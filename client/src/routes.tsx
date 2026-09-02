import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePostPage from './pages/CreatePostPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import PostDetailPage from './pages/PostDetailPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Route map.
 *
 * Public:  /login, /register
 * Private: /          (feed), /post/new (composer), /post/:id (detail)
 *
 * The whole API except /auth/* is guarded by the backend's cookie-based JWT
 * middleware, so every private page goes through <ProtectedRoute>, which also
 * redirects to /login when the local session is missing.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/new"
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
