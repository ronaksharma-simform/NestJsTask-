import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          Social<span>Media</span>
        </Link>
        <nav className="navbar__links" aria-label="Main navigation">
          <Link to="/" className="navbar__link">
            Feed
          </Link>
          <Link to="/post/new" className="btn btn--primary btn--small">
            + New Post
          </Link>
        </nav>
        <div className="navbar__user">
          <span className="navbar__username" title={user.email}>
            @{user.username}
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
