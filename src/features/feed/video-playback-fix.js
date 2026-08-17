const PATCH_KEY = "__indoTelegramVideoPlaybackFixV3";
const FETCH_KEY = "__indoTelegramVideoRecordsPromise";

function normalizeTelegramUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return value;
  if (value.includes("/api/media/videos/telegram/") && value.startsWith("http://")) {
    return `https://${value.slice("http://".length)}`;
  }
  return value;
}

function telegramStreamUrl(uploadId) {
  const id = String(uploadId || "").trim();
  if (!id) return "";
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  return `${base}/api/media/videos/telegram/${encodeURIComponent(id)}/stream`;
}

function getTelegramUploadId(record) {
  return String(
    record?.telegram?.uploadId ||
      record?.telegramUploadId ||
      record?.telegram_upload_id ||
      record?.uploadId ||
      "",
  ).trim();
}

async function loadVideoRecords() {
  if (window[FETCH_KEY]) return window[FETCH_KEY];

  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) return [];

  window[FETCH_KEY] = fetch(`${base}/api/media/videos?limit=100`, {
    headers: {},
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) return [];
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data.videos) ? data.videos : [];
    })
    .catch(() => []);

  return window[FETCH_KEY];
}

async function resolveTelegramSource(video) {
  if (!(video instanceof HTMLVideoElement)) return "";

  const card = video.closest("[data-video-id]");
  const videoId = String(
    video.dataset.videoId || card?.getAttribute("data-video-id") || "",
  ).trim();
  if (!videoId) return "";

  const records = await loadVideoRecords();
  const record = records.find((item) => String(item?.id || "").trim() === videoId);
  const uploadId = getTelegramUploadId(record);
  return telegramStreamUrl(uploadId);
}

function clearVideoSources(video) {
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach((source) => source.remove());
}

function markUnavailable(video) {
  clearVideoSources(video);
  video.removeAttribute("poster");
  video.dataset.indoTelegramUnavailable = "1";
  video.setAttribute("aria-label", "Video unavailable");
}

async function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";

  video.preload = "metadata";
  video.setAttribute("playsinline", "");

  // Never use Cloudinary, secureUrl, videoUrl, or any other stored fallback.
  // The only playable source is the Telegram uploadId stream.
  const telegramUrl = normalizeTelegramUrl(await resolveTelegramSource(video));
  if (!telegramUrl) {
    markUnavailable(video);
    return;
  }

  clearVideoSources(video);
  video.dataset.videoSrc = telegramUrl;
  video.dataset.originalVideoSrc = telegramUrl;

  const source = document.createElement("source");
  source.src = telegramUrl;
  video.appendChild(source);
  video.load();

  let retried = false;
  video.addEventListener("error", () => {
    if (retried) {
      markUnavailable(video);
      return;
    }

    retried = true;
    // Retry the same Telegram stream once only. There is deliberately no
    // Cloudinary/original-URL fallback here.
    video.load();
  });
}

function patchRoot(root = document) {
  if (root instanceof HTMLVideoElement) {
    void patchVideo(root);
    return;
  }

  root.querySelectorAll?.("video.post-video, video[data-video-src]").forEach((video) => {
    void patchVideo(video);
  });
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
