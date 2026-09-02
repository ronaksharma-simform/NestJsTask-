import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The NestJS backend listens on http://localhost:3000 (see server-side src/main.ts).
//
// The API protects every route except /auth/* with a cookie-based JWT middleware
// (src/utils/auth.middleware.ts reads req.cookies.accessToken). Browsers refuse
// to send/store cookies across origins when the backend replies with the CORS
// wildcard, so during development we proxy the two API namespaces through the
// Vite dev server. This makes every request same-origin (http://localhost:5173)
// and the accessToken cookie set by the backend works transparently.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/post': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
