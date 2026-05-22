import { useMemo } from "react";

import type { PageMargins } from "../types/document";
import {
  DOCUMENT_CONTENT_CLASS,
  DOCUMENT_PAGE_CLASS,
  getDocumentPreviewStyles,
  pageMarginPaddingStyle,
} from "../utils/documentLayout";
import { renderDocumentBodyHtml } from "../utils/documentRender";

interface PrintPreviewModalProps {
  title: string;
  content: Record<string, unknown>;
  margins: PageMargins;
  onClose: () => void;
  onPrint: () => void;
}

export function PrintPreviewModal({ title, content, margins, onClose, onPrint }: PrintPreviewModalProps) {
  const bodyHtml = useMemo(() => renderDocumentBodyHtml(content), [content]);
  const previewStyles = useMemo(() => getDocumentPreviewStyles(), []);

  return (
    <div className="docs-modal-backdrop docs-print-backdrop" role="presentation">
      <style>{previewStyles}</style>
      <div className="docs-print-modal" role="dialog" aria-labelledby="print-preview-title">
        <header className="docs-print-header">
          <h2 id="print-preview-title">Print preview — {title || "Untitled document"}</h2>
          <div className="docs-print-actions">
            <button className="docs-secondary-button" onClick={onClose} type="button">
              Close
            </button>
            <button className="docs-primary-button" onClick={onPrint} type="button">
              Print
            </button>
          </div>
        </header>

        <div className="docs-print-scroll">
          <div className="docs-print-sheet">
            <article
              className={`docs-print-page ${DOCUMENT_PAGE_CLASS}`}
              style={pageMarginPaddingStyle(margins)}
            >
              <div
                className={DOCUMENT_CONTENT_CLASS}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
