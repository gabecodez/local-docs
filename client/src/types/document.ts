export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGINS: PageMargins = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1,
};

export interface DocumentRecord {
  id: string;
  title: string;
  content: Record<string, unknown>;
  margins: PageMargins;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveState = "idle" | "dirty" | "autosaving" | "autosaved" | "error";

export interface OpenDocumentTab {
  id: string;
  title: string;
}
