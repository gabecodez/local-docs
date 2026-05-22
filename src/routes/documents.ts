import { Router } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "../services/documentStore.js";

const marginsSchema = z.object({
  top: z.number().min(0).max(4),
  right: z.number().min(0).max(4),
  bottom: z.number().min(0).max(4),
  left: z.number().min(0).max(4),
});

const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.record(z.unknown()).optional(),
  margins: marginsSchema.optional(),
});

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body ?? {});

  if (!parsed.success) {
    throw new AppError(400, "Invalid document payload");
  }

  return parsed.data;
}

export const documentsRouter = Router();

documentsRouter.get("/", async (_req, res) => {
  const documents = await listDocuments(env.DOCUMENTS_DIR);
  res.json({ documents });
});

documentsRouter.post("/", async (req, res) => {
  const { title } = parseBody(createDocumentSchema, req.body);
  const document = await createDocument(env.DOCUMENTS_DIR, title);
  res.status(201).json({ document });
});

documentsRouter.get("/:id", async (req, res) => {
  const document = await getDocument(env.DOCUMENTS_DIR, req.params.id);
  res.json({ document });
});

documentsRouter.patch("/:id", async (req, res) => {
  const updates = parseBody(updateDocumentSchema, req.body);

  if (
    updates.title === undefined &&
    updates.content === undefined &&
    updates.margins === undefined
  ) {
    throw new AppError(400, "Nothing to update");
  }

  const document = await updateDocument(env.DOCUMENTS_DIR, req.params.id, updates);
  res.json({ document });
});

documentsRouter.delete("/:id", async (req, res) => {
  await deleteDocument(env.DOCUMENTS_DIR, req.params.id);
  res.status(204).send();
});
