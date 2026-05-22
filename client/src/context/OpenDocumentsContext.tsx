import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { createDocument } from "../api/documents";
import type { OpenDocumentTab } from "../types/document";

const STORAGE_KEY = "local-docs-open-tabs";

interface OpenDocumentsContextValue {
  tabs: OpenDocumentTab[];
  openDocument: (tab: OpenDocumentTab) => void;
  removeTab: (id: string) => void;
  updateTabTitle: (id: string, title: string) => void;
  createTab: () => Promise<string>;
}

const OpenDocumentsContext = createContext<OpenDocumentsContextValue | null>(null);

function readStoredTabs(): OpenDocumentTab[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as OpenDocumentTab[];
  } catch {
    return [];
  }
}

export function OpenDocumentsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<OpenDocumentTab[]>(() => readStoredTabs());

  const persistTabs = useCallback((updater: (current: OpenDocumentTab[]) => OpenDocumentTab[]) => {
    setTabs((current) => {
      const nextTabs = updater(current);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs));
      return nextTabs;
    });
  }, []);

  const openDocument = useCallback(
    (tab: OpenDocumentTab) => {
      persistTabs((current) => [
        tab,
        ...current.filter((existing) => existing.id !== tab.id),
      ]);
    },
    [persistTabs],
  );

  const updateTabTitle = useCallback(
    (id: string, title: string) => {
      persistTabs((current) =>
        current.map((tab) =>
          tab.id === id ? { ...tab, title: title || "Untitled document" } : tab,
        ),
      );
    },
    [persistTabs],
  );

  const removeTab = useCallback(
    (id: string) => {
      persistTabs((current) => current.filter((tab) => tab.id !== id));
    },
    [persistTabs],
  );

  const createTab = useCallback(async () => {
    const response = await createDocument();
    const tab = {
      id: response.document.id,
      title: response.document.title,
    };
    openDocument(tab);
    navigate(`/doc/${tab.id}`);
    return tab.id;
  }, [navigate, openDocument]);

  const value = useMemo(
    () => ({
      tabs,
      openDocument,
      removeTab,
      updateTabTitle,
      createTab,
    }),
    [createTab, openDocument, removeTab, tabs, updateTabTitle],
  );

  return <OpenDocumentsContext.Provider value={value}>{children}</OpenDocumentsContext.Provider>;
}

export function useOpenDocuments() {
  const context = useContext(OpenDocumentsContext);

  if (!context) {
    throw new Error("useOpenDocuments must be used within OpenDocumentsProvider");
  }

  return context;
}
