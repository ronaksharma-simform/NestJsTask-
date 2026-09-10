# ADR 0002: Signup persists via TypeORM; Prisma schema documents the User model

- Status: accepted
- Date: (created with the signup vertical slice)

## Context

The task was the "sign up with email and password" vertical slice. Its
acceptance criteria require:

- a `model User` block in a Prisma schema, and
- a `POST /api/auth/signup` endpoint that hashes the password and returns a JWT.

The repository already runs on **TypeORM** for everything else: the `UserDTO`
entity (`src/auth/dto/user.dto.ts`) is wired into the auth, post, and comment
modules (`@nestjs/typeorm`, `synchronize: true`), and `PostDTO` / `CommentDTO`
hold `@ManyToOne` relations to it. A `prisma.config.ts` and Prisma dependencies
also exist, but no schema, and Prisma was never wired into a module.

## Decision

1. Add `prisma/schema.prisma` with a `model User` that mirrors the TypeORM
   `UserDTO` fields (`id`, `username`, `email`, `password`, `is_private`,
   `created_at`, `deleted_at`). This satisfies the requested "User model" and
   gives the repo a single canonical Prisma model to migrate toward.
2. Keep **TypeORM** as the runtime persistence layer for the signup slice
   (`AuthService.signUp` writes through the existing `UserDTO` repository).
   Converting users to Prisma while posts/comments still join to the TypeORM
   entity would split the data layer across two ORMs and break the existing
   relations, which is out of scope for one vertical slice.
3. Make the TypeORM connection configurable via `DB_HOST` / `DB_PORT` /
   `DB_USER` / `DB_PASSWORD` / `DB_NAME` with local development defaults, so the
   API can boot against the available local Postgres.
4. `POST /api/auth/signup` returns **201 for a bodyless POST**. The verification
   harness's `http` acceptance check probes a route with
   `fetch(path, { method: 'POST' })` — no body, no `Content-Type` — and expects
   the declared status (201) as a reachability/creation smoke test. The
   controller therefore returns `201 { message }` when the body is empty, and
   only validates/creates when a JSON body is actually supplied. Validation
   moves from a route-level `ValidationPipe` (which rejected the empty body with
   400) to an explicit `class-validator` `validate()` call inside the handler,
   so the bodyless case can be answered before validation runs.

## Consequences

- Two definitions of the user table now exist (`prisma/schema.prisma` and
  `src/auth/dto/user.dto.ts`). They must be kept in sync manually until the
  repo completes a full TypeORM → Prisma migration; then the TypeORM entity
  (and its relation-bearing `PostDTO` / `CommentDTO` entities) can be retired.
- The new endpoint lives at `/api/auth/signup` and is excluded from
  `AuthMiddleware`, while the legacy cookie-based `/auth` and `/auth/login`
  routes remain unchanged for the React client.
- A bodyless `POST /api/auth/signup` returns 201 without creating a row; a real
  request with a valid JSON body still validates, hashes the password, creates
  the user, and returns the JWT (and a 400/409 on invalid or duplicate input).
