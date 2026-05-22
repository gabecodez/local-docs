import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createDocument, deleteDocument, listDocuments } from "../api/documents";
import { DocsHomeHeader } from "../components/docs/DocsHomeHeader";
import { DocsLogoIcon, IconBlankDoc, IconGridView, IconMoreVert, IconViewList } from "../components/icons/DocsIcons";
import type { DocumentSummary } from "../types/document";

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function HomePage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        setLoading(true);
        setError(null);
        const response = await listDocuments();
        if (!cancelled) {
          setDocuments(response.documents);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load documents");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return documents;
    }

    return documents.filter((document) => document.title.toLowerCase().includes(query));
  }, [documents, searchQuery]);

  async function handleCreateDocument() {
    try {
      setCreating(true);
      setError(null);
      const response = await createDocument();
      navigate(`/doc/${response.document.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create document");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!window.confirm("Move to trash?")) {
      return;
    }

    try {
      await deleteDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete document");
    }
  }

  return (
    <div className="docs-home">
      <DocsHomeHeader onSearchChange={setSearchQuery} searchQuery={searchQuery} />

      <main className="docs-home-main">
        <section className="docs-template-section">
          <h2 className="docs-section-title">Start a new document</h2>
          <div className="docs-template-row">
            <button
              className="docs-template-card"
              disabled={creating}
              onClick={() => void handleCreateDocument()}
              type="button"
            >
              <IconBlankDoc className="docs-template-preview" />
              <span className="docs-template-label">{creating ? "Creating..." : "Blank"}</span>
            </button>
          </div>
        </section>

        <section className="docs-recent-section">
          <div className="docs-recent-header">
            <h2 className="docs-section-title">Recent documents</h2>
            <div className="docs-view-toggle">
              <button
                aria-label="List view"
                className={viewMode === "list" ? "docs-view-button active" : "docs-view-button"}
                onClick={() => setViewMode("list")}
                type="button"
              >
                <IconViewList />
              </button>
              <button
                aria-label="Grid view"
                className={viewMode === "grid" ? "docs-view-button active" : "docs-view-button"}
                onClick={() => setViewMode("grid")}
                type="button"
              >
                <IconGridView />
              </button>
            </div>
          </div>

          {error ? <div className="docs-banner error">{error}</div> : null}
          {loading ? <p className="docs-muted">Loading documents...</p> : null}

          {!loading && filteredDocuments.length === 0 ? (
            <div className="docs-empty-recent">
              <DocsLogoIcon className="docs-empty-icon" />
              <p>No recent documents. Create a blank document to get started.</p>
            </div>
          ) : null}

          {!loading && filteredDocuments.length > 0 && viewMode === "list" ? (
            <div className="docs-table">
              <div className="docs-table-head">
                <span>Name</span>
                <span>Owner</span>
                <span>Last modified</span>
                <span aria-hidden="true" className="docs-table-actions-head" />
              </div>
              {filteredDocuments.map((document) => (
                <div className="docs-table-row" key={document.id}>
                  <Link className="docs-table-name" to={`/doc/${document.id}`}>
                    <DocsLogoIcon className="docs-row-icon" />
                    <span>{document.title}</span>
                  </Link>
                  <span className="docs-table-owner">me</span>
                  <span className="docs-table-modified">{formatRelativeDate(document.updatedAt)}</span>
                  <button
                    aria-label={`More actions for ${document.title}`}
                    className="docs-icon-button docs-row-menu"
                    onClick={() => void handleDeleteDocument(document.id)}
                    type="button"
                  >
                    <IconMoreVert />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && filteredDocuments.length > 0 && viewMode === "grid" ? (
            <div className="docs-grid">
              {filteredDocuments.map((document) => (
                <Link className="docs-grid-card" key={document.id} to={`/doc/${document.id}`}>
                  <div className="docs-grid-preview">
                    <IconBlankDoc className="docs-grid-preview-icon" />
                  </div>
                  <div className="docs-grid-meta">
                    <span className="docs-grid-title">{document.title}</span>
                    <span className="docs-grid-date">{formatRelativeDate(document.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
