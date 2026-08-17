import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const UPLOAD_ENDPOINT = "/api/media/videos/upload-telegram";

function makeUploadId() {
  const random = globalThis.crypto?.randomUUID?.();
  return String(random || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 120);
}

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function cleanTags(tags) {
  return Array.isArray(tags)
    ? tags.slice(0, 20).map((value) => cleanText(value, 60).replace(/^#/, "")).filter(Boolean)
    : [];
}

async function uploadSingleFile(file, options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size <= 0) throw new Error("The selected video is empty.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 50 MB or smaller.");

  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  const token = await user.getIdToken(true);
  if (!token) throw new Error("Authentication token is unavailable. Please login again.");

  const meta = options.metadata || {};
  const uploadId = makeUploadId();
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) throw new Error("Video upload service is unavailable.");

  const mediaType = options.mediaType === "reel" ? "reel" : "video";
  const title = cleanText(
    options.title || file.name || (mediaType === "reel" ? "Untitled reel" : "Untitled video"),
    120,
  );
  const caption = cleanText(options.caption ?? options.description, 500);
  const privacyValue = cleanText(options.privacy || "public", 20);
  const privacy = ["public", "followers", "private"].includes(privacyValue) ? privacyValue : "public";
  const tags = cleanTags(options.tags);
  const duration = Math.max(0, Number(meta.duration || 0));
  const width = Math.max(0, Number(meta.width || 0));
  const height = Math.max(0, Number(meta.height || 0));

  const query = new URLSearchParams({
    mediaType,
    title,
    caption,
    privacy,
    allowComments: options.allowComments !== false ? "true" : "false",
    allowDuet: options.allowDuet !== false ? "true" : "false",
    category: cleanText(options.category, 60),
    tags: tags.join(","),
    location: cleanText(options.location, 120),
    duration: String(Number.isFinite(duration) ? duration : 0),
    width: String(Number.isFinite(width) ? width : 0),
    height: String(Number.isFinite(height) ? height : 0),
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": file.type || "video/mp4",
    "X-Upload-Id": uploadId,
    "X-File-Name": file.name,
    "X-File-Size": String(file.size),
    "X-Mime-Type": file.type || "video/mp4",
    "X-Media-Type": mediaType,
  };

  options.onProgress?.(10, "Uploading to Telegram…");

  let response;
  try {
    response = await fetch(`${base}${UPLOAD_ENDPOINT}?${query.toString()}`, {
      method: "POST",
      headers,
      body: file,
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      error?.message
        ? `Could not reach the video upload service: ${error.message}`
        : "Could not reach the video upload service.",
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Upload failed (${response.status}).`);
  if (!data?.ok || !data?.video) throw new Error(data?.error || "Upload completed without a video record.");

  options.onProgress?.(100, "Uploaded");
  return data.video;
}

export async function uploadVideoToTelegram(file, options = {}) {
  return uploadSingleFile(file, options);
}
