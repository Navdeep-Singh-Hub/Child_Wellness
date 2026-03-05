# Admin Analytics Dashboard

## Overview

The Admin Analytics system provides a scalable dashboard to track user therapy progress, game performance, time spent, and AI-based insights.

## Setup

### 1. Environment

Add to your `.env`:

```bash
# Comma-separated Auth0 user IDs allowed to access admin APIs.
# Use '*' to allow any authenticated user (dev only).
ADMIN_AUTH0_IDS=auth0|xxx,yyy
```

To find your Auth0 user ID: sign in to the app, then check the JWT or your Auth0 dashboard (Users → select user → copy "user_id").

### 2. API Base

- All admin endpoints are under `GET/POST /api/admin/analytics/*`.
- They require the same auth as the rest of the app (`x-auth0-id` header) and that ID must be in `ADMIN_AUTH0_IDS`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/analytics/overview` | Total users, active (daily/weekly/monthly), therapy-wise enrolled |
| GET | `/api/admin/analytics/users` | Paginated user list (query: `page`, `limit`, `search`) |
| GET | `/api/admin/analytics/users/:userId/journey` | Full therapy journey + AI insights for one user |
| GET | `/api/admin/analytics/time` | Time per therapy/game, daily usage (query: `range`, `userId`) |
| GET | `/api/admin/analytics/games` | Game performance: attempts, accuracy, avg time (query: `range`, `userId`) |
| GET | `/api/admin/analytics/therapy-progress` | Therapy-wise completion %, level, session history (query: `userId`) |
| GET | `/api/admin/analytics/reports` | Top users, need attention, most played, drop-offs (query: `range`, `userId`, `therapy`) |
| GET | `/api/admin/analytics/insights` | AI insights: improvement trend, engagement, effectiveness (query: `range`, `userId`) |
| POST | `/api/admin/analytics/cache/clear` | Clear dashboard cache |

Query `range`: e.g. `7d`, `14d`, `30d`, `90d`.

## Event-based time tracking

The app can send activity events so time is tracked per therapy/game/session:

- **POST /api/me/activity** (authenticated)

Body:

```json
{
  "eventType": "game_start",
  "therapy": "speech",
  "gameKey": "jaw-awareness-crocodile",
  "level": 2,
  "session": 1,
  "durationMs": 0
}
```

On `game_end` or `game_complete`, send `durationMs`. Optional: call `game_start` when entering a game and `game_end` when leaving, and set `durationMs` on end.

From the frontend, use `logActivity()` from `@/utils/api`:

```ts
import { logActivity } from '@/utils/api';

// When user starts a game
await logActivity({
  eventType: 'game_start',
  therapy: 'speech',
  gameKey: 'jaw-awareness-crocodile',
  level: 2,
  session: 1,
});

// When user finishes (with duration)
await logActivity({
  eventType: 'game_complete',
  therapy: 'speech',
  gameKey: 'jaw-awareness-crocodile',
  level: 2,
  session: 1,
  durationMs: 120000,
});
```

## Frontend dashboard

- **Route**: `/admin` or `/admin/dashboard` (Expo web).
- Navigate to the dashboard (e.g. from Profile or a direct link). Only users whose Auth0 ID is in `ADMIN_AUTH0_IDS` will get data; others receive 403.

## Data sources

- **User overview**: `User` collection, `UserTherapyProgress`.
- **Time tracking**: `Session.gameLogs` (durationMs, at), optional `ActivityLog` if you use `/api/me/activity`.
- **Game performance**: `Session.gameLogs` (type, correct, total, accuracy, durationMs).
- **Therapy progress**: `UserTherapyProgress.therapies`.
- **AI insights**: Derived from game logs (improvement trend = accuracy change over time; engagement = frequency + duration; effectiveness = accuracy + completion).

## Caching

- Overview and list responses are cached in memory for 5 minutes.
- Report/insight responses for 2 minutes.
- Use `POST /api/admin/analytics/cache/clear` to invalidate.

## Production

- Do not use `ADMIN_AUTH0_IDS=*` in production.
- For heavy report generation, consider moving aggregation to a background job and serving cached results (queue not implemented in this version; can be added with Bull/Redis).
