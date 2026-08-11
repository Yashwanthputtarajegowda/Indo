import { auth } from "./firebase-auth.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function fetchMyProfile() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/account/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not load profile.");
  }

  return data.profile || null;
}
