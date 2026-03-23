# REMOVED.md — Canhões do Ano Module Isolation

This file documents every file, component, controller, and service that was **removed** during
the isolation of the **Canhões do Ano** module. The goal is to make the application a standalone
single-module platform serving only the Canhões do Ano event.

---

## Frontend (`xplayerfe/`)

### Pages Removed

| Path | Reason |
|------|--------|
| `app/dashboard/` | XPlayer dashboard — not part of Canhões |
| `app/sessions/` | Gaming session tracker — not part of Canhões |
| `app/friends/` | Friends list — not part of Canhões |
| `app/backlog/` | Game backlog — not part of Canhões |
| `app/hub/` | Generic XPlayer hub — Canhões uses its own feed |
| `app/settings/` | XPlayer settings — not part of Canhões |
| `app/login/` | XPlayer root login — Canhões has its own login at `/canhoes/login` |
| `app/api/sessions/` | Gaming session API routes — not needed |
| `app/api/login/` | Mock credential login API — not used by Canhões (Google OAuth) |

### Modules Removed

| File | Reason |
|------|--------|
| `components/modules/DashboardModule.tsx` | XPlayer dashboard — not Canhões |
| `components/modules/BacklogModule.tsx` | Game backlog — not Canhões |
| `components/modules/BacklogGameDetailModule.tsx` | Game detail — not Canhões |
| `components/modules/SessionsModule.tsx` | Gaming sessions — not Canhões |
| `components/modules/FriendsModule.tsx` | Friends — not Canhões |
| `components/modules/SettingsModule.tsx` | Settings — not Canhões |
| `components/modules/HomeModule.tsx` | Generic home — not Canhões |

### Layout Components Removed

| File | Reason |
|------|--------|
| `components/layout/Header.tsx` | XPlayer header — Canhões has its own `CanhoesChrome` header |
| `components/layout/Sidebar.tsx` | XPlayer sidebar — Canhões uses bottom tabs |
| `components/layout/BottomNav.tsx` | Generic bottom nav — Canhões has `CanhoesBottomTabs` |
| `components/layout/DashboardLayout.tsx` | Dashboard wrapper — not used by Canhões |
| `components/layout/ModeToggle.tsx` | Light/dark toggle — Canhões is always dark |

### Feature Components Removed

| File | Reason |
|------|--------|
| `components/game/` (entire directory) | Game search, RAWG integration — not Canhões |
| `components/profile/` (entire directory) | Profile card — not used in Canhões |
| `components/session/` (entire directory) | Gaming session bar/timer — not Canhões |
| `components/login-form.tsx` | XPlayer root login form — Canhões has its own |
| `components/PostCard.tsx` | Generic post card — not used in Canhões |

### Library / Utilities Removed

| File | Reason |
|------|--------|
| `lib/repositories/backlogRepo.ts` | Backlog API calls — not Canhões |
| `lib/repositories/sessionRepo.ts` | Session API calls — not Canhões |
| `lib/rawg.ts` | RAWG games database API — not Canhões |
| `lib/xp-calculator.ts` | XP calculation — gaming feature, not Canhões |
| `lib/storage.ts` | Generic storage utilities — unused after other removals |
| `lib/user-storage.ts` | User data persistence — unused after other removals |

### Models Removed

| File | Reason |
|------|--------|
| `models/backlog.ts` | Backlog model — not Canhões |
| `models/profile.ts` | Profile model — not Canhões |
| `models/session.ts` | Gaming session model — not Canhões |

### Services Removed

| File | Reason |
|------|--------|
| `services/GameService.ts` | Game search service (RAWG) — not Canhões |
| `services/SessionService.ts` | Session management service — not Canhões |

### Constants Removed

| File | Reason |
|------|--------|
| `constants/mockGames.ts` | Mock game data for backlog — not Canhões |
| `constants/navigation.ts` | XPlayer navigation routes — not Canhões |

### Hooks Removed

| File | Reason |
|------|--------|
| `hooks/useSession.ts` | Gaming session hook — not Canhões |

---

## Backend (`XPlayerBE/`)

### Controllers Removed

| File | Reason |
|------|--------|
| `XPlayer.API/Controllers/SessionsController.cs` | Gaming session endpoints — not Canhões |
| `XPlayer.API/Controllers/GamesController.cs` | Game management endpoints — not Canhões |
| `XPlayer.API/Controllers/BacklogController.cs` | User backlog endpoints — not Canhões |

### DTOs Removed

| File | Reason |
|------|--------|
| `XPlayer.API/DTOs/SessionDtos.cs` | Session data transfer objects — not Canhões |
| `XPlayer.API/DTOs/GameDtos.cs` | Game data transfer objects — not Canhões |

### Models / Entities Removed

| File | Reason |
|------|--------|
| `XPlayer.API/Models/SessionEntity.cs` | Gaming session database entity — not Canhões |
| `XPlayer.API/Models/SessionStatus.cs` | Session status enum — not Canhões |
| `XPlayer.API/Models/BacklogItemEntity.cs` | Backlog database entity — not Canhões |
| `XPlayer.API/Models/GameEntity.cs` | Game database entity — not Canhões |
| `XPlayer.API/Models/XpCalculator.cs` | XP calculation model — not Canhões |

### Business Logic Services Removed

| File | Reason |
|------|--------|
| `XPlayer.BL/Services/SessionService.cs` | Session business logic — not Canhões |
| `XPlayer.BL/Services/StatsAggregator.cs` | User statistics aggregation — not Canhões |
| `XPlayer.BL/Services/StreakService.cs` | Login/activity streak calculation — not Canhões |
| `XPlayer.BL/Services/XpCalculator.cs` | XP calculation service — not Canhões |

### Domain Entities Removed

| File | Reason |
|------|--------|
| `XPlayer.Domain/Entities/Game.cs` | Game domain entity — not Canhões |
| `XPlayer.Domain/Entities/Session.cs` | Session domain entity — not Canhões |
| `XPlayer.Domain/Entities/SessionEvent.cs` | Session event domain entity — not Canhões |
| `XPlayer.Domain/Entities/UserDailyStat.cs` | Daily stats entity — not Canhões |
| `XPlayer.Domain/Entities/UserGameStat.cs` | Game stats entity — not Canhões |
| `XPlayer.Domain/Enums/SessionEnums.cs` | Session status enums — not Canhões |

### Tests Removed

| File | Reason |
|------|--------|
| `XPlayer.Tests/StreakServiceTests.cs` | Tests for removed StreakService |
| `XPlayer.Tests/XpCalculatorTests.cs` | Tests for removed XpCalculator |

---

## What Was Kept

The following were **intentionally kept** because they serve the Canhões do Ano module:

- **`components/chrome/canhoes/`** — Full Canhões layout shell (CanhoesChrome, BottomTabs, etc.)
- **`components/modules/canhoes/`** — All Canhões award modules (voting, nominations, gala, etc.)
- **`components/modules/hub/`** — Hub feed used by the Canhões feed page
- **`lib/repositories/canhoesRepo.ts`** — Canhões API calls
- **`lib/repositories/hubRepo.ts`** — Hub/feed API calls
- **`hooks/useAuth.ts`** — Authentication (needed everywhere)
- **`hooks/useCategories.ts`**, **`useProposals.ts`**, **`usePosts.ts`** — Canhões data
- **`lib/api/`**, **`lib/utils.ts`**, **`lib/time.ts`**, **`lib/media.ts`** — Shared utilities
- **`components/ui/`** — Shared UI primitives (shadcn/ui)
- **`components/animations/`** — New: SmokeOverlay + CannonBlast animations
- **Backend: `CanhoesController.cs`**, **`HubController.cs`**, **`AuthController.cs`**, **`UsersController.cs`**, **`CategoryProposalsController.cs`**
- **Backend: `CanhoesEntities.cs`**, **`HubFeedEntities.cs`**, **`UserEntity.cs`**
