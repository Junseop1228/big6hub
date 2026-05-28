# Big6Hub — Git 운영 정책

> ITM519 Web Programming · SeoulTech 2026
> 본 문서는 Big6Hub 팀의 Git 브랜치 전략, 커밋 컨벤션, PR/Issue/Project 운영 규칙을 정의한다.

---

## 팀 구성

| 이름 | 역할 |
|---|---|
| Junseop Kim (lead) | Backend API + DB |
| Hyoungdo Kim | Backend Testing + CI + Docs |
| Seongbin Lee | Frontend UI |
| Geon Kim | Frontend Auth |

---

## 1. 브랜치 전략

```
main
  └── dev
        ├── feature/junseop/<작업내용>
        ├── feature/hyoungdo/<작업내용>
        ├── feature/seongbin/<작업내용>
        └── feature/geon/<작업내용>
```

### 브랜치 역할

| 브랜치 | 역할 | 규칙 |
|---|---|---|
| `main` | 교수 평가 기준 브랜치. 항상 동작하는 상태 유지 | 직접 push 금지. dev → main PR만 허용 |
| `dev` | 통합 브랜치. feature들을 합쳐서 검증 | feature PR 머지 전 CI 통과 필수 |
| `feature/*` | 개인 작업 브랜치 | 작업 단위로 생성. 완료 후 dev로 PR |

### 브랜치 네이밍 규칙

```
feature/{이름}/{작업내용}   ← 새 기능
fix/{이름}/{버그내용}       ← 버그 수정
docs/{이름}/{문서내용}      ← 문서 작업
```

예시:
```
feature/junseop/teams-api
feature/hyoungdo/auth-unit-test
feature/seongbin/home-page
fix/geon/login-redirect-bug
docs/junseop/openapi-update
```

---

## 2. 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 방식을 따른다.

```
<타입>: <한 줄 요약>
```

### 타입 목록

| 타입 | 언제 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | README, 주석 등 문서 |
| `test` | 테스트 추가 및 수정 |
| `refactor` | 로직 변경 없는 코드 정리 |
| `chore` | 패키지, CI, 설정 등 |
| `style` | CSS, 포맷팅 |

### 예시

```
feat: add GET /api/teams endpoint
fix: resolve 401 error on token expiry
test: add requireAuth middleware unit test
docs: update README with setup instructions
chore: add jest config to package.json
style: fix mobile nav overflow on small screens
```

---

## 3. PR 정책

### feature → dev

- 팀원 **1명 이상** 코드 리뷰 후 머지
- PR 제목은 커밋 컨벤션 형식 준수
- 관련 Issue 번호 반드시 링크 (`Closes #번호`)
- CI 통과 필수

### dev → main

- 팀원 **전원 확인** 후 머지
- 기능이 실제로 동작하는지 로컬에서 검증 후 PR
- CI 통과 필수
- 머지 커밋 메시지: `release: W1 backend skeleton` 형식

### PR 본문 템플릿

```
## 작업 내용
- 

## 관련 Issue
Closes #

## 테스트 확인
- [ ] 로컬에서 동작 확인
- [ ] npm test 통과
```

---

## 4. Issues

**원칙: 작업 시작 전 Issue 먼저 열고 시작한다.**

### 라벨

| 라벨 | 용도 |
|---|---|
| `feature` | 새 기능 |
| `bug` | 버그 |
| `test` | 테스트 관련 |
| `docs` | 문서 |
| `frontend` | 프론트엔드 작업 |
| `backend` | 백엔드 작업 |
| `blocked` | 다른 작업 완료 대기 중 |

### Issue 제목 규칙

```
[feat] GET /api/teams 엔드포인트 구현
[fix] 로그인 후 리다이렉트 오류 수정
[test] authMiddleware 단위 테스트 작성
```

---

## 5. GitHub Projects (Kanban)

**보드 이름:** Big6Hub Sprint Board

### 컬럼 구성

```
Backlog → Todo → In Progress → In Review → Done
```

| 컬럼 | 의미 |
|---|---|
| Backlog | 전체 작업 목록 |
| Todo | 이번 주 할 것 |
| In Progress | 현재 작업 중 (브랜치 생성됨) |
| In Review | PR 오픈됨, 리뷰 대기 |
| Done | 머지 완료 |

**규칙:** Issue 생성 시 Backlog에 추가. 작업 시작 시 In Progress로 이동. PR 오픈 시 In Review로 이동.

---

## 6. Milestones

| 마일스톤 | 기간 | 목표 |
|---|---|---|
| W1: Backend Skeleton | ~ 5/31 | DB 스키마 + 기본 CRUD API |
| W2: Auth + Frontend | ~ 6/5 | JWT 인증 + UI 기본 화면 |
| W3: Integration | ~ 6/8 | 통합 + 테스트 + CI green |
| Final Delivery | 6/9 | 제출 완료 |

---

## 7. Wiki

| 페이지 | 내용 |
|---|---|
| Home | 프로젝트 개요 |
| Architecture | 시스템 구조도 (요청 흐름) |
| API Reference | 엔드포인트 상세 설명 |
| Setup Guide | 로컬 실행 방법 |
| Meeting Notes | 주차별 회의록 |

---

## 8. 금지 사항

- `main` 브랜치에 직접 push 금지
- `database.db`, `.env`, `node_modules` 커밋 금지 (`.gitignore` 적용됨)
- 리뷰 없이 본인 PR 셀프 머지 금지
- 테스트 실패 상태로 dev → main 머지 금지

---

*Last updated: 2026-05-28*
