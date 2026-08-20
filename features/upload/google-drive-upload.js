import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const UPLOAD_ENDPOINT = "/api/google-drive/videos/upload";

function makeUploadId() {
  const random = globalThis.crypto?.randomUUID?.();
  return String(random || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 120);
}

function cleanText(value, max = 500) { return String(value ?? "").trim().slice(0, max); }
function cleanTags(tags) { return Array.isArray(tags) ? tags.slice(0, 20).map((value) => cleanText(value, 60).replace(/^#/, "")).filter(Boolean) : []; }
function safeFileName(fileName, mimeType) {
  const original = String(fileName || "").trim();
  const extension = original.match(/\.[A-Za-z0-9]{1,8}$/)?.[0]?.toLowerCase() || (mimeType === "video/webm" ? ".webm" : mimeType === "video/quicktime" ? ".mov" : ".mp4");
  const base = original.replace(/\.[A-Za-z0-9]{1,8}$/, "").normalize("NFKD").replace(/[^A-Za-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
  return `${base || "video"}${extension}`;
}

export async function uploadVideoToGoogleDrive(file, options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size <= 0) throw new Error("The selected video is empty.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 500 MB or smaller.");
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken(true);
  if (!token) throw new Error("Authentication token is unavailable. Please login again.");
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) throw new Error("Video upload service is unavailable.");
  const meta = options.metadata || {};
  const mediaType = options.mediaType === "reel" ? "reel" : "video";
  const mimeType = file.type || "video/mp4";
  const query = new URLSearchParams({
    mediaType,
    title: cleanText(options.title || file.name || "Untitled video", 120),
    caption: cleanText(options.caption ?? options.description, 500),
    privacy: ["public", "followers", "private"].includes(cleanText(options.privacy || "public", 20)) ? cleanText(options.privacy || "public", 20) : "public",
    fileName: safeFileName(file.name, mimeType),
    allowComments: options.allowComments !== false ? "true" : "false",
    allowDuet: options.allowDuet !== false ? "true" : "false",
    category: cleanText(options.category, 60),
    tags: cleanTags(options.tags).join(","),
    location: cleanText(options.location, 120),
    duration: String(Math.max(0, Number(meta.duration || 0))),
    width: String(Math.max(0, Number(meta.width || 0))),
    height: String(Math.max(0, Number(meta.height || 0))),
  });
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": mimeType, "X-Upload-Id": makeUploadId(), "X-Mime-Type": mimeType, "X-Media-Type": mediaType };
  options.onProgress?.(10, "Uploading to Google Drive…");
  let response;
  try {
    response = await fetch(`${base}${UPLOAD_ENDPOINT}?${query.toString()}`, { method: "POST", headers, body: file, cache: "no-store" });
  } catch (error) {
    throw new Error(error?.message ? `Could not reach the video upload service: ${error.message}` : "Could not reach the video upload service.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Upload failed (${response.status}).`);
  if (!data?.ok || !data?.video) throw new Error(data?.error || "Upload completed without a video record.");
  options.onProgress?.(100, "Uploaded");
  return data.video;
}
