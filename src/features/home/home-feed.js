export async function loadHomeVideos(limit = 20) {
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(
    `${apiBase}/api/media/videos?limit=${encodeURIComponent(limit)}&type=video`,
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load videos.");
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function recordVideoView(videoId) {
  if (!videoId) return null;
  const apiBase = window.INDO_API_BASE || "";
  const response = await fetch(
    `${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/view`,
    {
      method: "POST",
    },
  );
  if (!response.ok) return null;
  return response.json().catch(() => null);
}
