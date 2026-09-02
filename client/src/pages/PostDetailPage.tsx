import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { ApiError, postApi } from '../services/api';
import type { Comment, Post } from '../types';
import { formatDateTime } from '../utils/format';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeBusy, setLikeBusy] = useState(false);

  const [commentContent, setCommentContent] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [commentNotice, setCommentNotice] = useState<string | null>(null);
  const [sessionComments, setSessionComments] = useState<Comment[]>([]);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const loadPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const found = await postApi.getOne(id);
      setPost(found);
      setNotFound(found === null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load the post.');
    } finally {
      setLoading(false);
    }
  }, [id, handleUnauthorized]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const handleLike = useCallback(async () => {
    if (!post) return;
    setLikeBusy(true);
    setError(null);
    try {
      const updated = await postApi.like(post.id);
      setPost(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not like the post.');
    } finally {
      setLikeBusy(false);
    }
  }, [post, handleUnauthorized]);

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post) return;
    setCommentNotice(null);
    const trimmed = commentContent.trim();
    if (trimmed.length === 0) return;

    setAddingComment(true);
    try {
      const comment = await postApi.addComment(post.id, trimmed);
      setSessionComments((current) => [comment, ...current]);
      setCommentContent('');
      setCommentNotice('Comment added.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setCommentNotice(
        err instanceof Error
          ? `Comment could not be added: ${err.message}`
          : 'Comment could not be added.',
      );
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <main className="page container">
      <div className="page__header">
        <div>
          <h1 className="page__title">Post</h1>
        </div>
        <Link to="/" className="btn btn--ghost">
          Back to feed
        </Link>
      </div>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => void loadPost()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="muted" aria-live="polite">
          Loading post…
        </p>
      ) : null}

      {!loading && notFound ? (
        <div className="card empty-state">
          <p className="empty-state__title">Post not found</p>
          <p className="muted">
            It may have been deleted, or the link is incorrect.
          </p>
        </div>
      ) : null}

      {!loading && post ? (
        <>
          <PostCard
            post={post}
            likeBusy={likeBusy}
            onLike={() => void handleLike()}
          />

          <div className="card">
            <h2 className="card__title">Add a comment</h2>
            <form className="form" onSubmit={handleAddComment}>
              <textarea
                className="form__input form__textarea"
                rows={3}
                placeholder="Write a comment…"
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={addingComment || commentContent.trim().length === 0}
              >
                {addingComment ? 'Posting…' : 'Post comment'}
              </button>
            </form>
            {commentNotice ? (
              <p className="form__hint" role="status">
                {commentNotice}
              </p>
            ) : null}
          </div>

          {sessionComments.length > 0 ? (
            <div className="card">
              <h2 className="card__title">Comments added just now</h2>
              <ul className="comment-list">
                {sessionComments.map((comment) => (
                  <li key={comment.id} className="comment">
                    <p className="comment__content">{comment.content}</p>
                    <time className="comment__date">
                      {formatDateTime(comment.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
              <p className="form__hint">
                The API currently supports adding comments but does not expose a
                way to fetch a post&apos;s existing comments, so only comments
                you add during this session are listed here.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
