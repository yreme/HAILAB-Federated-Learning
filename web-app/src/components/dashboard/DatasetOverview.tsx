import type { DatasetStat } from "../../types";

type DatasetOverviewProps = {
    stats: DatasetStat[];
};

export function DatasetOverview({ stats }: DatasetOverviewProps) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                <span className="mr-2 rounded-full bg-indigo-100 p-2 text-indigo-600">📊</span>
                训练数据集概览
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.description}
                        className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-center"
                    >
                        <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                        <div className="mt-1 text-sm text-gray-600">{stat.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
