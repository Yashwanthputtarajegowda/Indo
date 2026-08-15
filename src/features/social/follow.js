import { auth } from "../auth/firebase-client.js";

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "Could not update follow status.");
  return data;
}

export async function loadFollowStatus(targetUid) {
  return request(`/api/social/follow-status/${encodeURIComponent(targetUid)}`);
}

export async function toggleFollow(targetUid, follow) {
  return request("/api/social/follow", {
    method: "POST",
    body: JSON.stringify({ targetUid, follow: Boolean(follow) }),
  });
}

export async function loadFollowRequests() {
  return request("/api/social/follow-requests");
}

export async function respondToFollowRequest(requesterUid, accept) {
  return request(
    `/api/social/follow-requests/${encodeURIComponent(requesterUid)}`,
    {
      method: "POST",
      body: JSON.stringify({ accept: Boolean(accept) }),
    },
  );
}
