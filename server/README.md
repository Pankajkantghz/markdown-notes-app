# Mireth API

Express and TypeScript REST API for Mireth. PostgreSQL stores users, private notes, revocable sessions, and shared rate-limit counters. Grammar suggestions come from the Sapling API.

## Requirements

- Node.js and pnpm
- PostgreSQL 15 or newer
- A Sapling API key for grammar checks

## Setup

From this directory, install dependencies and create `server/.env`:

```sh
pnpm install
```

Set the database connection and server settings in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
CLIENT_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
SAPLING_API_KEY=YOUR_SAPLING_API_KEY
SESSION_COOKIE_SAME_SITE=lax
TRUST_PROXY=0
```

Set `GOOGLE_CLIENT_ID` to a Google **Web application** client ID. Use the same ID as `VITE_GOOGLE_CLIENT_ID` in `client/.env`; authorize the frontend origin (for local development, `http://localhost:5173`) in Google Cloud Console. This Identity Services credential flow does not need a redirect URI or client secret. Set `SAPLING_API_KEY` in the server environment; never put it in the client or commit it. Apply the database schema before starting the API:

```sh
pnpm db:migrate
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

`pnpm seed` adds sample notes without an owner, so they are not visible to signed-in users. Create notes after signing in to have them associated with your account.

## Structure

`src/app.ts` creates the Express app, runs the loaders, and starts the HTTP listener. `src/loaders/` initializes PostgreSQL and Express middleware. API routes and controllers live in `src/api/`, database and grammar operations in `src/services/`, environment values in `src/config/`, and the OpenAPI document in `src/docs/`.

## Swagger documentation

With the API running, open `http://127.0.0.1:5000/docs` for interactive Swagger UI or `http://127.0.0.1:5000/openapi.json` for the OpenAPI document. Health probes are `GET /health/live` and `GET /health/ready`; readiness checks PostgreSQL and the required migrated tables.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `POST` | `/auth/google` | Verify a Google Identity Services credential and sign in or create the user |
| `GET` | `/auth/me` | Return the signed-in user |
| `POST` | `/auth/logout` | Revoke the current session and clear its cookie |
| `GET` | `/health/live` | Process liveness probe |
| `GET` | `/health/ready` | Database readiness probe |
| `POST` | `/notes/grammar` | Check `{ "text": "..." }` with Sapling |
| `POST` | `/notes` | Create a note with `{ "title": "...", "content": "..." }` |
| `GET` | `/notes?page=1&limit=12` | List notes with pagination |
| `GET` | `/notes/:id/html` | Return the note and safely rendered `htmlContent` |
| `PATCH` | `/notes/:id` | Update a note's title and Markdown content |
| `DELETE` | `/notes/:id` | Delete a note |

The API verifies Google's ID token at sign-in, then issues a random, revocable, HTTP-only cookie backed by a hashed session token in PostgreSQL. The raw session token is not stored in the database or accessible to frontend JavaScript. Sessions expire after seven days and are revoked on logout. Set `GOOGLE_CLIENT_ID` to the same Web client ID in `client/.env` (`VITE_GOOGLE_CLIENT_ID`) and `server/.env`; this Identity Services flow does not use a Google client secret.

The API limits JSON request bodies to 1 MB, note titles to 160 characters, note content to 200,000 characters, grammar requests to 50,000 characters, and list pages to 100 notes. PostgreSQL stores rate-limit counters, shared by all API instances: 120 note requests per minute per client IP, 20 grammar requests per minute, and 20 auth requests per minute. In production, set `TRUST_PROXY` to the exact number of trusted reverse proxies (or `0` when clients connect directly) so IP-based limits use the real client address.

## Security notes

For production, set `NODE_ENV=production`, serve through HTTPS, configure exact HTTPS `CLIENT_ORIGINS`, `GOOGLE_CLIENT_ID`, and `TRUST_PROXY`, and use a least-privilege PostgreSQL account with `sslmode=verify-full` in `DATABASE_URL` (plus the provider's trusted CA when required). Keep `SESSION_COOKIE_SAME_SITE=lax` when frontend and API share a site; use `none` only for separate sites, where HTTPS is mandatory. Browser requests require an allow-listed origin and the application request header. SQL for sessions and rate limiting uses parameterized values; note queries use the Prisma ORM.

Existing notes remain unowned after the ownership migration and are hidden from signed-in users. New notes belong to their creator. The earlier `20261109T0749_add_note_table` migration drops the previous `Post` and `User` tables; if it has run, recover old rows from a pre-migration Neon backup restored to a separate database, then reconcile ownership before importing. Never edit or remove a migration that may have run. Two historical migrations add the same `Note.title` column; leave both in place until the applied migration ID is confirmed in every database. Backups, restore testing, alerting, privacy terms, and provider-specific TLS/network configuration must be set up by the deployment operator. Grammar request text is sent to Sapling; disclose this processing to users.

Prisma ORM 8 is still a release candidate. This project pins the latest compatible CLI, PostgreSQL ORM, and CLI engine versions; moving to stable Prisma ORM 7 requires replacing the current contract-based query and migration APIs, so it is not a safe dependency-only update.

Apply each migration once as part of the release process (`pnpm db:migrate`); set `MIGRATION_DATABASE_URL` to a separate credential with DDL permissions and keep the API's `DATABASE_URL` limited to runtime data operations. Do not start application instances before migrations finish. Configure automated encrypted database backups and test restoration before storing production user data.
