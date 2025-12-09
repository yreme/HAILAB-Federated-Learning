import { useMemo, useState } from "react";
import { topologyEdges, topologyNodes, type NodeStatus } from "../../data/networkTopology";

const edgeColors: Record<typeof topologyEdges[number]["status"], string> = {
    sync: "#4ade80",
    pending: "#f97316",
    idle: "#94a3b8",
};

const nodeStatusStyles: Record<NodeStatus, { label: string; dot: string; badge: string }> = {
    active: { label: "在线", dot: "bg-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
    degraded: { label: "降级", dot: "bg-amber-400", badge: "bg-amber-500/20 text-amber-300" },
    offline: { label: "离线", dot: "bg-rose-400", badge: "bg-rose-500/20 text-rose-200" },
};

export function FederatedTopologyMap() {
    const [selectedNodeId, setSelectedNodeId] = useState<string>(topologyNodes[0]?.id ?? "");
    const selectedNode = useMemo(
        () => topologyNodes.find((node) => node.id === selectedNodeId) ?? topologyNodes[0],
        [selectedNodeId]
    );
    const connectedEdges = useMemo(
        () => topologyEdges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId),
        [selectedNodeId]
    );

    if (!selectedNode) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 text-white shadow-2xl">
            <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                <div className="relative">
                    <svg viewBox="0 0 900 560" className="h-[360px] w-full lg:h-[520px]">
                        <defs>
                            <linearGradient id="chinaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                            </linearGradient>
                            <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
                            </linearGradient>
                            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="7" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <rect width="900" height="560" fill="url(#chinaGradient)" rx="32" />
                        <image
                            href="https://upload.wikimedia.org/wikipedia/commons/6/6d/China_-_outline_map.svg"
                            width="760"
                            height="520"
                            x="70"
                            y="20"
                            opacity="0.18"
                            preserveAspectRatio="xMidYMid meet"
                        />

                        {topologyEdges.map((edge) => {
                            const from = topologyNodes.find((node) => node.id === edge.from);
                            const to = topologyNodes.find((node) => node.id === edge.to);
                            if (!from || !to) return null;
                            const color = edgeColors[edge.status];
                            const highlighted = edge.from === selectedNodeId || edge.to === selectedNodeId;
                            return (
                                <g key={`${edge.from}-${edge.to}`}>
                                    <line
                                        x1={from.coords.x}
                                        y1={from.coords.y}
                                        x2={to.coords.x}
                                        y2={to.coords.y}
                                        stroke="url(#edgeGlow)"
                                        strokeWidth={highlighted ? 7 : 4}
                                        opacity={highlighted ? 0.6 : 0.25}
                                    />
                                    <line
                                        x1={from.coords.x}
                                        y1={from.coords.y}
                                        x2={to.coords.x}
                                        y2={to.coords.y}
                                        stroke={color}
                                        strokeWidth={highlighted ? 3.5 : 2}
                                        strokeDasharray="8 8"
                                        opacity={highlighted ? 1 : 0.55}
                                    />
                                </g>
                            );
                        })}

                        {topologyNodes.map((node) => {
                            const isSelected = node.id === selectedNodeId;
                            return (
                                <g
                                    key={node.id}
                                    onClick={() => setSelectedNodeId(node.id)}
                                    className="cursor-pointer transition-all duration-150 ease-out"
                                    style={{ transformOrigin: `${node.coords.x}px ${node.coords.y}px` }}
                                >
                                    {node.type === "central" && (
                                        <circle
                                            cx={node.coords.x}
                                            cy={node.coords.y}
                                            r={20}
                                            fill="#f472b6"
                                            opacity={0.35}
                                            filter="url(#nodeGlow)"
                                        />
                                    )}
                                    {isSelected && (
                                        <circle
                                            cx={node.coords.x}
                                            cy={node.coords.y}
                        r={node.type === "central" ? 15 : 12}
                                            fill="none"
                                            stroke="#a5b4fc"
                                            strokeWidth={2}
                                            opacity={0.9}
                                        />
                                    )}
                                    <circle
                                        cx={node.coords.x}
                                        cy={node.coords.y}
                                        r={node.type === "central" ? 11 : 8}
                                        fill={node.type === "central" ? "#fbbf24" : "#38bdf8"}
                                        stroke={isSelected ? "#e0e7ff" : "#0f172a"}
                                        strokeWidth={2.5}
                                    />
                                    <text
                                        x={node.coords.x + 14}
                                        y={node.coords.y - 4}
                                        className="fill-white text-[12px] font-semibold drop-shadow"
                                    >
                                        {node.name}
                                    </text>
                                    <text x={node.coords.x + 14} y={node.coords.y + 12} className="fill-slate-300 text-[10px]">
                                        {node.type === "central" ? "中心节点" : "分节点"} · {node.city}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-200">
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-green-400" /> 同步中
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-orange-400" /> 排队
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-slate-400" /> 待命
                        </div>
                        <div className="ml-auto text-[11px] text-slate-400">
                            点击节点查看联邦详情
                        </div>
                    </div>
                </div>

                <aside className="rounded-2xl border border-white/10 bg-slate-800/60 p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400">选中节点</p>
                            <h3 className="text-xl font-semibold text-white">{selectedNode.name}</h3>
                            <p className="text-slate-300 text-sm">{selectedNode.city}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${nodeStatusStyles[selectedNode.status].badge}`}>
                            {nodeStatusStyles[selectedNode.status].label}
                        </span>
                    </div>

                    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <dt className="text-slate-400 text-xs">平均延迟</dt>
                            <dd className="text-lg font-semibold text-white">{selectedNode.latencyMs} ms</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <dt className="text-slate-400 text-xs">带宽</dt>
                            <dd className="text-lg font-semibold text-white">{selectedNode.bandwidthGbps} Gbps</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <dt className="text-slate-400 text-xs">最近同步</dt>
                            <dd className="text-base font-semibold text-white">{selectedNode.lastSync}</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <dt className="text-slate-400 text-xs">连接数</dt>
                            <dd className="text-lg font-semibold text-white">{connectedEdges.length}</dd>
                        </div>
                    </dl>

                    <div className="mt-6 space-y-4">
                        <section>
                            <h4 className="text-xs uppercase tracking-widest text-slate-400">运行任务</h4>
                            <div className="mt-2 space-y-2">
                                {selectedNode.tasks.map((task) => (
                                    <div key={task} className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200">
                                        {task}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h4 className="text-xs uppercase tracking-widest text-slate-400">关联模型</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedNode.models.map((model) => (
                                    <span
                                        key={model}
                                        className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100"
                                    >
                                        {model}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}
