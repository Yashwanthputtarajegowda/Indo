const FIXED_ATTR = "data-indo-cloudinary-fixed";
const RETRY_ATTR = "data-indo-cloudinary-retried";

function makeBrowserVideoUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return "";
  const marker = "/video/upload/";
  const index = url.indexOf(marker);
  if (index < 0) return "";
  const before = url.slice(0, index + marker.length);
  const after = url.slice(index + marker.length);
  if (after.startsWith("f_mp4,vc_h264,ac_aac/")) return "";
  const queryIndex = after.indexOf("?");
  const pathPart = queryIndex >= 0 ? after.slice(0, queryIndex) : after;
  const query = queryIndex >= 0 ? after.slice(queryIndex) : "";
  return `${before}f_mp4,vc_h264,ac_aac/${pathPart}${query}${query ? "&" : "?"}__indo_fmp4=1`;
}

function rememberOriginal(video, url) {
  if (url && !video.dataset.indoOriginalSrc) video.dataset.indoOriginalSrc = url;
}

function fixVideo(video, restart = false) {
  if (!(video instanceof HTMLVideoElement)) return false;
  const original = video.dataset.indoOriginalSrc || video.currentSrc || video.src || video.dataset.videoSrc || "";
  rememberOriginal(video, original);
  const fixed = makeBrowserVideoUrl(original);
  if (!fixed || video.dataset[FIXED_ATTR] === "1") return false;

  video.dataset[FIXED_ATTR] = "1";
  video.dataset.videoSrcOriginal = original;
  if (video.dataset.videoSrc) video.dataset.videoSrc = fixed;
  video.src = fixed;
  video.preload = video.preload === "none" ? "metadata" : video.preload;
  video.load();

  if (restart) video.play().catch(() => {});
  return true;
}

function retryOriginal(video) {
  if (!(video instanceof HTMLVideoElement) || video.dataset[RETRY_ATTR] === "1") return false;
  const original = String(video.dataset.indoOriginalSrc || video.dataset.videoSrcOriginal || "").trim();
  if (!original) return false;
  video.dataset[RETRY_ATTR] = "1";
  video.dataset[FIXED_ATTR] = "0";
  if (video.dataset.videoSrc) video.dataset.videoSrc = original;
  video.src = original;
  video.load();
  return true;
}

export function installCloudinaryVideoCompatibility() {
  if (window.__indoCloudinaryVideoFixInstalled) return;
  window.__indoCloudinaryVideoFixInstalled = true;

  document.addEventListener(
    "loadstart",
    (event) => {
      const video = event.target instanceof HTMLVideoElement ? event.target : null;
      if (!video) return;
      const source = video.dataset.indoOriginalSrc || video.dataset.videoSrc || video.currentSrc || video.src || "";
      rememberOriginal(video, source);
      fixVideo(video, false);
    },
    true,
  );

  document.addEventListener(
    "error",
    (event) => {
      const video = event.target instanceof HTMLVideoElement ? event.target : null;
      if (!video) return;
      const original = video.dataset.indoOriginalSrc || video.currentSrc || video.src || video.dataset.videoSrc || "";
      if (!original.includes("res.cloudinary.com")) return;
      if (video.dataset[FIXED_ATTR] === "1" && retryOriginal(video)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (makeBrowserVideoUrl(original) && video.dataset[FIXED_ATTR] !== "1") {
        event.preventDefault();
        event.stopImmediatePropagation();
        fixVideo(video, true);
      }
    },
    true,
  );

  document.addEventListener(
    "canplay",
    (event) => {
      const video = event.target instanceof HTMLVideoElement ? event.target : null;
      if (!video) return;
      const source = video.dataset.indoOriginalSrc || video.dataset.videoSrc || video.currentSrc || video.src || "";
      rememberOriginal(video, source);
      if (video.dataset[FIXED_ATTR] !== "1") fixVideo(video, false);
    },
    true,
  );
}
