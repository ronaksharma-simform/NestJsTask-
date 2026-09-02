import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Gate for pages that require a logged-in user. While the persisted session is
 * being restored nothing is rendered (prevents a redirect flash), and
 * unauthenticated visitors are sent to /login remembering where they came from.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
