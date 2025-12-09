import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaServer, FaUpload } from "react-icons/fa";
import type { ModelDetail, ModelSummary, ModelTaskBoard, RunningTask, QueuedTask, CompletedTask } from "../../types";
import { DatasetOverview } from "../dashboard/DatasetOverview";
import { MetricCards } from "../dashboard/MetricCards";
import { LossChart } from "../charts/LossChart";
import { MapChart } from "../charts/MapChart";
import { ModelTimeline } from "./ModelTimeline";
import type { ModelVersion } from "../../types";

const tabs = [
    { key: "overview", label: "模型概览" },
    { key: "performance", label: "训练表现" },
    { key: "tasks", label: "联邦任务" },
    { key: "inference", label: "推理体验" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

type ModelDetailViewProps = {
    model: ModelDetail;
    peers: ModelSummary[];
    onBack: () => void;
    onSelectPeer: (id: string) => void;
};

const priorityStyle: Record<QueuedTask["priority"], string> = {
    high: "bg-red-100 text-red-700",
    normal: "bg-blue-100 text-blue-700",
    low: "bg-gray-100 text-gray-600",
};

export function ModelDetailView({ model, peers, onBack, onSelectPeer }: ModelDetailViewProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [activeVersion, setActiveVersion] = useState<"federated" | "local">("federated");
    const [tasks, setTasks] = useState<ModelTaskBoard>(model.tasks);
    const [selectedSampleId, setSelectedSampleId] = useState(model.inference.samples[0]?.id);
    const [selectedModelVersion, setSelectedModelVersion] = useState(model.inference.defaultModelVersion);
    const [newTaskName, setNewTaskName] = useState(`${model.name} 联邦增益`);
    const [newPriority, setNewPriority] = useState<QueuedTask["priority"]>("normal");
    const [newRounds, setNewRounds] = useState(80);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(model.tasks.completed[0]?.id ?? null);

    useEffect(() => {
        setActiveTab("overview");
        setActiveVersion("federated");
        setTasks(model.tasks);
        setSelectedSampleId(model.inference.samples[0]?.id);
        setSelectedModelVersion(model.inference.defaultModelVersion);
        setNewTaskName(`${model.name} 联邦增益`);
        setNewPriority("normal");
        setNewRounds(80);
        setSelectedRunId(model.tasks.completed[0]?.id ?? null);
    }, [model]);

    const selectedSample = useMemo(() => model.inference.samples.find((sample) => sample.id === selectedSampleId), [model, selectedSampleId]);

    const versionList: ModelVersion[] = useMemo(() => [...model.versions.federated, ...model.versions.local], [model.versions]);

    const completedRuns = tasks.completed;
    const selectedRun = completedRuns.find((run) => run.id === selectedRunId) ?? completedRuns[0];
    const runResults = selectedRun?.results ?? {
        comparisons: model.performance.metrics,
        lossSeries: model.performance.lossSeries,
        mapSeries: model.performance.mapSeries,
    };
    const comparisonMetrics = runResults.comparisons ?? model.performance.metrics;
    const lossSeries = runResults.lossSeries ?? model.performance.lossSeries;
    const mapSeries = runResults.mapSeries ?? model.performance.mapSeries;

    const handleCreateTask = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newTaskName) return;
        const newTask: QueuedTask = {
            id: `FL-${model.id}-${Date.now()}`,
            name: newTaskName,
            position: tasks.queued.length + 1,
            eta: `${Math.max(1, Math.round(newRounds / 40))} 小时`,
            queueLength: tasks.queued.length + 1,
            priority: newPriority,
        };
        setTasks((prev) => ({
            ...prev,
            queued: [...prev.queued, newTask],
        }));
        setNewTaskName(`${model.name} 联邦增量`);
    };

    const summary = model.summary;
    const activeMetrics = activeVersion === "federated"
        ? {
              version: summary.federatedVersion,
              map: summary.federatedMap,
              precision: summary.federatedPrecision,
              recall: summary.federatedRecall,
          }
        : {
              version: summary.localVersion,
              map: summary.localMap,
              precision: summary.localPrecision,
              recall: summary.localRecall,
          };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <FaArrowLeft className="mr-1" /> 返回列表
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{model.name}</h2>
                        <p className="text-sm text-gray-500">{model.summary.dataset}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">切换模型</div>
                    <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={model.id}
                        onChange={(e) => onSelectPeer(e.target.value)}
                    >
                        {peers.map((peer) => (
                            <option key={peer.id} value={peer.id}>
                                {peer.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-500">当前使用</div>
                        <div className="text-lg font-semibold text-gray-900">{activeMetrics.version}</div>
                        <div className="text-xs text-gray-500">{activeVersion === "federated" ? "联邦模型" : "本地模型"}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveVersion("local")}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                activeVersion === "local" ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600"
                            }`}
                        >
                            本地版本
                        </button>
                        <button
                            onClick={() => setActiveVersion("federated")}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                activeVersion === "federated" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600"
                            }`}
                        >
                            联邦版本
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center text-sm">
                        <div>
                            <div className="text-xs text-gray-500">mAP@50</div>
                            <div className="text-2xl font-bold text-gray-900">{(activeMetrics.map * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Precision</div>
                            <div className="text-2xl font-bold text-gray-900">{(activeMetrics.precision * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Recall</div>
                            <div className="text-2xl font-bold text-gray-900">{(activeMetrics.recall * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>节点：{summary.nodes.join(" / ")}</span>
                    <span className="inline-flex items-center"><FaServer className="mr-1" />{summary.health}</span>
                </div>
            </div>

            <div className="rounded-lg bg-white shadow-sm">
                <div className="flex flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-4 text-sm font-semibold transition ${activeTab === tab.key ? "tab-active" : "text-gray-500 hover:text-purple-600"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "overview" && (
                <div className="space-y-6">
                    <MetricCards metrics={model.performance.metrics} />
                    <DatasetOverview stats={model.overview.datasetStats} />
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">模型版本时间线</h3>
                            <button className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                                <FaUpload className="inline mr-2" /> 上传本地模型
                            </button>
                        </div>
                        <ModelTimeline versions={[...model.versions.federated, ...model.versions.local]} />
                    </div>
                </div>
            )}

            {activeTab === "performance" && (
                <div className="space-y-6">
                    <div className="rounded-lg bg-white p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="text-sm font-semibold text-gray-800">联邦训练任务</div>
                            <p className="text-xs text-gray-500">
                                {selectedRun ? `${selectedRun.name} · ${selectedRun.dataset}` : "暂无完成的联邦任务"}
                            </p>
                        </div>
                        {completedRuns.length > 0 && (
                            <select
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                value={selectedRun?.id ?? completedRuns[0].id}
                                onChange={(e) => setSelectedRunId(e.target.value)}
                            >
                                {completedRuns.map((run) => (
                                    <option key={run.id} value={run.id}>
                                        {run.id} · {run.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <MetricCards metrics={comparisonMetrics} />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <LossChart data={lossSeries} />
                        <MapChart data={mapSeries} />
                    </div>
                </div>
            )}

            {activeTab === "tasks" && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {tasks.running.map((task) => (
                            <RunningTaskCard key={task.id} task={task} />
                        ))}
                        <div className="grid gap-4 md:grid-cols-2">
                            {tasks.queued.map((task) => (
                                <QueuedTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                        <div className="space-y-4">
                            {tasks.completed.map((task) => (
                                <CompletedTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">提交联邦任务</h3>
                        <form className="space-y-4" onSubmit={handleCreateTask}>
                            <div>
                                <label className="text-xs text-gray-500">任务名称</label>
                                <input
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">训练轮次</label>
                                <input
                                    type="number"
                                    min={30}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                    value={newRounds}
                                    onChange={(e) => setNewRounds(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">优先级</label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value as QueuedTask["priority"])}
                                >
                                    <option value="high">高</option>
                                    <option value="normal">标准</option>
                                    <option value="low">低</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-sm font-semibold text-white"
                            >
                                推送到联邦队列
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "inference" && selectedSample && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 rounded-lg bg-white p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">测试样本</h3>
                        {model.inference.samples.map((sample) => (
                            <button
                                key={sample.id}
                                onClick={() => setSelectedSampleId(sample.id)}
                                className={`flex w-full items-center space-x-3 rounded-lg border p-3 text-left text-sm ${
                                    sample.id === selectedSampleId ? "border-purple-500 bg-purple-50" : "border-gray-200"
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
                    <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <div className="text-sm text-gray-500">选择模型版本</div>
                                <select
                                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    value={selectedModelVersion}
                                    onChange={(e) => setSelectedModelVersion(e.target.value)}
                                >
                                    {versionList.map((version) => (
                                        <option key={version.id} value={version.version}>
                                            {version.label} {version.version}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                上传自定义样本
                            </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-gray-100 p-6 text-center text-gray-500 h-64 flex flex-col items-center justify-center">
                                <FaServer className="text-4xl mb-3" />
                                <p>示例媒体：{selectedSample.type === "video" ? "视频" : "图像"}</p>
                                <p className="text-xs mt-2">{selectedSample.description}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <div className="text-xs text-gray-500">检测到对象</div>
                                    <div className="text-2xl font-bold text-blue-600">{selectedSample.detections}</div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4">
                                    <div className="text-xs text-gray-500">平均置信度</div>
                                    <div className="text-2xl font-bold text-green-600">{(selectedSample.confidence * 100).toFixed(1)}%</div>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4">
                                    <div className="text-xs text-gray-500">推理时间</div>
                                    <div className="text-2xl font-bold text-purple-600">{selectedSample.latency} ms</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RunningTaskCard({ task }: { task: RunningTask }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                    <p className="text-xs text-gray-500">{task.dataset}</p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">训练中</span>
            </div>
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Round {task.currentRound}/{task.totalRounds}</span>
                    <span>{task.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${task.progress}%` }} />
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">{task.nodes.join(" / ")}</div>
            <pre className="mt-4 h-36 overflow-auto rounded-lg bg-slate-900 p-3 text-xs font-mono text-green-200">
                {task.logs.map((line) => (
                    <div key={line}>{line}</div>
                ))}
            </pre>
        </div>
    );
}

function QueuedTaskCard({ task }: { task: QueuedTask }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                    <div className="text-xs text-gray-500">排队 {task.position}/{task.queueLength}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityStyle[task.priority]}`}>{task.priority}</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">预计等待 {task.eta}</div>
        </div>
    );
}

function CompletedTaskCard({ task }: { task: CompletedTask }) {
    return (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                    <div className="text-xs text-gray-500">{task.dataset}</div>
                </div>
                <span className="text-xs font-semibold text-green-700">完成</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">合并港口：{task.mergedPorts.join(" / ")}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-green-700">
                <span>指标提升 +{(task.metricsDelta * 100).toFixed(1)}%</span>
                <button className="text-green-700 underline">评测与回放</button>
            </div>
        </div>
    );
}
