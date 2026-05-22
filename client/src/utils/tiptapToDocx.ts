import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";

import type { PageMargins } from "../types/document";
import {
  DOCUMENT_PAGE,
  DOCUMENT_TYPOGRAPHY,
  blockquoteIndentTwips,
  headingSizePt,
  inchesToTwip,
  listIndentTwips,
  paragraphSpacingAfter,
  ptToHalfPoints,
} from "./documentLayout";

interface TipTapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: TipTapNode[];
}

interface RenderContext {
  headingLevel?: number;
}

function alignmentFromNode(node: TipTapNode): IParagraphOptions["alignment"] | undefined {
  const align = node.attrs?.textAlign;
  if (align === "center") {
    return AlignmentType.CENTER;
  }
  if (align === "right") {
    return AlignmentType.RIGHT;
  }
  if (align === "justify") {
    return AlignmentType.JUSTIFIED;
  }
  return AlignmentType.LEFT;
}

function runOptionsFromMarks(marks?: TipTapNode["marks"], context?: RenderContext): IRunOptions {
  const options: {
    bold?: boolean;
    italics?: boolean;
    underline?: { type: (typeof UnderlineType)[keyof typeof UnderlineType] };
    strike?: boolean;
    font?: string;
    size?: number;
    color?: string;
    shading?: { fill: string };
  } = {};

  if (context?.headingLevel) {
    options.bold = true;
    options.size = ptToHalfPoints(headingSizePt(context.headingLevel));
  }

  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        options.bold = true;
        break;
      case "italic":
        options.italics = true;
        break;
      case "underline":
        options.underline = { type: UnderlineType.SINGLE };
        break;
      case "strike":
        options.strike = true;
        break;
      case "textStyle": {
        const fontFamily = mark.attrs?.fontFamily;
        if (typeof fontFamily === "string") {
          options.font = fontFamily.split(",")[0]?.replace(/["']/g, "").trim() || DOCUMENT_TYPOGRAPHY.bodyFontShort;
        }

        const fontSize = mark.attrs?.fontSize;
        if (typeof fontSize === "string") {
          const points = Number.parseFloat(fontSize);
          if (!Number.isNaN(points)) {
            options.size = ptToHalfPoints(points);
          }
        }

        const color = mark.attrs?.color;
        if (typeof color === "string") {
          options.color = color.replace("#", "");
        }
        break;
      }
      case "highlight": {
        const color = mark.attrs?.color;
        if (typeof color === "string") {
          options.shading = { fill: color.replace("#", "") };
        }
        break;
      }
      default:
        break;
    }
  }

  return options;
}

function textRunsFromNode(node: TipTapNode, context?: RenderContext): TextRun[] {
  if (node.type === "text" && typeof node.text === "string") {
    const runOptions = runOptionsFromMarks(node.marks, context);
    return [
      new TextRun({
        ...runOptions,
        text: node.text,
        font: runOptions.font ?? DOCUMENT_TYPOGRAPHY.bodyFontShort,
        size: runOptions.size ?? ptToHalfPoints(DOCUMENT_TYPOGRAPHY.bodyFontSizePt),
      }),
    ];
  }

  if (node.type === "hardBreak") {
    return [new TextRun({ break: 1 })];
  }

  const runs: TextRun[] = [];
  for (const child of node.content ?? []) {
    runs.push(...textRunsFromNode(child, context));
  }
  return runs;
}

interface ListParagraphOptions {
  bullet?: boolean;
  ordered?: boolean;
}

function blockSpacing(): IParagraphOptions["spacing"] {
  return { after: paragraphSpacingAfter() };
}

function paragraphFromBlock(node: TipTapNode, list?: ListParagraphOptions): Paragraph {
  const headingLevel = node.type === "heading" ? Number(node.attrs?.level ?? 1) : undefined;
  const context: RenderContext | undefined = headingLevel ? { headingLevel } : undefined;
  const runs = textRunsFromNode(node, context);

  return new Paragraph({
    alignment: alignmentFromNode(node),
    spacing: blockSpacing(),
    children: runs.length > 0 ? runs : [new TextRun({ text: "" })],
    indent:
      node.type === "blockquote"
        ? { left: blockquoteIndentTwips() }
        : list
          ? { left: listIndentTwips() }
          : undefined,
    bullet: list?.bullet ? { level: 0 } : undefined,
    numbering: list?.ordered
      ? {
          reference: "default-numbering",
          level: 0,
        }
      : undefined,
  });
}

function paragraphsFromNode(node: TipTapNode): Paragraph[] {
  if (!node.type) {
    return [];
  }

  if (node.type === "paragraph" || node.type === "heading" || node.type === "blockquote") {
    return [paragraphFromBlock(node)];
  }

  if (node.type === "bulletList" || node.type === "orderedList") {
    const paragraphs: Paragraph[] = [];
    const listOptions: ListParagraphOptions = {
      bullet: node.type === "bulletList",
      ordered: node.type === "orderedList",
    };

    for (const listItem of node.content ?? []) {
      for (const child of listItem.content ?? []) {
        paragraphs.push(paragraphFromBlock(child, listOptions));
      }
    }

    return paragraphs;
  }

  if (node.type === "doc") {
    return (node.content ?? []).flatMap((child) => paragraphsFromNode(child));
  }

  return (node.content ?? []).flatMap((child) => paragraphsFromNode(child));
}

export async function tiptapContentToDocxBuffer(
  content: Record<string, unknown>,
  margins: PageMargins,
): Promise<ArrayBuffer> {
  const root = content as TipTapNode;
  const children = paragraphsFromNode(root);

  const document = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: DOCUMENT_TYPOGRAPHY.bodyFontShort,
            size: ptToHalfPoints(DOCUMENT_TYPOGRAPHY.bodyFontSizePt),
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: inchesToTwip(DOCUMENT_PAGE.widthIn),
              height: inchesToTwip(DOCUMENT_PAGE.heightIn),
            },
            margin: {
              top: inchesToTwip(margins.top),
              right: inchesToTwip(margins.right),
              bottom: inchesToTwip(margins.bottom),
              left: inchesToTwip(margins.left),
            },
          },
        },
        children: children.length > 0 ? children : [new Paragraph({ spacing: blockSpacing(), children: [new TextRun("")] })],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  return blob.arrayBuffer();
}
