const PATCH_KEY = "__indoVideoPlaybackFixV8";

// Intentionally side-effect free. Home feed owns lazy loading and playback.
// This compatibility module must never patch fetch(), request hundreds of
// media records, create hidden video elements, or force preload=auto.
export function installVideoPlaybackFix() {
  if (window[PATCH_KEY]) return;
  window[PATCH_KEY] = true;

  const mark = (root = document) => {
    root.querySelectorAll?.("video").forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) return;
      video.setAttribute("playsinline", "");
      if (!video.dataset.indoLazyPlayback) {
        video.dataset.indoLazyPlayback = "1";
      }
    });
  };

  mark(document);
}
