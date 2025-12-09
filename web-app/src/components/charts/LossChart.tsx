import { Line } from "react-chartjs-2";
import type { TrainingPoint } from "../../types";
import "./chartConfig";

type LossChartProps = {
    data: TrainingPoint[];
};

export function LossChart({ data }: LossChartProps) {
    const labels = data.map((point) => point.epoch);

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                <span className="mr-2 text-purple-600">📉</span>
                训练损失曲线对比
            </h3>
            <div className="h-64">
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "本地模型 C1",
                                data: data.map((point) => point.localLoss),
                                borderColor: "rgb(251, 146, 60)",
                                backgroundColor: "rgba(251, 146, 60, 0.1)",
                                tension: 0.4,
                            },
                            {
                                label: "联邦模型 B1",
                                data: data.map((point) => point.fedLoss),
                                borderColor: "rgb(34, 197, 94)",
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                tension: 0.4,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: "Loss",
                                },
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: "Epoch",
                                },
                                ticks: {
                                    maxTicksLimit: 6,
                                },
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
}
