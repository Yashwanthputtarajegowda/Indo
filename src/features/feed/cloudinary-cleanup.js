const CHECKED_KEY = 'indoCloudinaryChecked';
const CHECKING_KEY = 'indoCloudinaryChecking';

function removeCard(video) {
  const card = video.closest('.post-card[data-video-id], .video-post[data-video-id]');
  if (!card) return;
  video.pause?.();
  card.remove();
}

async function validateVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (video.dataset[CHECKED_KEY] === '1' || video.dataset[CHECKING_KEY] === '1') return;
  const source = String(video.dataset.originalVideoSrc || video.dataset.indoOriginalSrc || video.dataset.videoSrc || video.currentSrc || video.src || '').trim();
  if (!source || !source.includes('res.cloudinary.com/')) return;

  video.dataset[CHECKING_KEY] = '1';
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    const response = await fetch(source, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    // Cloudinary transformations can temporarily return non-200 while being
    // generated. Only a definitive missing response should remove the card.
    if (response.status === 404 || response.status === 410) {
      removeCard(video);
      return;
    }
    if (response.ok || response.status === 206 || response.status === 403 || response.status === 405) {
      video.dataset[CHECKED_KEY] = '1';
    }
  } catch {
    // Network/CORS/timeout is not proof that the asset is deleted.
  } finally {
    delete video.dataset[CHECKING_KEY];
  }
}

function bind(video) {
  if (!(video instanceof HTMLVideoElement) || video.dataset.indoCleanupBound === '1') return;
  video.dataset.indoCleanupBound = '1';
  // Playback code owns recovery/fallback. Do not remove the card on the first
  // transient error because a Cloudinary transformed rendition may still be readying.
  video.addEventListener('error', () => {
    if (video.dataset.indoVideoFinalFailure === '1') removeCard(video);
  }, { once: false });
  validateVideo(video);
}

function scan() {
  document.querySelectorAll('#root video[data-video-src], #root video.post-video').forEach(bind);
}

export function startCloudinaryCleanup() {
  if (window.__indoCloudinaryCleanupStarted) return;
  window.__indoCloudinaryCleanupStarted = true;
  window.setTimeout(scan, 800);
  window.setInterval(() => {
    if (document.querySelector('#root .video-post')) scan();
  }, 5000);
}

startCloudinaryCleanup();
