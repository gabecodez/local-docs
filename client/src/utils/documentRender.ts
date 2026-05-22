import { generateHTML } from "@tiptap/html";

import { createEditorExtensions } from "../extensions/editorExtensions";
import type { PageMargins } from "../types/document";
import {
  DOCUMENT_CONTENT_CLASS,
  DOCUMENT_PAGE_CLASS,
  getDocumentPrintStyles,
} from "./documentLayout";

export interface DocumentRenderInput {
  title: string;
  content: Record<string, unknown>;
  margins: PageMargins;
}

function escapeHtml(text: string): string {
  return text.replace(/[<>&"]/g, (char) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
    return map[char] ?? char;
  });
}

/** Body HTML from TipTap JSON — single source for preview, print, and PDF. */
export function renderDocumentBodyHtml(content: Record<string, unknown>): string {
  return generateHTML(content, createEditorExtensions());
}

/** Full standalone HTML document for print and PDF export. */
export function renderFullDocumentHtml(input: DocumentRenderInput): string {
  const bodyHtml = renderDocumentBodyHtml(input.content);
  const safeTitle = escapeHtml(input.title.trim() || "Document");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>${getDocumentPrintStyles(input.margins)}</style>
</head>
<body>
  <article class="${DOCUMENT_PAGE_CLASS}">
    <div class="${DOCUMENT_CONTENT_CLASS}">${bodyHtml}</div>
  </article>
</body>
</html>`;
}
