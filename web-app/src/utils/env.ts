export function getRoboflowApiKey(): string | null {
    if (typeof window !== "undefined" && window.Robo_API_KEY) {
        return window.Robo_API_KEY;
    }
    if (typeof import.meta !== "undefined" && (import.meta as ImportMeta)?.env?.VITE_ROBO_API_KEY) {
        return (import.meta as ImportMeta).env.VITE_ROBO_API_KEY ?? null;
    }
    return null;
}
