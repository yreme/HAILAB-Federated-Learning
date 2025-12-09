import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { topologyEdges, topologyNodes, type NodeStatus } from "../../data/networkTopology";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAP_CENTER: [number, number] = [112.5, 30.5];
const edgeColors: Record<typeof topologyEdges[number]["status"], string> = {
    sync: "#4ade80",
    pending: "#f97316",
    idle: "#94a3b8",
};

const nodeStatusStyles: Record<NodeStatus, { label: string; dot: string; badge: string }> = {
    active: { label: "在线", dot: "bg-emerald-400", badge: "bg-emerald-500/20 text-emerald-200" },
    degraded: { label: "网络异常", dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-200" },
    offline: { label: "离线", dot: "bg-rose-400", badge: "bg-rose-500/20 text-rose-200" },
};

type LineFeature = GeoJSON.Feature<GeoJSON.LineString, { status: typeof topologyEdges[number]["status"] }>;

const buildEdgeCollection = (focusedNodeId?: string): GeoJSON.FeatureCollection<GeoJSON.LineString> => {
    const features: LineFeature[] = [];
    topologyEdges.forEach((edge) => {
        if (focusedNodeId && edge.from !== focusedNodeId && edge.to !== focusedNodeId) {
            return;
        }
        const from = topologyNodes.find((node) => node.id === edge.from);
        const to = topologyNodes.find((node) => node.id === edge.to);
        if (!from || !to) return;
        features.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [from.location.lng, from.location.lat],
                    [to.location.lng, to.location.lat],
                ],
            },
            properties: { status: edge.status },
        });
    });
    return {
        type: "FeatureCollection",
        features,
    };
};

export function FederatedTopologyMap() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRefs = useRef<Record<string, { element: HTMLButtonElement; marker: maplibregl.Marker }>>({});
    const [mapReady, setMapReady] = useState(false);
    const defaultNodeId = topologyNodes[0]?.id ?? "";
    const [selectedNodeId, setSelectedNodeId] = useState<string>(defaultNodeId);
    const selectedNode = useMemo(
        () => topologyNodes.find((node) => node.id === selectedNodeId) ?? topologyNodes[0],
        [selectedNodeId]
    );
    const connectedEdges = useMemo(
        () => topologyEdges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId),
        [selectedNodeId]
    );

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: MAP_CENTER,
            zoom: 4.2,
            attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

        const handleLoad = () => {
            map.addSource("federated-edges", {
                type: "geojson",
                data: buildEdgeCollection(),
            });
            map.addLayer({
                id: "federated-edges",
                type: "line",
                source: "federated-edges",
                paint: {
                    "line-color": [
                        "match",
                        ["get", "status"],
                        "sync",
                        edgeColors.sync,
                        "pending",
                        edgeColors.pending,
                        "idle",
                        edgeColors.idle,
                        edgeColors.idle,
                    ],
                    "line-width": 2.5,
                    "line-opacity": 0.75,
                    "line-dasharray": [2, 1.2],
                },
            });

            map.addSource("selected-edges", {
                type: "geojson",
                data: buildEdgeCollection(defaultNodeId),
            });
            map.addLayer({
                id: "selected-edges",
                type: "line",
                source: "selected-edges",
                paint: {
                    "line-color": [
                        "match",
                        ["get", "status"],
                        "sync",
                        edgeColors.sync,
                        "pending",
                        edgeColors.pending,
                        "idle",
                        edgeColors.idle,
                        edgeColors.idle,
                    ],
                    "line-width": 4.5,
                    "line-opacity": 0.95,
                    "line-blur": 0.2,
                },
            });

            topologyNodes.forEach((node) => {
                const element = document.createElement("button");
                element.className =
                    "group rounded-full border border-white/20 bg-slate-900/80 px-3 py-2 text-left text-[10px] text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:scale-105";
                element.innerHTML = `
                    <span class="flex items-center gap-1">
                        <span class="h-2.5 w-2.5 rounded-full ${node.type === "central" ? "bg-amber-300" : "bg-sky-300"}"></span>
                        <span class="text-[11px] font-semibold">${node.name}</span>
                    </span>
                    <span class="mt-0.5 block text-[9px] text-slate-300">${node.city}</span>
                `;
                element.onclick = (event) => {
                    event.stopPropagation();
                    setSelectedNodeId(node.id);
                };
                const marker = new maplibregl.Marker({ element, anchor: "bottom" })
                    .setLngLat([node.location.lng, node.location.lat])
                    .addTo(map);
                markerRefs.current[node.id] = { element, marker };
            });

            setMapReady(true);
        };

        if (map.isStyleLoaded()) {
            handleLoad();
        } else {
            map.once("load", handleLoad);
        }

        return () => {
            Object.values(markerRefs.current).forEach(({ marker }) => marker.remove());
            markerRefs.current = {};
            map.remove();
        };
    }, []);

    useEffect(() => {
        Object.entries(markerRefs.current).forEach(([id, { element }]) => {
            const classes = ["ring-2", "ring-indigo-400/70", "shadow-indigo-500/30"];
            if (id === selectedNodeId) {
                element.classList.add(...classes);
            } else {
                element.classList.remove(...classes);
            }
        });

        if (!mapReady) return;
        const map = mapRef.current;
        if (!map) return;
        const source = map.getSource("selected-edges") as maplibregl.GeoJSONSource | undefined;
        if (source) {
            source.setData(buildEdgeCollection(selectedNodeId));
        }
        if (selectedNode) {
            map.easeTo({
                center: [selectedNode.location.lng, selectedNode.location.lat],
                zoom: Math.max(map.getZoom(), 5),
                duration: 800,
            });
        }
    }, [mapReady, selectedNode, selectedNodeId]);

    if (!selectedNode) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 text-white shadow-2xl">
            <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <div ref={mapContainerRef} className="h-[360px] w-full lg:h-[560px]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-900/40 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    <div className="pointer-events-auto absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded-full bg-slate-900/80 px-4 py-2 text-xs text-slate-200 shadow-xl">
                        <span className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: edgeColors.sync }} /> 同步
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: edgeColors.pending }} /> 排队
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: edgeColors.idle }} /> 待命
                        </span>
                        <span className="text-[10px] text-slate-400">点击节点可查看详情</span>
                    </div>
                </div>

                <aside className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400">选中节点</p>
                            <h3 className="text-xl font-semibold text-white">{selectedNode.name}</h3>
                            <p className="text-sm text-slate-400">{selectedNode.city}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${nodeStatusStyles[selectedNode.status].badge}`}>
                            {nodeStatusStyles[selectedNode.status].label}
                        </span>
                    </header>

                    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-xl bg-slate-900/60 p-3">
                            <dt className="text-xs text-slate-400">平均延迟</dt>
                            <dd className="text-lg font-semibold text-white">{selectedNode.latencyMs} ms</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3">
                            <dt className="text-xs text-slate-400">带宽</dt>
                            <dd className="text-lg font-semibold text-white">{selectedNode.bandwidthMbps} Mbps</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3">
                            <dt className="text-xs text-slate-400">最近同步</dt>
                            <dd className="text-base font-semibold text-white">{selectedNode.lastSync}</dd>
                        </div>
                        <div className="rounded-xl bg-slate-900/60 p-3">
                            <dt className="text-xs text-slate-400">联邦连接</dt>
                            <dd className="text-lg font-semibold text-white">{connectedEdges.length}</dd>
                        </div>
                    </dl>

                    <section className="mt-6">
                        <h4 className="text-xs uppercase tracking-widest text-slate-400">运行任务</h4>
                        <div className="mt-2 space-y-2">
                            {selectedNode.tasks.map((task) => (
                                <div key={task} className="rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-xs text-slate-200">
                                    {task}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-4">
                        <h4 className="text-xs uppercase tracking-widest text-slate-400">关联模型</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedNode.models.map((model) => (
                                <span key={model} className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                                    {model}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="mt-6">
                        <h4 className="text-xs uppercase tracking-widest text-slate-400">全部节点</h4>
                        <div className="mt-3 space-y-2">
                            {topologyNodes.map((node) => (
                                <button
                                    key={node.id}
                                    onClick={() => setSelectedNodeId(node.id)}
                                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                                        node.id === selectedNodeId
                                            ? "border-indigo-400/60 bg-indigo-500/10 text-indigo-100"
                                            : "border-white/10 bg-slate-900/40 text-slate-200 hover:border-indigo-400/40 hover:text-white"
                                    }`}
                                >
                                    <div>
                                        <div className="font-semibold">{node.name}</div>
                                        <div className="text-xs text-slate-400">{node.city}</div>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${nodeStatusStyles[node.status].badge}`}>
                                        {nodeStatusStyles[node.status].label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
