import "dotenv/config";

import { startServer, stopServer, type StartedServer } from "./server.js";

let activeServer: StartedServer | undefined;

async function boot() {
  if (activeServer) {
    await stopServer(activeServer.server);
    activeServer = undefined;
  }

  activeServer = await startServer();
  console.log(`Server listening on ${activeServer.url}`);
}

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully`);

  if (!activeServer) {
    process.exit(0);
    return;
  }

  activeServer.server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

await boot();
