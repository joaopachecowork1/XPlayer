# XPlayer Backend (DEV skeleton)

This is a minimal ASP.NET Core Web API backend to support the frontend right now.

## Run (local)
From `backend/XPlayer.Api`:

```bash
dotnet restore
dotnet run
```

By default:
- Swagger: `https://localhost:5001/swagger` (or `http://localhost:5000/swagger`)
- SQLite file: `xplayer.db` in the API folder

## Auth (DEV ONLY)
The API uses a very simple middleware (`MockAuthMiddleware`) that sets a user id.
- If `Authorization: Bearer <token>` exists, it assumes the mock user.
- You can also pass `X-User-Id: <guid>` to simulate different users.

TODO: replace with real JWT auth.

## Endpoints used by the frontend
- `POST /api/sessions/start`
- `POST /api/sessions/{id}/stop`
- `GET /api/sessions`
- `GET /api/sessions/active`
- `GET /api/backlog`

## XP rules
Server is the source of truth.
Currently: `1 XP per second` (placeholder).
TODO: decide and update `Models/XpCalculator.cs`.
