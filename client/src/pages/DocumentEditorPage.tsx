import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createDocument, getDocument, updateDocument } from "../api/documents";
import { MarginsDialog } from "../components/MarginsDialog";
import { PrintPreviewModal } from "../components/PrintPreviewModal";
import { RichTextEditor } from "../components/RichTextEditor";
import { useOpenDocuments } from "../context/OpenDocumentsContext";
import { useDocumentPersistence } from "../hooks/useDocumentPersistence";
import { exportDocumentToPdf, saveDocumentAsDocx } from "../utils/exportDocument";
import { openFileFromDisk } from "../utils/fileAccess";
import { importDocumentFromFile } from "../utils/importDocument";
import { printDocument } from "../utils/printDocument";

export function DocumentEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { openDocument, updateTabTitle, createTab } = useOpenDocuments();
  const [loading, setLoading] = useState(true);
  const [showMargins, setShowMargins] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const {
    document,
    title,
    setTitle,
    saveState,
    error,
    setError,
    applyDocument,
    queueAutosave,
  } = useDocumentPersistence(id, (savedTitle) => {
    if (id) {
      updateTabTitle(id, savedTitle);
    }
  });

  useEffect(() => {
    if (!id) {
      setError("Document id is missing");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDocument() {
      try {
        setLoading(true);
        setError(null);
        const response = await getDocument(id as string);
        if (!cancelled) {
          applyDocument(response.document);
          openDocument({ id: response.document.id, title: response.document.title });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load document");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [applyDocument, id, openDocument, setError]);

  const buildSnapshot = useCallback(() => {
    if (!document || !editorRef.current) {
      return null;
    }

    return {
      ...document,
      title: title.trim() || "Untitled document",
      content: editorRef.current.getJSON() as Record<string, unknown>,
    };
  }, [document, title]);

  const handleContentUpdate = useCallback(
    (content: Record<string, unknown>) => {
      queueAutosave({ content });
    },
    [queueAutosave],
  );

  const handleSaveDraft = useCallback(async () => {
    await queueAutosave(title !== document?.title ? { title } : {}, true);
  }, [document?.title, queueAutosave, title]);

  const handleOpenFile = useCallback(async () => {
    try {
      setError(null);
      const picked = await openFileFromDisk({
        filters: [
          { name: "Word documents", extensions: ["docx"] },
          { name: "Local Docs JSON", extensions: ["json"] },
        ],
      });

      if (picked.canceled || !picked.data) {
        return;
      }

      const imported = await importDocumentFromFile(
        picked.data,
        picked.filePath ?? "document.docx",
      );
      const created = await createDocument(imported.title);
      const updated = await updateDocument(created.document.id, {
        title: imported.title,
        content: imported.content,
        margins: imported.margins,
      });

      navigate(`/doc/${updated.document.id}`);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Failed to open file");
    }
  }, [navigate, setError]);

  const handleSaveAsDocx = useCallback(async () => {
    const snapshot = buildSnapshot();
    if (!snapshot) {
      return;
    }

    try {
      setError(null);
      await handleSaveDraft();
      const result = await saveDocumentAsDocx(snapshot);

      if (!result.canceled) {
        setStatusMessage(result.filePath ? `Saved DOCX to ${result.filePath}` : "DOCX downloaded");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save DOCX");
    }
  }, [buildSnapshot, handleSaveDraft, setError]);

  const handleExportPdf = useCallback(async () => {
    const snapshot = buildSnapshot();

    if (!snapshot) {
      return;
    }

    try {
      setError(null);
      await handleSaveDraft();
      const result = await exportDocumentToPdf(snapshot);

      if (!result.canceled) {
        setStatusMessage(
          result.filePath ? `Exported PDF to ${result.filePath}` : "PDF downloaded",
        );
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export PDF");
    }
  }, [buildSnapshot, handleSaveDraft, setError]);

  const handlePrint = useCallback(async () => {
    const snapshot = buildSnapshot();

    if (!snapshot) {
      return;
    }

    await printDocument({
      title: snapshot.title,
      content: snapshot.content,
      margins: snapshot.margins,
    });
  }, [buildSnapshot]);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  if (loading) {
    return <div className="docs-editor-loading">Loading document...</div>;
  }

  if (error && !document) {
    return (
      <div className="docs-error-page">
        <div className="docs-banner error">{error}</div>
        <Link className="docs-text-link" to="/">
          Back to Docs home
        </Link>
      </div>
    );
  }

  if (!document || !id) {
    return null;
  }

  const exportSnapshot = buildSnapshot();

  return (
    <div className="docs-editor-page">
      {error ? <div className="docs-banner error docs-floating-banner">{error}</div> : null}
      {statusMessage ? (
        <div className="docs-banner docs-floating-banner docs-status-banner">{statusMessage}</div>
      ) : null}
      <RichTextEditor
        content={document.content}
        documentId={document.id}
        editable
        margins={document.margins}
        onEditorReady={handleEditorReady}
        onExportPdf={() => void handleExportPdf()}
        onNewDocument={() => void createTab()}
        onOpenFile={() => void handleOpenFile()}
        onOpenHome={() => navigate("/")}
        onOpenMargins={() => setShowMargins(true)}
        onPrintPreview={() => setShowPrintPreview(true)}
        onSaveAsDocx={() => void handleSaveAsDocx()}
        onSaveDraft={() => void handleSaveDraft()}
        onTitleChange={setTitle}
        onUpdate={handleContentUpdate}
        saveState={saveState}
        title={title}
      />

      {showMargins ? (
        <MarginsDialog
          margins={document.margins}
          onClose={() => setShowMargins(false)}
          onSave={(margins) => queueAutosave({ margins }, true)}
        />
      ) : null}

      {showPrintPreview && exportSnapshot ? (
        <PrintPreviewModal
          content={exportSnapshot.content}
          margins={exportSnapshot.margins}
          onClose={() => setShowPrintPreview(false)}
          onPrint={() => void handlePrint()}
          title={exportSnapshot.title}
        />
      ) : null}
    </div>
  );
}
