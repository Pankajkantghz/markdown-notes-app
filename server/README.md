# Markdown Notes API

Express and TypeScript REST API for the Markdown Notes app. It stores notes in PostgreSQL, checks grammar through a local LanguageTool service, and returns rendered Markdown as HTML.

## Requirements

- Node.js and pnpm
- PostgreSQL 15 or newer
- LanguageTool running at `http://localhost:8010` for grammar checks

## Setup

From this directory, install dependencies and create `server/.env`:

```sh
pnpm install
```

Set the database connection and server settings in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
PORT=5000
HOST=127.0.0.1
CLIENT_ORIGINS=http://localhost:5173
```

Keep `.env` private and use a database account with access only to this app's database. The default server address is `127.0.0.1:5000`; `CLIENT_ORIGINS` defaults to `http://localhost:5173`.

Start the development server:

```sh
pnpm dev
```

Build and run the compiled server:

```sh
pnpm build
pnpm start
```

`pnpm seed` adds the sample notes to the configured database.

## Swagger documentation

With the API running, open `http://127.0.0.1:5000/docs` for interactive Swagger UI or `http://127.0.0.1:5000/openapi.json` for the OpenAPI document. The specification is maintained in `src/docs/openapi.ts` and includes the health, notes, and grammar endpoints.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `POST` | `/notes/grammar` | Check `{ "text": "..." }` with LanguageTool |
| `POST` | `/notes` | Create a note with `{ "title": "...", "content": "..." }` |
| `GET` | `/notes?page=1&limit=12` | List notes with pagination |
| `GET` | `/notes/:id/html` | Return the note and safely rendered `htmlContent` |
| `PATCH` | `/notes/:id` | Update a note's title and Markdown content |
| `DELETE` | `/notes/:id` | Delete a note |

The API limits JSON request bodies to 1 MB, note titles to 160 characters, note content to 200,000 characters, grammar requests to 50,000 characters, and list pages to 100 notes. It allows 120 requests per minute per client IP, with grammar checks limited to 20 per minute. Rate-limit state is in memory and applies to one server process.

## Security notes

The API binds to loopback by default, limits request sizes, validates IDs and pagination, restricts browser origins, and escapes raw HTML in rendered Markdown. Its queries use the Prisma ORM; request values are passed as ORM values rather than concatenated into SQL. Do not add raw SQL string interpolation for request data.

This app does not have user authentication or per-user note access. CORS is a browser policy, not authentication. Keep the API on a trusted local machine. Do not bind it to a public interface or expose it to the internet until authentication, HTTPS, and production-grade shared rate limiting are configured. The built-in limiter is process-local and is not a substitute for an edge or shared-store limiter in a multi-instance deployment.
