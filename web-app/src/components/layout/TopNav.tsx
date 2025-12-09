import { useState } from "react";
import { FaBell, FaProjectDiagram, FaShip } from "react-icons/fa";
import { FederatedTopologyMap } from "../topology/FederatedTopologyMap";

const mockNotifications = [
    {
        id: "notif-1",
        title: "港口垂类大模型联邦训练完成",
        detail: "博大(厦门)总部 + 厦门大学同步完成 B1 v2.2.1 汇总，mAP@50 91.0%",
        time: "今天 10:32",
    },
    {
        id: "notif-2",
        title: "抓箱防吊起任务已评估",
        detail: "FL-ANTI-2025-04 精度验证通过，可切换为生产版本",
        time: "今天 09:58",
    },
    {
        id: "notif-3",
        title: "行人危险监测提交成功",
        detail: "FL-PED-2025-12 排队中，预计等待 40 分钟",
        time: "今天 09:20",
    },
];

type PanelKey = "notifications" | "topology" | null;

export function TopNav() {
    const [activePanel, setActivePanel] = useState<PanelKey>(null);

    const togglePanel = (panel: PanelKey) => {
        setActivePanel((prev) => (prev === panel ? null : panel));
    };

    const handleMouseEnter = (panel: PanelKey) => {
        setActivePanel(panel);
    };

    const handleMouseLeave = (panel: PanelKey) => {
        setActivePanel((prev) => (prev === panel ? null : prev));
    };

    return (
        <nav className="gradient-bg text-white shadow-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <FaShip className="text-3xl" />
                    <div>
                        <h1 className="text-xl font-bold">港口集装箱联邦学习平台</h1>
                        <p className="text-xs opacity-90">Container Vision AI - Federated Learning System</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                    <div
                        className="relative"
                        onMouseEnter={() => handleMouseEnter("notifications")}
                        onMouseLeave={() => handleMouseLeave("notifications")}
                    >
                        <button
                            className="flex items-center space-x-2 rounded-lg px-4 py-2 transition hover:bg-white hover:bg-opacity-20"
                            onClick={() => togglePanel("notifications")}
                        >
                            <FaBell />
                            <span>通知</span>
                            <span className="rounded-full bg-white bg-opacity-90 px-2 py-0.5 text-xs font-semibold text-purple-700">
                                {mockNotifications.length}
                            </span>
                        </button>
                        {activePanel === "notifications" && (
                            <div className="absolute right-0 z-20 mt-3 w-80 rounded-xl bg-white/95 text-gray-800 shadow-2xl backdrop-blur-lg">
                                <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">最新通知</div>
                                <div className="max-h-64 divide-y divide-gray-100 overflow-auto">
                                    {mockNotifications.map((item) => (
                                        <div key={item.id} className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                                            <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                                            <div className="mt-1 text-xs text-gray-400">{item.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        className="relative"
                        onMouseEnter={() => handleMouseEnter("topology")}
                        onMouseLeave={() => handleMouseLeave("topology")}
                    >
                        <button
                            className="flex items-center space-x-2 rounded-lg px-4 py-2 transition hover:bg-white hover:bg-opacity-20"
                            onClick={() => togglePanel("topology")}
                        >
                            <FaProjectDiagram />
                            <span>联邦拓扑</span>
                        </button>
                        {activePanel === "topology" && (
                            <div className="absolute right-0 z-20 mt-3 w-[26rem] rounded-xl bg-white/95 text-gray-800 shadow-2xl backdrop-blur-lg">
                                <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">
                                    博大(厦门)总部·厦门大学 ↔ 分节点
                                </div>
                                <div className="p-4">
                                    <FederatedTopologyMap />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
