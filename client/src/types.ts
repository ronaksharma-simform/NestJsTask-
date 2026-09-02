// Types mirroring the NestJS entities/DTOs exposed by the API:
//   src/auth/dto/user.dto.ts      -> User
//   src/posts/dto/post.dto.ts     -> Post / MediaType
//   src/posts/dto/image.dto.ts    -> upload flow
//   src/comments/dto/comment.dto.ts -> Comment

export type MediaType = 'text' | 'image' | 'video';

export interface User {
  id: string;
  username: string;
  email: string;
  is_private: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Post {
  id: string;
  type: MediaType;
  content: string;
  media_url: string | null;
  media_meta_data: Record<string, unknown> | null;
  likes_count: number;
  created_at: string;
  deleted_at: string | null;
  userId: string;
}

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  /** Stored as BIGINT on the server, so it can come back as a string. */
  like: number | string;
  postId: string;
  userId: string;
}

/** Envelope returned by POST /auth and POST /auth/login. */
export interface AuthResponse {
  message: string;
  user: User;
}

/** Body sent to POST /post (userId is stamped server-side from the JWT cookie). */
export interface CreatePostInput {
  type: MediaType;
  content: string;
  /**
   * For image posts the server expects the uploadId returned by POST /post/upload;
   * it resolves that id to the final Cloudinary URL when the post is created.
   */
  media_url?: string | null;
}

export interface CreatePostResponse {
  message: string;
  post: Post;
}

/** Response of POST /post/upload (multipart field name: "file"). */
export interface UploadResponse {
  message: string;
  uploadId: string;
}
