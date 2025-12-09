import { topologyEdges, topologyNodes } from "../../data/networkTopology";

const edgeColors: Record<typeof topologyEdges[number]["status"], string> = {
    sync: "#4ade80",
    pending: "#f97316",
    idle: "#94a3b8",
};

export function FederatedTopologyMap() {
    return (
        <div className="rounded-xl bg-slate-900 text-white shadow-inner">
            <svg viewBox="0 0 800 500" className="h-72 w-full">
                <defs>
                    <linearGradient id="chinaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#312e81" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.25" />
                    </linearGradient>
                    <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect width="800" height="500" fill="url(#chinaGradient)" rx="24" />
                <image
                    href="https://upload.wikimedia.org/wikipedia/commons/6/6d/China_-_outline_map.svg"
                    width="700"
                    height="460"
                    x="40"
                    y="20"
                    opacity="0.15"
                    preserveAspectRatio="xMidYMid meet"
                />

                {topologyEdges.map((edge) => {
                    const from = topologyNodes.find((node) => node.id === edge.from);
                    const to = topologyNodes.find((node) => node.id === edge.to);
                    if (!from || !to) return null;
                    const color = edgeColors[edge.status];
                    return (
                        <g key={`${edge.from}-${edge.to}`}>
                            <line
                                x1={from.coords.x}
                                y1={from.coords.y}
                                x2={to.coords.x}
                                y2={to.coords.y}
                                stroke="url(#edgeGlow)"
                                strokeWidth={5}
                                opacity={0.4}
                            />
                            <line
                                x1={from.coords.x}
                                y1={from.coords.y}
                                x2={to.coords.x}
                                y2={to.coords.y}
                                stroke={color}
                                strokeWidth={2.5}
                                strokeDasharray="6 6"
                                className="edge-dash"
                            />
                        </g>
                    );
                })}

                {topologyNodes.map((node) => (
                    <g key={node.id}>
                        {node.type === "central" && (
                            <circle
                                cx={node.coords.x}
                                cy={node.coords.y}
                                r={16}
                                fill="#f472b6"
                                opacity={0.35}
                                filter="url(#nodeGlow)"
                            />
                        )}
                        <circle
                            cx={node.coords.x}
                            cy={node.coords.y}
                            r={node.type === "central" ? 10 : 7}
                            fill={node.type === "central" ? "#fbbf24" : "#38bdf8"}
                            stroke="#0f172a"
                            strokeWidth={2}
                        />
                        <text x={node.coords.x + 12} y={node.coords.y - 6} className="fill-white text-[11px] font-semibold">
                            {node.name}
                        </text>
                        <text x={node.coords.x + 12} y={node.coords.y + 10} className="fill-slate-300 text-[9px]">
                            {node.type === "central" ? "中心节点" : "分节点"}
                        </text>
                    </g>
                ))}
            </svg>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-slate-300">
                <div>
                    <span className="font-semibold text-white">中心节点：</span>
                    博大(厦门)总部 · 厦门大学
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-green-400" /> 同步中</span>
                    <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-orange-400" /> 排队</span>
                    <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-slate-400" /> 待命</span>
                </div>
            </div>
        </div>
    );
}
