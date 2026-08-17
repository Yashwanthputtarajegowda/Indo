function normalizeTelegramUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return value;
  if (value.includes("/api/media/videos/telegram/") && value.startsWith("http://")) {
    return `https://${value.slice("http://".length)}`;
  }
  return value;
}

function fixVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  const source = video.querySelector("source");
  if (!source) return;

  const raw = source.getAttribute("src") || video.getAttribute("data-video-src") || "";
  const normalized = normalizeTelegramUrl(raw);
  if (normalized && normalized !== raw) {
    source.setAttribute("src", normalized);
    video.setAttribute("data-video-src", normalized);
    video.load();
  }

  // Do not force Telegram chunks to video/mp4. The stored MIME type is the
  // authoritative type and forcing MP4 can make otherwise valid media fail.
  if (normalized.includes("/api/media/videos/telegram/")) {
    source.removeAttribute("type");
  }
}

export function installTelegramVideoPlaybackFix() {
  if (window.__indoTelegramVideoPlaybackFix) return;
  window.__indoTelegramVideoPlaybackFix = true;

  document.querySelectorAll("video").forEach(fixVideo);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.("video")) fixVideo(node);
        node.querySelectorAll?.("video").forEach(fixVideo);
      });
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
