import { useEffect, useMemo, useState } from "react";
import { FaExternalLinkAlt, FaInfoCircle, FaPlay, FaServer } from "react-icons/fa";
import type { ModelDetail, ModelVersion, ModelInferenceSample, InferenceServiceConfig, NormalizedInferenceResult } from "../../types";
import { inferenceService } from "../../services/inferenceService";

interface ModelInferencePanelProps {
    model: ModelDetail;
    versions: ModelVersion[];
}

export function InferencePlayground({ model, versions }: ModelInferencePanelProps) {
    const services = model.inference.services ?? [];
    const [selectedServiceId, setSelectedServiceId] = useState(model.inference.defaultServiceId ?? services[0]?.id ?? "");
    const [selectedSampleId, setSelectedSampleId] = useState(model.inference.samples[0]?.id ?? "");
    const [selectedVersion, setSelectedVersion] = useState(model.inference.defaultModelVersion);
    const [imageUrl, setImageUrl] = useState(model.inference.samples[0]?.mediaUrl ?? model.inference.samples[0]?.thumbnail ?? "");
    const [result, setResult] = useState<NormalizedInferenceResult | null>(null);
    const [status, setStatus] = useState<"idle" | "running">("idle");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const defaultService = model.inference.defaultServiceId ?? services[0]?.id ?? "";
        setSelectedServiceId(defaultService);
        const defaultSampleId = model.inference.samples[0]?.id ?? "";
        setSelectedSampleId(defaultSampleId);
        setSelectedVersion(model.inference.defaultModelVersion);
        const defaultSample = model.inference.samples.find((sample) => sample.id === defaultSampleId);
        setImageUrl(defaultSample?.mediaUrl ?? defaultSample?.thumbnail ?? "");
        setResult(null);
        setError(null);
    }, [model.id]);

    const selectedSample = useMemo(() => model.inference.samples.find((sample) => sample.id === selectedSampleId), [model, selectedSampleId]);
    const selectedService = useMemo(() => services.find((service) => service.id === selectedServiceId), [services, selectedServiceId]);

    useEffect(() => {
        if (!selectedSample) return;
        setImageUrl(selectedSample.mediaUrl ?? selectedSample.thumbnail ?? "");
        setResult(null);
        setError(null);
    }, [selectedSampleId]);

    useEffect(() => {
        setResult(null);
        setError(null);
    }, [selectedServiceId]);

    const isLoading = status === "running";
    const detectionCount = result?.predictions.length ?? selectedSample?.detections ?? 0;
    const confidenceValue = result?.predictions.length
        ? result.predictions.reduce((sum, pred) => sum + pred.confidence, 0) / result.predictions.length
        : selectedSample?.confidence ?? 0;
    const latencyValue = result?.durationMs ?? selectedSample?.latency ?? 0;

    const handleRunInference = async () => {
        if (!selectedService) {
            setError("当前模型未配置推理微服务");
            return;
        }
        try {
            setStatus("running");
            setError(null);
            const newResult = await inferenceService.run({
                service: selectedService,
                imageUrl,
            });
            setResult(newResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "推理失败");
        } finally {
            setStatus("idle");
        }
    };

    if (services.length === 0) {
        return (
            <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-md">
                暂无推理微服务配置，请在 `web-app/src/data/models` 中为该模型补充服务信息。
            </div>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="space-y-4">
                <SampleList
                    samples={model.inference.samples}
                    selectedSampleId={selectedSampleId}
                    onSelect={setSelectedSampleId}
                />
                {selectedService && (
                    <ServiceCard service={selectedService} />
                )}
            </div>
            <div className="space-y-4 rounded-lg bg-white p-6 shadow-md">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <div className="text-xs text-gray-500">推理服务</div>
                        <select
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                        >
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}（{service.runtime === "microservice" ? "微服务" : "Web"}）
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <div className="text-xs text-gray-500">选择模型版本</div>
                        <select
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            value={selectedVersion}
                            onChange={(e) => setSelectedVersion(e.target.value)}
                        >
                            {versions.map((version) => (
                                <option key={version.id} value={version.version}>
                                    {version.label} {version.version}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500">推理图像链接</label>
                    <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                    />
                    {selectedSample?.inputHint && <p className="mt-1 text-xs text-gray-400">{selectedSample.inputHint}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleRunInference}
                        disabled={isLoading || !imageUrl}
                        className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                            isLoading || !imageUrl ? "bg-gray-400" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95"
                        }`}
                    >
                        <FaPlay className="mr-2" /> {isLoading ? "推理中..." : "开始推理"}
                    </button>
                    {result && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                            {`共 ${result.predictions.length} 个结果`}
                        </span>
                    )}
                    {error && <span className="text-xs text-red-500">{error}</span>}
                </div>
                <MetricsRow detections={detectionCount} confidence={confidenceValue} latency={latencyValue} />
                <InferenceResultViewer imageUrl={imageUrl} result={result} loading={isLoading} />
                <PredictionList result={result} />
            </div>
        </div>
    );
}

function SampleList({ samples, selectedSampleId, onSelect }: { samples: ModelInferenceSample[]; selectedSampleId: string; onSelect: (id: string) => void }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">测试样本</h3>
            <div className="space-y-3">
                {samples.map((sample) => (
                    <button
                        key={sample.id}
                        onClick={() => onSelect(sample.id)}
                        className={`flex w-full items-center space-x-3 rounded-lg border p-3 text-left text-sm transition ${
                            selectedSampleId === sample.id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                        }`}
                    >
                        <img src={sample.thumbnail} alt={sample.name} className="h-12 w-16 rounded object-cover" />
                        <div>
                            <div className="font-semibold text-gray-800">{sample.name}</div>
                            <div className="text-xs text-gray-500">{sample.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ServiceCard({ service }: { service: InferenceServiceConfig }) {
    return (
        <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50 p-5 text-sm text-purple-900">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-purple-900">{service.name}</div>
                {"docUrl" in service && service.docUrl && (
                    <a
                        href={service.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-purple-600 hover:underline"
                    >
                        文档 <FaExternalLinkAlt className="ml-1" />
                    </a>
                )}
            </div>
            <p className="mt-1 text-xs text-purple-800">运行模式：{service.runtime === "microservice" ? "微服务 (Roboflow)" : "浏览器 ONNX"}</p>
            {service.description && <p className="mt-2 text-xs leading-5 text-purple-900">{service.description}</p>}
            {service.type === "roboflow" && (
                <div className="mt-3 rounded-lg bg-white/80 p-3 text-xs text-gray-600">
                    <div className="flex items-center text-gray-700">
                        <FaServer className="mr-2" /> Endpoint
                    </div>
                    <div className="mt-1 break-all font-mono text-[11px] text-gray-500">{service.endpoint}</div>
                </div>
            )}
        </div>
    );
}

function MetricsRow({ detections, confidence, latency }: { detections: number; confidence: number; latency: number }) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-xs text-gray-500">检测对象</div>
                <div className="text-2xl font-bold text-blue-600">{detections}</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
                <div className="text-xs text-gray-500">平均置信度</div>
                <div className="text-2xl font-bold text-green-600">{(confidence * 100).toFixed(1)}%</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
                <div className="text-xs text-gray-500">推理时间</div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(latency)} ms</div>
            </div>
        </div>
    );
}

function InferenceResultViewer({ imageUrl, result, loading }: { imageUrl: string; result: NormalizedInferenceResult | null; loading: boolean }) {
    const width = result?.image.width ?? 1920;
    const height = result?.image.height ?? 1080;
    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-black/90">
            <img
                src={imageUrl}
                alt="推理样本"
                className="w-full object-contain"
            />
            {result && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {result.predictions.map((pred) => {
                        if (pred.type === "segment" && pred.points && pred.points.length > 2) {
                            const points = pred.points.map((point) => `${point.x},${point.y}`).join(" ");
                            return (
                                <g key={pred.id}>
                                    <polygon points={points} fill={`${pred.color}33`} stroke={pred.color} strokeWidth={2} />
                                    <text x={pred.points[0]?.x ?? 0} y={(pred.points[0]?.y ?? 0) + 16} fill="#fff" fontSize={24} fontWeight="bold">
                                        {pred.label} {(pred.confidence * 100).toFixed(1)}%
                                    </text>
                                </g>
                            );
                        }
                        if (pred.box) {
                            const x = pred.box.x - pred.box.width / 2;
                            const y = pred.box.y - pred.box.height / 2;
                            return (
                                <g key={pred.id}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={pred.box.width}
                                        height={pred.box.height}
                                        fill="none"
                                        stroke={pred.color}
                                        strokeWidth={4}
                                    />
                                    <rect
                                        x={x}
                                        y={Math.max(0, y - 28)}
                                        width={Math.max(80, pred.box.width)}
                                        height={28}
                                        fill={pred.color}
                                        opacity={0.85}
                                    />
                                    <text x={x + 6} y={Math.max(18, y - 8)} fill="#fff" fontSize={18} fontWeight="bold">
                                        {pred.label} {(pred.confidence * 100).toFixed(1)}%
                                    </text>
                                </g>
                            );
                        }
                        return null;
                    })}
                </svg>
            )}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    正在调用 Roboflow 微服务...
                </div>
            )}
            {!result && !loading && (
                <div className="absolute bottom-4 left-4 rounded bg-black/60 px-3 py-2 text-xs text-gray-100">
                    点击“开始推理”即可查看识别框和置信度
                </div>
            )}
        </div>
    );
}

function PredictionList({ result }: { result: NormalizedInferenceResult | null }) {
    if (!result || result.predictions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                尚未获取推理结果。
            </div>
        );
    }
    return (
        <div>
            <div className="mb-2 flex items-center text-sm text-gray-600">
                <FaInfoCircle className="mr-2 text-blue-500" /> 推理结果详情
            </div>
            <div className="space-y-2">
                {result.predictions.map((pred) => (
                    <div key={pred.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pred.color }} />
                            <span className="font-semibold text-gray-800">{pred.label}</span>
                        </div>
                        <div className="text-xs text-gray-500">{(pred.confidence * 100).toFixed(1)}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
