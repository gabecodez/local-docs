import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { randomUUID } from "node:crypto";
import { unlink, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PORT = 3847;
const VITE_DEV_URL = "http://127.0.0.1:5173";
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

interface StartedServer {
  port: number;
  url: string;
}

interface StartServerOptions {
  port?: number;
  host?: string;
  documentsDir?: string;
}

interface ServerModule {
  startServer: (options?: StartServerOptions) => Promise<StartedServer>;
}

interface SaveFilePayload {
  data: number[];
  defaultName: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

interface OpenFilePayload {
  filters?: Array<{ name: string; extensions: string[] }>;
}

async function loadHtmlInHiddenWindow(html: string): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    show: false,
    width: 816,
    height: 1056,
    webPreferences: {
      sandbox: false,
    },
  });

  const tempPath = path.join(tmpdir(), `local-docs-${randomUUID()}.html`);
  await writeFile(tempPath, html, "utf8");

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out loading document for PDF export"));
      }, 15000);

      window.webContents.once("did-finish-load", () => {
        clearTimeout(timeout);
        resolve();
      });

      window.webContents.once("did-fail-load", (_event, _code, description) => {
        clearTimeout(timeout);
        reject(new Error(description || "Failed to load document for PDF export"));
      });

      void window.loadFile(tempPath);
    });

    await window.webContents.executeJavaScript(`
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })
    `);
  } finally {
    void unlink(tempPath).catch(() => undefined);
  }

  return window;
}

async function startBackend(): Promise<string> {
  process.env.NODE_ENV = isDev ? "development" : "production";
  process.env.PORT = String(SERVER_PORT);
  process.env.DOCUMENTS_DIR = path.join(app.getPath("userData"), "documents");
  process.env.CORS_ORIGIN =
    "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:3847,http://localhost:3847";

  const serverPath = path.join(app.getAppPath(), "dist", "server.js");
  const serverModuleUrl = pathToFileURL(serverPath).href;
  const { startServer } = (await import(serverModuleUrl)) as ServerModule;
  const started = await startServer({
    host: "127.0.0.1",
    port: SERVER_PORT,
    documentsDir: process.env.DOCUMENTS_DIR,
  });

  return started.url;
}

async function createMainWindow() {
  const serverUrl = await startBackend();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: "Local Docs",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--api-base=${serverUrl}`],
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (isDev) {
    await mainWindow.loadURL(VITE_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    await mainWindow.loadURL(serverUrl);
  }
}

function registerFileHandlers() {
  ipcMain.handle("save-file", async (_event, payload: SaveFilePayload) => {
    const result = await dialog.showSaveDialog({
      defaultPath: payload.defaultName,
      filters: payload.filters ?? [{ name: "All files", extensions: ["*"] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    await writeFile(result.filePath, Buffer.from(payload.data));
    return { canceled: false, filePath: result.filePath };
  });

  ipcMain.handle("open-file", async (_event, payload: OpenFilePayload) => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: payload.filters ?? [
        { name: "Documents", extensions: ["docx", "json"] },
        { name: "All files", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    if (!filePath) {
      return { canceled: true };
    }

    const data = await readFile(filePath);
    return {
      canceled: false,
      filePath,
      data: Array.from(data),
    };
  });

  ipcMain.handle("print-html", async (_event, html: string) => {
    const window = await loadHtmlInHiddenWindow(html);

    await new Promise<void>((resolve, reject) => {
      window.webContents.print({ printBackground: true, silent: false }, (success, failureReason) => {
        window.destroy();

        if (!success) {
          reject(new Error(failureReason));
          return;
        }

        resolve();
      });
    });
  });

  ipcMain.handle("download-file", async (_event, payload: SaveFilePayload) => {
    const downloadsDir = app.getPath("downloads");
    const filePath = path.join(downloadsDir, payload.defaultName);
    await writeFile(filePath, Buffer.from(payload.data));
    return { canceled: false, filePath };
  });

  ipcMain.handle("generate-pdf", async (_event, payload: { html: string }) => {
    const window = await loadHtmlInHiddenWindow(payload.html);

    try {
      const pdfBuffer = await window.webContents.printToPDF({
        printBackground: true,
        pageSize: "Letter",
        margins: {
          marginType: "custom",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      });

      return { data: Array.from(pdfBuffer) };
    } finally {
      window.destroy();
    }
  });
}

app.whenReady().then(() => {
  registerFileHandlers();

  void createMainWindow().catch((error: unknown) => {
    console.error("Failed to start Local Docs:", error);
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow().catch((error: unknown) => {
        console.error("Failed to start Local Docs:", error);
        app.quit();
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
