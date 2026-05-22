export interface SaveFileRequest {
  data: ArrayBuffer;
  defaultName: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface SaveFileResult {
  canceled: boolean;
  filePath?: string;
}

export interface OpenFileRequest {
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface OpenFileResult {
  canceled: boolean;
  data?: ArrayBuffer;
  filePath?: string;
}

function triggerBrowserDownload(data: ArrayBuffer, defaultName: string): SaveFileResult {
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = defaultName;
  anchor.click();
  URL.revokeObjectURL(url);
  return { canceled: false };
}

function pickBrowserFile(accept: string): Promise<OpenFileResult> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener(
      "change",
      async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);

        if (!file) {
          resolve({ canceled: true });
          return;
        }

        resolve({
          canceled: false,
          data: await file.arrayBuffer(),
          filePath: file.name,
        });
      },
      { once: true },
    );

    input.click();
  });
}

export async function downloadFileToDisk(request: SaveFileRequest): Promise<SaveFileResult> {
  if (window.electronAPI?.downloadFile) {
    return window.electronAPI.downloadFile({
      data: Array.from(new Uint8Array(request.data)),
      defaultName: request.defaultName,
    });
  }

  return triggerBrowserDownload(request.data, request.defaultName);
}

export async function saveFileToDisk(request: SaveFileRequest): Promise<SaveFileResult> {
  if (window.electronAPI?.saveFile) {
    return window.electronAPI.saveFile({
      data: Array.from(new Uint8Array(request.data)),
      defaultName: request.defaultName,
      filters: request.filters,
    });
  }

  return triggerBrowserDownload(request.data, request.defaultName);
}

export async function openFileFromDisk(request: OpenFileRequest = {}): Promise<OpenFileResult> {
  if (window.electronAPI?.openFile) {
    const result = await window.electronAPI.openFile({ filters: request.filters });

    if (result.canceled || !result.data) {
      return { canceled: true };
    }

    return {
      canceled: false,
      data: Uint8Array.from(result.data).buffer,
      filePath: result.filePath,
    };
  }

  const accept = request.filters
    ?.flatMap((filter) => filter.extensions.map((extension) => `.${extension}`))
    .join(",") ?? ".docx,.json";

  return pickBrowserFile(accept);
}
