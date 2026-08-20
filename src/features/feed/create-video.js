import { auth } from "../auth/firebase-client.js";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

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

async function uploadVideoToGoogleDrive(file, mediaType, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  const idToken = await user.getIdToken(true);
  const meta = options.metadata || {};
  const params = new URLSearchParams({
    mediaType,
    title: options.title || "Untitled video",
    caption: options.caption || "",
    privacy: options.privacy || "public",
    allowComments: String(options.allowComments !== false),
    allowDuet: String(options.allowDuet !== false),
    category: options.category || "",
    fileName: file.name || "indo-video.mp4",
    duration: String(meta.duration || 0),
    width: String(meta.width || 0),
    height: String(meta.height || 0),
  });

  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  const url = `${base}/api/google-drive/videos/upload?${params.toString()}`;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 95);
      options.onProgress?.(Math.max(5, percent), `Uploading ${percent}%...`);
    };

    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText || "{}"); } catch {}

      if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
        options.onProgress?.(100, "Video uploaded successfully.");
        resolve(data);
        return;
      }

      reject(new Error(data.error || `Upload failed (${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Network error while uploading video."));
    xhr.ontimeout = () => reject(new Error("Video upload timed out."));
    xhr.timeout = 15 * 60 * 1000;
    xhr.send(file);
  });
}

export async function uploadMedia(file, mediaType = "video", options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video must be 50 MB or smaller.");

  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  const onProgress = options.onProgress || (() => {});
  const meta = await readVideoMetadata(file);
  onProgress(2, mediaType === "reel" ? "Preparing reel..." : "Preparing video...");

  return uploadVideoToGoogleDrive(file, mediaType, {
    ...options,
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
