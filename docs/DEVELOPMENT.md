# Development guide

## Repository setup

```bash
git clone https://github.com/gabecodez/local-docs.git
cd local-docs
npm install
cp .env.example .env
```

The npm package name is `local-docs`. If your checkout folder is still named something else (e.g. `nodejs-server`), you can rename it to `local-docs` for consistency—functionality does not depend on the folder name.

## Daily workflows

### Full stack in the browser

```bash
npm run dev
```

Open `http://localhost:5173`. Ensure `VITE_API_URL=http://localhost:3000` in `client/.env.development` if the client cannot reach the API (create the file if needed).

### API-only changes

```bash
npm run dev:server
```

### UI-only changes

```bash
npm run dev:client
```

### Desktop shell

```bash
npm run dev:electron
```

Rebuilds Electron TypeScript on start. Uses Vite HMR for the renderer.

## Type checking

```bash
npm run typecheck
```

Runs `tsc` for server (`src/`), Electron (`electron/`), and client workspace.

## Production build

```bash
npm run build
npm run start
```

Serve the app at `http://localhost:3000` with API and static UI combined.

## Code conventions

- **TypeScript** everywhere; ESM (`"type": "module"`).
- Server imports use `.js` extensions (Node16 module resolution).
- Prefer extending `documentLayout.ts` when changing print/PDF/DOCX formatting.
- Route handlers rely on Express 5 async error propagation (no try/catch boilerplate).
- Do not commit `data/`, `dist/`, `.env`, or compiled `src/**/*.js` artifacts.

## Adding a TipTap extension

1. Install the `@tiptap/extension-*` package in `client/`.
2. Register it in `client/src/extensions/editorExtensions.ts`.
3. If it affects export appearance, verify:
   - `generateHTML` output in print preview
   - DOCX mapping in `tiptapToDocx.ts` (add cases as needed)

## Debugging exports

| Symptom | Check |
|---------|--------|
| PDF blank (Electron) | Temp HTML load in `electron/main.ts`; ensure `did-finish-load` fired |
| PDF opens print dialog | Must use `exportDocumentToPdf`, not `printDocument` |
| DOCX missing styles | TipTap mark types in `runOptionsFromMarks` |
| Preview ≠ print | Both must use `renderDocumentBodyHtml` + `documentLayout` CSS |

## Electron IPC changes

1. Handler in `electron/main.ts`
2. Exposure in `electron/preload.ts`
3. Types in `client/src/types/electron.d.ts`
4. Wrapper in `client/src/utils/fileAccess.ts` or export utils

Restart `npm run dev:electron` after preload/main changes.

## Environment files

| File | Purpose |
|------|---------|
| `.env` | Server secrets/paths (gitignored) |
| `.env.example` | Committed template |
| `client/.env.development` | Optional `VITE_API_URL` |

## Data directory

Drafts: `DOCUMENTS_DIR` (default `./data/documents`). Safe to delete `.json` files while the server is stopped for a clean slate.

## Release build

```bash
npm run dist
```

Requires platform tooling for `electron-builder` (code signing not configured by default).

## Useful paths

| Path | Contents |
|------|----------|
| `client/src/utils/documentLayout.ts` | Shared page/typography constants |
| `client/src/utils/documentRender.ts` | HTML generation |
| `src/services/documentStore.ts` | Persistence layer |
| `electron/main.ts` | Desktop lifecycle + IPC |
