import type { ModelDetail, ModelSummary } from "../types";
import { modelDataset, modelMap } from "../data/models";

const sleep = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T,>(value: T): T =>
    typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const toSummary = (model: ModelDetail): ModelSummary => ({
    id: model.id,
    name: model.name,
    category: model.category,
    description: model.description,
    thumbnail: model.thumbnail,
    tags: model.tags,
    status: model.status,
    summary: model.summary,
});

export const modelService = {
    async listModels(): Promise<ModelSummary[]> {
        await sleep(200);
        return modelDataset.map(toSummary);
    },
    async getModelDetail(id: string): Promise<ModelDetail> {
        await sleep(300);
        const detail = modelMap[id];
        if (!detail) {
            throw new Error(`模型 ${id} 不存在`);
        }
        return clone(detail);
    },
};
