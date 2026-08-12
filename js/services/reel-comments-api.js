import { addReelComment, watchReelComments } from "./reel-actions.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

async function authRequest(path, options = {}) {
  const { auth } = await import("./firebase-auth.js");
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Comments action failed.");
  return data;
}

export async function getComments(reelId) {
  const response = await fetch(`${API_BASE_URL}/reels/${encodeURIComponent(reelId)}/comments`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load comments.");
  return data.comments || [];
}

export async function addComment(reelId, text) {
  return addReelComment(reelId, text);
}

export function watchComments(reelId, onComments) {
  return watchReelComments(reelId, onComments);
}
