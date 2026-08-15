import { auth } from "../auth/firebase-client.js";

export async function updateAccountVisibility(accountType) {
  if (!["public", "private"].includes(accountType)) {
    throw new Error("Account must be public or private.");
  }

  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}/api/account/visibility`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ accountType }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not update account visibility.");
  return data;
}
