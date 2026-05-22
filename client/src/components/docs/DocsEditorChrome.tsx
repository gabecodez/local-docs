import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type { SaveState } from "../../types/document";
import {
  DocsLogoIcon,
  IconCloudDone,
  IconMenu,
} from "../icons/DocsIcons";

interface MenuAction {
  label: string;
  shortcut?: string;
  onClick: () => void;
}

interface DocsEditorChromeProps {
  title: string;
  saveState: SaveState;
  onTitleChange: (value: string) => void;
  onSaveDraft: () => void;
  onOpenFile: () => void;
  onSaveAsDocx: () => void;
  onExportPdf: () => void;
  onPrintPreview: () => void;
  onOpenMargins: () => void;
  onNewDocument: () => void;
  onOpenHome: () => void;
  toolbar: ReactNode;
}

function saveLabel(state: SaveState): string {
  switch (state) {
    case "autosaving":
      return "Saving draft...";
    case "autosaved":
      return "Draft saved locally";
    case "dirty":
      return "Unsaved changes";
    case "error":
      return "Autosave failed";
    default:
      return "Draft";
  }
}

export function DocsEditorChrome({
  title,
  saveState,
  onTitleChange,
  onSaveDraft,
  onOpenFile,
  onSaveAsDocx,
  onExportPdf,
  onPrintPreview,
  onOpenMargins,
  onNewDocument,
  onOpenHome,
  toolbar,
}: DocsEditorChromeProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "s" && event.shiftKey) {
        event.preventDefault();
        onSaveAsDocx();
      } else if (key === "s") {
        event.preventDefault();
        onSaveDraft();
      } else if (key === "o") {
        event.preventDefault();
        onOpenFile();
      } else if (key === "p") {
        event.preventDefault();
        onPrintPreview();
      } else if (key === "n") {
        event.preventDefault();
        onNewDocument();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewDocument, onOpenFile, onPrintPreview, onSaveAsDocx, onSaveDraft]);

  const fileActions: MenuAction[] = [
    { label: "New", shortcut: "Ctrl+N", onClick: onNewDocument },
    { label: "Open...", shortcut: "Ctrl+O", onClick: onOpenFile },
    { label: "Save draft", shortcut: "Ctrl+S", onClick: onSaveDraft },
    { label: "Save as DOCX...", shortcut: "Ctrl+Shift+S", onClick: onSaveAsDocx },
    { label: "Export PDF...", onClick: onExportPdf },
    { label: "Print preview", shortcut: "Ctrl+P", onClick: onPrintPreview },
  ];

  const formatActions: MenuAction[] = [
    { label: "Page margins...", onClick: onOpenMargins },
  ];

  const menus = [
    { name: "File", actions: fileActions },
    { name: "Edit", actions: [] },
    { name: "View", actions: [] },
    { name: "Insert", actions: [] },
    { name: "Format", actions: formatActions },
    { name: "Tools", actions: [] },
    { name: "Help", actions: [] },
  ];

  return (
    <div className="docs-editor-chrome" ref={menuRef}>
      <div className="docs-title-bar">
        <div className="docs-title-bar-left">
          <button aria-label="Main menu" className="docs-icon-button" onClick={onOpenHome} type="button">
            <IconMenu />
          </button>
          <Link aria-label="Docs home" className="docs-logo-link" to="/">
            <DocsLogoIcon className="docs-logo-small" />
          </Link>
          <input
            className="docs-doc-title"
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Untitled document"
            value={title}
          />
          <div className={`docs-cloud-status ${saveState}`} title={saveLabel(saveState)}>
            <IconCloudDone />
          </div>
        </div>

        <div className="docs-title-bar-right">
          <button className="docs-secondary-action" onClick={onSaveDraft} type="button">
            Save draft
          </button>
          <button className="docs-secondary-action" onClick={onSaveAsDocx} type="button">
            Save as DOCX
          </button>
          <button className="docs-share-button" onClick={onExportPdf} type="button">
            Export PDF
          </button>
        </div>
      </div>

      <nav aria-label="Document menu" className="docs-menu-bar">
        {menus.map((menu) => (
          <div className="docs-menu-wrap" key={menu.name}>
            <button
              className={openMenu === menu.name ? "docs-menu-item active" : "docs-menu-item"}
              onClick={() => setOpenMenu((current) => (current === menu.name ? null : menu.name))}
              type="button"
            >
              {menu.name}
            </button>
            {openMenu === menu.name && menu.actions.length > 0 ? (
              <div className="docs-menu-dropdown">
                {menu.actions.map((action) => (
                  <button
                    className="docs-menu-dropdown-item"
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      setOpenMenu(null);
                    }}
                    type="button"
                  >
                    <span>{action.label}</span>
                    {action.shortcut ? <span className="docs-menu-shortcut">{action.shortcut}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      {toolbar}
    </div>
  );
}
