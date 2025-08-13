import { supabase } from "../db/db.js";
import appError from "./appError.js";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export const createPost = async (
  id: string,
  files: Express.Multer.File[],
  metadata: ({
    duration: number;
    start_percent: number;
    end_percent: number;
    pan: {
      x: number;
      y: number;
    };
    zoom: number;
  } | null)[]
) => {
  const media_urls: { media_url: string; mime_type: string }[] = [];

  for (const [index, file] of files.entries()) {
    let uploadBody: Buffer | NodeJS.ReadableStream = file.buffer;
    if (file.mimetype.startsWith("video/") && metadata[index] != null) {
      const inputPath = path.join(
        "/tmp",
        `${Date.now()}-input-${file.originalname}`
      );
      await fs.promises.writeFile(inputPath, file.buffer);
      const outputPath = path.join(
        "/tmp",
        `${Date.now()}-output-${file.originalname}`
      );

      const start_time =
        metadata[index].start_percent * metadata[index].duration;
      const end_time = metadata[index].end_percent * metadata[index].duration;
      const duration = end_time - start_time;
      const zoomFactor = 1 + metadata[index].zoom / 100;
      const normalizedPanX = -metadata[index].pan.x + 0.5;
      const normalizedPanY = -metadata[index].pan.y + 0.5;

      await runffmpeg([
        "-ss",
        start_time.toString(),
        "-i",
        inputPath,
        "-t",
        duration.toString(),
        "-vf",
        `scale=${1080 * zoomFactor}:${1080 * zoomFactor}:force_original_aspect_ratio=increase,crop=1080:1080:(iw - 1080) * ${normalizedPanX}:(ih - 1080) * ${normalizedPanY}`,
        outputPath,
      ]);
      uploadBody = await fs.promises.readFile(outputPath);
    }

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(`posts/${id}/${index}`, uploadBody, {
        contentType: file.mimetype,
      });
    if (error) throw new appError("Failed to upload media", 500);
    media_urls.push({
      media_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/posts/${id}/${index}`,
      mime_type: file.mimetype,
    });
  }

  return media_urls;
};

const runffmpeg = (args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) throw new appError("FFmpeg not found", 500);
    const ffmpeg = spawn(ffmpegPath, args);
    ffmpeg.on("error", (error) => {
      reject(new appError(error.message, 500));
    });
    ffmpeg.on("close", (code) => {
      if (code == 0) resolve();
      else {
        console.log(code);
        reject(new appError("Failed to process video", 500));
      }
    });
  });
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
