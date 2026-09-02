import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (username.trim().length < 5) {
      setError('Username must be at least 5 characters long.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      const from = (location.state as LocationState | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to log in. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-card__title">Log in</h1>
        <p className="auth-card__subtitle">
          Welcome back to your social feed.
        </p>

        {error ? (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="form__field">
            <span className="form__label">Username</span>
            <input
              className="form__input"
              type="text"
              autoComplete="username"
              placeholder="john_doe"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="form__field">
            <span className="form__label">Password</span>
            <input
              className="form__input"
              type="password"
              autoComplete="current-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-card__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
