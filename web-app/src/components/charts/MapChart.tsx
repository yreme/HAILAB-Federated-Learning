import { Line } from "react-chartjs-2";
import type { MapPoint } from "../../types";
import "./chartConfig";

type MapChartProps = {
    data: MapPoint[];
};

export function MapChart({ data }: MapChartProps) {
    const labels = data.map((point) => point.epoch);

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-700">
                <span className="mr-2 text-blue-600">📈</span>
                mAP 提升曲线
            </h3>
            <div className="h-64">
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "本地模型 C1",
                                data: data.map((point) => point.localMap),
                                borderColor: "rgb(251, 146, 60)",
                                backgroundColor: "rgba(251, 146, 60, 0.1)",
                                tension: 0.4,
                            },
                            {
                                label: "联邦模型 B1",
                                data: data.map((point) => point.fedMap),
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
                                max: 1,
                                title: {
                                    display: true,
                                    text: "mAP@50",
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
