import type { ModelVersion } from "../../types";

type ModelTimelineProps = {
    versions: ModelVersion[];
};

const tagStyles: Record<ModelVersion["tag"], string> = {
    federated: "bg-green-600",
    local: "bg-orange-500",
};

export function ModelTimeline({ versions }: ModelTimelineProps) {
    return (
        <div className="space-y-4">
            {versions.map((version) => (
                <div
                    key={version.id}
                    className={`rounded-lg border-l-4 bg-white p-4 shadow-md ${
                        version.isActive ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${tagStyles[version.tag]}`}>
                                    {version.tag === "federated" ? "联邦模型" : "本地模型"}
                                </span>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    {version.label} - {version.version}
                                </h4>
                                <span className="text-xs text-gray-500">{version.createdAt}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div>
                                    <span className="text-xs text-gray-600">mAP@50</span>
                                    <div className="text-lg font-bold text-gray-800">{(version.metrics.map50 * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-600">Precision</span>
                                    <div className="text-lg font-bold text-gray-800">{(version.metrics.precision * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-600">Recall</span>
                                    <div className="text-lg font-bold text-gray-800">{(version.metrics.recall * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-600">模型大小</span>
                                    <div className="text-lg font-bold text-gray-800">{version.sizeMB.toFixed(1)} MB</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {version.badges.map((badge) => (
                                    <span key={badge} className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 md:w-auto">
                            <button
                                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                    version.isActive
                                        ? "bg-green-600 text-white"
                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {version.isActive ? "使用中" : "启用"}
                            </button>
                            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                下载
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
