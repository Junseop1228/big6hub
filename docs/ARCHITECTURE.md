# Big6Hub — Architecture

> Technical architecture reference for Big6Hub.
> For allowed tech stack and coding rules, see docs/PREMISE.md.

---

## 1. System Overview

```
Browser (Client)
      │
      │  HTTP Request
      ▼
Express Server (Node.js)
      │
      ├── Static files  → public/
      ├── API routes    → /api/*
      └── API docs      → /api-docs (Swagger UI)
      │
      ▼
SQLite Database (database.db)
```

---

## 2. Request Lifecycle

Every API request follows this exact flow (Lecture 10 MVC pattern):

```
Browser
  │
  ▼
app.js           — global middleware (helmet, cors, json parser, swagger)
  │
  ▼
routes/*.js      — matches URL pattern, calls controller
  │
  ▼
middleware/      — requireAuth: JWT check → 401 if invalid
  │               requireAdmin: role check → 403 if not admin
  ▼
controllers/*.js — validates input (express-validator), calls model, sends res.json()
  │
  ▼
models/*.js      — raw SQL only (db.all / db.get / db.run), parameterized queries
  │
  ▼
database.db      — SQLite file
```

---

## 3. Folder Structure

```
big6hub/
├── app.js              Entry point. Mounts middleware, routers, Swagger UI.
├── db.js               Opens SQLite connection. Creates all tables on startup.
├── seed.js             Creates admin account + fetches live data via fetchData.js.
├── openapi.yaml        OpenAPI 3.0 spec. Served at /api-docs.
│
├── scripts/
│   └── fetchData.js    Fetches Big 6 teams, squads, standings from football-data.org v4.
│
├── routes/
│   ├── auth.js         POST /api/auth/register, /login  |  GET /api/auth/me
│   ├── teams.js        GET /api/teams, /api/teams/:id  |  PUT /api/teams/:id
│   ├── players.js      GET|POST /api/players  |  GET|PUT|DELETE /api/players/:id
│   ├── seasons.js      GET|POST /api/seasons  |  GET|PUT|DELETE /api/seasons/:id
│   └── favorites.js    GET|POST /api/favorites  |  DELETE /api/favorites/:id
│
├── controllers/
│   ├── authController.js       register, login, me
│   ├── teamsController.js      getTeams, getTeam, putTeam
│   ├── playersController.js    getPlayers, getPlayer, postPlayer, putPlayer, deletePlayer
│   ├── seasonsController.js    getSeasons, getSeason, postSeason, putSeason, deleteSeason
│   └── favoritesController.js  getFavorites, postFavorite, deleteFavorite
│
├── models/
│   ├── usersModel.js      createUser, findUserByEmail, findUserById
│   ├── teamsModel.js      getAllTeams, getTeamById (with trophies + managers), updateTeam
│   ├── playersModel.js    getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer
│   ├── seasonsModel.js    getSeasons, getSeasonById, createSeason, updateSeason, deleteSeason
│   └── favoritesModel.js  getFavorites, getFavoriteById, createFavorite, deleteFavorite
│
├── middleware/
│   ├── requireAuth.js   Verifies JWT. Attaches req.user. Returns 401 if missing or invalid.
│   └── requireAdmin.js  Checks req.user.role === 'admin'. Returns 403 if not admin.
│
├── public/
│   ├── index.html       Home — Big 6 team grid
│   ├── team.html        Club detail — tabs: Home, Information, Seasons, Players, Trophies
│   ├── season.html      Season detail — sidebar: Summary, Squad, Match Results
│   ├── player.html      Player profile
│   ├── auth.html        Login / Register page
│   ├── favorites.html   My Favorites — saved players by team
│   ├── admin.html       Admin CRUD console — Teams, Players, Seasons
│   ├── css/
│   │   └──style.css    Global styles + responsive layout
│   └── js/
│       ├── api.js       Centralized fetch wrapper (apiFetch) — auto-attaches JWT
│       ├── session.js   JWT localStorage management + nav rendering
│       ├── utils.js     Team color CSS variable injection from slug
│       ├── team.js      Tab switching logic
│       ├── season.js    Sidebar + match tab logic
│       ├── player.js    Tab switching logic
│       ├── auth.js      Login / Register tab switching and URL param routing
│       ├── favorites.js Scroll and remove interactions
│       ├── home.js      Dynamic team card rendering via API
│       └── admin.js     Admin CRUD operations via API
│
└── tests/
    ├── unit/
    │   ├── requireAuth.test.js   4 cases — JWT middleware isolation
    │   └── usersModel.test.js    6 cases — in-memory SQLite mock
    └── api/
        ├── auth.test.js          10 cases — register, login, me
        └── teams.test.js         7 cases — GET list, GET detail, PUT admin-only
```

---

## 4. API Endpoints

Full interactive documentation at `/api-docs` (Swagger UI). Summary:

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Auth | Get current user |
| GET | /api/teams | Public | List all Big 6 teams |
| GET | /api/teams/:id | Public | Team detail with trophies and managers |
| PUT | /api/teams/:id | Admin | Update team info |
| GET | /api/players | Public | List players (filter: ?team_id=) |
| GET | /api/players/:id | Public | Single player |
| POST | /api/players | Admin | Add player |
| PUT | /api/players/:id | Admin | Update player |
| DELETE | /api/players/:id | Admin | Delete player |
| GET | /api/seasons | Public | List seasons (filter: ?team_id=) |
| GET | /api/seasons/:id | Public | Single season |
| POST | /api/seasons | Admin | Add season |
| PUT | /api/seasons/:id | Admin | Update season |
| DELETE | /api/seasons/:id | Admin | Delete season |
| GET | /api/favorites | Auth | My favorites list |
| POST | /api/favorites | Auth | Add favorite |
| DELETE | /api/favorites/:id | Auth | Remove favorite (403 if not owner) |

---

## 5. Database Schema

```
teams ──< seasons    (1:N)
teams ──< players    (1:N)
teams ──< trophies   (1:N)
teams ──< managers   (1:N)
users ──< favorites  (1:N)
```

| Table | Key Columns |
|---|---|
| teams | id, name, slug, stadium, city, manager, logo_url |
| seasons | id, team_id (FK), season, wins, draws, losses, final_position |
| players | id, team_id (FK), name, position, goals, assists, is_legend |
| trophies | id, team_id (FK), competition, season |
| managers | id, team_id (FK), name, start_year, end_year, is_current |
| users | id, email, password_hash, role |
| favorites | id, user_id (FK), kind ('team'\|'player'), target_id |

---

## 6. Authentication Flow

```
1. POST /api/auth/register or /login
      │  { email, password }
      ▼
2. authController
      │  bcrypt.hash (register) / bcrypt.compare (login)
      ▼
3. jsonwebtoken.sign({ id, role })
      │  returns JWT (12h expiry)
      ▼
4. Client stores token in localStorage via session.js
      │
      │  subsequent requests:
      │  Authorization: Bearer <token>
      ▼
5. requireAuth middleware
      │  jwt.verify(token, JWT_SECRET)
      │  attaches req.user = { id, role }
      ▼
6. requireAdmin middleware (admin-only routes)
      │  checks req.user.role === 'admin'
      ▼
7. Controller proceeds
```

---

## 7. Data Seeding

Live data is fetched from **football-data.org v4 API** on first run:

```
npm run seed
  └── seed.js
        ├── Create admin account (ADMIN_EMAIL / ADMIN_PASSWORD from .env)
        └── scripts/fetchData.js
              ├── GET /competitions/PL/teams?season=2024  → 6 teams + 120 players
              └── GET /competitions/PL/standings?season=2024  → 2024-25 season stats
```

Rate limit: 10 requests/minute (free tier). Seed uses 2 requests total.

---

## 8. Security Measures

| Threat | Mitigation |
|---|---|
| SQL Injection | Parameterized queries (`?` placeholder) throughout all models |
| Broken Access Control (IDOR) | DELETE /api/favorites/:id checks `favorite.user_id === req.user.id` |
| Cryptographic Failures | Passwords hashed with bcrypt (salt rounds: 10), never stored plaintext |
| Timing Attack on login | `bcrypt.compare` always runs regardless of whether user exists |
| Unauthorized access | Protected routes enforced server-side via requireAuth / requireAdmin |
| XSS | helmet CSP headers + frontend uses textContent not innerHTML |

---

*Last updated: 2026-06-08*
