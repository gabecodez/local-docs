export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && window.electronAPI?.apiBaseUrl) {
    return window.electronAPI.apiBaseUrl;
  }

  return import.meta.env.VITE_API_URL ?? "";
}

export function isElectronApp(): boolean {
  return typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);
}
