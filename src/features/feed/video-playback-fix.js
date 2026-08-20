const PATCH_KEY = "__indoVideoPlaybackFixV5";
const DRIVE_ONLY_FETCH_KEY = "__indoGoogleDriveOnlyFeedV2";

function normalizeUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  return value.startsWith("http://") ? `https://${value.slice(7)}` : value;
}

function apiBase() {
  return String(window.INDO_API_BASE || "").replace(/\/$/, "");
}

function isMediaVideosRequest(input) {
  try {
    const url = typeof input === "string" ? input : input?.url;
    const base = apiBase();
    return Boolean(base && String(url || "").startsWith(`${base}/api/media/videos`));
  } catch {
    return false;
  }
}

function isGoogleDriveVideoRecord(video) {
  const provider = String(video?.storage?.provider || video?.googleDrive?.provider || "").trim().toLowerCase();
  const fileId = String(video?.googleDrive?.fileId || "").trim();
  const url = normalizeUrl(video?.streamUrl || video?.videoUrl || video?.secureUrl);
  return provider === "google-drive" || Boolean(fileId) || /\/api\/google-drive\/videos\/[^/]+\/stream(?:$|\?)/i.test(url);
}

async function applyGoogleDriveOnlyFeedFilter(response) {
  if (!response?.ok || !response.clone) return response;
  try {
    const payload = await response.clone().json();
    if (!payload || !Array.isArray(payload.videos)) return response;
    const filtered = { ...payload, videos: payload.videos.filter(isGoogleDriveVideoRecord) };
    return new Response(JSON.stringify(filtered), {
      status: response.status,
      statusText: response.statusText,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return response;
  }
}

function installGoogleDriveOnlyFeedFilter() {
  if (window[DRIVE_ONLY_FETCH_KEY] || typeof window.fetch !== "function") return;
  window[DRIVE_ONLY_FETCH_KEY] = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const requestInit = { ...init, cache: "no-store" };
    const response = await originalFetch(input, requestInit);
    if (!isMediaVideosRequest(input)) return response;
    return applyGoogleDriveOnlyFeedFilter(response);
  };
}

function driveStreamUrl(video) {
  const base = apiBase();
  const fileId = String(video?.googleDrive?.fileId || "").trim();
  const videoId = String(video?.id || "").trim();
  if (!base || (!fileId && !videoId)) return "";
  // The backend canonical Google Drive stream endpoint is the only playback source.
  return `${base}/api/google-drive/videos/${encodeURIComponent(videoId || fileId)}/stream`;
}

function getDriveSourceFromCard(video) {
  const card = video.closest?.("[data-video-id]");
  return card?.__indoVideoRecord || null;
}

function resetForDriveSource(video, record) {
  const src = normalizeUrl(driveStreamUrl(record));
  if (!src) return false;
  const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");
  // Always replace any cached/blob/external source with the canonical Drive endpoint.
  if (current !== src || video.dataset.indoDriveSource !== src) {
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((source) => source.remove());
    video.load();
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.dataset.indoDriveSource = src;
    video.dataset.videoSrc = src;
    video.load();
  }
  video.preload = "metadata";
  video.setAttribute("playsinline", "");
  return true;
}

async function resolveDriveRecord(video) {
  const cardRecord = getDriveSourceFromCard(video);
  if (cardRecord && isGoogleDriveVideoRecord(cardRecord)) return cardRecord;
  const videoId = String(video.dataset.videoId || video.closest?.("[data-video-id]")?.getAttribute("data-video-id") || "").trim();
  const base = apiBase();
  if (!base || !videoId) return null;
  try {
    const response = await fetch(`${base}/api/media/videos?limit=1000`, { cache: "no-store", credentials: "omit" });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => ({}));
    const record = Array.isArray(payload.videos) ? payload.videos.find((item) => String(item?.id || "") === videoId) : null;
    return record && isGoogleDriveVideoRecord(record) ? record : null;
  } catch {
    return null;
  }
}

async function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";
  const record = await resolveDriveRecord(video);
  if (!record) {
    // Remove anything that could have come from an old storage backend/cache.
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((source) => source.remove());
    video.load();
    return;
  }
  resetForDriveSource(video, record);
}

function patchRoot(root = document) {
  if (root instanceof HTMLVideoElement) {
    void patchVideo(root);
    return;
  }
  root.querySelectorAll?.("video").forEach((video) => void patchVideo(video));
}

function attachDriveRecordLookup() {
  document.querySelectorAll?.("[data-video-id]").forEach((card) => {
    if (card.__indoVideoRecord) return;
    const video = card.querySelector?.("video");
    if (!video) return;
    // A later feed pass will resolve and pin the canonical Drive source.
    void patchVideo(video);
  });
}

export function installVideoPlaybackFix() {
  if (window[PATCH_KEY]) return;
  window[PATCH_KEY] = true;
  installGoogleDriveOnlyFeedFilter();
  patchRoot(document);
  attachDriveRecordLookup();

  const root = document.getElementById("root") || document.body;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) patchRoot(node);
      });
    }
    attachDriveRecordLookup();
  });
  observer.observe(root, { childList: true, subtree: true });
}
