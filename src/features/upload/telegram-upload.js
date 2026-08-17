import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

function makeUploadId() {
  const random = globalThis.crypto?.randomUUID?.();
  return String(random || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 120);
}

async function uploadSingleFile(file, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const meta = options.metadata || {};
  const uploadId = makeUploadId();
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  const title = String(options.title || file.name || (options.mediaType === "reel" ? "Untitled reel" : "Untitled video")).trim();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/octet-stream",
    "X-Upload-Id": uploadId,
    "X-File-Name": file.name,
    "X-File-Size": String(file.size),
    "X-Mime-Type": file.type || "video/mp4",
    "X-Media-Type": options.mediaType === "reel" ? "reel" : "video",
    "X-Title": title,
    "X-Caption": String(options.caption || options.description || "").trim(),
    "X-Privacy": String(options.privacy || "public"),
    "X-Allow-Comments": options.allowComments !== false ? "true" : "false",
    "X-Allow-Duet": options.allowDuet !== false ? "true" : "false",
    "X-Category": String(options.category || "").trim(),
    "X-Tags": Array.isArray(options.tags) ? options.tags.slice(0, 20).map((value) => String(value).trim()).filter(Boolean).join(",") : "",
    "X-Location": String(options.location || "").trim(),
    "X-Duration": String(Number(meta.duration || 0)),
    "X-Width": String(Number(meta.width || 0)),
    "X-Height": String(Number(meta.height || 0)),
  };

  options.onProgress?.(10, "Uploading one file…");
  let response;
  try {
    response = await fetch(`${base}/api/telegram/uploads`, {
      method: "POST",
      headers,
      body: file,
    });
  } catch (error) {
    throw new Error(error?.message || "Network request failed.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Upload failed (${response.status}).`);
  options.onProgress?.(100, "Uploaded");
  return data.video;
}

export async function uploadVideoToTelegram(file, options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 20 MB or smaller.");
  return uploadSingleFile(file, options);
}
