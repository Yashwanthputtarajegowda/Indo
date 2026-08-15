import { auth } from "../auth/firebase-client.js";

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken();
}

export async function searchUserId(query) {
  const normalized = String(query || "").trim();
  if (!normalized) return null;

  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/account/check-user-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: normalized }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not search User ID.");
  return data.exists ? data.user : null;
}

export async function loadPublicProfile(uid) {
  const safeUid = String(uid || "").trim();
  if (!safeUid) throw new Error("User profile is unavailable.");
  const token = await getToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/account/public-profile/${encodeURIComponent(safeUid)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load profile.");
  return data.profile || null;
}
