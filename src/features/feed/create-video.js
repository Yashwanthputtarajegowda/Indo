import { auth } from "../auth/firebase-client.js";

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

  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("This video is larger than the current Telegram upload limit of 50 MB.");
  }

  const onProgress = options.onProgress || (() => {});
  const token = await user.getIdToken();
  const meta = await readVideoMetadata(file);
  const form = new FormData();

  form.append("file", file, file.name || `${mediaType}.mp4`);
  form.append("mediaType", mediaType === "reel" ? "reel" : "video");
  form.append("title", String(options.title || "").trim().slice(0, 120));
  form.append("caption", String(options.description ?? options.caption ?? "").trim().slice(0, 500));
  form.append("privacy", String(options.privacy || "public"));
  form.append("allowComments", String(options.allowComments !== false));
  form.append("allowDuet", String(options.allowDuet !== false));
  form.append("category", String(options.category || "").trim().slice(0, 60));
  form.append("tags", JSON.stringify(Array.isArray(options.tags) ? options.tags.slice(0, 20) : []));
  form.append("location", String(options.location || "").trim().slice(0, 120));
  form.append("duration", String(meta.duration));
  form.append("width", String(meta.width));
  form.append("height", String(meta.height));

  onProgress(15, mediaType === "reel" ? "Uploading your reel..." : "Uploading your video...");

  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/media/videos/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Video upload is temporarily unavailable.");
  }

  onProgress(100, "Published successfully.");
  return data.video;
}

export async function uploadVideo(file, options = {}) {
  return uploadMedia(file, "video", options);
}

export async function uploadReel(file, options = {}) {
  return uploadMedia(file, "reel", options);
}
