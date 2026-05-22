import type { DocumentRecord, DocumentSummary, PageMargins } from "../types/document";
import { getApiBaseUrl } from "../utils/apiBase";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function listDocuments(): Promise<{ documents: DocumentSummary[] }> {
  return request("/api/documents");
}

export function createDocument(title?: string): Promise<{ document: DocumentRecord }> {
  return request("/api/documents", {
    method: "POST",
    body: JSON.stringify(title ? { title } : {}),
  });
}

export function getDocument(id: string): Promise<{ document: DocumentRecord }> {
  return request(`/api/documents/${id}`);
}

export function updateDocument(
  id: string,
  updates: {
    title?: string;
    content?: Record<string, unknown>;
    margins?: PageMargins;
  },
): Promise<{ document: DocumentRecord }> {
  return request(`/api/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteDocument(id: string): Promise<void> {
  return request(`/api/documents/${id}`, {
    method: "DELETE",
  });
}
