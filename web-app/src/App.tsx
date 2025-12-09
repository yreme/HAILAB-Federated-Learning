import { useEffect, useState } from "react";
import "./App.css";
import { TopNav } from "./components/layout/TopNav";
import { ModelGrid } from "./components/models/ModelGrid";
import { ModelDetailView } from "./components/models/ModelDetailView";
import { modelService } from "./services/modelService";
import type { ModelDetail, ModelSummary } from "./types";

function App() {
    const [models, setModels] = useState<ModelSummary[]>([]);
    const [selectedModel, setSelectedModel] = useState<ModelDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setLoading(true);
                const result = await modelService.listModels();
                setModels(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "加载失败");
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, []);

    const handleSelectModel = async (id: string) => {
        try {
            setDetailLoading(true);
            const detail = await modelService.getModelDetail(id);
            setSelectedModel(detail);
        } catch (err) {
            setError(err instanceof Error ? err.message : "加载模型失败");
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <div className="mx-auto max-w-7xl px-4 py-8">
                {loading ? (
                    <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">模型数据加载中...</div>
                ) : error ? (
                    <div className="rounded-lg bg-red-50 p-6 text-center text-sm text-red-600 shadow-md">{error}</div>
                ) : selectedModel ? (
                    <div className="relative">
                        {detailLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                            </div>
                        )}
                        <ModelDetailView
                            model={selectedModel}
                            peers={models}
                            onBack={() => setSelectedModel(null)}
                            onSelectPeer={(id) => {
                                if (id === selectedModel.id) return;
                                handleSelectModel(id);
                            }}
                        />
                    </div>
                ) : (
                    <ModelGrid models={models} onSelect={handleSelectModel} />
                )}
            </div>
        </div>
    );
}

export default App;
