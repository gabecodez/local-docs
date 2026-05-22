import { useCallback, useEffect, useRef, useState } from "react";

import { updateDocument } from "../api/documents";
import { DEFAULT_MARGINS, type DocumentRecord, type PageMargins, type SaveState } from "../types/document";

const AUTOSAVE_DEBOUNCE_MS = 800;

interface PendingUpdates {
  title?: string;
  content?: Record<string, unknown>;
  margins?: PageMargins;
}

export function useDocumentPersistence(documentId: string | undefined, onTitleSaved?: (title: string) => void) {
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<number | undefined>(undefined);
  const pendingUpdates = useRef<PendingUpdates>({});

  const applyDocument = useCallback((record: DocumentRecord) => {
    setDocument(record);
    setTitle(record.title);
    pendingUpdates.current = {};
    setSaveState("autosaved");
  }, []);

  const flushAutosave = useCallback(async () => {
    if (!documentId || !document) {
      return;
    }

    const updates = pendingUpdates.current;
    if (
      updates.title === undefined &&
      updates.content === undefined &&
      updates.margins === undefined
    ) {
      return;
    }

    try {
      setSaveState("autosaving");
      setError(null);
      const response = await updateDocument(documentId, updates);
      pendingUpdates.current = {};
      setSaveState("autosaved");
      setDocument((current) =>
        current
          ? {
              ...current,
              title: response.document.title,
              margins: response.document.margins,
              updatedAt: response.document.updatedAt,
            }
          : response.document,
      );

      if (updates.title !== undefined) {
        onTitleSaved?.(response.document.title);
      }
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "Failed to autosave document");
      throw saveError;
    }
  }, [document, documentId, onTitleSaved]);

  const queueAutosave = useCallback(
    (updates: PendingUpdates, immediate = false): Promise<void> => {
      pendingUpdates.current = {
        ...pendingUpdates.current,
        ...updates,
      };

      if (updates.title !== undefined) {
        setTitle(updates.title);
        setDocument((current) => (current ? { ...current, title: updates.title! } : current));
      }

      if (updates.content !== undefined) {
        setDocument((current) => (current ? { ...current, content: updates.content! } : current));
      }

      if (updates.margins !== undefined) {
        setDocument((current) => (current ? { ...current, margins: updates.margins! } : current));
      }

      setSaveState("dirty");

      window.clearTimeout(debounceTimer.current);

      if (immediate) {
        return flushAutosave();
      }

      debounceTimer.current = window.setTimeout(() => {
        void flushAutosave();
      }, AUTOSAVE_DEBOUNCE_MS);

      return Promise.resolve();
    },
    [flushAutosave],
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!document || title === document.title) {
      return;
    }

    queueAutosave({ title });
  }, [document, queueAutosave, title]);

  return {
    document,
    title,
    setTitle,
    saveState,
    error,
    setError,
    applyDocument,
    queueAutosave,
    flushAutosave,
    defaultMargins: DEFAULT_MARGINS,
  };
}
