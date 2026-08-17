import { auth } from "../auth/firebase-client.js";

const LAST_STORY_KEY = "indo:last-story";
const CHUNK_SIZE = 2 * 1024 * 1024;

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  return { token, headers: { Authorization: `Bearer ${token}` } };
}

function uploadId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, "");
  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
}

async function uploadStoryChunks(file, onProgress) {
  const apiBase = window.INDO_API_BASE || "";
  const { headers } = await authHeaders();
  const id = uploadId();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploaded = 0;

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * CHUNK_SIZE;
    const chunk = file.slice(start, Math.min(file.size, start + CHUNK_SIZE));
    let attempt = 0;
    while (true) {
      try {
        const response = await fetch(`${apiBase}/api/stories/telegram/uploads`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/octet-stream",
            "X-Upload-Id": id,
            "X-Chunk-Index": String(index),
            "X-Total-Chunks": String(totalChunks),
            "X-File-Size": String(file.size),
            "X-File-Name": file.name || "indo-story.mp4",
            "X-Mime-Type": file.type || "video/mp4",
          },
          body: chunk,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Telegram story upload failed.");
        uploaded += 1;
        onProgress(10 + Math.round((uploaded / totalChunks) * 70), `Uploading story ${uploaded}/${totalChunks}...`);
        break;
      } catch (error) {
        attempt += 1;
        if (attempt >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
      }
    }
  }
  return id;
}

export async function publishStory(file, onProgress = () => {}, editor = {}) {
  if (!(file instanceof File) || !file.type.startsWith("video/")) {
    throw new Error("Please select a video story.");
  }

  onProgress(5, "Preparing Telegram story upload...");
  const uploadId = await uploadStoryChunks(file, onProgress);
  const apiBase = window.INDO_API_BASE || "";
  const { token } = await authHeaders();

  onProgress(82, "Publishing story...");
  const response = await fetch(`${apiBase}/api/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      uploadId,
      title: String(editor.title || "").trim().slice(0, 80),
      titleFont: String(editor.titleFont || "Arial, sans-serif"),
      titleX: Number(editor.titleX ?? 50),
      titleY: Number(editor.titleY ?? 14),
      crop: String(editor.crop || "portrait"),
      stickerDataUrl: String(editor.stickerDataUrl || "").slice(0, 500000),
      stickerX: Number(editor.stickerX ?? 50),
      stickerY: Number(editor.stickerY ?? 50),
      stickerScale: Number(editor.stickerScale ?? 1),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not publish story.");

  const user = auth.currentUser;
  if (user) {
    const returned = data.story && typeof data.story === "object" ? data.story : {};
    const cachedStory = {
      ...returned,
      id: returned.id || uploadId,
      ownerUid: returned.ownerUid || user.uid,
      username: returned.username || user.displayName || user.email?.split("@")[0] || "User",
      secureUrl: returned.secureUrl || returned.videoUrl || returned.url,
      videoUrl: returned.videoUrl || returned.secureUrl || returned.url,
      storage: "telegram",
      title: String(editor.title || "").trim().slice(0, 80),
      titleFont: String(editor.titleFont || "Arial, sans-serif"),
      titleX: Number(editor.titleX ?? 50),
      titleY: Number(editor.titleY ?? 14),
      crop: String(editor.crop || "portrait"),
      stickerDataUrl: String(editor.stickerDataUrl || "").slice(0, 500000),
      stickerX: Number(editor.stickerX ?? 50),
      stickerY: Number(editor.stickerY ?? 50),
      stickerScale: Number(editor.stickerScale ?? 1),
      createdAt: returned.createdAt || Date.now(),
    };
    localStorage.setItem(LAST_STORY_KEY, JSON.stringify(cachedStory));
  }

  onProgress(100, "Story published.");
  return data.story;
}
