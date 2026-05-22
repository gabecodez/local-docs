import html2pdf from "html2pdf.js";

import { DOCUMENT_PAGE_CLASS } from "./documentLayout";

function waitForDocumentReady(doc: Document): Promise<void> {
  return new Promise((resolve) => {
    if (doc.readyState === "complete") {
      window.setTimeout(resolve, 150);
      return;
    }

    doc.defaultView?.addEventListener(
      "load",
      () => {
        window.setTimeout(resolve, 150);
      },
      { once: true },
    );
  });
}

/** Generate a PDF blob from a full HTML document string (browser-only path). */
export async function renderHtmlToPdfBuffer(html: string): Promise<ArrayBuffer> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:8.5in;height:11in;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const frameDocument = iframe.contentDocument;
  const frameWindow = iframe.contentWindow;

  if (!frameDocument || !frameWindow) {
    document.body.removeChild(iframe);
    throw new Error("Unable to prepare PDF render frame");
  }

  try {
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();

    await waitForDocumentReady(frameDocument);

    const pageElement = frameDocument.querySelector(`.${DOCUMENT_PAGE_CLASS}`);
    if (!pageElement) {
      throw new Error("PDF render failed: document page not found");
    }

    const blob = await html2pdf()
      .set({
        margin: 0,
        filename: "document.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      })
      .from(pageElement as HTMLElement)
      .outputPdf("blob");

    return blob.arrayBuffer();
  } finally {
    document.body.removeChild(iframe);
  }
}
