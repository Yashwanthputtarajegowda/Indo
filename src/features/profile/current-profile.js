import { auth } from "../auth/firebase-client.js";

export async function loadCurrentProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const apiBase = window.INDO_API_BASE || "";
  const token = await user.getIdToken();
  const response = await fetch(`${apiBase}/api/account/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.profile || null;
}
