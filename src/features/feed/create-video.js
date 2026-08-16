import { auth } from "../auth/firebase-client.js";
import { uploadVideoToTelegram } from "../upload/telegram-upload.js";

async function readVideoMetadata(file) {
  const video = document.createElement("video");
  video.preload = "metadata";
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: Number(video.videoWidth || 0),
        height: Number(video.videoHeight || 0),
      });
      video.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
      video.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadMedia(file, mediaType = "video", options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");

  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  const maxBytes = 20 * 1024 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("This video is larger than the current 20 GB upload limit.");

  const onProgress = options.onProgress || (() => {});
  const meta = await readVideoMetadata(file);
  onProgress(2, mediaType === "reel" ? "Preparing reel…" : "Preparing video…");

  return uploadVideoToTelegram(file, {
    mediaType,
    title: options.title,
    caption: options.description ?? options.caption ?? "",
    description: options.description,
    privacy: options.privacy,
    allowComments: options.allowComments,
    allowDuet: options.allowDuet,
    category: options.category,
    tags: options.tags,
    location: options.location,
    metadata: meta,
    onProgress,
  });
}

export async function uploadVideo(file, options = {}) {
  return uploadMedia(file, "video", options);
}

export async function uploadReel(file, options = {}) {
  return uploadMedia(file, "reel", options);
}
