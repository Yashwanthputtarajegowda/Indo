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
  const source = String(video.dataset.videoSrc || video.currentSrc || video.src || '').trim();
  if (!source || !source.includes('res.cloudinary.com/')) return;

  video.dataset[CHECKING_KEY] = '1';
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const response = await fetch(source, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!response.ok) {
      removeCard(video);
      return;
    }
    video.dataset[CHECKED_KEY] = '1';
  } catch {
    // A CORS/network failure is not proof that the asset is deleted.
  } finally {
    delete video.dataset[CHECKING_KEY];
  }
}

function bind(video) {
  if (!(video instanceof HTMLVideoElement) || video.dataset.indoCleanupBound === '1') return;
  video.dataset.indoCleanupBound = '1';
  video.addEventListener('error', () => removeCard(video), { once: false });
  video.addEventListener('abort', () => {
    window.setTimeout(() => {
      if (video.readyState === 0 && video.currentSrc) removeCard(video);
    }, 2500);
  }, { once: false });
  validateVideo(video);
}

function scan() {
  document.querySelectorAll('#root video[data-video-src], #root video.post-video').forEach(bind);
}

export function startCloudinaryCleanup() {
  if (window.__indoCloudinaryCleanupStarted) return;
  window.__indoCloudinaryCleanupStarted = true;
  window.setTimeout(scan, 300);
  window.setInterval(() => {
    if (document.querySelector('#root .video-post')) scan();
  }, 3000);
}

startCloudinaryCleanup();
