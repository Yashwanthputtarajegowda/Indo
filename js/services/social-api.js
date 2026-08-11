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
  if (!response.ok) throw new Error(data.error || "Social action failed.");
  return data;
}

export function followUser(targetUid) {
  return authRequest("/social/follow", {
    method: "POST",
    body: JSON.stringify({ targetUid, follow: true })
  });
}

export function unfollowUser(targetUid) {
  return authRequest("/social/follow", {
    method: "POST",
    body: JSON.stringify({ targetUid, follow: false })
  });
}

export function getFollowStatus(targetUid) {
  return authRequest(`/social/follow-status/${encodeURIComponent(targetUid)}`);
}
