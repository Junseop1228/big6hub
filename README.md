# Big6Hub

![CI](https://github.com/Junseop1228/big6hub/actions/workflows/ci.yml/badge.svg)

A full-stack web application for Premier League Big 6 fans — explore clubs, squads, seasons, match results, trophies, and the latest news.

**Live URL:** https://big6hub.onrender.com

> Free tier — first request after inactivity may take ~30 seconds to wake up.

---

## Team

| Name | Role |
|---|---|
| Junseop Kim | Team lead · Backend |
| Seongbin Lee | Frontend UI |
| Geon Kim | Frontend Auth & Data Rendering |
| Hyoungdo Kim | Testing · CI · News |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | SQLite (via `sqlite` + `sqlite3`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Frontend | Vanilla JS (ES6+), HTML5, CSS3 |
| Testing | Jest + SuperTest |
| CI | GitHub Actions |
| Deployment | Render (free tier) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
# 1. Clone
git clone https://github.com/Junseop1228/big6hub.git
cd big6hub

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 4. Seed database (fetches live data from ESPN, PL, BBC APIs)
npm run seed

# 5. Start server
npm start
```

Open http://localhost:3000

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `DB_PATH` | No | SQLite file path (default: `./database.db`) |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing — use a long random string |
| `ADMIN_EMAIL` | **Yes** | Admin account email |
| `ADMIN_PASSWORD` | **Yes** | Admin account password |

---

## Data Sources

Seed fetches live data on every run — no static data files needed.

| Source | Data | Auth |
|---|---|---|
| ESPN (unofficial) | Teams, players (goals/assists), season records (6 seasons), PL trophies (2006–present) | None |
| Premier League Pulse API | Official player profile photos (250×250) | None |
| BBC Sport RSS | Latest news per club (10 articles each) | None |

**Seeded data:** 6 teams · 221 players · 36 season records · 19 PL trophies · 30 recent matches · 96 player photos · 60 news articles

---

## Running Tests

```bash
npm test
```

- **32 tests** — 5 test suites (unit + API)
- Tests use an in-memory SQLite database (`DB_PATH=:memory:`)
- No `.env` required for CI

---

## API Documentation

Swagger UI available at:
- **Live:** https://big6hub.onrender.com/api-docs
- **Local:** http://localhost:3000/api-docs

OpenAPI spec: [`openapi.yaml`](./openapi.yaml)

### Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/teams` | — | List all 6 teams |
| GET | `/api/teams/:id` | — | Team detail (with trophies & managers) |
| PUT | `/api/teams/:id` | Admin | Update team info |
| GET | `/api/teams/:id/matches` | — | Recent & upcoming matches |
| GET | `/api/players` | — | List players (filter by `team_id`) |
| GET | `/api/players/:id` | — | Player detail |
| POST | `/api/players` | Admin | Create player |
| PUT | `/api/players/:id` | Admin | Update player |
| DELETE | `/api/players/:id` | Admin | Delete player |
| GET | `/api/seasons` | — | List seasons (filter by `team_id`) |
| GET | `/api/seasons/:id` | — | Season detail |
| POST | `/api/seasons` | Admin | Create season |
| PUT | `/api/seasons/:id` | Admin | Update season |
| DELETE | `/api/seasons/:id` | Admin | Delete season |
| GET | `/api/favorites` | JWT | List my favorites |
| POST | `/api/favorites` | JWT | Add to favorites |
| DELETE | `/api/favorites/:id` | JWT | Remove from favorites |
| GET | `/api/news` | — | News (filter by `team_id`) |
| POST | `/api/news/refresh` | Admin | Refresh news from RSS |

---

## Project Structure

```
big6hub/
├── app.js              # Express app config (no listen)
├── server.js           # Entry point — app.listen + initDb
├── db.js               # SQLite init + getDb()
├── seed.js             # DB seeding from live APIs
├── openapi.yaml        # OpenAPI 3.0 spec
├── controllers/        # Route handlers (auth, teams, players, seasons, favorites, news, matches)
├── models/             # DB query functions
├── middleware/         # requireAuth, requireAdmin
├── routes/             # Express routers
├── scripts/
│   ├── fetchData.js    # ESPN + PL API data fetcher
│   └── fetchNews.js    # BBC RSS news fetcher
├── public/             # Static frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── team.html
│   ├── player.html
│   ├── season.html
│   ├── favorites.html
│   ├── auth.html
│   ├── admin.html
│   ├── css/style.css
│   └── js/             # api.js, session.js, home.js, team.js, ...
├── tests/
│   ├── setup.js        # JWT_SECRET + DB_PATH=:memory: for test isolation
│   ├── unit/           # requireAuth.test.js, usersModel.test.js
│   └── api/            # auth.test.js, teams.test.js, news.test.js
└── docs/
    ├── ARCHITECTURE.md
    ├── GIT_POLICY.md
    └── PREMISE.md
```

---

## Security

| Threat | Mitigation |
|---|---|
| **SQL Injection** | All queries use `?` parameterized placeholders |
| **Broken Access Control (IDOR)** | `DELETE /api/favorites/:id` verifies `favorite.user_id === req.user.id` |
| **Timing Attack** | `bcrypt.compare()` always runs even when user is not found |
| **XSS** | Frontend uses `escapeHtml()` before all DOM insertions |
| **Missing Auth** | `requireAuth` / `requireAdmin` middleware enforced server-side |

---

## Deployment

**Live URL:** https://big6hub.onrender.com

Deployed on Render (free tier). On every push to `main`, Render automatically:
1. Runs `npm install`
2. Starts the app with `npm start` (`node seed.js && node server.js`)

The seed script fetches fresh data from ESPN, PL, and BBC APIs on each deploy.

---

## AI Disclosure

This project was developed with the assistance of **Claude (Anthropic)**, an AI assistant.

### How AI was used

| Area | Description |
|---|---|
| Backend architecture | MVC folder structure, middleware design, route/controller/model separation |
| API implementation | Express route handlers, JWT authentication, bcrypt password hashing |
| Database | SQLite schema design, parameterized queries, UNIQUE constraints |
| Testing | Jest/SuperTest test structure, in-memory DB isolation strategy |
| Data sourcing | ESPN unofficial API research, Premier League Pulse API integration |
| Debugging | Error diagnosis across test failures, DB contamination issues, CSP headers, Render deployment |
| Documentation | OpenAPI/Swagger schema writing, README sections |
| Git workflow | Branch naming, commit message conventions, conflict resolution guidance |

### What was not AI-generated

All code was reviewed, understood, and approved by the team before committing.
Frontend UI/UX design and HTML/CSS were authored by team members.
Final decisions on architecture, data sources, and features were made by the team.
