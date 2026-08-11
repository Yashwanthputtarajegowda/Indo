import { auth } from "./firebase-auth.js";
import { clearProfile } from "./profile-state.js";
import { clearAccountActivity } from "./account-lifecycle.js";

const BACKEND_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function deleteAccount() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Authentication required.");
  }

  const idToken = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}/account/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not delete account.");
  }

  clearProfile();
  clearAccountActivity();

  window.dispatchEvent(new CustomEvent("indo:account-deleted", {
    detail: data
  }));

  return data;
}
