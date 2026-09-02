import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { ApiError, postApi } from '../services/api';
import type { Post } from '../types';

export default function FeedPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postApi.getAll();
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleLike = useCallback(
    async (post: Post) => {
      setLikeBusyId(post.id);
      setError(null);
      try {
        const updated = await postApi.like(post.id);
        setPosts((current) =>
          current
            ? current.map((item) => (item.id === updated.id ? updated : item))
            : current,
        );
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized();
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not like the post.');
      } finally {
        setLikeBusyId(null);
      }
    },
    [handleUnauthorized],
  );

  return (
    <main className="page container">
      <div className="page__header">
        <div>
          <h1 className="page__title">Feed</h1>
          <p className="page__subtitle">Latest posts from the community.</p>
        </div>
        <Link to="/post/new" className="btn btn--primary">
          + New Post
        </Link>
      </div>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => void loadPosts()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="muted" aria-live="polite">
          Loading posts…
        </p>
      ) : null}

      {!loading && posts && posts.length === 0 ? (
        <div className="card empty-state">
          <p className="empty-state__title">No posts yet</p>
          <p className="muted">Be the first to share something.</p>
          <Link to="/post/new" className="btn btn--primary">
            Write a post
          </Link>
        </div>
      ) : null}

      {!loading && posts
        ? posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likeBusy={likeBusyId === post.id}
              onLike={(target) => void handleLike(target)}
            />
          ))
        : null}
    </main>
  );
}
