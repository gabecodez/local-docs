import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(0).default(3000),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"),
  DOCUMENTS_DIR: z.string().default("./data/documents"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = parsed.data;

export function getDocumentsDir(): string {
  return process.env.DOCUMENTS_DIR ?? config.DOCUMENTS_DIR;
}

export const env = {
  get NODE_ENV() {
    return config.NODE_ENV;
  },
  get PORT() {
    return config.PORT;
  },
  get DOCUMENTS_DIR() {
    return getDocumentsDir();
  },
  get corsOrigins() {
    return config.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  },
};
