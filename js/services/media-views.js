import { auth } from "./firebase-auth.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function recordMediaView(videoId) {
  const id = String(videoId || "").trim();
  if (!id) return null;

  const user = auth.currentUser;
  const headers = { "Content-Type": "application/json" };

  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const response = await fetch(`${API_BASE_URL}/media/videos/${encodeURIComponent(id)}/view`, {
    method: "POST",
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not record video view.");
  return data;
}
