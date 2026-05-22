# Local Docs

**Local Docs** (`local-docs`) is a local-first document editor inspired by cloud word processors, built for privacy and offline-friendly workflows. Create rich-text documents, autosave drafts on your machine, and export to DOCX or PDF without sending content to a hosted service.

> **Naming note:** “Local Docs” is a descriptive product name for a documents app that runs locally. It is not affiliated with, endorsed by, or connected to Google Docs™ or any other third-party document product.

## Features

- **Rich text editing** — Headings, lists, links, fonts, sizes, colors, highlights, alignment, block quotes, and more (powered by [TipTap](https://tiptap.dev/))
- **Autosave drafts** — Changes debounce to the local API; explicit “Save draft” flushes immediately
- **Page margins** — Per-document inch-based margins applied consistently in the editor and all exports
- **Open files** — Import `.docx` (via Mammoth) or native `.json` drafts
- **Save as DOCX** — Export with Word-compatible formatting and page setup
- **Export PDF** — One-click PDF generation (no system “Print to PDF” dialog)
- **Print preview & print** — WYSIWYG letter-size preview matching export layout
- **Desktop app** — Optional Electron shell with file dialogs and native PDF rendering
- **Web dev mode** — React + Vite UI with Express API for browser-based development

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Electron (optional)                                        │
│  ┌──────────────┐    IPC: open/save/print/pdf               │
│  │ React client │◄──────────────────────────────────────────┤
│  └──────┬───────┘                                           │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTP
          ▼
┌──────────────────┐     JSON files      ┌────────────────────┐
│  Express API     │ ──────────────────► │  data/documents/   │
│  (Node.js)       │                     │  {uuid}.json       │
└──────────────────┘                     └────────────────────┘
```

| Layer | Tech | Role |
|-------|------|------|
| Client | React 19, Vite, TipTap | Editor UI, export pipelines |
| Server | Express 5, TypeScript | REST API, static hosting in production |
| Desktop | Electron 36 | Native PDF, file pickers, embedded server |
| Storage | Filesystem | One JSON file per document |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module-level detail and [docs/API.md](docs/API.md) for REST endpoints.

## Requirements

- **Node.js** 20 or newer
- **npm** 10+ (workspaces)
- **Windows / macOS / Linux** for Electron desktop builds

## Quick start

```bash
git clone https://github.com/gabecodez/local-docs.git
cd local-docs
npm install
cp .env.example .env
```

### Web development (browser + API)

```bash
npm run dev
```

- API: `http://localhost:3000` (or `PORT` from `.env`)
- Client: `http://localhost:5173` (Vite proxies API when configured, or set `VITE_API_URL`)

### Desktop development (Electron)

```bash
npm run dev:electron
```

Starts Vite, compiles Electron, launches the desktop app with API on port `3847` and documents under the OS user-data directory.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite client (concurrent) |
| `npm run dev:server` | API only with hot reload |
| `npm run dev:client` | Vite client only |
| `npm run dev:electron` | Desktop app in development |
| `npm run build` | Production client + server + Electron compile |
| `npm run start` | Run compiled server (`dist/index.js`) |
| `npm run start:electron` | Run packaged Electron entry (after build) |
| `npm run dist` | Full build + `electron-builder` installers |
| `npm run typecheck` | TypeScript check (server, electron, client) |

## Configuration

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port for the API |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `CORS_ORIGIN` | Vite + localhost URLs | Comma-separated allowed origins |
| `DOCUMENTS_DIR` | `./data/documents` | Directory for draft JSON files |

In Electron, `DOCUMENTS_DIR` is overridden to the app user-data folder automatically.

Client optional:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL when not using Electron (e.g. `http://localhost:3000`) |

## Document model

Each draft is stored as `{uuid}.json`:

```json
{
  "id": "uuid",
  "title": "My document",
  "content": { "type": "doc", "content": [] },
  "margins": { "top": 1, "right": 1, "bottom": 1, "left": 1 },
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

- **content** — TipTap/ProseMirror JSON document tree
- **margins** — Inches applied on US Letter (8.5″ × 11″) in editor, print, PDF, and DOCX

## Export & print consistency

All visual outputs share one layout specification in `client/src/utils/documentLayout.ts`:

- Print preview, print, and PDF use HTML generated from the same TipTap JSON via `@tiptap/html`
- DOCX uses the same margins, fonts, and heading sizes from that layout spec
- See `client/src/utils/documentRender.ts` and `tiptapToDocx.ts`

| Action | Web (browser) | Electron |
|--------|---------------|----------|
| Autosave | API → `DOCUMENTS_DIR` | API → user data dir |
| Save as DOCX | Download + save dialog | Native save dialog |
| Export PDF | `html2pdf.js` → download | `printToPDF` → Downloads folder |
| Print | Hidden iframe | Hidden `BrowserWindow` |

## Project structure

```
local-docs/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Editor chrome, print preview, dialogs
│       ├── hooks/          # Autosave persistence
│       ├── pages/          # Home + editor routes
│       └── utils/          # Layout, render, DOCX/PDF export
├── electron/               # Desktop shell (main + preload)
├── src/                    # Express API (TypeScript)
│   ├── routes/             # documents, health
│   ├── services/           # JSON file store
│   └── config/             # Environment validation
├── docs/                   # Extended documentation
├── data/documents/         # Draft storage (gitignored)
└── dist/                   # Compiled server (gitignored)
```

## Building installers

```bash
npm run dist
```

Outputs platform packages under `release/` (NSIS on Windows, DMG on macOS, AppImage on Linux) via `electron-builder`.

## Documentation

- [Development guide](docs/DEVELOPMENT.md) — Workflows, debugging, conventions
- [Architecture](docs/ARCHITECTURE.md) — Data flow, export pipelines, Electron IPC
- [API reference](docs/API.md) — REST endpoints and payloads
- [GitHub setup](docs/GITHUB.md) — Create the remote repo and push

## License

[MIT](LICENSE) — Copyright (c) 2026 gabecodez

## Trademark

“Local Docs” and `local-docs` refer to this open-source project only. Third-party names (e.g. Google Docs™) belong to their respective owners.
