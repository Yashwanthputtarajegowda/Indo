import { auth } from "./firebase-auth.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/account/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load profile.");
  return data.profile;
}

export async function updateMyProfile({ name, bio }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/account/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, bio })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not update profile.");
  return data.profile;
}
