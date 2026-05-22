import type { DocumentRecord } from "../types/document";
import { renderFullDocumentHtml } from "./documentRender";
import { downloadFileToDisk, saveFileToDisk } from "./fileAccess";
import { renderHtmlToPdfBuffer } from "./renderHtmlToPdf";
import { tiptapContentToDocxBuffer } from "./tiptapToDocx";

function sanitizeFilename(title: string): string {
  const cleaned = title.trim().replace(/[<>:"/\\|?*]+/g, "").replace(/\s+/g, " ");
  return cleaned || "document";
}

export async function saveDocumentAsDocx(document: DocumentRecord): Promise<SaveDocxResult> {
  const buffer = await tiptapContentToDocxBuffer(document.content, document.margins);
  const defaultName = `${sanitizeFilename(document.title)}.docx`;

  const result = await saveFileToDisk({
    data: buffer,
    defaultName,
    filters: [{ name: "Word document", extensions: ["docx"] }],
  });

  return {
    canceled: result.canceled,
    filePath: result.filePath,
  };
}

export interface SaveDocxResult {
  canceled: boolean;
  filePath?: string;
}

export interface ExportPdfResult {
  canceled: boolean;
  filePath?: string;
}

async function generatePdfBuffer(document: DocumentRecord): Promise<ArrayBuffer> {
  const html = renderFullDocumentHtml({
    title: document.title,
    content: document.content,
    margins: document.margins,
  });

  if (window.electronAPI?.generatePdf) {
    const result = await window.electronAPI.generatePdf({ html });

    if (!result.data) {
      throw new Error("PDF generation failed");
    }

    return Uint8Array.from(result.data).buffer;
  }

  return renderHtmlToPdfBuffer(html);
}

export async function exportDocumentToPdf(document: DocumentRecord): Promise<ExportPdfResult> {
  const defaultName = `${sanitizeFilename(document.title)}.pdf`;
  const pdfBuffer = await generatePdfBuffer(document);

  const saveResult = await downloadFileToDisk({
    data: pdfBuffer,
    defaultName,
  });

  return {
    canceled: saveResult.canceled,
    filePath: saveResult.filePath,
  };
}
