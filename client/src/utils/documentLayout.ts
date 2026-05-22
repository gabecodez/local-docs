import type { CSSProperties } from "react";

import type { PageMargins } from "../types/document";

/** US Letter page and shared typography for print, PDF, preview, and DOCX. */
export const DOCUMENT_PAGE = {
  widthIn: 8.5,
  heightIn: 11,
} as const;

export const DOCUMENT_TYPOGRAPHY = {
  bodyFontFamily: "Arial, sans-serif",
  bodyFontShort: "Arial",
  bodyFontSizePt: 11,
  bodyLineHeight: 1.5,
  paragraphGapPt: 12,
  h1SizePt: 24,
  h1LineHeight: 1.2,
  h2SizePt: 18,
  h2LineHeight: 1.25,
  h3SizePt: 14,
  h3LineHeight: 1.3,
  listPaddingLeftPx: 36,
  blockquoteBorderPx: 3,
  blockquotePaddingLeftPx: 16,
  blockquoteBorderColor: "#dadce0",
  blockquoteTextColor: "#5f6368",
  linkColor: "#1155cc",
} as const;

export const DOCUMENT_PAGE_CLASS = "document-page";
export const DOCUMENT_CONTENT_CLASS = "document-content";

/** DOCX uses half-points for font size (11pt → 22). */
export function ptToHalfPoints(pt: number): number {
  return Math.round(pt * 2);
}

/** DOCX paragraph spacing after is in twentieths of a point. */
export function paragraphSpacingAfter(): number {
  return Math.round(DOCUMENT_TYPOGRAPHY.paragraphGapPt * 20);
}

/** ~36px list indent at 96dpi → 0.375in → 540 twips. */
export function listIndentTwips(): number {
  return Math.round((DOCUMENT_TYPOGRAPHY.listPaddingLeftPx / 96) * 1440);
}

/** Blockquote left indent (0.5in). */
export function blockquoteIndentTwips(): number {
  return 720;
}

export function headingSizePt(level: number): number {
  if (level === 1) {
    return DOCUMENT_TYPOGRAPHY.h1SizePt;
  }
  if (level === 2) {
    return DOCUMENT_TYPOGRAPHY.h2SizePt;
  }
  return DOCUMENT_TYPOGRAPHY.h3SizePt;
}

export function inchesToTwip(inches: number): number {
  return Math.round(inches * 1440);
}

export function pageMarginPaddingStyle(margins: PageMargins): CSSProperties {
  return {
    paddingTop: `${margins.top}in`,
    paddingRight: `${margins.right}in`,
    paddingBottom: `${margins.bottom}in`,
    paddingLeft: `${margins.left}in`,
  };
}

export function pageMarginPaddingCss(margins: PageMargins): string {
  return [
    `padding-top:${margins.top}in`,
    `padding-right:${margins.right}in`,
    `padding-bottom:${margins.bottom}in`,
    `padding-left:${margins.left}in`,
  ].join(";");
}

function documentContentCss(): string {
  const t = DOCUMENT_TYPOGRAPHY;
  const c = DOCUMENT_CONTENT_CLASS;

  return `
    .${c} p,
    .${c} h1,
    .${c} h2,
    .${c} h3,
    .${c} blockquote,
    .${c} ul,
    .${c} ol {
      margin: 0 0 ${t.paragraphGapPt}pt;
    }

    .${c} h1 {
      font-size: ${t.h1SizePt}pt;
      line-height: ${t.h1LineHeight};
      font-weight: 700;
    }

    .${c} h2 {
      font-size: ${t.h2SizePt}pt;
      line-height: ${t.h2LineHeight};
      font-weight: 700;
    }

    .${c} h3 {
      font-size: ${t.h3SizePt}pt;
      line-height: ${t.h3LineHeight};
      font-weight: 700;
    }

    .${c} ul,
    .${c} ol {
      padding-left: ${t.listPaddingLeftPx}px;
    }

    .${c} blockquote {
      border-left: ${t.blockquoteBorderPx}px solid ${t.blockquoteBorderColor};
      padding-left: ${t.blockquotePaddingLeftPx}px;
      color: ${t.blockquoteTextColor};
    }

    .${c} a {
      color: ${t.linkColor};
      text-decoration: underline;
    }

    .${c} mark {
      border-radius: 2px;
      padding: 0 1px;
    }

    .${c} img {
      max-width: 100%;
      height: auto;
    }

    .${c} p:last-child,
    .${c} h1:last-child,
    .${c} h2:last-child,
    .${c} h3:last-child,
    .${c} blockquote:last-child,
    .${c} ul:last-child,
    .${c} ol:last-child {
      margin-bottom: 0;
    }
  `;
}

function documentPageShellCss(): string {
  const t = DOCUMENT_TYPOGRAPHY;
  const p = DOCUMENT_PAGE;
  const page = DOCUMENT_PAGE_CLASS;

  return `
    .${page} {
      width: ${p.widthIn}in;
      min-height: ${p.heightIn}in;
      box-sizing: border-box;
      background: #fff;
      color: #000;
      font-family: ${t.bodyFontFamily};
      font-size: ${t.bodyFontSizePt}pt;
      line-height: ${t.bodyLineHeight};
    }
  `;
}

/** Styles for in-app print preview (modal chrome is separate). */
export function getDocumentPreviewStyles(): string {
  return `${documentPageShellCss()}\n${documentContentCss()}`;
}

/** Full stylesheet for standalone print/PDF HTML documents. */
export function getDocumentPrintStyles(margins: PageMargins): string {
  const page = DOCUMENT_PAGE_CLASS;

  return `
    @page {
      size: letter portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: ${DOCUMENT_TYPOGRAPHY.bodyFontFamily};
      font-size: ${DOCUMENT_TYPOGRAPHY.bodyFontSizePt}pt;
      line-height: ${DOCUMENT_TYPOGRAPHY.bodyLineHeight};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .${page} {
      width: ${DOCUMENT_PAGE.widthIn}in;
      min-height: ${DOCUMENT_PAGE.heightIn}in;
      margin: 0 auto;
      ${pageMarginPaddingCss(margins)}
      overflow: visible;
      box-sizing: border-box;
      background: #fff;
      color: #000;
      font-family: ${DOCUMENT_TYPOGRAPHY.bodyFontFamily};
      font-size: ${DOCUMENT_TYPOGRAPHY.bodyFontSizePt}pt;
      line-height: ${DOCUMENT_TYPOGRAPHY.bodyLineHeight};
    }

    ${documentContentCss()}
  `;
}
