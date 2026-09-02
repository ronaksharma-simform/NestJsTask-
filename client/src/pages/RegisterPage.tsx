import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 5) {
      setError('Username must be at least 5 characters long.');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: trimmedUsername,
        email: email.trim(),
        password,
        is_private: isPrivate,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to create the account. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">
          Join and start sharing posts with the community.
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
              placeholder="At least 5 characters"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="form__field">
            <span className="form__label">Email</span>
            <input
              className="form__input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form__field">
            <span className="form__label">Password</span>
            <input
              className="form__input"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="form__field">
            <span className="form__label">Confirm password</span>
            <input
              className="form__input"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>

          <label className="form__check">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
            />
            <span>Make my profile private</span>
          </label>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
