import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import {
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
  createEditorExtensions,
} from "../extensions/editorExtensions";
import type { PageMargins, SaveState } from "../types/document";
import {
  DOCUMENT_CONTENT_CLASS,
  DOCUMENT_PAGE_CLASS,
  getDocumentPreviewStyles,
  pageMarginPaddingStyle,
} from "../utils/documentLayout";
import { DocsEditorChrome } from "./docs/DocsEditorChrome";
import { DocumentTabBar } from "./DocumentTabBar";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconBulletList,
  IconChevronDown,
  IconFormatPaint,
  IconImage,
  IconItalic,
  IconLink,
  IconNumberList,
  IconPrint,
  IconQuote,
  IconRedo,
  IconStrike,
  IconUnderline,
  IconUndo,
} from "./icons/DocsIcons";

interface RichTextEditorProps {
  documentId: string;
  title: string;
  saveState: SaveState;
  content: Record<string, unknown>;
  margins: PageMargins;
  editable: boolean;
  onTitleChange: (value: string) => void;
  onUpdate: (content: Record<string, unknown>) => void;
  onEditorReady: (editor: Editor) => void;
  onSaveDraft: () => void;
  onOpenFile: () => void;
  onSaveAsDocx: () => void;
  onExportPdf: () => void;
  onPrintPreview: () => void;
  onOpenMargins: () => void;
  onNewDocument: () => void;
  onOpenHome: () => void;
}

export function RichTextEditor({
  documentId,
  title,
  saveState,
  content,
  margins,
  editable,
  onTitleChange,
  onUpdate,
  onEditorReady,
  onSaveDraft,
  onOpenFile,
  onSaveAsDocx,
  onExportPdf,
  onPrintPreview,
  onOpenMargins,
  onNewDocument,
  onOpenHome,
}: RichTextEditorProps) {
  const loadedDocumentId = useRef<string | null>(null);

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content,
    editable,
    editorProps: {
      attributes: {
        class: `ProseMirror ${DOCUMENT_CONTENT_CLASS}`,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onUpdate(currentEditor.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (loadedDocumentId.current !== documentId) {
      loadedDocumentId.current = documentId;
      editor.commands.setContent(content);
    }
  }, [content, documentId, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) {
    return <div className="docs-editor-loading">Loading document...</div>;
  }

  return (
    <div className="docs-editor-layout">
      <style>{getDocumentPreviewStyles()}</style>
      <DocsEditorChrome
        onNewDocument={onNewDocument}
        onOpenHome={onOpenHome}
        onOpenMargins={onOpenMargins}
        onExportPdf={onExportPdf}
        onOpenFile={onOpenFile}
        onPrintPreview={onPrintPreview}
        onSaveAsDocx={onSaveAsDocx}
        onSaveDraft={onSaveDraft}
        onTitleChange={onTitleChange}
        saveState={saveState}
        title={title}
        toolbar={<EditorToolbar editor={editor} onPrintPreview={onPrintPreview} />}
      />
      <DocumentTabBar />

      <div className="docs-canvas-scroll">
        <div className="docs-canvas">
          <div
            className={`docs-page ${DOCUMENT_PAGE_CLASS}`}
            style={pageMarginPaddingStyle(margins)}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditorToolbarProps {
  editor: Editor;
  onPrintPreview: () => void;
}

function EditorToolbar({ editor, onPrintPreview }: EditorToolbarProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const refresh = () => forceUpdate((value) => value + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);

    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  const textStyle = editor.getAttributes("textStyle");
  const currentFont = textStyle.fontFamily ?? "Arial, sans-serif";
  const currentSize = (textStyle.fontSize ?? "11pt").replace("pt", "");
  const styleValue = editor.isActive("heading", { level: 1 })
    ? "heading-1"
    : editor.isActive("heading", { level: 2 })
      ? "heading-2"
      : editor.isActive("heading", { level: 3 })
        ? "heading-3"
        : "normal";

  return (
    <div className="docs-toolbar">
      <div className="docs-toolbar-group">
        <ToolbarIconButton
          disabled={!editor.can().undo()}
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <IconUndo />
        </ToolbarIconButton>
        <ToolbarIconButton
          disabled={!editor.can().redo()}
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <IconRedo />
        </ToolbarIconButton>
        <ToolbarIconButton label="Print preview" onClick={onPrintPreview}>
          <IconPrint />
        </ToolbarIconButton>
        <ToolbarIconButton label="Paint format" onClick={() => undefined}>
          <IconFormatPaint />
        </ToolbarIconButton>
      </div>

      <span className="docs-toolbar-divider" />

      <div className="docs-toolbar-group">
        <label className="docs-toolbar-select">
          <select
            className="docs-select docs-select-style"
            onChange={(event) => {
              const value = event.target.value;
              if (value === "normal") {
                editor.chain().focus().setParagraph().run();
              } else if (value === "heading-1") {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              } else if (value === "heading-2") {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              } else if (value === "heading-3") {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }
            }}
            value={styleValue}
          >
            <option value="normal">Normal text</option>
            <option value="heading-1">Heading 1</option>
            <option value="heading-2">Heading 2</option>
            <option value="heading-3">Heading 3</option>
          </select>
          <IconChevronDown className="docs-select-chevron" />
        </label>

        <label className="docs-toolbar-select">
          <select
            className="docs-select docs-select-font"
            onChange={(event) => editor.chain().focus().setFontFamily(event.target.value).run()}
            value={currentFont}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <IconChevronDown className="docs-select-chevron" />
        </label>

        <label className="docs-toolbar-select">
          <select
            className="docs-select docs-select-size"
            onChange={(event) => editor.chain().focus().setFontSize(`${event.target.value}pt`).run()}
            value={currentSize}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <IconChevronDown className="docs-select-chevron" />
        </label>
      </div>

      <span className="docs-toolbar-divider" />

      <div className="docs-toolbar-group">
        <ToolbarIconButton
          active={editor.isActive("bold")}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("italic")}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("underline")}
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("strike")}
          label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrike />
        </ToolbarIconButton>
        <ColorPicker
          colors={TEXT_COLORS}
          label="Text color"
          onSelect={(color) => editor.chain().focus().setColor(color).run()}
          value={textStyle.color ?? "#000000"}
        />
        <ColorPicker
          colors={HIGHLIGHT_COLORS}
          label="Highlight color"
          onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          value={editor.getAttributes("highlight").color ?? "#ffff00"}
          variant="highlight"
        />
        <ToolbarIconButton label="Insert link" onClick={() => insertLink(editor)}>
          <IconLink />
        </ToolbarIconButton>
        <ToolbarIconButton label="Insert image" onClick={() => undefined}>
          <IconImage />
        </ToolbarIconButton>
      </div>

      <span className="docs-toolbar-divider" />

      <div className="docs-toolbar-group">
        <ToolbarIconButton
          active={editor.isActive({ textAlign: "left" })}
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <IconAlignLeft />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive({ textAlign: "center" })}
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <IconAlignCenter />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive({ textAlign: "right" })}
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <IconAlignRight />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("bulletList")}
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconBulletList />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("orderedList")}
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconNumberList />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={editor.isActive("blockquote")}
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconQuote />
        </ToolbarIconButton>
      </div>
    </div>
  );
}

function insertLink(editor: Editor) {
  const previousUrl = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Enter link URL", previousUrl ?? "https://");

  if (url === null) {
    return;
  }

  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

interface ColorPickerProps {
  colors: string[];
  label: string;
  onSelect: (color: string) => void;
  value: string;
  variant?: "text" | "highlight";
}

function ColorPicker({ colors, label, onSelect, value, variant = "text" }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="docs-color-picker">
      <button
        aria-label={label}
        className="docs-toolbar-button docs-color-button"
        onClick={() => setOpen((current) => !current)}
        title={label}
        type="button"
      >
        <span
          className={variant === "highlight" ? "docs-color-swatch highlight" : "docs-color-swatch text"}
          style={{ backgroundColor: value }}
        />
      </button>
      {open ? (
        <div className="docs-color-menu">
          {colors.map((color) => (
            <button
              aria-label={`${label} ${color}`}
              className="docs-color-option"
              key={color}
              onClick={() => {
                onSelect(color);
                setOpen(false);
              }}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface ToolbarIconButtonProps {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

function ToolbarIconButton({ active, children, disabled, label, onClick }: ToolbarIconButtonProps) {
  return (
    <button
      aria-label={label}
      className={active ? "docs-toolbar-button active" : "docs-toolbar-button"}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
