const PATCH_KEY = "__indoVideoPlaybackFixV4";
const FETCH_KEY = "__indoTelegramVideoRecordsPromise";

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
