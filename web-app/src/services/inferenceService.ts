import type {
    InferencePoint,
    InferencePrediction,
    InferenceServiceConfig,
    NormalizedInferenceResult,
    RoboflowInferenceConfig,
} from "../types";
import { getRoboflowApiKey } from "../utils/env";

const palette = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#f97316", "#2dd4bf"];
const labelColorCache = new Map<string, string>();

interface RunInferenceParams {
    service: InferenceServiceConfig;
    imageUrl?: string;
    file?: File | null;
    apiKey?: string | null;
    signal?: AbortSignal;
}

const ensureColor = (label: string) => {
    if (!labelColorCache.has(label)) {
        const color = palette[labelColorCache.size % palette.length];
        labelColorCache.set(label, color);
    }
    return labelColorCache.get(label)!;
};

const toPoints = (rawPoints: unknown): InferencePoint[] | undefined => {
    if (!rawPoints) return undefined;
    if (Array.isArray(rawPoints)) {
        if (rawPoints.length === 0) return undefined;
        if (Array.isArray(rawPoints[0])) {
            return (rawPoints as Array<[number, number]>).map(([x, y]) => ({ x, y }));
        }
        if (typeof rawPoints[0] === "number") {
            const list = rawPoints as number[];
            if (list.length % 2 !== 0) return undefined;
            const points: InferencePoint[] = [];
            for (let i = 0; i < list.length; i += 2) {
                points.push({ x: list[i]!, y: list[i + 1]! });
            }
            return points;
        }
    }
    if (typeof rawPoints === "object" && rawPoints !== null) {
        const maybeObj = rawPoints as { x?: number[]; y?: number[] };
        if (Array.isArray(maybeObj.x) && Array.isArray(maybeObj.y) && maybeObj.x.length === maybeObj.y.length) {
            return maybeObj.x.map((x, idx) => ({ x, y: maybeObj.y![idx]! }));
        }
    }
    return undefined;
};

const normalizeRoboflow = (
    payload: any,
    service: RoboflowInferenceConfig,
    durationMs?: number
): NormalizedInferenceResult => {
    const imageWidth = payload?.image?.width ?? payload?.width ?? payload?.predictions?.[0]?.width ?? 1920;
    const imageHeight = payload?.image?.height ?? payload?.height ?? payload?.predictions?.[0]?.height ?? 1080;

    const predictions: InferencePrediction[] = Array.isArray(payload?.predictions)
        ? payload.predictions.map((item: any, index: number) => {
              const label = item.class ?? item.label ?? `object-${index + 1}`;
              const confidence = typeof item.confidence === "number" ? item.confidence : Number(item.confidence ?? 0);
              const hasBox = ["x", "y", "width", "height"].every((key) => typeof item[key] === "number");
              const points = toPoints(item.points);
              return {
                  id: item.id ?? `${label}-${index}`,
                  label,
                  confidence,
                  type: points && points.length > 2 ? "segment" : "box",
                  color: ensureColor(label),
                  box: hasBox
                      ? {
                            x: item.x,
                            y: item.y,
                            width: item.width,
                            height: item.height,
                        }
                      : undefined,
                  points,
              } satisfies InferencePrediction;
          })
        : [];

    return {
        provider: service.name,
        runtime: service.runtime,
        durationMs,
        image: {
            width: imageWidth,
            height: imageHeight,
        },
        predictions,
        raw: payload,
    } satisfies NormalizedInferenceResult;
};

const runRoboflowInference = async ({ service, imageUrl, file, apiKey, signal }: RunInferenceParams & { service: RoboflowInferenceConfig }) => {
    const effectiveApiKey = apiKey ?? getRoboflowApiKey();
    if (!effectiveApiKey) {
        throw new Error("未检测到 Robo_API_KEY，请在 index.html 或 Vite 环境变量中配置。");
    }

    const requestUrl = new URL(service.endpoint);
    requestUrl.searchParams.set("api_key", effectiveApiKey);

    const optionEntries = Object.entries(service.options ?? {}).filter(([, value]) => value !== undefined);
    optionEntries.forEach(([key, value]) => requestUrl.searchParams.set(key, String(value)));

    const init: RequestInit = {
        method: "POST",
        signal,
    };

    if (file) {
        const form = new FormData();
        form.append("file", file);
        init.body = form;
    } else {
        if (!imageUrl) {
            throw new Error("请选择测试样本或上传图片");
        }
        requestUrl.searchParams.set(service.imageParam ?? "image", imageUrl);
    }

    const started = typeof performance !== "undefined" ? performance.now() : Date.now();
    const response = await fetch(requestUrl.toString(), init);
    const finished = typeof performance !== "undefined" ? performance.now() : Date.now();

    if (!response.ok) {
        const message = await response.text().catch(() => response.statusText);
        throw new Error(`远程推理请求失败: ${response.status} ${message}`);
    }

    const payload = await response.json().catch(() => {
        throw new Error("远程推理返回的不是合法 JSON");
    });

    return normalizeRoboflow(payload, service, finished - started);
};

export const inferenceService = {
    async run(params: RunInferenceParams): Promise<NormalizedInferenceResult> {
        if (!params.service) {
            throw new Error("当前模型未配置推理服务");
        }
        switch (params.service.type) {
            case "roboflow":
                return runRoboflowInference(params as RunInferenceParams & { service: RoboflowInferenceConfig });
            case "web-onnx":
                throw new Error("Web ONNX 推理尚未实现，敬请期待。");
            default:
                throw new Error(`暂不支持的推理服务类型 ${(params.service as InferenceServiceConfig).type}`);
        }
    },
};
