# ADR 0001: React client in `client/` with a Vite dev proxy to the NestJS API

- Status: accepted
- Date: (created with the React frontend task)

## Context

The repository is a NestJS social-media API. `client/`, `frontend/`, and
`server/` existed only as stub `package.json` copies of the root manifest, so
the repo had no real UI. The task was to add a React frontend compatible with
the routes already exposed by the NestJS backend.

Backend facts that shape the client:

- Auth is **cookie-based**: `POST /auth` and `POST /auth/login` set an
  `accessToken` JWT cookie; every other route is guarded by
  `AuthMiddleware` (`src/utils/auth.middleware.ts`) which reads
  `req.cookies.accessToken`.
- CORS is configured as `origin: '*'` **with** `credentials: true`
  (`src/main.ts`). Browsers refuse credentialed cross-origin requests when the
  `Access-Control-Allow-Origin` is `*`, so direct cross-origin calls from a
  dev client on another port would silently fail to store/send the cookie.
- The API is small: `POST /auth`, `POST /auth/login`, and under `/post`:
  `POST /` (create), `POST /upload` (multipart), `GET /posts`, `GET /:id`
  (returns an array), `GET /like/:id`, `POST /comment/:id`.

## Decision

1. Build the React client in the **`client/`** directory (the existing
   directory the project map already labels for a client app) as a Vite +
   React 18 + TypeScript SPA with React Router. No CSS framework — a single
   hand-written stylesheet keeps the dependency surface minimal.
2. Point the Vite dev server at the API with a **proxy** for `/auth` and
   `/post` to `http://localhost:3000` (`client/vite.config.ts`). All requests
   are then same-origin from the browser's point of view, so the backend's
   `accessToken` cookie is stored, echoed, and cleared without any CORS
   involvement. `fetch` calls use `credentials: 'include'` and are
   origin-relative, so the same code also works in production when the client
   and API share an origin.
3. Model the session with the cookie as the server-side source of truth plus a
   **localStorage mirror** of the current user (whitelisted fields only) so the
   UI can render guards/navbar without a "get current user" endpoint (none
   exists). Logout clears the cookie for the origin and the mirror.
4. Image posts use the backend's two-step flow: `POST /post/upload` returns an
   `uploadId` (background Cloudinary job), which is then passed as
   `media_url` to `POST /post`; the server resolves it to the final URL. The UI
   surfaces the backend's "Url doesnt Exist" error as a "processing, retry"
   message.

## Consequences

- Development requires the API on port 3000 and the client on 5173; no CORS
  changes were needed server-side.
- Production deployments that split client and API across origins must either
  serve them same-origin or fix the backend CORS config (echo the concrete
  origin instead of `*`). This is documented in `client/README.md`.
- The root `tsconfig.json`/`tsconfig.build.json` now exclude `client/`,
  `frontend/`, and `server/` so `nest build` does not try to compile the
  React/Vite sources.

### Backend quirks the client accommodates (unchanged API)

- `GET /post/:id` returns an array; the client unwraps the first element.
- Liking is exposed via `GET /post/like/:id` (state-changing GET).
- No endpoint lists a post's comments, so the detail page shows only comments
  added during the current session (the POST returns the created comment).
- `storeUser` persists only whitelisted user fields because register/login
  return the raw entity and `@Exclude()` on the password is only honored when
  a serializer interceptor is enabled (it is not).
