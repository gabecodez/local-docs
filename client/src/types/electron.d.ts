export {};

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      apiBaseUrl: string;
      saveFile: (payload: {
        data: number[];
        defaultName: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ canceled: boolean; filePath?: string }>;
      downloadFile: (payload: {
        data: number[];
        defaultName: string;
      }) => Promise<{ canceled: boolean; filePath?: string }>;
      openFile: (payload: {
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ canceled: boolean; data?: number[]; filePath?: string }>;
      printHtml: (html: string) => Promise<void>;
      generatePdf: (payload: { html: string }) => Promise<{ data: number[] }>;
    };
  }
}
