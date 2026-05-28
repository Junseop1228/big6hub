# Big6Hub — Git Operation Policy

> ITM519 Web Programming · SeoulTech 2026
> This document defines the branch strategy, commit conventions, and PR/Issue/Project rules for the Big6Hub team.

---

## Team

| Name | Role |
|---|---|
| Junseop Kim (lead) | Backend API + DB |
| Hyoungdo Kim | Backend Testing + CI + Docs |
| Seongbin Lee | Frontend UI |
| Geon Kim | Frontend Auth |

---

## 1. Branch Strategy

```
main
  └── dev
        ├── feature/junseop/<task>
        ├── feature/hyoungdo/<task>
        ├── feature/seongbin/<task>
        └── feature/geon/<task>
```

### Branch Roles

| Branch | Role | Rules |
|---|---|---|
| `main` | Production-ready branch. Always kept in a working state. | No direct push. Only merged from `dev` via PR. |
| `dev` | Integration branch. Features are merged here for verification. | CI must pass before merging into `main`. |
| `feature/*` | Individual work branches. | Created per task. PR into `dev` when complete. |

### Branch Naming Convention

```
feature/{name}/{task}    ← new feature
fix/{name}/{issue}       ← bug fix
docs/{name}/{topic}      ← documentation
```

Examples:
```
feature/junseop/teams-api
feature/hyoungdo/auth-unit-test
feature/seongbin/home-page
fix/geon/login-redirect-bug
docs/junseop/openapi-update
```

---

## 2. Commit Message Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>: <short summary>
```

### Types

| Type | When to use |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | README, comments, documentation |
| `test` | Adding or updating tests |
| `refactor` | Code cleanup without logic change |
| `chore` | Packages, CI, config |
| `style` | CSS, formatting |

### Examples

```
feat: add GET /api/teams endpoint
fix: resolve 401 error on token expiry
test: add requireAuth middleware unit test
docs: update README with setup instructions
chore: add jest config to package.json
style: fix mobile nav overflow on small screens
```

---

## 3. Pull Request Policy

### feature → dev

- At least **1 team member** must review and approve before merging
- PR title must follow commit convention format
- Related Issue number must be linked (`Closes #number`)
- CI must pass

### dev → main

- **All team members** must confirm before merging
- Verify the feature works locally before opening a PR
- CI must pass
- Merge commit message format: `release: W1 backend skeleton`

### PR Body Template

```
## Summary


## Related Issue
Closes #

## Checklist
- [ ] Tested locally
- [ ] npm test passes
```

---

## 4. Issues

**Rule: Always open an Issue before starting any work.**

### Labels

| Label | Purpose |
|---|---|
| `feature` | New feature |
| `bug` | Bug report |
| `test` | Testing related |
| `docs` | Documentation |
| `frontend` | Frontend work |
| `backend` | Backend work |
| `blocked` | Waiting on another task |

### Issue Title Format

```
[feat] Implement GET /api/teams endpoint
[fix] Fix login redirect error after token expiry
[test] Write unit tests for authMiddleware
```

---

## 5. GitHub Projects (Kanban)

**Board name:** Big6Hub Sprint Board

### Columns

```
Backlog → Todo → In Progress → In Review → Done
```

| Column | Meaning |
|---|---|
| Backlog | Full list of planned tasks |
| Todo | Planned for this week |
| In Progress | Currently being worked on (branch created) |
| In Review | PR opened, awaiting review |
| Done | Merged and complete |

**Rule:** Add Issue to Backlog on creation. Move to In Progress when work begins. Move to In Review when PR is opened.

---

## 6. Milestones

| Milestone | Deadline | Goal |
|---|---|---|
| W1: Backend Skeleton | May 31 | DB schema + basic CRUD API |
| W2: Auth + Frontend | Jun 5 | JWT auth + base UI screens |
| W3: Integration | Jun 8 | Full integration + tests + CI green |
| Final Delivery | Jun 9 | Submission ready |

---

## 7. Wiki

| Page | Content |
|---|---|
| Home | Project overview |
| Architecture | System structure and request flow |
| API Reference | Endpoint details |
| Setup Guide | Local development setup |
| Meeting Notes | Weekly meeting records |

---

## 8. Rules

- No direct push to `main`
- Never commit `database.db`, `.env`, or `node_modules` (covered by `.gitignore`)
- No self-merge without at least one review
- Never merge `dev` → `main` while tests are failing

---

*Last updated: 2026-05-28*
