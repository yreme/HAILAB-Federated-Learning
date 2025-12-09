export type MetricKey = "map50" | "precision" | "recall";

export interface MetricComparison {
    label: string;
    localValue: number;
    fedValue: number;
    unit?: string;
}

export interface TrainingPoint {
    epoch: number;
    localLoss: number;
    fedLoss: number;
    localMap: number;
    fedMap: number;
}

export interface DatasetStat {
    value: string;
    description: string;
}

export type TaskStatus = "queued" | "running" | "aggregating" | "completed" | "failed";

export interface FederatedTask {
    id: string;
    name: string;
    nodes: string[];
    progress: number;
    currentRound: number;
    totalRounds: number;
    status: TaskStatus;
    baseModel: string;
    createdAt: string;
}

export interface ModelVersion {
    id: string;
    label: string;
    tag: "federated" | "local";
    version: string;
    createdAt: string;
    metrics: Record<MetricKey, number>;
    sizeMB: number;
    summary: string;
    isActive?: boolean;
    badges: string[];
}

export interface MapPoint {
    epoch: number;
    localMap: number;
    fedMap: number;
}

export interface ModelSummary {
    id: string;
    name: string;
    category: string;
    description: string;
    thumbnail: string;
    tags: string[];
    status: "stable" | "alert" | "offline";
    summary: {
        localVersion: string;
        federatedVersion: string;
        localMap: number;
        federatedMap: number;
        localPrecision: number;
        federatedPrecision: number;
        localRecall: number;
        federatedRecall: number;
        nodes: string[];
        dataset: string;
        health: string;
    };
}

export type InferenceRuntime = "microservice" | "edge";
export type InferenceServiceType = "roboflow" | "web-onnx";

export interface BaseInferenceServiceConfig {
    id: string;
    name: string;
    type: InferenceServiceType;
    runtime: InferenceRuntime;
    description?: string;
}

export interface RoboflowInferenceConfig extends BaseInferenceServiceConfig {
    type: "roboflow";
    runtime: "microservice";
    endpoint: string;
    version: string;
    docUrl?: string;
    imageParam?: string;
    options?: {
        confidence?: number;
        overlap?: number;
        format?: string;
    };
}

export interface WebOnnxInferenceConfig extends BaseInferenceServiceConfig {
    type: "web-onnx";
    runtime: "edge";
    modelUrl?: string;
}

export type InferenceServiceConfig = RoboflowInferenceConfig | WebOnnxInferenceConfig;

export interface ModelInferenceSample {
    id: string;
    name: string;
    type: "image" | "video";
    thumbnail: string;
    description: string;
    detections: number;
    confidence: number;
    latency: number;
    mediaUrl?: string;
    inputHint?: string;
}

export interface InferenceBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface InferencePoint {
    x: number;
    y: number;
}

export type InferencePredictionType = "box" | "segment";

export interface InferencePrediction {
    id: string;
    label: string;
    confidence: number;
    type: InferencePredictionType;
    color: string;
    box?: InferenceBoundingBox;
    points?: InferencePoint[];
}

export interface NormalizedInferenceResult {
    provider: string;
    runtime: InferenceRuntime;
    durationMs?: number;
    image: {
        width: number;
        height: number;
    };
    predictions: InferencePrediction[];
    raw?: unknown;
}

export interface ModelInferenceData {
    defaultModelVersion: string;
    defaultServiceId?: string;
    services?: InferenceServiceConfig[];
    samples: ModelInferenceSample[];
}

export interface RunningTask {
    id: string;
    name: string;
    currentRound: number;
    totalRounds: number;
    progress: number;
    nodes: string[];
    dataset: string;
    logs: string[];
}

export interface QueuedTask {
    id: string;
    name: string;
    position: number;
    eta: string;
    queueLength: number;
    priority: "high" | "normal" | "low";
}

export interface TrainingRunResult {
    comparisons: MetricComparison[];
    lossSeries?: TrainingPoint[];
    mapSeries?: MapPoint[];
}

export interface CompletedTask {
    id: string;
    name: string;
    mergedPorts: string[];
    dataset: string;
    metricsDelta: number;
    evaluated: boolean;
    results?: TrainingRunResult;
}

export interface ModelTaskBoard {
    running: RunningTask[];
    queued: QueuedTask[];
    completed: CompletedTask[];
}

export interface ModelDetail extends ModelSummary {
    overview: {
        datasetStats: DatasetStat[];
    };
    performance: {
        metrics: MetricComparison[];
        lossSeries: TrainingPoint[];
        mapSeries: MapPoint[];
    };
    versions: {
        local: ModelVersion[];
        federated: ModelVersion[];
    };
    inference: ModelInferenceData;
    tasks: ModelTaskBoard;
}

declare global {
    interface Window {
        Robo_API_KEY?: string;
    }
}
