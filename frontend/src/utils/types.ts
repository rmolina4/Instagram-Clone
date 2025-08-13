export type LUT_NAME =
  | "None"
  | "Aden"
  | "Brannan"
  | "Earlybird"
  | "Hefe"
  | "Inkwell"
  | "Lomo";

export interface LUT {
  name: LUT_NAME;
  strength: number;
}

export interface LUT_FIELDS {
  sepia?: number;
  brightness?: number;
  saturate?: number;
  contrast?: number;
  grayscale?: number;
}

export const LUT_FILTERS: Record<LUT_NAME, LUT_FIELDS> = {
  None: {},
  Aden: { sepia: 0.2, brightness: 1.15, saturate: 1.4 },
  Brannan: { contrast: 1.4, sepia: 0.5 },
  Earlybird: { contrast: 0.9, sepia: 0.4 },
  Hefe: { contrast: 1.25, saturate: 1.3, sepia: 0.3 },
  Inkwell: { grayscale: 1, contrast: 1.1 },
  Lomo: { contrast: 1.5, saturate: 1.5 },
};

export interface BaseResource {
  id: string;
  body: string | null;
  username: string;
  created_at: string;
  entity_id: string;
  like_count: number;
  liked_by_me: boolean;
  is_owner: boolean;
}

export interface Comment extends BaseResource {
  parent_id: string | null;
  reply_count?: number;
  recent?: boolean;
  root_id?: string;
}

export interface Adjustment {
  Brightness: number;
  Contrast: number;
  Saturation: number;
  Fade: number;
  Temperature: number;
  Vignette: number;
}

export enum Resolution {
  "Original" = "Original",
  "1:1" = "1:1",
  "4:5" = "4:5",
  "16:9" = "16:9",
}

interface BaseMediaDraft {
  id: string;
  poster: string | null;
  updatePoster: boolean;
  mime_type: string;
  lut: LUT_NAME;
  lut_strength: number;
  adjustments: Adjustment;
  zoom: number;
  resolution: Resolution;
  pan: { x: number; y: number };
}

export interface ImageMediaDraft extends BaseMediaDraft {
  media_type: "image";
  resource: HTMLImageElement;
}

export interface VideoMediaDraft extends BaseMediaDraft {
  media_type: "video";
  file: File;
  timeline: string[];
  cover: number | string | null;
  audio: boolean;
  start_percent: number;
  end_percent: number;
  resource: HTMLVideoElement;
}

export type MediaDraft = ImageMediaDraft | VideoMediaDraft;

export interface BaseProcessedMedia extends Media {
  file: File | Blob;
}

export interface ProcessedImageMedia extends BaseProcessedMedia {
  media_type: "image";
}

export interface ProcessedVideoMedia extends BaseProcessedMedia {
  duration: number;
  media_type: "video";
  start_percent: number;
  end_percent: number;
  pan: { x: number; y: number };
  zoom: number;
}

export type ProcessedMedia = ProcessedVideoMedia | ProcessedImageMedia;

export interface Media {
  media_url: string;
  mime_type: string;
}

export interface Post extends BaseResource {
  account_id: string;
  followed_by_me: boolean;
  bookmarked_by_me: boolean;
  comments: Comment[];
  media: Media[];
  comment_count: number;
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
  is_owner: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

export interface APIResponse {
  success: boolean;
  message: string;
  status: number;
}

export interface GetRepliesResponse extends APIResponse {
  replies: Comment[];
}

export interface GetPostResponse extends APIResponse {
  post: Post;
}

export interface GetNextPostsResponse extends APIResponse {
  posts: Post[];
}

export interface CreateResourceResponse extends APIResponse {
  id: string;
  entity_id: string;
}

export interface GetNextCommentsResponse extends APIResponse {
  comments: Comment[];
}

export interface GetProfileResponse extends APIResponse {
  profile: Profile;
}

export interface GetMeResponse extends APIResponse {
  user: User;
}

export interface GetUsernamesResponse extends APIResponse {
  users: {
    id: string;
    username: string;
    name: string;
  }[];
}
