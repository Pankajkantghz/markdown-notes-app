# Mireth

A private Markdown notebook for writing, organizing, and refining your notes.

[Open Mireth](https://mireth.vercel.app/)

## Features

- Google sign-in with notes scoped to your account
- Markdown editor, live preview, file import, and grammar suggestions
- Searchable, paginated note library with edit and delete
- Responsive light and dark themes

## Architecture

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 60, "rankSpacing": 90, "diagramPadding": 24}, "themeVariables": {"fontSize": "18px"}}}%%
flowchart LR
  User[User] -->|Write, list, or open notes| Client[Browser: React app]
  Client -->|HTTPS request + session cookie| API[Express API]
  Client -->|Sign in| GIS[Google Identity Services]
  GIS -->|Google ID credential| Client
  API -->|Verify sign-in credential| Google[Google identity service]
  Google -->|Verified identity| API
  API -->|Validate session and note ownership| Services[Auth, note, and grammar services]
  Services -->|Read or write users, sessions, and notes| DB[(PostgreSQL)]
  DB -->|Stored records| Services
  Services -->|Grammar text| Sapling[Sapling grammar API]
  Sapling -->|Suggestions| Services
  Services -->|Result| API
  API -->|JSON or rendered HTML + session cookie| Client
  Client -->|Display notes and results| User
```

The API verifies Google credentials, issues an HTTP-only session cookie, and checks note ownership on requests. PostgreSQL stores users, sessions, notes, and rate-limit counters. Grammar text is sent to Sapling when grammar checks are used.

## Run locally

**Requirements:** Node.js, pnpm, PostgreSQL, and a Google Web client ID. Grammar checks also need a Sapling API key.

1. Create a PostgreSQL database.
2. Add `server/.env`:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE
   CLIENT_ORIGINS=http://localhost:5173
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   SAPLING_API_KEY=YOUR_SAPLING_API_KEY
   SESSION_COOKIE_SAME_SITE=lax
   TRUST_PROXY=0
   ```

3. Set `VITE_GOOGLE_CLIENT_ID` in `client/.env` to the same ID. Add `http://localhost:5173` as an authorized JavaScript origin in Google Cloud Console.
4. Start the API and client in separate terminals:

   ```sh
   (cd server && pnpm install && pnpm db:migrate && pnpm dev)
   (cd client && pnpm install && pnpm dev)
   ```

Open the Vite URL shown in the client terminal. Keep `.env` files and secrets out of Git.

## API

All `/notes` endpoints require sign-in and operate only on the current user's notes.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/google` | Sign in with Google |
| `GET` | `/auth/me` | Get the current user |
| `POST` | `/auth/logout` | End the session |
| `GET` | `/notes` | List notes |
| `POST` | `/notes` | Create a note |
| `PATCH` | `/notes/:id` | Update a note |
| `DELETE` | `/notes/:id` | Delete a note |
| `POST` | `/notes/grammar` | Get grammar suggestions |
| `GET` | `/notes/:id/html` | Get rendered note HTML |

API docs: [`/docs`](https://mireth-xyj0.onrender.com/docs) · OpenAPI: [`/openapi.json`](https://mireth-xyj0.onrender.com/openapi.json)

## Checks

```sh
pnpm --dir client lint && pnpm --dir client build
pnpm --dir server test && pnpm --dir server build
```

GitHub Actions runs these checks and validates migration integrity.

## Deployment and data

The client is hosted on Vercel, the API on Render, and PostgreSQL on Neon. Configure HTTPS, exact Google OAuth origins, matching client IDs, trusted proxy settings, and secrets in the hosting dashboards. Use a pooled Neon URL for the API, a migration-capable URL for releases, and enable backups with tested restores.

Historical migrations include a destructive table change and duplicate title migrations. Do not edit or remove migrations that may have run. If older records are missing, restore a pre-migration Neon backup to a separate database and reconcile note ownership before importing. Notes without an owner remain hidden from signed-in users.

Mireth stores account and note data in PostgreSQL. Grammar text is sent to Sapling when requested. Google, hosting, database, and grammar providers may process data to deliver their services; review their privacy terms.

## Contributing

Focused contributions are welcome. Run the checks above, keep API documentation current, and never commit credentials or `.env` files.
