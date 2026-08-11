import { auth } from "./firebase-auth.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

async function getSignature() {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/media/signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not create upload signature.");
  return { ...data, token };
}

export async function uploadVideo(file, { title = "", caption = "", mediaType = "video" } = {}) {
  if (!(file instanceof File)) throw new Error("Choose a video file.");
  if (!file.type.startsWith("video/")) throw new Error("Only video files are supported.");
  if (!["video", "reel"].includes(mediaType)) throw new Error("Invalid media type.");

  const signed = await getSignature();
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signed.apiKey);
  body.append("timestamp", String(signed.timestamp));
  body.append("signature", signed.signature);
  body.append("resource_type", "video");

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/video/upload`,
    { method: "POST", body }
  );
  const uploaded = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok) throw new Error(uploaded.error?.message || "Video upload failed.");

  const saveResponse = await fetch(`${API_BASE_URL}/media/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${signed.token}`
    },
    body: JSON.stringify({
      mediaType,
      title: String(title || "").trim().slice(0, 120),
      caption: String(caption || "").trim().slice(0, 500),
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      duration: uploaded.duration || 0,
      width: uploaded.width || 0,
      height: uploaded.height || 0
    })
  });
  const saved = await saveResponse.json().catch(() => ({}));
  if (!saveResponse.ok) throw new Error(saved.error || "Could not save video.");
  return saved.video;
}

export async function getHomeVideos(limit = 20) {
  const response = await fetch(`${API_BASE_URL}/media/videos?type=video&limit=${encodeURIComponent(limit)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load videos.");
  return data.videos || [];
}

export async function getReels(limit = 20) {
  const response = await fetch(`${API_BASE_URL}/media/videos?type=reel&limit=${encodeURIComponent(limit)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load reels.");
  return data.videos || [];
}
