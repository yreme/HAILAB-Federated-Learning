export type TopologyNode = {
    id: string;
    name: string;
    city: string;
    type: "central" | "branch";
    coords: { x: number; y: number };
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
    },
    {
        id: "xmu",
        name: "厦门大学",
        city: "厦门",
        type: "central",
        coords: { x: 540, y: 300 },
    },
    {
        id: "shanghai",
        name: "上海港",
        city: "上海",
        type: "branch",
        coords: { x: 560, y: 250 },
    },
    {
        id: "ningbo",
        name: "宁波港",
        city: "宁波",
        type: "branch",
        coords: { x: 575, y: 270 },
    },
    {
        id: "qingdao",
        name: "青岛港",
        city: "青岛",
        type: "branch",
        coords: { x: 520, y: 200 },
    },
    {
        id: "tianjin",
        name: "天津港",
        city: "天津",
        type: "branch",
        coords: { x: 540, y: 180 },
    },
    {
        id: "shenzhen",
        name: "深圳港",
        city: "深圳",
        type: "branch",
        coords: { x: 500, y: 360 },
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
