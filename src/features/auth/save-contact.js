import { auth } from "./firebase-client.js";

export async function saveAccountContact({ mobile, email }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/account/contact`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mobile, email }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "Could not save contact details.");
  return data;
}
