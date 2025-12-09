import type { ModelDetail } from "../../types";
import pedestrian from "./pedestrian-safety-monitor.json";
import foundation from "./foundation.json";
import autoGrab from "./auto-grab-control.json";
import autoDrop from "./auto-drop-control.json";
import assistGrab from "./assist-grab-vision.json";
import assistDrop from "./assist-drop-vision.json";
import antiSway from "./anti-sway-protection.json";

const dataset = [
    pedestrian,
    foundation,
    autoGrab,
    autoDrop,
    assistGrab,
    assistDrop,
    antiSway,
] as ModelDetail[];

export const modelDataset: ModelDetail[] = dataset;
export const modelMap: Record<string, ModelDetail> = Object.fromEntries(dataset.map((model) => [model.id, model]));
