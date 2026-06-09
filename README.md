# Big6Hub

> Premier League Big 6 Information Hub
> ITM519 Web Programming — SeoulTech 2026

![CI](https://github.com/Junseop1228/big6hub/actions/workflows/ci.yml/badge.svg)

Big6Hub is a full-stack web application where football newcomers can browse
club history, season records, and player profiles for Premier League's Big 6
clubs in one place.

---

## Team

| Name | Role | GitHub |
|---|---|---|
| Junseop Kim (lead) | Backend API + DB | @Junseop1228 |
| Hyoungdo Kim | Backend Testing + CI + Docs | — |
| Seongbin Lee | Frontend UI | @yeonlimee2 |
| Geon Kim | Frontend Auth | — |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | SQLite |
| Frontend | Vanilla HTML / CSS / JS |
| Auth | JWT + bcrypt |
| API Docs | Swagger / OpenAPI |
| CI | GitHub Actions |

---

## Quick Start

### Prerequisites

- Node.js v20 or higher
- npm v10 or higher

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Junseop1228/big6hub.git
cd big6hub

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your values

# 4. Initialize the database
npm run seed

# 5. Start the server
npm start
```

Open http://localhost:3000 in your browser.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_PATH` | SQLite database file path | `./database.db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-long-random-string` |
| `ADMIN_EMAIL` | Admin account email | `admin@big6hub.test` |
| `ADMIN_PASSWORD` | Admin account password | `Admin1234!` |
| `FOOTBALL_DATA_API_KEY` | football-data.org API key | `your-api-key` |

---

## Running Tests

```bash
npm test
```

Test suites:

| Suite | Location | Coverage |
|---|---|---|
| Unit tests | `tests/unit/` | Backend modules (models, middleware) |
| API tests | `tests/api/` | Auth routes, error cases, main flow |

---

## API Documentation

Start the server and visit:

```
http://localhost:3000/api-docs
```

Full OpenAPI spec: [`openapi.yaml`](openapi.yaml)

---

## Project Structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full folder
structure and request lifecycle.

---

## Deployment

Currently runs locally. To run on any machine:

```bash
npm install && npm run seed && npm start
```

Then open http://localhost:3000.

---


## Security

The following vulnerability mitigations are implemented (per OWASP guidelines):

| Threat | Mitigation |
|---|---|
| **SQL Injection** | All database queries use `?` parameterized placeholders — user input is never interpolated into SQL strings |
| **Broken Access Control (IDOR)** | `DELETE /api/favorites/:id` verifies `favorite.user_id === req.user.id` before deletion — users cannot delete each other's favorites |
| **Timing Attack** | Login always calls `bcrypt.compare()` even when the user email is not found, preventing user enumeration via response time |
| **XSS** | Frontend uses `escapeHtml()` before injecting any API data into the DOM — no `innerHTML` with raw user input |
| **Missing Auth** | Protected routes enforce `requireAuth` / `requireAdmin` middleware server-side — JWT validation cannot be bypassed by the client |

## AI Disclosure

This project was developed with the assistance of **Claude (Anthropic)**, an AI assistant.

### How AI was used

| Area | Description |
|---|---|
| Backend architecture | MVC folder structure, middleware design, route/controller/model separation |
| API implementation | Express route handlers, JWT authentication, bcrypt password hashing |
| Database | SQLite schema design, parameterized queries, migration patterns |
| Testing | Jest/SuperTest test structure, in-memory DB isolation strategy |
| Data sourcing | ESPN unofficial API research, Premier League Pulse API integration |
| Debugging | Error diagnosis across test failures, DB contamination issues, CSP headers |
| Documentation | OpenAPI/Swagger schema writing, README sections |
| Git workflow | Branch naming, commit message conventions, conflict resolution guidance |

### What was not AI-generated

All code was reviewed, understood, and approved by the team before committing.
Frontend UI/UX design and HTML/CSS were authored by team members.
Final decisions on architecture, data sources, and features were made by the team.

### Team members who used AI assistance

- **Junseop Kim** (backend, team lead) — primary AI user for backend development

---

*Last updated: 2026-05-28*
