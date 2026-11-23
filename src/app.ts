import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { documentsRouter } from "./routes/documents.js";
import { healthRouter } from "./routes/health.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../client/dist");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(healthRouter);
  app.use("/api/documents", documentsRouter);

  if (env.NODE_ENV === "production") {
    app.use(express.static(clientDistPath));

    app.get(/.*/, (_req, res, next) => {
      if (_req.path.startsWith("/api/")) {
        next();
        return;
      }

      res.sendFile(path.join(clientDistPath, "index.html"), (error) => {
        if (error) {
          next(error);
        }
      });
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({
        name: "local-docs",
        message: "API is running. Start the React client with npm run dev:client.",
        endpoints: {
          health: "/health",
          documents: "/api/documents",
        },
      });
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}
