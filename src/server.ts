import type { Server } from "node:http";

import { createApp } from "./app.js";

export interface StartServerOptions {
  port?: number;
  host?: string;
  documentsDir?: string;
}

export interface StartedServer {
  server: Server;
  port: number;
  url: string;
}

function resolvePort(server: Server, requestedPort: number): number {
  const address = server.address();

  if (address && typeof address === "object") {
    return address.port;
  }

  if (requestedPort !== 0) {
    return requestedPort;
  }

  throw new Error("Unable to determine server port");
}

export function startServer(options: StartServerOptions = {}): Promise<StartedServer> {
  if (options.documentsDir) {
    process.env.DOCUMENTS_DIR = options.documentsDir;
  }

  const host = options.host ?? "127.0.0.1";
  const requestedPort = Number(process.env.PORT ?? options.port ?? 3000);

  if (!Number.isInteger(requestedPort) || requestedPort < 0) {
    return Promise.reject(new Error(`Invalid PORT value: ${process.env.PORT ?? options.port}`));
  }

  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(requestedPort, host, () => {
      try {
        const port = resolvePort(server, requestedPort);
        resolve({
          server,
          port,
          url: `http://${host}:${port}`,
        });
      } catch (error) {
        reject(error);
      }
    });

    server.on("error", reject);
  });
}

export function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
