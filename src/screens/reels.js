import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadReels, recordReelView, renderReel } from '../features/feed/reels-feed.js';

export function renderReels(app) {
  app.innerHTML = `<div class="app-shell reels-shell"><header class="reels-top"><button data-screen="home" aria-label="Back">${icons.back}</button><h2>Reels</h2><button data-screen="create" aria-label="Create">＋</button></header><main class="reels-list" data-reels-list><div class="feed-status">Loading reels...</div></main>${nav('reels')}</div>`;

  const list = app.querySelector('[data-reels-list]');
  loadReels().then((reels) => {
    if (!reels.length) {
      list.innerHTML = '<div class="feed-status">No reels yet. Upload your first reel from Create.</div>';
      return;
    }
    list.innerHTML = reels.map(renderReel).join('');
    list.querySelectorAll('.reel-video').forEach((videoElement) => {
      const card = videoElement.closest('[data-video-id]');
      if (!card) return;
      let counted = false;
      const recordOnce = () => {
        if (counted) return;
        counted = true;
        recordReelView(card.dataset.videoId).catch(() => {});
      };
      videoElement.addEventListener('play', recordOnce, { once: true });
      videoElement.addEventListener('loadeddata', () => videoElement.play().catch(() => {}), { once: true });
    });
  }).catch((error) => {
    list.innerHTML = `<div class="feed-status">${error.message || 'Could not load reels.'}</div>`;
  });
}
