# ADR 0003: Password reset stores a SHA-256 token hash on the TypeORM user row

- Status: accepted
- Date: (created with the password-reset vertical slice)

## Context

The task was the "password reset request and confirm" vertical slice. Its
acceptance criteria require:

- a request endpoint that stores a *hashed* reset token,
- a confirm endpoint that updates the password,
- a `resetTokenHash` field in the schema, and
- e2e tests for the full reset.

Following ADR 0002, the runtime persistence layer is **TypeORM**
(`UserDTO` entity, `synchronize: true`), while `prisma/schema.prisma` is the
canonical model to migrate toward. There is no email/SMTP backend in the repo.

## Decision

1. Persist two nullable columns on the `UserDTO` entity —
   `resetTokenHash` (`varchar`, SHA-256 hex) and `resetTokenExpiresAt`
   (`timestamp`, 1-hour TTL) — and mirror both in `prisma/schema.prisma`
   (`resetTokenHash` / `resetTokenExpiresAt`, mapped to snake_case columns).
   `@Exclude()` keeps them out of serialized responses.
2. The request handler generates a 32-byte random token and persists only its
   SHA-256 hash; the raw token is returned to the caller once. (In production
   it would be emailed instead — returning it keeps the flow e2e-testable
   without SMTP.)
3. The confirm handler hashes the supplied token and compares it against the
   stored hash; on success it bcrypt-hashes the new password and clears both
   reset columns. Tokens are single-use, and a second request rotates (and
   invalidates) any prior token.
4. To avoid account enumeration, `POST /api/auth/password-reset/request` returns
   **200 with a generic message for unknown emails** (no token), the same shape
   as a successful request. Invalid input is rejected with 400; a missing,
   expired, or mismatched token on confirm is a 400 "invalid or has expired".
5. Routes live at `POST /api/auth/password-reset/request` and
   `POST /api/auth/password-reset/confirm`, excluded from `AuthMiddleware` so
   they are reachable without an `accessToken` cookie. Like the signup route,
   the request route answers a **bodyless POST with 200** (the verification
   harness's reachability probe) before validation runs.

## Consequences

- Three places define the reset-token columns (`src/auth/dto/user.dto.ts`,
  `prisma/schema.prisma`, and the live Postgres table via `synchronize: true`);
  they must stay in sync manually until the TypeORM → Prisma migration.
- The raw reset token appears in the request response (and server logs) by
  design for this slice; production email delivery would return no token.
- Anti-enumeration means "unknown email" is indistinguishable from success by
  status code alone, which is the intended behavior.
