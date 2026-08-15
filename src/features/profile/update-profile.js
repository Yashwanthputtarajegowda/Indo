import { auth } from "../auth/firebase-client.js";

export async function updateCurrentProfile({ name, bio }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const cleanName = String(name || "").trim();
  const cleanBio = String(bio || "")
    .trim()
    .slice(0, 160);
  if (!cleanName) throw new Error("User Name is required.");

  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(
    `${apiBase}/api/account/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cleanName,
        bio: cleanBio,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || "Could not update profile.",
    );
  return data.profile;
}
