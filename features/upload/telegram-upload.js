import { auth } from "../auth/firebase-client.js";

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
  if (!base) throw new Error("Video upload service is unavailable.");

  const mediaType = options.mediaType === "reel" ? "reel" : "video";
  const title = String(options.title || file.name || (mediaType === "reel" ? "Untitled reel" : "Untitled video")).trim();
  const query = new URLSearchParams({
    mediaType,
    title,
    caption: String(options.caption || options.description || "").trim(),
    privacy: String(options.privacy || "public"),
    allowComments: options.allowComments !== false ? "true" : "false",
    allowDuet: options.allowDuet !== false ? "true" : "false",
    category: String(options.category || "").trim(),
    tags: Array.isArray(options.tags) ? options.tags.slice(0, 20).map((value) => String(value).trim()).filter(Boolean).join(",") : "",
    location: String(options.location || "").trim(),
    duration: String(Number(meta.duration || 0)),
    width: String(Number(meta.width || 0)),
    height: String(Number(meta.height || 0)),
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": file.type || "video/mp4",
    "X-Upload-Id": uploadId,
    "X-File-Name": file.name,
    "X-File-Size": String(file.size),
    "X-Mime-Type": file.type || "video/mp4",
    "X-Media-Type": mediaType,
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
    response = await fetch(`${base}/api/media/videos/upload-telegram?${query.toString()}`, {
      method: "POST",
      headers,
      body: file,
    });
  } catch (error) {
    throw new Error(error?.message || "Could not reach the video upload service.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Upload failed (${response.status}).`);
  options.onProgress?.(100, "Uploaded");
  return data.video;
}

export async function uploadVideoToTelegram(file, options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Video must be 50 MB or smaller.");
  return uploadSingleFile(file, options);
}
