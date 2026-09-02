# Social Media — React Client

React + TypeScript frontend (Vite) for the NestJS backend in this repository. It
implements the user-facing flows exposed by the API: sign up / log in, the post
feed, creating text and image posts, liking posts, and adding comments.

## Stack

- [Vite](https://vitejs.dev/) dev server + build tooling
- [React 18](https://react.dev/) with TypeScript
- [React Router v6](https://reactrouter.com/) for client-side routing
- Plain CSS (single stylesheet, responsive) — no UI framework dependency

## Getting started

Prerequisites: Node.js 18+, and the backend running on `http://localhost:3000`
(see the repository root `README.md`; the API needs PostgreSQL, Redis, and a
Cloudinary configuration for image uploads to fully work).

```bash
# from this directory (client/)
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/auth` and `/post` to
the NestJS API on port 3000 (see `vite.config.ts`), so requests are same-origin
and the backend's `accessToken` cookie is set, sent, and cleared transparently.
No CORS configuration is needed in development.

### Other scripts

| Script              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the Vite dev server (port 5173)     |
| `npm run build`     | Production build into `dist/`             |
| `npm run preview`   | Preview the production build locally      |
| `npm run typecheck` | Type-check the codebase (`tsc --noEmit`)  |

### Configuration

Copy `client/.env.example` to `client/.env` if you need to point at an API
origin other than the dev proxy target.

| Variable               | Default        | Purpose                                              |
| ---------------------- | -------------- | ---------------------------------------------------- |
| `VITE_API_BASE_URL`    | _(empty)_      | API origin when NOT using the Vite proxy (e.g. prod) |

> **CORS note for production:** the backend currently enables CORS with
> `origin: '*'` and `credentials: true`, which browsers reject for credentialed
> cross-origin requests. Until the backend is changed to echo a concrete origin,
> serve this client and the API from the same origin (e.g. behind a reverse
> proxy), or keep using the Vite proxy in a hosting setup.

## Routes

| Route           | Access  | Description                                        |
| --------------- | ------- | -------------------------------------------------- |
| `/login`        | Public  | Log in (username + password)                       |
| `/register`     | Public  | Create an account                                  |
| `/`             | Private | Post feed with like buttons                        |
| `/post/new`     | Private | Create a text or image post                        |
| `/post/:id`     | Private | Single post detail + comment box                   |

Routes under a private path are wrapped in `ProtectedRoute`; unauthenticated
visitors are redirected to `/login` and sent back after a successful login.

## API surface consumed

The typed client lives in `src/services/api.ts` and mirrors the backend routes:

| Frontend helper            | Backend endpoint                    | Notes                                                        |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `authApi.register`         | `POST /auth`                        | Sets `accessToken` cookie (registration auto-logs-in)        |
| `authApi.login`            | `POST /auth/login`                  | Sets `accessToken` cookie                                    |
| `postApi.getAll`           | `GET /post/posts`                   | Feed (controller ordering is server-side)                    |
| `postApi.getOne(id)`       | `GET /post/:id`                     | Controller returns an array; the helper unwraps it           |
| `postApi.create`           | `POST /post`                        | `userId` stamped server-side from the JWT                    |
| `postApi.like(id)`         | `GET /post/like/:id`                | Backend uses GET (not POST) for liking                       |
| `postApi.addComment`       | `POST /post/comment/:id`            | Body: `{ content }`                                          |
| `postApi.uploadImage(file)`| `POST /post/upload` (multipart)     | Field name `file`; returns `uploadId`                        |

### Image-post flow

1. The user selects an image; the client validates the MIME type (JPG/PNG/GIF,
   matching the backend's multer `fileFilter`).
2. `POST /post/upload` stores the file locally and enqueues a Cloudinary upload
   job, returning an `uploadId` immediately.
3. `POST /post` is called with `media_url = uploadId`. The backend resolves the
   id to the finished Cloudinary URL when creating the post. If the background
   job has not finished yet the backend answers `400 Url doesnt Exist` — the
   composer explains this and lets the user retry publishing.

## Session model

The backend keeps the session in an `accessToken` cookie (JWT). This client
treats that cookie as the source of truth for requests (`credentials: 'include'`)
and keeps a small local mirror of the current user in `localStorage`
(`social-media.current-user`) only so the UI can render the navbar and decide
route guards without an extra API call. Logging out clears both. Note there is
no "get current user" endpoint, so a stale cookie (e.g. after server restart
with a changed JWT secret) surfaces as a 401 on the first API call, which the
pages handle by redirecting to `/login`.

## Known backend limitations the UI works around

- `GET /post/:id` returns an **array** even for a single id; the client unwraps
  the first element.
- There is **no endpoint to fetch the comments of a post**, so the detail page
  only lists comments added during the current session (they are returned by
  `POST /post/comment/:id`).
- Liking is exposed as `GET /post/like/:id` (a state-changing GET).
- The register/login responses return the raw user entity; the client persists a
  sanitized copy so a password hash is never written to `localStorage`.

## Project structure

```
client/
├── index.html
├── vite.config.ts          # dev server + /auth,/post proxy to :3000
├── tsconfig.json
├── src/
│   ├── main.tsx            # React entry
│   ├── App.tsx             # Router + providers + navbar shell
│   ├── routes.tsx          # Route table (public vs protected)
│   ├── index.css           # Global styles
│   ├── types.ts            # Domain types mirroring the backend DTOs
│   ├── services/api.ts     # Typed API client (authApi, postApi, ApiError)
│   ├── context/AuthContext.tsx
│   ├── components/         # Navbar, ProtectedRoute, PostCard
│   └── pages/              # Login, Register, Feed, CreatePost, PostDetail
```
