const PATCH_KEY = "__indoVideoPlaybackFixV4";
const FETCH_KEY = "__indoTelegramVideoRecordsPromise";
const DRIVE_ONLY_FETCH_KEY = "__indoGoogleDriveOnlyFeedV1";

function normalizeUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  if (value.startsWith("http://")) return `https://${value.slice(7)}`;
  return value;
}

function telegramStreamUrl(uploadId) {
  const id = String(uploadId || "").trim();
  if (!id) return "";
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  return base ? `${base}/api/media/videos/telegram/${encodeURIComponent(id)}/stream` : "";
}

function getTelegramUploadId(record) {
  return String(
    record?.telegram?.uploadId || record?.telegramUploadId || record?.telegram_upload_id || record?.uploadId || "",
  ).trim();
}

async function loadVideoRecords() {
  if (window[FETCH_KEY]) return window[FETCH_KEY];
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) return [];
  window[FETCH_KEY] = fetch(`${base}/api/media/videos?limit=100`, { cache: "no-store", credentials: "omit" })
    .then(async (response) => {
      if (!response.ok) return [];
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data.videos) ? data.videos : [];
    })
    .catch(() => []);
  return window[FETCH_KEY];
}

function isMediaVideosRequest(input) {
  try {
    const url = typeof input === "string" ? input : input?.url;
    const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
    if (!base) return false;
    return String(url || "").startsWith(`${base}/api/media/videos`);
  } catch {
    return false;
  }
}

function isGoogleDriveVideoRecord(video) {
  const provider = String(video?.storage?.provider || video?.googleDrive?.provider || "").trim().toLowerCase();
  const fileId = String(video?.googleDrive?.fileId || "").trim();
  return provider === "google-drive" || Boolean(fileId);
}

async function applyGoogleDriveOnlyFeedFilter(response) {
  if (!response?.ok || !response.clone) return response;
  try {
    const payload = await response.clone().json();
    if (!payload || !Array.isArray(payload.videos)) return response;
    const filtered = {
      ...payload,
      videos: payload.videos.filter(isGoogleDriveVideoRecord),
    };
    return new Response(JSON.stringify(filtered), {
      status: response.status,
      statusText: response.statusText,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return response;
  }
}

function installGoogleDriveOnlyFeedFilter() {
  if (window[DRIVE_ONLY_FETCH_KEY] || typeof window.fetch !== "function") return;
  window[DRIVE_ONLY_FETCH_KEY] = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (!isMediaVideosRequest(input)) return response;
    return applyGoogleDriveOnlyFeedFilter(response);
  };
}

function isOpenSource(video) {
  const card = video.closest?.("[data-video-id]");
  const source = String(video.dataset.source || card?.getAttribute("data-source") || "").toLowerCase();
  const id = String(video.dataset.videoId || card?.getAttribute("data-video-id") || "").toLowerCase();
  return source === "wikimedia-commons" || source === "internet-archive" || source === "archive" || source === "openverse" || /^(wikimedia-commons|internet-archive|archive|openverse):/.test(id);
}

function isTelegram(video) {
  const card = video.closest?.("[data-video-id]");
  const source = String(video.dataset.source || card?.getAttribute("data-source") || "").toLowerCase();
  const id = String(video.dataset.videoId || card?.getAttribute("data-video-id") || "").toLowerCase();
  return source === "telegram" || id.startsWith("telegram:") || id.startsWith("tg:");
}

async function resolveTelegramSource(video) {
  const card = video.closest("[data-video-id]");
  const videoId = String(video.dataset.videoId || card?.getAttribute("data-video-id") || "").trim();
  if (!videoId) return "";
  const records = await loadVideoRecords();
  const record = records.find((item) => String(item?.id || "").trim() === videoId);
  return telegramStreamUrl(getTelegramUploadId(record));
}

function resetForSource(video, src) {
  const normalized = normalizeUrl(src);
  if (!normalized) return false;
  const current = normalizeUrl(video.currentSrc || video.src || video.querySelector("source")?.src || "");
  if (current === normalized) return true;
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach((source) => source.remove());
  const source = document.createElement("source");
  source.src = normalized;
  video.appendChild(source);
  video.dataset.videoSrc = normalized;
  video.load();
  return true;
}

async function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";
  video.preload = "metadata";
  video.setAttribute("playsinline", "");

  // Open-source videos already contain their real Wikimedia/Internet Archive
  // file URL. Never replace those URLs with a Telegram stream.
  if (isOpenSource(video)) return;

  if (!isTelegram(video)) return;
  const telegramUrl = await resolveTelegramSource(video);
  if (!telegramUrl) return;

  resetForSource(video, telegramUrl);
  let retries = 0;
  video.addEventListener("error", () => {
    if (retries >= 1) return;
    retries += 1;
    video.load();
  }, { once: false });
}

function patchRoot(root = document) {
  if (root instanceof HTMLVideoElement) {
    void patchVideo(root);
    return;
  }
  root.querySelectorAll?.("video").forEach((video) => void patchVideo(video));
}

export function installVideoPlaybackFix() {
  if (window[PATCH_KEY]) return;
  window[PATCH_KEY] = true;
  installGoogleDriveOnlyFeedFilter();
  patchRoot(document);

  const root = document.getElementById("root") || document.body;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) patchRoot(node);
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
}
