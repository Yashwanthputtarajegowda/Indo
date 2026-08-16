import { auth } from "../auth/firebase-client.js";

const CHUNK_SIZE = 2 * 1024 * 1024;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiJson(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const response = await fetch(`${window.INDO_API_BASE || ""}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const retryAfter = Number(data?.retryAfter || 0);
    if (response.status === 503 && retryAfter > 0) {
      await sleep(Math.min(15000, retryAfter * 1000));
      throw Object.assign(new Error(data?.error || "Telegram is busy."), { retryable: true });
    }
    throw new Error(data?.error || "Request failed.");
  }
  return data;
}

export async function uploadVideoToTelegram(file, options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const meta = options.metadata || {};
  const created = await apiJson("/api/telegram/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type || "video/mp4",
      size: file.size,
      totalChunks,
      mediaType: options.mediaType === "reel" ? "reel" : "video",
      title: String(options.title || file.name || (options.mediaType === "reel" ? "Untitled reel" : "Untitled video")).trim(),
      caption: String(options.caption || options.description || "").trim(),
      privacy: String(options.privacy || "public"),
      allowComments: options.allowComments !== false,
      allowDuet: options.allowDuet !== false,
      category: String(options.category || "").trim(),
      tags: Array.isArray(options.tags) ? options.tags.slice(0, 20) : [],
      location: String(options.location || "").trim(),
      duration: Number(meta.duration || 0),
      width: Number(meta.width || 0),
      height: Number(meta.height || 0),
    }),
  });

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);
    let completed = false;
    for (let attempt = 0; attempt < 4 && !completed; attempt += 1) {
      try {
        await apiJson(`/api/telegram/uploads/${encodeURIComponent(created.uploadId)}/chunks/${index}`, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: chunk,
        });
        completed = true;
      } catch (error) {
        if (!error?.retryable || attempt === 3) throw error;
        await sleep(Math.min(15000, 1000 * (attempt + 1)));
      }
    }
    const percent = Math.round(((index + 1) / totalChunks) * 95);
    options.onProgress?.(percent, `Uploading to Telegram… ${index + 1}/${totalChunks}`);
  }

  const finalized = await apiJson(`/api/telegram/uploads/${encodeURIComponent(created.uploadId)}/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  options.onProgress?.(100, "Published successfully.");
  return finalized.video;
}
