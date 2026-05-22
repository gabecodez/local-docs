import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { AppError } from "../middleware/errorHandler.js";
import {
  DEFAULT_MARGINS,
  type DocumentRecord,
  type DocumentSummary,
  type PageMargins,
} from "../types/document.js";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function documentPath(documentsDir: string, id: string): string {
  if (!ID_PATTERN.test(id)) {
    throw new AppError(400, "Invalid document id");
  }

  return path.join(documentsDir, `${id}.json`);
}

async function ensureDocumentsDir(documentsDir: string): Promise<void> {
  await mkdir(documentsDir, { recursive: true });
}

function normalizeMargins(margins?: Partial<PageMargins>): PageMargins {
  return {
    top: margins?.top ?? DEFAULT_MARGINS.top,
    right: margins?.right ?? DEFAULT_MARGINS.right,
    bottom: margins?.bottom ?? DEFAULT_MARGINS.bottom,
    left: margins?.left ?? DEFAULT_MARGINS.left,
  };
}

function normalizeRecord(raw: DocumentRecord): DocumentRecord {
  return {
    ...raw,
    margins: normalizeMargins(raw.margins),
  };
}

function toSummary(record: DocumentRecord): DocumentSummary {
  return {
    id: record.id,
    title: record.title,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listDocuments(documentsDir: string): Promise<DocumentSummary[]> {
  await ensureDocumentsDir(documentsDir);

  const entries = await readdir(documentsDir, { withFileTypes: true });
  const documents = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const raw = await readFile(path.join(documentsDir, entry.name), "utf8");
        const record = normalizeRecord(JSON.parse(raw) as DocumentRecord);
        return toSummary(record);
      }),
  );

  return documents.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getDocument(
  documentsDir: string,
  id: string,
): Promise<DocumentRecord> {
  await ensureDocumentsDir(documentsDir);

  try {
    const raw = await readFile(documentPath(documentsDir, id), "utf8");
    return normalizeRecord(JSON.parse(raw) as DocumentRecord);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AppError(404, "Document not found");
    }

    throw error;
  }
}

export async function createDocument(
  documentsDir: string,
  title = "Untitled document",
): Promise<DocumentRecord> {
  await ensureDocumentsDir(documentsDir);

  const now = new Date().toISOString();
  const record: DocumentRecord = {
    id: randomUUID(),
    title,
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    margins: { ...DEFAULT_MARGINS },
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(documentPath(documentsDir, record.id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function updateDocument(
  documentsDir: string,
  id: string,
  updates: {
    title?: string;
    content?: Record<string, unknown>;
    margins?: PageMargins;
  },
): Promise<DocumentRecord> {
  const existing = await getDocument(documentsDir, id);
  const record: DocumentRecord = {
    ...existing,
    title: updates.title ?? existing.title,
    content: updates.content ?? existing.content,
    margins: updates.margins ?? existing.margins,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(documentPath(documentsDir, id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function deleteDocument(documentsDir: string, id: string): Promise<void> {
  await ensureDocumentsDir(documentsDir);

  try {
    await unlink(documentPath(documentsDir, id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AppError(404, "Document not found");
    }

    throw error;
  }
}
