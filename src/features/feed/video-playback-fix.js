const PATCH_KEY = "__indoTelegramVideoPlaybackFixV2";

function normalizeTelegramUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return value;
  if (value.includes("/api/media/videos/telegram/") && value.startsWith("http://")) {
    return `https://${value.slice("http://".length)}`;
  }
  return value;
}

function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";

  const sources = Array.from(video.querySelectorAll("source"));
  sources.forEach((source) => {
    const normalized = normalizeTelegramUrl(source.getAttribute("src"));
    if (normalized) source.setAttribute("src", normalized);
    // Never force Telegram storage to video/mp4. The backend sends the
    // original MIME type and the browser should inspect the actual stream.
    source.removeAttribute("type");
  });

  const dataSrc = normalizeTelegramUrl(video.dataset.videoSrc);
  if (dataSrc) video.dataset.videoSrc = dataSrc;

  video.preload = "metadata";
  video.setAttribute("playsinline", "");

  let retriedDirect = false;
  video.addEventListener("error", () => {
    if (retriedDirect) return;

    const source = video.querySelector("source[src]");
    const src = normalizeTelegramUrl(String(video.currentSrc || source?.getAttribute("src") || "").trim());
    if (!src) return;

    retriedDirect = true;
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((item) => item.remove());
    video.src = src;
    video.load();
  });

  // Existing records may contain an HTTP stream URL generated before Express
  // trusted the Cloud Run forwarded HTTPS protocol. Reload those as HTTPS.
  const first = video.querySelector("source[src]");
  if (first) {
    const src = first.getAttribute("src") || "";
    const normalized = normalizeTelegramUrl(src);
    if (normalized && normalized !== src) {
      first.setAttribute("src", normalized);
      video.load();
    }
  }
}

function patchRoot(root = document) {
  if (root instanceof HTMLVideoElement) patchVideo(root);
  root.querySelectorAll?.("video.post-video, video[data-video-src]").forEach(patchVideo);
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
