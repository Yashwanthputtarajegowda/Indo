import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const CHUNK_BYTES = 8 * 1024 * 1024;
const INIT_ENDPOINT = "/api/google-drive/videos/upload-resumable/init";
const CHUNK_ENDPOINT = "/api/google-drive/videos/upload-resumable";

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

async function readJson(response) {
  return response.json().catch(() => ({}));
}

async function fetchWithRetry(url, init, attempts = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok || response.status === 409) return response;
      if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) return response;
      const data = await readJson(response);
      throw new Error(data?.error || `Upload request failed (${response.status}).`);
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastError || new Error("Upload request failed.");
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
  const queryMeta = {
    mediaType,
    title: cleanText(options.title || file.name || "Untitled video", 120),
    caption: cleanText(options.caption ?? options.description, 500),
    privacy: ["public", "followers", "private"].includes(cleanText(options.privacy || "public", 20)) ? cleanText(options.privacy || "public", 20) : "public",
    fileName: safeFileName(file.name, mimeType),
    allowComments: options.allowComments !== false,
    allowDuet: options.allowDuet !== false,
    category: cleanText(options.category, 60),
    tags: cleanTags(options.tags),
    location: cleanText(options.location, 120),
    duration: Math.max(0, Number(meta.duration || 0)),
    width: Math.max(0, Number(meta.width || 0)),
    height: Math.max(0, Number(meta.height || 0)),
    totalSize: file.size,
    mimeType,
  };

  options.onProgress?.(3, "Preparing secure Google Drive upload…");
  const initResponse = await fetchWithRetry(`${base}${INIT_ENDPOINT}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(queryMeta),
    cache: "no-store",
  });
  const initData = await readJson(initResponse);
  if (!initResponse.ok || !initData?.ok || !initData?.uploadId) throw new Error(initData?.error || `Could not start upload (${initResponse.status}).`);

  const uploadId = String(initData.uploadId);
  let offset = Math.max(0, Number(initData.nextOffset || 0));
  const chunkSize = Math.min(CHUNK_BYTES, Math.max(CHUNK_BYTES, Number(initData.chunkSize || CHUNK_BYTES)));

  while (offset < file.size) {
    const endExclusive = Math.min(file.size, offset + chunkSize);
    const chunk = file.slice(offset, endExclusive);
    const chunkNumber = Math.floor(offset / chunkSize) + 1;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const progress = Math.min(98, Math.max(4, Math.round((offset / file.size) * 94) + 4));
    options.onProgress?.(progress, `Uploading part ${chunkNumber}/${totalChunks}…`);

    const params = new URLSearchParams({ start: String(offset), total: String(file.size), uploadId: makeUploadId() });
    const response = await fetchWithRetry(`${base}${CHUNK_ENDPOINT}/${encodeURIComponent(uploadId)}?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": mimeType },
      body: chunk,
      cache: "no-store",
    });
    const data = await readJson(response);
    if (response.status === 409 && Number.isFinite(Number(data?.nextOffset))) {
      offset = Number(data.nextOffset);
      continue;
    }
    if (!response.ok || !data?.ok) throw new Error(data?.error || `Upload part failed (${response.status}).`);
    if (data.complete && data.video) {
      options.onProgress?.(100, "Uploaded");
      return data.video;
    }
    const nextOffset = Number(data.nextOffset);
    if (!Number.isFinite(nextOffset) || nextOffset <= offset) throw new Error("Upload service returned an invalid next offset.");
    offset = nextOffset;
  }

  throw new Error("Upload finished without a video record.");
}
