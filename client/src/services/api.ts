import type {
  AuthResponse,
  Comment,
  CreatePostInput,
  Post,
  UploadResponse,
  User,
} from '../types';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  is_private?: boolean;
}

/**
 * Base URL of the NestJS API. Empty by default: in development the Vite proxy
 * (client/vite.config.ts) forwards /auth and /post to http://localhost:3000,
 * so requests are same-origin and the backend's accessToken cookie works.
 * Override with VITE_API_BASE_URL when the app is served away from the API.
 */
const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/+$/,
  '',
);

const USER_STORAGE_KEY = 'social-media.current-user';

/** Error raised for any non-2xx API response (NestJS error envelope included). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return `Request failed with status ${response.status}`;
  try {
    // NestJS exceptions are JSON: { statusCode, message, error }
    const data = JSON.parse(text) as { message?: unknown; error?: string };
    const message = data.message ?? data.error;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.length > 0) return message;
    return `Request failed with status ${response.status}`;
  } catch {
    return text.length > 300 ? `${text.slice(0, 300)}…` : text;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const authApi = {
  /** POST /auth — creates a user and sets the accessToken cookie. */
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** POST /auth/login — validates credentials and sets the accessToken cookie. */
  login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const postApi = {
  /** GET /post/posts — feed of all posts. */
  getAll(): Promise<Post[]> {
    return request<Post[]>('/post/posts');
  },

  /**
   * GET /post/:id — the controller returns an array (findBy); this helper
   * unwraps it to a single post and returns null when it does not exist.
   */
  async getOne(id: string): Promise<Post | null> {
    const data = await request<Post[] | Post>(`/post/${encodeURIComponent(id)}`);
    return Array.isArray(data) ? (data[0] ?? null) : data;
  },

  /** POST /post — creates a post for the logged-in user. */
  async create(input: CreatePostInput): Promise<Post> {
    const response = await request<CreatePostResponse>('/post', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.post;
  },

  /** GET /post/like/:id — increments and returns the post (GET, per backend). */
  like(id: string): Promise<Post> {
    return request<Post>(`/post/like/${encodeURIComponent(id)}`);
  },

  /** POST /post/comment/:id — adds a comment to a post. */
  addComment(postId: string, content: string): Promise<Comment> {
    return request<Comment>(`/post/comment/${encodeURIComponent(postId)}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * POST /post/upload — uploads an image (multipart field "file") and returns
   * an uploadId. The server enqueues the file for Cloudinary processing; pass
   * the returned uploadId as the post's media_url when creating the post.
   */
  uploadImage(file: File): Promise<UploadResponse> {
    const body = new FormData();
    body.append('file', file);
    return request<UploadResponse>('/post/upload', {
      method: 'POST',
      body,
    });
  },
};

export function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Persists only the whitelisted user fields. The backend controllers return
 * the raw TypeORM entity, and although the password column is decorated with
 * @Exclude() the global ClassSerializerInterceptor is not enabled - so never
 * store the response verbatim.
 */
export function storeUser(user: User | null): void {
  if (user === null) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  const sanitized = {
    id: user.id,
    username: user.username,
    email: user.email,
    is_private: user.is_private,
    created_at: user.created_at,
    deleted_at: user.deleted_at,
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized));
}
