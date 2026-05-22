# Architecture

This document describes how **Local Docs** (`local-docs`) is structured and how data moves through the system.

## Goals

1. **Local-first** — Drafts live as JSON on disk; no cloud account required.
2. **Consistent exports** — Print, PDF, and DOCX share one layout definition.
3. **Dual runtime** — Same React app in the browser (dev/prod web) or inside Electron.

## Runtime modes

### Web development

`npm run dev` runs:

1. **Server** — `tsx watch src/index.ts` → Express on `PORT` (default 3000).
2. **Client** — Vite on port 5173 with HMR.

The client calls the API using `VITE_API_URL` or same-origin when the server serves `client/dist` in production.

### Production web

`npm run build` then `npm run start`:

- Server compiles to `dist/`.
- Client builds to `client/dist/`.
- Express serves static assets and falls back to `index.html` for non-API routes.

### Electron

`electron/main.ts`:

1. Sets `DOCUMENTS_DIR` under `app.getPath("userData")`.
2. Dynamically imports compiled `dist/server.js` and starts the API on port `3847`.
3. Loads Vite dev URL (development) or the API URL (production build).
4. Exposes IPC handlers via `preload.ts` → `window.electronAPI`.

## Server (`src/`)

| Module | Responsibility |
|--------|----------------|
| `index.ts` | Process entry, graceful shutdown |
| `server.ts` | `startServer` / `stopServer`, port binding |
| `app.ts` | Express middleware, routes, static client |
| `config/env.ts` | Zod-validated environment |
| `routes/documents.ts` | CRUD + validation |
| `services/documentStore.ts` | Read/write `{id}.json` files |
| `middleware/errorHandler.ts` | `AppError` → JSON responses |

Documents are identified by UUID v4 filenames. Invalid IDs return `400`; missing files return `404`.

## Client (`client/src/`)

### Routing

- `/` — Home: list drafts, create blank document.
- `/doc/:id` — Editor with tabs, toolbar, autosave.

### State

- **`useDocumentPersistence`** — Debounced PATCH to API (`autosaving` / `autosaved` / `dirty`).
- **`OpenDocumentsContext`** — Tab strip for open documents.

### Editor

- **TipTap** extensions in `extensions/editorExtensions.ts` (StarterKit, fonts, colors, align, etc.).
- Canvas uses `document-page` / `document-content` CSS classes aligned with export layout.

### Export pipeline

```
TipTap JSON (snapshot)
        │
        ├─► generateHTML() ──► renderFullDocumentHtml()
        │                           │
        │                           ├─► Print preview (in-app)
        │                           ├─► Print (iframe / Electron window)
        │                           └─► PDF (html2pdf or printToPDF)
        │
        └─► tiptapToDocx() ──► DOCX buffer ──► save dialog / download
```

**`documentLayout.ts`** — Single source for letter size, margins (inches), typography (11pt Arial, heading sizes, list/blockquote rules).

**`documentRender.ts`** — `renderDocumentBodyHtml`, `renderFullDocumentHtml`.

**`renderHtmlToPdf.ts`** — Browser PDF via `html2pdf.js` (no print dialog).

**`tiptapToDocx.ts`** — Maps TipTap nodes/marks to `docx` paragraphs and runs.

**`fileAccess.ts`** — `saveFileToDisk` (dialog), `downloadFileToDisk` (PDF one-click).

## Electron IPC

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `save-file` | Renderer → Main | Save dialog + write bytes |
| `open-file` | Renderer → Main | Open dialog + read bytes |
| `download-file` | Renderer → Main | Write to Downloads (PDF) |
| `generate-pdf` | Renderer → Main | HTML → PDF bytes (`printToPDF`) |
| `print-html` | Renderer → Main | System print dialog for layout HTML |

Preload exposes `window.electronAPI` with `apiBaseUrl` from `--api-base=` argv.

## Security notes

- API has rate limiting, Helmet, CORS allowlist, and JSON body size cap (10MB).
- Electron uses `contextIsolation` and no `nodeIntegration` in the renderer.
- Hidden PDF/print windows load only generated HTML from temp files.

## Extension points

- Add auth middleware on Express if exposing beyond localhost.
- Plug cloud sync by wrapping `documentStore` or watching `DOCUMENTS_DIR`.
- Additional importers/exporters should convert to/from TipTap JSON and reuse `documentLayout` constants.
