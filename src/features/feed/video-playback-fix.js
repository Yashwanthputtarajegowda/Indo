const PATCH_KEY = "__indoVideoPlaybackFixV7";
const DRIVE_ONLY_FETCH_KEY = "__indoGoogleDriveOnlyFeedV4";
const DRIVE_RECORDS_KEY = "__indoGoogleDriveRecordsPromiseV2";

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

function isGoogleDriveStreamUrl(raw) {
  const value = normalizeUrl(raw);
  const base = apiBase();
  return Boolean(value && base && value.startsWith(`${base}/api/google-drive/videos/`) && /\/stream(?:$|\?)/i.test(value));
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

async function loadDriveRecords() {
  if (window[DRIVE_RECORDS_KEY]) return window[DRIVE_RECORDS_KEY];
  const base = apiBase();
  if (!base) return [];
  window[DRIVE_RECORDS_KEY] = fetch(`${base}/api/media/videos?limit=1000`, {
    cache: "no-store",
    credentials: "omit",
  })
    .then(async (response) => {
      if (!response.ok) return [];
      const payload = await response.json().catch(() => ({}));
      return Array.isArray(payload.videos) ? payload.videos.filter(isGoogleDriveVideoRecord) : [];
    })
    .catch(() => []);
  return window[DRIVE_RECORDS_KEY];
}

function driveStreamUrl(video) {
  const base = apiBase();
  const videoId = String(video?.id || "").trim();
  const fileId = String(video?.googleDrive?.fileId || "").trim();
  if (!base || (!videoId && !fileId)) return "";
  return `${base}/api/google-drive/videos/${encodeURIComponent(videoId || fileId)}/stream`;
}

function getDriveSourceFromCard(video) {
  const card = video.closest?.("[data-video-id]");
  return card?.__indoVideoRecord || null;
}

function clearVideoSource(video) {
  video.pause();
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach((source) => source.remove());
  video.load();
}

function installDriveWarmup(video) {
  if (!(video instanceof HTMLVideoElement) || video.dataset.indoWarmupInstalled === "1") return;
  video.dataset.indoWarmupInstalled = "1";
  const warm = () => {
    if (!video.dataset.indoDriveSource) return;
    video.preload = "auto";
  };
  video.addEventListener("pointerenter", warm, { once: true, passive: true });
  video.addEventListener("touchstart", warm, { once: true, passive: true });
}

function rememberDriveSource(video, src) {
  video.dataset.indoDriveSource = src;
  video.dataset.videoSrc = src;
  video.setAttribute("playsinline", "");
}

function resetForDriveSource(video, record) {
  const src = normalizeUrl(driveStreamUrl(record));
  if (!src) return false;
  const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");

  // Watch page already provides the canonical Drive src. Never tear it down and reload it.
  if (isGoogleDriveStreamUrl(current) && current === src) {
    rememberDriveSource(video, src);
    return true;
  }

  if (current !== src || video.dataset.indoDriveSource !== src) {
    clearVideoSource(video);
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    rememberDriveSource(video, src);
    video.preload = "auto";
    video.load();
  }
  return true;
}

async function resolveDriveRecord(video) {
  const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");
  if (isGoogleDriveStreamUrl(current)) {
    // The watch page already has the canonical Drive URL; avoid a metadata round-trip.
    const card = video.closest?.("[data-video-id]");
    const videoId = String(video.dataset.videoId || card?.getAttribute("data-video-id") || "").trim();
    return videoId ? { id: videoId, videoUrl: current, streamUrl: current, secureUrl: current, storage: { provider: "google-drive" }, googleDrive: { provider: "google-drive" } } : null;
  }

  const card = video.closest?.("[data-video-id]");
  const cardRecord = getDriveSourceFromCard(video);
  if (cardRecord && isGoogleDriveVideoRecord(cardRecord)) return cardRecord;

  const videoId = String(video.dataset.videoId || card?.getAttribute("data-video-id") || "").trim();
  if (!videoId) return null;
  const records = await loadDriveRecords();
  const record = records.find((item) => String(item?.id || "") === videoId) || null;
  if (card) card.__indoVideoRecord = record;
  return record;
}

async function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";

  const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");
  if (isGoogleDriveStreamUrl(current)) {
    rememberDriveSource(video, current);
    installDriveWarmup(video);
    return;
  }

  const record = await resolveDriveRecord(video);
  if (!record) {
    clearVideoSource(video);
    return;
  }
  resetForDriveSource(video, record);
  installDriveWarmup(video);
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
    const video = card.querySelector?.("video");
    if (!video) return;
    const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");
    if (isGoogleDriveStreamUrl(current)) {
      rememberDriveSource(video, current);
      installDriveWarmup(video);
      return;
    }
    if (card.__indoVideoRecord && isGoogleDriveVideoRecord(card.__indoVideoRecord)) {
      resetForDriveSource(video, card.__indoVideoRecord);
      installDriveWarmup(video);
      return;
    }
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
