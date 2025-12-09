export type NodeStatus = "active" | "degraded" | "offline";

export type TopologyNode = {
    id: string;
    name: string;
    city: string;
    type: "central" | "branch";
    coords: { x: number; y: number };
    status: NodeStatus;
    latencyMs: number;
    bandwidthGbps: number;
    lastSync: string;
    tasks: string[];
    models: string[];
};

export type TopologyEdge = {
    from: string;
    to: string;
    status: "sync" | "pending" | "idle";
};

export const topologyNodes: TopologyNode[] = [
    {
        id: "boda-xm",
        name: "博大(厦门)总部",
        city: "厦门",
        type: "central",
        coords: { x: 520, y: 320 },
        status: "active",
        latencyMs: 42,
        bandwidthGbps: 40,
        lastSync: "15 秒前",
        tasks: ["港区垂类联邦-42轮", "多模态安全调度"],
        models: ["港口垂类大模型", "抓放箱行人危险检测模型"],
    },
    {
        id: "xmu",
        name: "厦门大学",
        city: "厦门",
        type: "central",
        coords: { x: 540, y: 300 },
        status: "active",
        latencyMs: 55,
        bandwidthGbps: 20,
        lastSync: "1 分钟前",
        tasks: ["差分隐私实验", "模型蒸馏评测"],
        models: ["视觉辅助抓箱模型"],
    },
    {
        id: "shanghai",
        name: "上海港",
        city: "上海",
        type: "branch",
        coords: { x: 560, y: 250 },
        status: "active",
        latencyMs: 76,
        bandwidthGbps: 18,
        lastSync: "28 秒前",
        tasks: ["夜班超分辨", "危险等级自更新"],
        models: ["抓放箱行人危险检测模型", "自动抓箱控制模型"],
    },
    {
        id: "ningbo",
        name: "宁波港",
        city: "宁波",
        type: "branch",
        coords: { x: 575, y: 270 },
        status: "active",
        latencyMs: 83,
        bandwidthGbps: 15,
        lastSync: "45 秒前",
        tasks: ["堆场虚拟仿真"],
        models: ["港口垂类大模型"],
    },
    {
        id: "qingdao",
        name: "青岛港",
        city: "青岛",
        type: "branch",
        coords: { x: 520, y: 200 },
        status: "degraded",
        latencyMs: 118,
        bandwidthGbps: 8,
        lastSync: "3 分钟前",
        tasks: ["雾霾特化"],
        models: ["港口垂类大模型"],
    },
    {
        id: "tianjin",
        name: "天津港",
        city: "天津",
        type: "branch",
        coords: { x: 540, y: 180 },
        status: "degraded",
        latencyMs: 132,
        bandwidthGbps: 6,
        lastSync: "5 分钟前",
        tasks: ["光纤维护"],
        models: ["辅助抓箱模型"],
    },
    {
        id: "shenzhen",
        name: "深圳港",
        city: "深圳",
        type: "branch",
        coords: { x: 500, y: 360 },
        status: "active",
        latencyMs: 65,
        bandwidthGbps: 14,
        lastSync: "20 秒前",
        tasks: ["危险等级自更新"],
        models: ["抓放箱行人危险检测模型"],
    },
];

export const topologyEdges: TopologyEdge[] = [
    { from: "boda-xm", to: "xmu", status: "sync" },
    { from: "boda-xm", to: "shanghai", status: "sync" },
    { from: "boda-xm", to: "ningbo", status: "sync" },
    { from: "boda-xm", to: "qingdao", status: "pending" },
    { from: "boda-xm", to: "tianjin", status: "pending" },
    { from: "boda-xm", to: "shenzhen", status: "sync" },
    { from: "xmu", to: "shanghai", status: "sync" },
    { from: "xmu", to: "qingdao", status: "idle" },
];
