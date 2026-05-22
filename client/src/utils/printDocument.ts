import type { DocumentRenderInput } from "./documentRender";
import { renderFullDocumentHtml } from "./documentRender";

export async function printDocument(input: DocumentRenderInput): Promise<void> {
  const html = renderFullDocumentHtml(input);

  if (window.electronAPI?.printHtml) {
    await window.electronAPI.printHtml(html);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument;

  if (!frameWindow || !frameDocument) {
    document.body.removeChild(iframe);
    throw new Error("Unable to prepare print frame");
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  await new Promise<void>((resolve) => {
    frameWindow.addEventListener("afterprint", () => resolve(), { once: true });
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(resolve, 1500);
  });

  document.body.removeChild(iframe);
}
