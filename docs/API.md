# API reference

Base URL defaults to `http://localhost:3000` in development. Electron uses `http://127.0.0.1:3847`.

All document endpoints are under `/api/documents`. Errors return JSON: `{ "error": "message" }`.

## Health

### `GET /health`

**Response `200`**

```json
{ "status": "ok" }
```

## Documents

### `GET /api/documents`

List document summaries (newest `updatedAt` first).

**Response `200`**

```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Untitled document",
      "createdAt": "2026-05-22T12:00:00.000Z",
      "updatedAt": "2026-05-22T12:05:00.000Z"
    }
  ]
}
```

### `POST /api/documents`

Create a new draft.

**Body (optional)**

```json
{ "title": "My document" }
```

| Field | Type | Rules |
|-------|------|-------|
| `title` | string | Trimmed, 1–200 chars (optional; default `"Untitled document"`) |

**Response `201`**

```json
{
  "document": {
    "id": "uuid",
    "title": "My document",
    "content": { "type": "doc", "content": [{ "type": "paragraph" }] },
    "margins": { "top": 1, "right": 1, "bottom": 1, "left": 1 },
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

### `GET /api/documents/:id`

Fetch a full document record.

**Response `200`** — `{ "document": DocumentRecord }`  
**Response `404`** — Document not found  
**Response `400`** — Invalid UUID format

### `PATCH /api/documents/:id`

Partial update. At least one field required.

**Body**

```json
{
  "title": "Updated title",
  "content": { "type": "doc", "content": [] },
  "margins": { "top": 1, "right": 1, "bottom": 1, "left": 1 }
}
```

| Field | Type | Rules |
|-------|------|-------|
| `title` | string | Optional, 1–200 chars trimmed |
| `content` | object | Optional TipTap JSON root |
| `margins` | object | Optional; each side 0–4 inches |

**Response `200`** — `{ "document": DocumentRecord }`  
**Response `400`** — Invalid payload or nothing to update  
**Response `404`** — Document not found

### `DELETE /api/documents/:id`

**Response `204`** — No body  
**Response `404`** — Document not found

## Types

### `DocumentRecord`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `title` | string | Display name |
| `content` | object | TipTap `doc` JSON |
| `margins` | `PageMargins` | Inch values per edge |
| `createdAt` | string | ISO-8601 |
| `updatedAt` | string | ISO-8601 |

### `PageMargins`

```json
{ "top": 1, "right": 1, "bottom": 1, "left": 1 }
```

## Development root

When `NODE_ENV` is not `production`, `GET /` returns API metadata:

```json
{
  "name": "local-docs",
  "message": "API is running. Start the React client with npm run dev:client.",
  "endpoints": {
    "health": "/health",
    "documents": "/api/documents"
  }
}
```
