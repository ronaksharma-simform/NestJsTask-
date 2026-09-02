import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { formatDateTime } from '../utils/format';

interface PostCardProps {
  post: Post;
  /** True while a like request for this post is in flight. */
  likeBusy?: boolean;
  /** Optional like handler; when omitted a read-only like count is shown. */
  onLike?: (post: Post) => void;
}

export default function PostCard({ post, likeBusy = false, onLike }: PostCardProps) {
  const typeLabel = post.type.charAt(0).toUpperCase() + post.type.slice(1);

  return (
    <article className="card post">
      <header className="post__head">
        <span className="badge">{typeLabel}</span>
        <time className="post__date" dateTime={post.created_at}>
          {formatDateTime(post.created_at)}
        </time>
      </header>

      {post.media_url ? (
        <div className="post__media">
          <img src={post.media_url} alt="" loading="lazy" />
        </div>
      ) : null}

      <p className="post__content">{post.content}</p>

      <footer className="post__actions">
        {onLike ? (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={likeBusy}
            onClick={() => onLike(post)}
          >
            {likeBusy ? 'Liking…' : `Like (${post.likes_count})`}
          </button>
        ) : (
          <span className="post__likes">Likes: {post.likes_count}</span>
        )}
        <Link className="btn btn--ghost btn--small" to={`/post/${post.id}`}>
          View &amp; comment
        </Link>
      </footer>
    </article>
  );
}
