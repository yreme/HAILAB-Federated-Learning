import type { ReactNode } from "react";
import { FaArrowUp, FaBullseye, FaCheckCircle, FaCrosshairs } from "react-icons/fa";
import type { MetricComparison } from "../../types";

type MetricCardsProps = {
    metrics: MetricComparison[];
};

const iconMap: Record<string, ReactNode> = {
    "mAP@50": <FaBullseye className="text-2xl text-blue-500" />,
    Precision: <FaCrosshairs className="text-2xl text-purple-500" />,
    Recall: <FaCheckCircle className="text-2xl text-green-500" />,
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function MetricCards({ metrics }: MetricCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {metrics.map((metric) => {
                const delta = metric.fedValue - metric.localValue;
                return (
                    <div key={metric.label} className="card-hover rounded-lg bg-white p-6 shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700">{metric.label}</h3>
                            {iconMap[metric.label]}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">本地模型 (C1)</span>
                                    <span className="text-lg font-bold text-gray-800">
                                        {formatPercent(metric.localValue)}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-orange-500"
                                        style={{ width: `${metric.localValue * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">联邦模型 (B1)</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {formatPercent(metric.fedValue)}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-green-500"
                                        style={{ width: `${metric.fedValue * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="border-t pt-2 text-center">
                                <span className="font-bold text-green-600 inline-flex items-center justify-center space-x-1">
                                    <FaArrowUp />
                                    <span>
                                        {delta >= 0 ? "+" : ""}
                                        {(delta * 100).toFixed(1)}% 提升
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
