# Markdown Notes

A local Markdown note-taking app for writing, importing, checking, saving, and reading notes.

## Architecture

```mermaid
flowchart LR
  User --> Router[React Router]
  Router --> Layout[Content layout]
  Layout --> Pages[Home, library, note reader]
  Pages --> NotesFeature[Notes feature: components, API, types]
  NotesFeature -->|JSON over REST| API[Express API]
  Pages -->|Read selected .md/.txt file in browser| Pages
  API --> Docs[OpenAPI spec + Swagger UI]
  API --> Routes[Note routes]
  Routes --> Controllers[Controllers]
  Controllers --> Services[Note services]
  Services --> DB[(PostgreSQL)]
  Services -->|Grammar text| LT[LanguageTool on localhost:8010]
  Services -->|Render Markdown safely| HTML[HTML response]
  HTML --> UI
```

The client contains the editor, Markdown preview, grammar suggestions, library, and rendered note page. When a user selects a Markdown or text file, the browser reads it and sends its text to the API as JSON. The Express API validates requests and routes them through controllers to note and grammar services. PostgreSQL stores note content; LanguageTool supplies grammar matches and replacement suggestions. The API safely renders stored Markdown for the note reader, and the live client preview sanitizes rendered HTML with DOMPurify.

### Frontend architecture

`client/src/app` owns the router, application providers, and route pages. `components/layouts` contains the shared navigation, footer, content wrapper, and page heading used by the editor and library. `components/ui` holds reusable interface primitives such as the shared button with consistent variants and sizes. The notes feature keeps reusable editor, toolbar, preview, and workspace components beside its API functions and TypeScript types; routes consume them through the `features/notes` barrel. `lib/api-client.ts` is the shared Axios client. Routes compose these feature pieces and own page-level state and navigation.

The editor and preview share note content state. Saving and library actions use the notes API client, while selecting a file is handled locally by the browser. The note reader requests server-rendered HTML; the editor preview renders locally and sanitizes its HTML before display.

## Features

- Write notes in Markdown and preview the rendered result.
- Import `.md` and `.txt` files from the editor.
- Check spelling and grammar with LanguageTool, view underlined matches, and apply suggested replacements.
- Save, edit, search, paginate, read, and delete notes.
- Render saved Markdown as HTML.
- Switch between light and dark themes.

## Tools and technology

| Area | Tools |
| --- | --- |
| Languages | TypeScript, JavaScript, SQL |
| Client | React, Vite, Tailwind CSS, React Router |
| Markdown | Marked for rendering; DOMPurify for client-preview sanitization |
| Notifications and icons | Sonner, Lucide React |
| API | Node.js, Express, Axios |
| API docs | OpenAPI 3.0, Swagger UI |
| Database | PostgreSQL 15 or newer, Prisma ORM for PostgreSQL |
| Grammar | LanguageTool-compatible HTTP service |
| Package management | pnpm (server package metadata specifies pnpm 10.32.1) |
| Development tools | pnpm, Git, TypeScript compiler, Oxlint |

## Run locally

### Prerequisites

- Node.js and pnpm
- PostgreSQL 15 or newer
- LanguageTool available at `http://localhost:8010` for grammar checks

### 1. Configure the database

Create a PostgreSQL database. If it does not have the `Note` table described by [`server/src/prisma/contract.prisma`](server/src/prisma/contract.prisma), connect to the database and create it:

```sql
CREATE TABLE "Note" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Create `server/.env` with your local database connection and development server settings:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
PORT=5000
HOST=127.0.0.1
CLIENT_ORIGINS=http://localhost:5173
```

Keep `.env` local; it is excluded from Git. Start PostgreSQL and a LanguageTool service listening on port `8010` before using the corresponding features.

In a terminal, install and start the API:

```sh
cd server
pnpm install
pnpm dev
```

The API listens on `http://127.0.0.1:5000` by default. Its root endpoint (`GET /`) returns a health message.

### 2. Start the client

In another terminal:

```sh
cd client
pnpm install
pnpm dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### Optional: load sample notes

With the database configured, run:

```sh
cd server
pnpm seed
```

## API

All note endpoints use the `/notes` prefix. JSON request and response bodies use the `application/json` content type.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/notes/grammar` | Check grammar for `{ "text": "..." }`; returns match offsets and suggestions. |
| `POST` | `/notes` | Save `{ "title": "...", "content": "..." }` as a note. |
| `GET` | `/notes?page=1&limit=9` | List saved notes with pagination. |
| `PATCH` | `/notes/:id` | Update a note's title and Markdown content. |
| `GET` | `/notes/:id/html` | Return a note with safely rendered `htmlContent`. |
| `DELETE` | `/notes/:id` | Delete a note. |

Interactive API documentation is available at [`/docs`](http://127.0.0.1:5000/docs); the raw OpenAPI document is at [`/openapi.json`](http://127.0.0.1:5000/openapi.json). Swagger UI is served by the API.

File selection is handled in the browser: the client reads the selected `.md` or `.txt` file and saves its text through `POST /notes`. The API accepts Markdown text as JSON; it does not currently expose a separate multipart file-upload endpoint.

## Project layout

```text
client/
  src/app/                  Router, providers, and route pages
  src/components/layouts/   Navigation, footer, page layout, and headings
  src/components/ui/        Reusable button and interface primitives
  src/features/notes/       Notes UI, API client, and types
  src/lib/                  Shared API utilities
server/
  src/routes/               HTTP route declarations
  src/controllers/          Request validation and responses
  src/services/             Database, grammar, and Markdown work
  src/docs/                 OpenAPI specification
  src/prisma/               PostgreSQL client and seed data
  src/utils/                Server configuration and middleware
```

## Development checks

Run the client checks:

```sh
cd client
pnpm lint
pnpm build
```

Build the API:

```sh
cd server
pnpm build
```

This project is intended for local learning. The API has no authentication or per-user note access; keep it on a trusted local machine rather than exposing it publicly.

## Future improvements

Ideas for extending the learning project:

- Add automated API and UI tests for note creation, updates, deletion, grammar suggestions, and Markdown rendering.
- Add a dedicated multipart upload endpoint if files need to be uploaded directly to the API.
- Move the LanguageTool URL and client API URL into environment-based configuration.
- Add database migration and setup scripts so a new local database can be initialized automatically.
- Add undo or reset controls for applied grammar suggestions.
- Add authentication and per-user data only if the app later needs to support multiple users or public access.

## Contributing

Contributions and learning-focused improvements are welcome.

1. Fork the repository and create a branch for your change.
2. Install dependencies in both `client/` and `server/` using `pnpm install`.
3. Make a focused change. For API changes, keep the route, controller, service, and README documentation consistent.
4. Run the client lint/build checks and the server build from the [Development checks](#development-checks) section. Manually verify changes that need PostgreSQL or LanguageTool with those local services running.
5. Open a pull request describing what changed and how you verified it. Include screenshots for visible UI changes when useful.

Do not commit `.env` files, database credentials, or other local secrets. Please keep changes scoped to the issue or feature being addressed.
