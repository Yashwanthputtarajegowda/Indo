import { auth } from "../auth/firebase-client.js";

export async function loadProfileMedia(targetProfile = null) {
  const apiBase = window.INDO_API_BASE || "";
  const requestedUid = String(
    targetProfile?.uid ||
      targetProfile?.userId ||
      targetProfile?.ownerUid ||
      "",
  ).trim();
  const currentUid = auth.currentUser?.uid || "";
  const targetUid = requestedUid || currentUid;

  if (!targetUid) return { profile: targetProfile || null, videos: [] };

  const response = await fetch(`${apiBase}/api/media/videos?limit=50`);
  if (!response.ok) throw new Error("Could not load profile videos.");
  const data = await response.json().catch(() => ({}));
  const videos = Array.isArray(data.videos)
    ? data.videos.filter((video) => String(video.ownerUid || "") === targetUid)
    : [];

  return { profile: targetProfile || null, videos };
}
