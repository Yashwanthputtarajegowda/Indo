import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const CHUNK_SIZE = 32 * 1024 * 1024;
const LEGACY_FALLBACK_MAX_BYTES = 45 * 1024 * 1024;
const FAST_INIT_ENDPOINT = "/api/google-drive/videos/upload-resumable-fast/init";
const FAST_CHUNK_ENDPOINT = "/api/google-drive/videos/upload-resumable-fast";

async function readVideoMetadata(file) {
  const video = document.createElement("video");
  video.preload = "metadata";
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve({ duration: Number.isFinite(video.duration) ? video.duration : 0, width: Number(video.videoWidth || 0), height: Number(video.videoHeight || 0) });
      video.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
      video.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

async function readApiResponse(response) {
  const text = await response.text();
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("text/html") || /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
    throw new Error(`Video backend route is not available (${response.status}). Please deploy the latest Indo-Backend and try again.`);
  }
  let data = {};
  try { data = JSON.parse(text || "{}"); } catch { throw new Error(`Video upload service returned an invalid response (${response.status}).`); }
  if (!response.ok || data.ok === false) throw new Error(String(data.error || `Upload request failed (${response.status}).`).slice(0, 300));
  return data;
}

async function request(url, options = {}) { return readApiResponse(await fetch(url, options)); }

async function syncDriveTitle(base, token, video, title) {
  const videoId = String(video?.id || "").trim();
  const cleanTitle = String(title || "").trim();
  if (!videoId || !cleanTitle) return;
  const response = await fetch(`${base}/api/google-drive/videos/${encodeURIComponent(videoId)}/title`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: cleanTitle }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) throw new Error(String(data?.error || `Could not sync video title (${response.status}).`).slice(0, 300));
}

async function uploadLegacy(file, mediaType, options, token, base) {
  if (file.size > LEGACY_FALLBACK_MAX_BYTES) throw new Error("The video backend is still updating. Please retry; large videos use the fast resumable uploader.");
  const meta = options.metadata || {};
  const params = new URLSearchParams({
    mediaType,
    title: options.title || file.name || "Untitled video",
    caption: options.caption || "",
    privacy: options.privacy || "public",
    allowComments: String(options.allowComments !== false),
    allowDuet: String(options.allowDuet !== false),
    category: options.category || "",
    fileName: file.name || "indo-video.mp4",
    duration: String(Number(meta.duration || 0)),
    width: String(Number(meta.width || 0)),
    height: String(Number(meta.height || 0)),
  });
  options.onProgress?.(5, "Using compatible upload mode…");
  const result = await request(`${base}/api/google-drive/videos/upload?${params.toString()}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "video/mp4" },
    body: file,
    cache: "no-store",
  });
  await syncDriveTitle(base, token, result.video, options.title || "Untitled video");
  options.onProgress?.(100, "Video uploaded successfully.");
  return result.video;
}

async function uploadVideoToGoogleDrive(file, mediaType, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken(true);
  const meta = options.metadata || {};
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) throw new Error("Backend URL is not configured.");
  const title = String(options.title || "Untitled video").trim() || "Untitled video";
  const initBody = {
    mediaType, title, caption: options.caption || "", privacy: options.privacy || "public",
    allowComments: options.allowComments !== false, allowDuet: options.allowDuet !== false,
    category: options.category || "", tags: Array.isArray(options.tags) ? options.tags : [],
    location: options.location || "", fileName: file.name || "indo-video.mp4",
    duration: Number(meta.duration || 0), width: Number(meta.width || 0), height: Number(meta.height || 0),
    totalSize: file.size, mimeType: file.type || "video/mp4",
  };

  let init;
  try {
    init = await request(`${base}${FAST_INIT_ENDPOINT}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(initBody), cache: "no-store",
    });
  } catch (error) {
    if (file.size <= LEGACY_FALLBACK_MAX_BYTES && /not available|404|405|invalid response/i.test(String(error.message))) return uploadLegacy(file, mediaType, options, token, base);
    throw error;
  }

  const uploadId = String(init.uploadId || "");
  if (!uploadId) throw new Error("Backend did not return an upload session.");
  const chunkSize = Math.max(8 * 1024 * 1024, Number(init.chunkSize || CHUNK_SIZE));
  let offset = Math.max(0, Number(init.nextOffset || 0));

  while (offset < file.size) {
    const endExclusive = Math.min(offset + chunkSize, file.size);
    const chunk = file.slice(offset, endExclusive);
    const params = new URLSearchParams({ start: String(offset), total: String(file.size) });
    let result = null;
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        result = await request(`${base}${FAST_CHUNK_ENDPOINT}/${encodeURIComponent(uploadId)}?${params.toString()}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "video/mp4", "Content-Length": String(chunk.size) },
          body: chunk, cache: "no-store",
        });
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
    if (!result) throw lastError || new Error("Video upload failed.");
    if (result.complete && result.video) {
      await syncDriveTitle(base, token, result.video, title);
      options.onProgress?.(100, "Video uploaded successfully.");
      return result.video;
    }
    const nextOffset = Number(result.nextOffset);
    if (!Number.isFinite(nextOffset) || nextOffset <= offset) throw new Error("Upload service returned an invalid next offset.");
    offset = nextOffset;
    const percent = Math.min(99, Math.round((offset / file.size) * 100));
    options.onProgress?.(percent, `Uploading ${percent}%…`);
  }
  throw new Error("Upload ended without a completed Drive file.");
}

export async function uploadMedia(file, mediaType = "video", options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size <= 0) throw new Error("The selected video is empty.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 500 MB or smaller.");
  if (!auth.currentUser) throw new Error("Please login first.");
  const onProgress = options.onProgress || (() => {});
  const meta = await readVideoMetadata(file);
  onProgress(2, mediaType === "reel" ? "Preparing reel…" : "Preparing video…");
  return uploadVideoToGoogleDrive(file, mediaType, { ...options, metadata: meta, onProgress });
}

export async function uploadVideo(file, options = {}) { return uploadMedia(file, "video", options); }
export async function uploadReel(file, options = {}) { return uploadMedia(file, "reel", options); }
