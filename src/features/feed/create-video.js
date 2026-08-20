import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const CHUNK_SIZE = 8 * 1024 * 1024;

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

async function apiJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text || "{}"); } catch { throw new Error(text || `Request failed (${response.status}).`); }
  if (!response.ok || data.ok === false) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

async function uploadVideoToGoogleDrive(file, mediaType, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const idToken = await user.getIdToken(true);
  const meta = options.metadata || {};
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) throw new Error("Backend URL is not configured.");
  const params = new URLSearchParams({ mediaType, title: options.title || "Untitled video", caption: options.caption || "", privacy: options.privacy || "public", allowComments: String(options.allowComments !== false), allowDuet: String(options.allowDuet !== false), category: options.category || "", fileName: file.name || "indo-video.mp4", duration: String(meta.duration || 0), width: String(meta.width || 0), height: String(meta.height || 0), totalBytes: String(file.size) });
  const headers = { Authorization: `Bearer ${idToken}` };
  const init = await apiJson(`${base}/api/google-drive/videos/upload-resumable/init?${params.toString()}`, { method: "POST", headers });
  const uploadId = init.uploadId;
  if (!uploadId) throw new Error("Backend did not return an upload session.");

  let offset = Number(init.offset || 0);
  while (offset < file.size) {
    const end = Math.min(offset + CHUNK_SIZE, file.size);
    const chunk = file.slice(offset, end);
    let attempt = 0;
    let result;
    while (true) {
      try {
        result = await apiJson(`${base}/api/google-drive/videos/upload-resumable/${encodeURIComponent(uploadId)}`, {
          method: "PUT",
          headers: { ...headers, "Content-Type": file.type || "video/mp4", "Content-Range": `bytes ${offset}-${end - 1}/${file.size}` },
          body: chunk,
        });
        break;
      } catch (error) {
        attempt += 1;
        if (attempt >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    offset = Number(result.offset ?? end);
    const percent = Math.min(99, Math.round((offset / file.size) * 100));
    options.onProgress?.(percent, `Uploading ${percent}%...`);
    if (result.done) {
      options.onProgress?.(100, "Video uploaded successfully.");
      return result;
    }
  }
  throw new Error("Upload ended without a completed Drive file.");
}

export async function uploadMedia(file, mediaType = "video", options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 500 MB or smaller.");
  if (!auth.currentUser) throw new Error("Please login first.");
  const onProgress = options.onProgress || (() => {});
  const meta = await readVideoMetadata(file);
  onProgress(2, mediaType === "reel" ? "Preparing reel..." : "Preparing video...");
  return uploadVideoToGoogleDrive(file, mediaType, { ...options, metadata: meta, onProgress });
}
export async function uploadVideo(file, options = {}) { return uploadMedia(file, "video", options); }
export async function uploadReel(file, options = {}) { return uploadMedia(file, "reel", options); }
