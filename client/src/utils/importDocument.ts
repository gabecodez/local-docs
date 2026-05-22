import { generateJSON } from "@tiptap/html";
import mammoth from "mammoth";

import { createEditorExtensions } from "../extensions/editorExtensions";
import { DEFAULT_MARGINS, type DocumentRecord, type PageMargins } from "../types/document";

export interface ImportedDocument {
  title: string;
  content: Record<string, unknown>;
  margins: PageMargins;
}

function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  return base || "Imported document";
}

function parseStoredDocument(raw: unknown, filename: string): ImportedDocument {
  const record = raw as Partial<DocumentRecord>;

  if (!record.content || typeof record.content !== "object") {
    throw new Error("Invalid document file: missing editor content");
  }

  return {
    title: typeof record.title === "string" && record.title.trim() ? record.title : titleFromFilename(filename),
    content: record.content as Record<string, unknown>,
    margins: record.margins ?? DEFAULT_MARGINS,
  };
}

export async function importDocumentFromFile(
  data: ArrayBuffer,
  filename: string,
): Promise<ImportedDocument> {
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".json")) {
    const text = new TextDecoder().decode(data);
    return parseStoredDocument(JSON.parse(text) as unknown, filename);
  }

  if (lowerName.endsWith(".docx")) {
    const result = await mammoth.convertToHtml({ arrayBuffer: data });
    const content = generateJSON(result.value, createEditorExtensions()) as Record<string, unknown>;

    return {
      title: titleFromFilename(filename),
      content,
      margins: DEFAULT_MARGINS,
    };
  }

  throw new Error("Unsupported file type. Open a .docx or .json document.");
}
