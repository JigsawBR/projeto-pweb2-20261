# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Class project (PWEB2 — 2026.1) implementing a personal finance management app. Two subprojects:

- `financas-api/` — Spring Boot 4 backend (already built)
- `financas-webapp/` — React + TypeScript frontend (under active development)

The frontend is the primary development target. The backend is maintained by the professor but lives in this repo.

## Backend (`financas-api/`)

### Commands

```bash
cd financas-api
./mvnw spring-boot:run        # start the API on :8080
./mvnw compile                # compile only
./mvnw test                   # run tests
./mvnw test -Dtest=ClassName  # run a single test class
```

API docs: `http://localhost:8080/swagger-ui/index.html`  
H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:financasdb`, user `sa`, no password)

The H2 database is **in-memory**: it is wiped and re-seeded from Flyway migrations on every restart. Seed data and schema live in `src/main/resources/db/migration/`. To add tables or data, create a new migration file (`V2__...sql`, `V3__...sql`, etc.) — never edit `V1__init.sql` after the app has been run, as Flyway tracks checksums.

Default seeded user: **username** `admin`, **password** `password123`.

### Architecture

```
br.edu.ifpb.financas.api/
├── auth/           AuthController, AuthService, AuthExceptionHandler, DTOs
├── security/       SecurityConfig, JwtAuthenticationFilter, JwtService, OpenApiConfig
├── user/           AppUser (JPA entity), UserService (UserDetailsService), UserRepository
├── transaction/    TransactionController, TransactionService, TransactionRepository, Entity, DTOs, Specifications
├── category/       CategoryController, CategoryService, CategoryRepository, Entity, DTOs
├── goal/           GoalController, GoalService, GoalRepository, Goal (entity), DTOs  [RF05]
└── spendinglimit/  SpendingLimitController, SpendingLimitService, SpendingLimitRepository, Entity, DTOs  [RF06]
```

**Auth flow:** `POST /auth/login` and `POST /auth/register` return a JWT. All other routes require `Authorization: Bearer <token>`.

**JWT:** Generated and validated by `JwtService` using JJWT 0.12.6 / HS256. Secret and expiration configured in `application.yml` (`jwt.secret` must be ≥ 32 chars; `jwt.expiration-ms` defaults to 86400000 = 24h).

**Security filter chain (Spring Security 7 specifics):**
- `JwtAuthenticationFilter` is a `@Component` but auto-registration is disabled via `FilterRegistrationBean` — it only runs inside the Spring Security chain, not as a plain servlet filter.
- Unauthenticated requests return 401 via `HttpStatusEntryPoint(UNAUTHORIZED)` (Spring Security 7 defaults to 403 otherwise).
- Permitted paths: `/auth/**`, `/h2-console/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/error`.
- `BadCredentialsException` → 401 and `IllegalArgumentException` (duplicate username) → 409 are handled by `AuthExceptionHandler` (`@RestControllerAdvice`).
- `ddl-auto: validate` — Hibernate only validates the schema; Flyway owns DDL.

## Frontend (`financas-webapp/`)

### Commands

```bash
cd financas-webapp
npm install        # install dependencies
npm run dev        # dev server on :5173 with HMR
npm run build      # type-check + Vite production build
npm run lint       # ESLint
npm run preview    # preview production build
```

### Stack

React 19 + TypeScript + Vite. The project ships as a bare Vite template — **React Router and Redux have not been installed yet** and must be added as the requirements are implemented.

Required by the project spec (not yet added):
- React Router — routing and `ProtectedRoute` component
- Redux Toolkit — global state slices for auth, transactions, categories
- Redux Thunks — async API calls (`login`, `register`, `fetchTransactions`, `createTransaction`)

### Requirements summary (see `REQUISITOS.md` for full detail)

| RF | Route | Status |
|----|-------|--------|
| RF01 | `/login`, `/register` | Auth slices + ProtectedRoute |
| RF02 | `/transactions`, `/transactions/new` | Transactions slice |
| RF03 | `/` (dashboard) | Derived selectors from transactions slice |
| RF04 | TBD by group | — |
| RF05 | `/goals`, `/goals/new` | Goals slice + Vitest/RTL tests |
| RF06 | `/spending-limits` | Spending limits slice + Service Worker |
| RF07 | TBD by group | — |

All routes except `/login` and `/register` are private (redirect to `/login` when unauthenticated). Token and user data stored in a Redux slice. API base URL is `http://localhost:8080`.
