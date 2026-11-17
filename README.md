# Mireth

Give your thoughts a place to grow. Mireth is a Markdown note-taking app for writing, importing, checking, saving, and reading notes.

## Live app

[Open Mireth](https://markdown-notes-app-chi-ruby.vercel.app/)

The app opens to Google sign-in. After signing in, users can create and manage their own private Markdown notes. Note content is only available to authenticated users.

## Architecture

```mermaid
flowchart LR
  User --> Login[React login page]
  Login -->|ID credential| GIS[Google Identity Services]
  GIS -->|Credential| Auth[Express auth routes]
  Auth -->|Verify credential| Google[Google identity verification]
  Auth -->|Create or revoke session| DB[(PostgreSQL)]
  Auth -->|HTTP-only session cookie| Client[React application]
  User --> Router[React Router and auth provider]
  Client --> Router
  Router --> Pages[Home, library, note reader]
  Pages --> Feature[Notes feature: UI, API, types]
  Feature -->|JSON + session cookie| API[Express API]
  API --> Middleware[Origin, session, and rate-limit middleware]
  Middleware --> Routes[Auth and note routes]
  Routes --> Controllers[Controllers]
  Controllers --> Services[Note and session services]
  Services -->|Users, sessions, owned notes, rate limits| DB
  Services -->|Grammar text + server API key| Sapling[Sapling grammar API]
  Services -->|Render saved Markdown| HTML[Safe HTML response]
  HTML --> Pages
  Pages -->|Read selected .md/.txt locally| Pages
  API --> Health[Health endpoints]
  API --> Docs[OpenAPI + Swagger UI]
```

The client contains the branded, theme-aware Google sign-in page, editor, Markdown preview, grammar suggestions, library, and note reader. Google Identity Services returns an ID credential to the client, which exchanges it with the API for a revocable HTTP-only session cookie. Authenticated note requests use that cookie; the API scopes reads and writes to the signed-in user. PostgreSQL stores users, sessions, owned notes, and shared rate-limit counters. For grammar checks, the server sends text to Sapling using a server-side API key. The API safely renders saved Markdown for the reader, while the live client preview sanitizes rendered HTML with DOMPurify. File selection stays in the browser before note text is sent to the API.

### Frontend architecture

`client/src/app` owns the router, application providers, and route pages. The auth module contains the branded login route and provider that exchanges Google credentials for a session and loads the current user. `components/layouts` contains the shared navigation, footer, content wrapper, and page heading used by the editor and library. `components/ui` holds reusable interface primitives such as the shared button with consistent variants and sizes. The notes feature keeps reusable editor, toolbar, preview, and workspace components beside its API functions and TypeScript types; routes consume them through the `features/notes` barrel. `lib/api-client.ts` is the shared Axios client and sends credentials with API requests. Routes compose these feature pieces and own page-level state and navigation.

The editor and preview share note content state. Saving and library actions use the notes API client, while selecting a file is handled locally by the browser. The note reader requests server-rendered HTML; the editor preview renders locally and sanitizes its HTML before display.

## Features

- Write notes in Markdown and preview the rendered result.
- Sign in with Google and keep each account's notes private to that user.
- Use a responsive, theme-aware sign-in page styled with Mireth's brand.
- Import `.md` and `.txt` files from the editor.
- Check spelling and grammar with Sapling, view underlined matches, and apply suggested replacements.
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
| Grammar | Sapling grammar-check API |
| Package management | pnpm (server package metadata specifies pnpm 10.32.1) |
| Development tools | pnpm, Git, TypeScript compiler, Oxlint |

## Run locally

### Prerequisites

- Node.js and pnpm
- PostgreSQL 15 or newer
- A Sapling API key for grammar checks

### 1. Configure the database

Create an empty PostgreSQL database, then apply the checked-in migrations from the `server` directory. This creates the user and note tables and their ownership relation.

Create `server/.env` with your local database connection and development server settings:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
CLIENT_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
SAPLING_API_KEY=YOUR_SAPLING_API_KEY
SESSION_COOKIE_SAME_SITE=lax
TRUST_PROXY=0
```

Set the same Google **Web application** client ID in `client/.env` as `VITE_GOOGLE_CLIENT_ID`. For local Google Identity Services sign-in, authorize `http://localhost:5173` as a JavaScript origin; this flow does not use a redirect URI or client secret. Keep both `.env` files local; they are excluded from Git. Add your Sapling API key to `server/.env`; keep it out of the client env and Git.

In a terminal, install and start the API:

```sh
cd server
pnpm install
pnpm db:migrate
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

Google sign-in is handled by `POST /auth/google`; `GET /auth/me` returns the current user and `POST /auth/logout` revokes the session. The client exchanges Google's ID token for a revocable, HTTP-only session cookie. All note and grammar routes require that session, and note queries are scoped to the signed-in user's account. Rate limits are stored in PostgreSQL and shared across API instances.

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
  src/app.ts                HTTP entrypoint and application startup
  src/api/                  API router, routes, and controllers
  src/config/               Environment configuration
  src/loaders/              Database and Express startup
  src/services/             Database, grammar, and Markdown work
  src/docs/                 OpenAPI specification
  src/prisma/               PostgreSQL client and seed data
  src/utils/                Markdown helpers and rate limiting
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

## Production deployment

The repository includes production-oriented session cookies, database-backed rate limits, strict origin checks, readiness probes, graceful shutdown, and structured request logs. Deployment still depends on the operator's infrastructure and must be verified before public launch.

GitHub Actions runs client lint/build, server build, and migration integrity checks for pushes and pull requests.

Connect the GitHub repository to Vercel for the client and Render for the API, and enable deploys from the chosen production branch. Keep deployments behind the CI checks and set each provider's build, start, and environment settings from its dashboard. Neon hosts PostgreSQL; use its pooled runtime URL for the API and a migration-capable URL for release migrations. Configure the exact deployed frontend origin in both Google OAuth and the API's `CLIENT_ORIGINS`.

- Serve the client and API over HTTPS. The Vercel rewrites in `client/vercel.json` proxy API requests through the frontend origin; use `SESSION_COOKIE_SAME_SITE=lax` for the session cookie.
- Set `NODE_ENV=production`, a PostgreSQL `DATABASE_URL` with `sslmode=verify-full` and the provider's trusted CA when required, the matching Google Web client ID, HTTPS `CLIENT_ORIGINS`, `SAPLING_API_KEY`, and the correct `TRUST_PROXY` hop count. Use a least-privilege database account.
- Set `VITE_GOOGLE_CLIENT_ID` to the same ID and leave `VITE_API_URL` unset on Vercel so requests use the same-origin API proxy. Add the deployed frontend origin to Google Authorized JavaScript origins.
- Apply migrations as a release step with `cd server && pnpm db:migrate`; do not run schema migrations concurrently from each application instance. Set `MIGRATION_DATABASE_URL` to a separate migration-only credential in deployment and keep the API's `DATABASE_URL` restricted to runtime data operations.
- Monitor `/health/live` and `/health/ready`. Configure automated encrypted PostgreSQL backups and regularly test restore procedures, alerting, log retention, and rollback.
- Grammar requests send submitted text to Sapling. Review its data handling terms and disclose this processing to users.
- Before launch, verify account isolation, login/logout, cookie settings, rate limits across multiple API instances, database failover, backup restoration, and browser behavior on the production domains. Publish privacy, retention, and support information for real users.

These steps are deployment-specific; successful local builds alone do not certify a production deployment.

## Privacy

Mireth uses Google to sign you in and stores your notes and account data in its configured PostgreSQL database. When deployed, connections to the app should use HTTPS. If you use grammar checks, submitted text is sent to Sapling; review its privacy terms before sending personal text. Mireth does not sell your notes. Google, hosting, database, and grammar providers may process data as needed to provide their services under their own terms. Data-at-rest encryption and backup retention depend on the configured providers and account settings.

## Future improvements

Ideas for extending the learning project:

- Add automated API and UI tests for note creation, updates, deletion, grammar suggestions, and Markdown rendering.
- Add a dedicated multipart upload endpoint if files need to be uploaded directly to the API.
- Add automated API and browser end-to-end checks for authentication, account isolation, and production cookie behavior.
- Add a documented deployment pipeline and backup restore runbook for the chosen hosting provider.
- Add undo or reset controls for applied grammar suggestions.

## Contributing

Contributions and learning-focused improvements are welcome.

1. Fork the repository and create a branch for your change.
2. Install dependencies in both `client/` and `server/` using `pnpm install`.
3. Make a focused change. For API changes, keep the route, controller, service, and README documentation consistent.
4. Run the client lint/build checks and the server build from the [Development checks](#development-checks) section. Manually verify grammar changes with a configured Sapling API key.
5. Open a pull request describing what changed and how you verified it. Include screenshots for visible UI changes when useful.

Do not commit `.env` files, database credentials, or other local secrets. Please keep changes scoped to the issue or feature being addressed.
