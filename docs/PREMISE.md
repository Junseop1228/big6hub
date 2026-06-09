# Big6Hub — Project Premise

> This document defines the technical scope and guardrails for Big6Hub.
> All contributors and AI tools must follow these rules throughout the project.
> Source of truth: ITM519 syllabus, ITM519_Project_Specification_2026, Lectures 0–12.

---

## 1. Purpose

1. Stay within the technical scope taught in ITM519 lectures.
2. Prevent over-engineering.
3. Ensure every team member can explain and modify any part of the code.

---

## 2. Language Rule

All content in this repository must be written in English.
This includes: code comments, commit messages, PR descriptions,
issue titles, variable names, and all .md files.

---

## 3. Allowed Tech Stack

**Backend**
- Node.js + Express (required)
- sqlite + sqlite3 packages
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- swagger-ui-express + yamljs (API docs)
- dotenv, cors, helmet, express-validator (gray area — already agreed)

**Frontend**
- Vanilla HTML / CSS / JS
- Bootstrap or Tailwind CSS (optional)

**Testing & CI**
- Jest + Supertest
- GitHub Actions

**Database**
- SQLite (required)

---

## 4. Disallowed Tech Stack

- TypeScript
- ORM (Prisma, Sequelize, TypeORM) — raw SQL only
- React, Vue, Svelte, Angular
- GraphQL, gRPC, WebSocket
- Docker / Kubernetes
- Any backend framework other than Express
- Any state management library (Redux, Zustand, etc.)

---

## 5. Code Patterns

**SQL**
- Always use parameterized queries (`?` placeholder)
- Never concatenate user input into SQL strings

**Project Structure**
- Routes → Controllers → Models → DB (Lecture 10 MVC pattern)
- Authentication via middleware (requireAuth, requireAdmin)
- All async functions use async/await + try/catch

**Naming**
- Variables and functions: camelCase
- Files: camelCase (e.g., teamsController.js)
- REST endpoints: plural nouns, no verbs
  - ✅ /api/teams, /api/players
  - ❌ /api/getTeams, /api/createPlayer

**Security**
- Passwords always hashed with bcrypt (never plaintext)
- Protected routes enforced server-side via middleware
- User input rendered with textContent, never innerHTML

---

## 6. Project Requirements Checklist

| # | Requirement | How |
|---|---|---|
| 1 | Node.js + Express backend | app.js + routes/ |
| 2 | REST API + JSON responses | routes/, controllers/ |
| 3 | Responsive frontend | public/ with media queries |
| 4 | SQLite database | db.js + models/ |
| 5 | Authentication (JWT + bcrypt) | middleware/requireAuth.js |
| 6 | Protected routes (server-side) | middleware/requireAdmin.js |
| 7 | Unit tests (2+ modules) | tests/unit/ |
| 8 | API tests (auth + error + success) | tests/api/ |
| 9 | GitHub Actions CI | .github/workflows/ci.yml |
| 10 | Swagger / OpenAPI at /api-docs | openapi.yaml |
| 11 | README with all required sections | README.md |
| 12 | Security: XSS, SQLi, CSRF, BAC | models/, middleware/, public/js/ |

---

## 7. Decision Principles

When introducing any new package or pattern, ask in order:

1. Is it taught in ITM519 lectures? → Yes: use it. No: next question.
2. Is it required by the project spec? → Yes: use the simplest form.
3. Can every team member explain it during live evaluation? → No: do not use.
4. Does it align with the course learning objectives? → No: over-engineering, avoid.

If none of the above applies, **default is no**. Update this document
before introducing anything new.

---

*Last updated: 2026-05-28*
