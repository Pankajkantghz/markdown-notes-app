# Mireth API

Express and TypeScript REST API for Mireth. It stores notes in PostgreSQL, checks grammar through a local LanguageTool service, and returns rendered Markdown as HTML.

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
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

Set `GOOGLE_CLIENT_ID` to a Google **Web application** client ID. Use the same ID as `VITE_GOOGLE_CLIENT_ID` in `client/.env`; authorize the frontend origin (for local development, `http://localhost:5173`) in Google Cloud Console. This Identity Services credential flow does not need a redirect URI or client secret. Apply the database schema before starting the API:

```sh
pnpm prisma db migrate
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

With the API running, open `http://127.0.0.1:5000/docs` for interactive Swagger UI or `http://127.0.0.1:5000/openapi.json` for the OpenAPI document. The specification is maintained in `src/docs/openapi.ts` and includes the health, notes, and grammar endpoints.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `POST` | `/auth/google` | Verify a Google Identity Services credential and sign in or create the user |
| `GET` | `/auth/me` | Return the signed-in user |
| `POST` | `/notes/grammar` | Check `{ "text": "..." }` with LanguageTool |
| `POST` | `/notes` | Create a note with `{ "title": "...", "content": "..." }` |
| `GET` | `/notes?page=1&limit=12` | List notes with pagination |
| `GET` | `/notes/:id/html` | Return the note and safely rendered `htmlContent` |
| `PATCH` | `/notes/:id` | Update a note's title and Markdown content |
| `DELETE` | `/notes/:id` | Delete a note |

All `/notes` endpoints require `Authorization: Bearer <Google ID token>`. The client obtains this credential from Google Identity Services. The API verifies the token's signature and audience, identifies the account by Google's stable `sub`, and scopes every note query to that user's database ID. Google ID tokens expire, so users may need to sign in again. Set `GOOGLE_CLIENT_ID` to the same web client ID in both `client/.env` (`VITE_GOOGLE_CLIENT_ID`) and `server/.env`; no client secret is used by this ID-token flow.

The API limits JSON request bodies to 1 MB, note titles to 160 characters, note content to 200,000 characters, grammar requests to 50,000 characters, and list pages to 100 notes. It allows 120 requests per minute per client IP, with grammar checks limited to 20 per minute. Rate-limit state is in memory and applies to one server process.

## Security notes

The API binds to loopback by default, limits request sizes, validates IDs and pagination, restricts browser origins, and escapes raw HTML in rendered Markdown. Its queries use the Prisma ORM; request values are passed as ORM values rather than concatenated into SQL. Do not add raw SQL string interpolation for request data.

Existing notes remain unowned after the ownership migration and are intentionally hidden from signed-in users. New notes are owned by their creator. CORS is a browser policy, not authentication. Keep the API on a trusted local machine until HTTPS and production-grade shared rate limiting are configured. The built-in limiter is process-local and is not a substitute for an edge or shared-store limiter in a multi-instance deployment.
