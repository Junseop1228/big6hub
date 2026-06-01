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
      ├── Static files → public/
      ├── API routes   → /api/*
      └── API docs     → /api-docs (Swagger UI)
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
app.js          — global middleware (helmet, cors, json parser)
  │
  ▼
routes/*.js     — matches URL pattern, calls the right controller
  │
  ▼
middleware/     — requireAuth / requireAdmin (JWT check, short-circuits
  │               with 401/403 if invalid)
  ▼
controllers/*.js — validates input, calls model, sends response
  │
  ▼
models/*.js     — executes raw SQL via db.all / db.get / db.run
  │
  ▼
database.db     — SQLite file
  │
  ▼
controllers     — res.json({ ... }) back to browser
```

---

## 3. Folder Structure

```
big6hub/
├── app.js              Entry point. Wires middleware, routers, Swagger.
├── db.js               Opens SQLite connection. Creates tables on startup.
├── seed.js             Populates DB with initial data.
├── openapi.yaml        OpenAPI 3.0 spec. Served at /api-docs.
│
├── routes/             URL definitions only. No logic.
│   ├── auth.js         POST /api/auth/register, /login, /me
│   ├── teams.js        GET|PUT /api/teams
│   ├── seasons.js      GET|POST|PUT|DELETE /api/seasons
│   ├── players.js      GET|POST|PUT|DELETE /api/players
│   └── favorites.js    GET|POST|DELETE /api/favorites
│
├── controllers/        Request handling logic. Calls models, sends responses.
│   ├── authController.js
│   ├── teamsController.js
│   ├── seasonsController.js
│   ├── playersController.js
│   └── favoritesController.js
│
├── models/             Raw SQL queries only. Returns plain JS objects.
│   ├── usersModel.js
│   ├── teamsModel.js
│   ├── seasonsModel.js
│   ├── playersModel.js
│   ├── favoritesModel.js
│   ├── trophiesModel.js
│   └── managersModel.js
│
├── middleware/         Reusable request interceptors.
│   ├── requireAuth.js  Verifies JWT. Attaches req.user. Returns 401 if invalid.
│   ├── requireAdmin.js Checks req.user.role === 'admin'. Returns 403 if not.
│   ├── validators.js   Input validation rules (express-validator).
│   └── errorHandler.js Global error handler. Returns 500 with error message.
│
├── public/             Static frontend files served directly by Express.
│   ├── index.html      Home page
│   ├── team.html       Club detail page — tab navigation (Home, Information, Seasons, Players, Trophies)
│   ├── season.html     Season detail page — sidebar navigation (Summary, Squad, Match Results)
│   ├── auth.html       Login / Register page
│   ├── favorites.html  My favorites page
│   ├── admin.html      Admin CRUD console
│   ├── css/            Styling (tokens, layout, components, pages)
│   └── js/             Client-side JS modules (api, session, home, team ...)
│       ├── api.js      API fetch functions
│       ├── team.js     
│       ├── season.js   
│       └── player.js 
│
├── data/               Seed data files. Populated via API or manual input.
├── scripts/            Utility scripts (e.g., fetch data from external APIs).
│
└── tests/
    ├── unit/           Tests for individual functions (models, middleware).
    └── api/            End-to-end HTTP tests using Supertest.
```

---

## 4. Database Schema

```
teams ──< seasons        (1:N)
teams ──< players        (1:N)
teams ──< trophies       (1:N)
teams ──< managers       (1:N)
users ──< favorites      (1:N)
```

| Table | Key Columns |
|---|---|
| teams | id, name, slug, stadium, city, manager, logo_url |
| seasons | id, team_id (FK), season, wins, draws, losses, final_position |
| players | id, team_id (FK), name, position, goals, assists, is_legend |
| trophies | id, team_id (FK), competition, season |
| managers | id, team_id (FK), name, start_year, end_year, is_current |
| users | id, email, password_hash, role |
| favorites | id, user_id (FK), kind ('team'|'player'), target_id |

---

## 5. Authentication Flow

```
1. POST /api/auth/login
      │  { email, password }
      ▼
2. authController
      │  bcrypt.compare(password, hash)
      ▼
3. jsonwebtoken.sign({ id, role })
      │  returns JWT (12h expiry)
      ▼
4. Client stores token in localStorage
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

## 6. API Reference

Full endpoint documentation is available at `/api-docs` (Swagger UI)
when the server is running, or in `openapi.yaml` at the repo root.

---

*Last updated: 2026-05-28*
