import { auth } from "./firebase-auth.js";

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function touchAccountActivity() {
  const user = auth.currentUser;

  if (!user) {
    return { ok: false, skipped: true };
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/account/activity`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timestamp: Date.now()
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not update account activity.");
  }

  return data;
}

export function startActivityTracking({ intervalMs = 15 * 60 * 1000 } = {}) {
  let timerId = null;

  const touch = () => {
    touchAccountActivity().catch((error) => {
      console.warn("Indo activity update failed:", error.message);
    });
  };

  const start = () => {
    touch();

    if (timerId !== null) {
      clearInterval(timerId);
    }

    timerId = setInterval(touch, intervalMs);
  };

  const stop = () => {
    if (timerId === null) {
      return;
    }

    clearInterval(timerId);
    timerId = null;
  };

  window.addEventListener("focus", touch);
  window.addEventListener("online", touch);

  return {
    start,
    stop,
    touch
  };
}
