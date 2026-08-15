import { auth } from "../auth/firebase-client.js";

function buildUploadUrl(formValues, mediaType) {
  const apiBase = window.INDO_API_BASE || "";
  const params = new URLSearchParams();
  params.set("mediaType", mediaType === "reel" ? "reel" : "video");
  params.set("title", String(formValues.title || "").trim().slice(0, 120));
  params.set("caption", String(formValues.description ?? formValues.caption ?? "").trim().slice(0, 500));
  params.set("privacy", String(formValues.privacy || "public"));
  params.set("allowComments", String(formValues.allowComments !== false));
  params.set("allowDuet", String(formValues.allowDuet !== false));
  params.set("category", String(formValues.category || "").trim().slice(0, 60));
  params.set("tags", Array.isArray(formValues.tags) ? formValues.tags.join(",") : "");
  params.set("location", String(formValues.location || "").trim().slice(0, 120));
  params.set("duration", String(Number(formValues.duration || 0)));
  params.set("width", String(Number(formValues.width || 0)));
  params.set("height", String(Number(formValues.height || 0)));
  return `${apiBase}/api/media/videos/upload-telegram?${params.toString()}`;
}

export async function uploadMedia(file, mediaType = "video", options = {}) {
  if (!(file instanceof File)) throw new Error("Select a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Please select a valid video file.");

  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  const onProgress = options.onProgress || (() => {});
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("This video is larger than the current Telegram upload limit of 50 MB.");
  }

  onProgress(5, "Preparing your upload...");
  const token = await user.getIdToken();
  onProgress(15, mediaType === "reel" ? "Uploading your reel to Telegram..." : "Uploading your video to Telegram...");

  const url = buildUploadUrl({ ...options, duration: options.duration || 0, width: options.width || 0, height: options.height || 0 }, mediaType);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "video/mp4",
      "X-File-Name": encodeURIComponent(file.name || `${mediaType}.mp4`),
    },
    body: file,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Video upload failed.");
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
