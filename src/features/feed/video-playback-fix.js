const PATCH_KEY = "__indoTelegramVideoPlaybackFixV1";

function patchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset.indoPlaybackFixed === "1") return;
  video.dataset.indoPlaybackFixed = "1";

  const sources = Array.from(video.querySelectorAll("source"));
  sources.forEach((source) => {
    // Do not force a MIME type. Telegram storage preserves the original
    // upload and the browser should inspect the actual stream when needed.
    source.removeAttribute("type");
  });

  video.preload = "metadata";
  video.setAttribute("playsinline", "");

  let retriedDirect = false;
  video.addEventListener("error", () => {
    if (retriedDirect) return;

    const source = video.querySelector("source[src]");
    const src = String(video.currentSrc || source?.getAttribute("src") || "").trim();
    if (!src) return;

    retriedDirect = true;
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((item) => item.remove());
    video.src = src;
    video.load();
  });
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
