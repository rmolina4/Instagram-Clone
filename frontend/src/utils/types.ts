export interface Comment {
  id: string;
  body: string | null;
  username: string;
  created_at: string;
  parent_id: string | null;
  entity_id: string;
  like_count: number;
  liked_by_me: boolean;
}

export interface Post {
  id: string;
  caption: string;
  created_at: string;
  entity_id: string;
  account_id: string;
  username: string;
  like_count: number;
  liked_by_me: boolean;
  bookmarked_by_me: boolean;
  comments: Comment[];
  media_urls: string[];
}

export interface Profile {
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  posts: Post[];
  liked_posts: Post[];
  bookmarked_posts: Post[];
}

export interface Account {
  id: string;
  username: string;
  email: string;
  name: string;
}

export interface APIResponse {
  success: boolean;
  message: string;
}

export interface GetPostResponse extends APIResponse {
  post: Post;
}

export interface GetNextPostsResponse extends APIResponse {
  posts: Post[];
}

export interface CreateCommentResponse extends APIResponse {
  comment: Comment;
}

export interface GetNextCommentsResponse extends APIResponse {
  comments: Comment[];
}

export interface GetProfileResponse extends APIResponse {
  profile: Profile;
}

export interface GetMeResponse extends APIResponse {
  account: Account;
}
