import { contextBridge, ipcRenderer } from "electron";

const apiBaseArg = process.argv.find((arg) => arg.startsWith("--api-base="));
const apiBaseUrl = apiBaseArg?.slice("--api-base=".length) ?? "http://127.0.0.1:3847";

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  apiBaseUrl,
  saveFile: (payload: {
    data: number[];
    defaultName: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => ipcRenderer.invoke("save-file", payload),
  downloadFile: (payload: { data: number[]; defaultName: string }) =>
    ipcRenderer.invoke("download-file", payload),
  openFile: (payload: { filters?: Array<{ name: string; extensions: string[] }> }) =>
    ipcRenderer.invoke("open-file", payload),
  printHtml: (html: string) => ipcRenderer.invoke("print-html", html),
  generatePdf: (payload: { html: string }) => ipcRenderer.invoke("generate-pdf", payload),
});
