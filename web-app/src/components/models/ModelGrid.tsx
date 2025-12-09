import type { ModelSummary } from "../../types";
import { FaBolt, FaNetworkWired, FaShieldAlt } from "react-icons/fa";

type ModelGridProps = {
    models: ModelSummary[];
    onSelect: (id: string) => void;
};

const statusClass: Record<ModelSummary["status"], string> = {
    stable: "bg-green-100 text-green-800",
    alert: "bg-orange-100 text-orange-800",
    offline: "bg-gray-200 text-gray-600",
};

export function ModelGrid({ models, onSelect }: ModelGridProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">港口多模型联邦集群</h2>
                <p className="text-sm text-gray-600 mt-1">
                    每个模块都可独立联邦训练与推理，对比本地与联邦版本表现。
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {models.map((model) => (
                    <div
                        key={model.id}
                        className="relative overflow-hidden rounded-xl bg-white shadow-md card-hover cursor-pointer"
                        onClick={() => onSelect(model.id)}
                    >
                        <div
                            className="h-40 bg-cover bg-center"
                            style={{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.15)), url(${model.thumbnail})` }}
                        >
                            <div className="p-4 text-white flex flex-col justify-between h-full">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass[model.status]}`}>
                                    <FaShieldAlt className="mr-1" /> {model.status === "alert" ? "需关注" : "稳定"}
                                </span>
                                <div>
                                    <h3 className="text-xl font-semibold">{model.name}</h3>
                                    <p className="text-xs opacity-80">{model.category}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-gray-600 h-10 overflow-hidden">{model.description}</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg bg-orange-50 p-3">
                                    <div className="text-xs text-gray-500">本地最新</div>
                                    <div className="text-sm font-semibold text-gray-900">{model.summary.localVersion}</div>
                                    <div className="text-orange-600 text-xs mt-1">mAP {Math.round(model.summary.localMap * 100)}%</div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-3">
                                    <div className="text-xs text-gray-500">联邦最新</div>
                                    <div className="text-sm font-semibold text-gray-900">{model.summary.federatedVersion}</div>
                                    <div className="text-green-600 text-xs mt-1">mAP {Math.round(model.summary.federatedMap * 100)}%</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="inline-flex items-center"><FaNetworkWired className="mr-1" />{model.summary.nodes.length} 个节点</span>
                                <span className="inline-flex items-center"><FaBolt className="mr-1" />联邦增益 +{Math.round((model.summary.federatedMap - model.summary.localMap) * 1000) / 10}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
