import { supabase } from "../db/db.js";
import appError from "./appError.js";

export const createPost = async (media: Express.Multer.File[], id: string) => {
  const media_urls = [];

  for (const [index, file] of media.entries()) {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(`posts/${id}/${index}`, file.buffer, {
        contentType: file.mimetype,
      });
    if (error) {
      throw new appError("Failed to upload media", 500);
    }
    media_urls.push(
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/posts/${id}/${index}`
    );
  }
  return media_urls;
};

export const deletePost = async (id: string, media_count: number) => {
  for (let i = 0; i < media_count; i++) {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .remove([`posts/${id}/${i}`]);
    if (error) {
      throw new appError("Failed to delete media", 500);
    }
  }
};

export const createAvatar = async (
  file: Express.Multer.File,
  account_id: string
) => {
  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME!)
    .upload(`avatars/${account_id}`, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (error) {
    throw new appError("Failed to upload avatar", 500);
  }
  return `https://${process.env.SUPABASE_BUCKET_NAME}.supabase.co/storage/v1/object/public/avatars/${account_id}`;
};
