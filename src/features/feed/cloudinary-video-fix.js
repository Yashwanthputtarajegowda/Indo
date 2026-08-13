const FIXED_ATTR = 'data-indo-cloudinary-fixed';

function makeBrowserVideoUrl(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return '';
  if (/[?&]__indo_fmp4=1(?:&|$)/.test(url)) return '';
  const marker = '/video/upload/';
  const index = url.indexOf(marker);
  if (index < 0) return '';
  const before = url.slice(0, index + marker.length);
  const after = url.slice(index + marker.length);
  if (after.startsWith('f_mp4,vc_h264,ac_aac/')) return '';
  const queryIndex = after.indexOf('?');
  const pathPart = queryIndex >= 0 ? after.slice(0, queryIndex) : after;
  const query = queryIndex >= 0 ? after.slice(queryIndex) : '';
  return `${before}f_mp4,vc_h264,ac_aac/${pathPart}${query}${query ? '&' : '?'}__indo_fmp4=1`;
}

function fixVideo(video, restart = false) {
  if (!(video instanceof HTMLVideoElement)) return false;
  const original = video.currentSrc || video.src || video.dataset.videoSrc || '';
  const fixed = makeBrowserVideoUrl(original);
  if (!fixed || video.dataset[FIXED_ATTR] === '1') return false;

  video.dataset[FIXED_ATTR] = '1';
  if (video.dataset.videoSrc) video.dataset.videoSrc = fixed;
  video.src = fixed;
  video.preload = video.preload === 'none' ? 'metadata' : video.preload;
  video.load();

  if (restart) {
    const muted = video.muted;
    video.muted = muted;
    video.play().catch(() => {});
  }
  return true;
}

export function installCloudinaryVideoCompatibility() {
  if (window.__indoCloudinaryVideoFixInstalled) return;
  window.__indoCloudinaryVideoFixInstalled = true;

  document.addEventListener('loadstart', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!video) return;
    fixVideo(video, false);
  }, true);

  document.addEventListener('error', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!video || video.dataset[FIXED_ATTR] === '1') return;
    const original = video.currentSrc || video.src || video.dataset.videoSrc || '';
    if (!original.includes('res.cloudinary.com')) return;
    if (!makeBrowserVideoUrl(original)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    fixVideo(video, true);
  }, true);

  document.addEventListener('canplay', (event) => {
    const video = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!video) return;
    if (video.dataset[FIXED_ATTR] === '1') return;
    fixVideo(video, false);
  }, true);
}
