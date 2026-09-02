import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, postApi } from '../services/api';
import type { MediaType } from '../types';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_CONTENT_LENGTH = 200;

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [type, setType] = useState<MediaType>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Revoke the object URL we create for the image preview on unmount.
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const updatePreview = (next: string | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = next;
    setPreviewUrl(next);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setUploadId(null);
    setUploadNotice(null);
    updatePreview(null);
    setFile(selected);
    if (!selected) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setFile(null);
      setError('Only JPG, PNG and GIF images are accepted by the server.');
      return;
    }
    updatePreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setUploadNotice(null);
    setUploading(true);
    try {
      const response = await postApi.uploadImage(file);
      setUploadId(response.uploadId);
      setUploadNotice(
        'The server accepted the image and is processing it in the background ' +
          '(Cloudinary upload queue). You can publish right away; if the server ' +
          'reports the image is not ready yet, wait a second and publish again.',
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'The image could not be uploaded. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (trimmed.length < 5) {
      setError('Content must be at least 5 characters long.');
      return;
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setError(`Content must be at most ${MAX_CONTENT_LENGTH} characters long.`);
      return;
    }
    if (type === 'image' && !file) {
      setError('Choose an image to attach, or switch the type back to Text.');
      return;
    }
    if (type === 'image' && file && !uploadId) {
      setError(
        uploading
          ? 'Please wait for the image upload to finish.'
          : 'Upload the image before publishing the post.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await postApi.create({
        type,
        content: trimmed,
        media_url: type === 'image' ? uploadId : null,
      });
      navigate(`/post/${created.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && /url doesn'?t exist/i.test(err.message)) {
        setError(
          'The image has not finished processing yet. Wait a moment, then ' +
            'press Publish again.',
        );
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not create the post. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page container">
      <div className="page__header">
        <div>
          <h1 className="page__title">Create a post</h1>
          <p className="page__subtitle">
            Share a thought or an image with the community.
          </p>
        </div>
        <Link to="/" className="btn btn--ghost">
          Back to feed
        </Link>
      </div>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span className="form__label">Post type</span>
            <select
              className="form__input"
              value={type}
              onChange={(event) => setType(event.target.value as MediaType)}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
          </label>

          <label className="form__field">
            <span className="form__label">Content</span>
            <textarea
              className="form__input form__textarea"
              rows={4}
              maxLength={MAX_CONTENT_LENGTH}
              placeholder="What is on your mind? (5–200 characters)"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <span className="form__hint">{content.length}/200 characters</span>
          </label>

          {type === 'image' ? (
            <div className="form__field">
              <span className="form__label">Image (JPG, PNG or GIF)</span>
              <input
                className="form__file"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
              />

              {previewUrl ? (
                <div className="form__preview">
                  <img src={previewUrl} alt="Selected upload preview" />
                </div>
              ) : null}

              {file && !uploadId ? (
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  disabled={uploading}
                  onClick={() => void handleUpload()}
                >
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
              ) : null}

              {uploadNotice ? (
                <p className="form__hint" role="status">
                  {uploadNotice}
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting || uploading}
          >
            {submitting ? 'Publishing…' : 'Publish post'}
          </button>
        </form>
      </div>
    </main>
  );
}
