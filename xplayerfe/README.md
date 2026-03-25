This is a [Next.js](https://nextjs.org) project — **Canhões do Ano**, a micro social network + voting platform.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🧪 Mock Mode (Offline Development)

You can run the entire app without a backend or Google OAuth using **Mock Mode**.

### Activate

Create a `.env.local` file in the `xplayerfe/` directory:

```bash
# .env.local
NEXT_PUBLIC_MOCK_AUTH=true
```

Or pass it inline:

```bash
NEXT_PUBLIC_MOCK_AUTH=true npm run dev
```

### What Mock Mode does

| Feature | Behaviour |
|---------|-----------|
| Authentication | Injects a `Dev Admin` user with `isAdmin: true` — no Google login required |
| Login page | Never shown — the app goes straight to the feed |
| Admin panel | Fully accessible and pre-populated with demo data |
| API calls | Intercepted and returned as static fixtures (no backend needed) |
| Dev banner | A 🧪 DEV MODE badge appears in the bottom-left corner |

> ⚠️ Mock mode is **hard-guarded** behind `process.env.NODE_ENV !== 'production'`. It can never run in a production deployment even if the env variable is accidentally set.

### Mock data

Fixtures live in `lib/mock/mockData.ts`. Edit them to adjust the data shown in dev.

---

## Project Structure

```
app/
  canhoes/(app)/          — Protected app pages (feed, admin, categorias, …)
  canhoes/(public)/       — Public pages (login)
  api/                    — Next.js API routes (auth, proxy, uploads)
components/
  chrome/canhoes/         — Navigation shell (bottom tabs, header)
  modules/canhoes/        — Feature modules
    admin/                — Admin panel & components
  dev/                    — DevModeBanner (dev-only)
  ui/                     — Shared UI components (shadcn/ui)
lib/
  api/                    — xplayerFetch wrapper
  mock/                   — Mock mode: index, mockData, mockFetch
  repositories/           — API repositories (canhoesRepo, hubRepo)
  auth/                   — Auth utilities (useIsAdmin)
contexts/
  AuthContext.tsx          — App-level auth state
hooks/
  useAuth.ts              — Re-export of AuthContext
```

## Architecture

- **UI → Repository → xplayerFetch → /api/proxy → Backend**
- Auth: NextAuth v4 with Google provider, JWT strategy
- Admin check: `user.isAdmin` from the `/api/me` backend endpoint
- Mock mode bypasses all auth and API calls with static fixtures

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
```

---

## Google OAuth Notes (Local + Vercel)

- Local dev runs on `http://localhost:3000`.
- Keep `NEXTAUTH_URL=http://localhost:3000` in `.env.local`.
- In Google Cloud OAuth client, include:
	- `http://localhost:3000/api/auth/callback/google`
	- `https://x-player-eight.vercel.app/api/auth/callback/google`
- Avoid LAN callback URLs like `http://192.168.x.x/...` with Google OAuth web flow.
- Use **Mock Mode** (above) to avoid needing Google OAuth during development.
