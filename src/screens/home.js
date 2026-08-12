import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadHomeVideos, recordVideoView, renderVideoCard, bindVideoCards } from '../features/feed/home-feed.js';
import { loadNotifications } from '../features/notifications/notifications.js';

function renderNotificationBadge(app) {
  const button = app.querySelector('[data-screen="notifications"]');
  if (!button) return;
  loadNotifications().then((items) => {
    const unread = items.filter((item) => !item.read).length;
    button.querySelector('.notification-badge')?.remove();
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.textContent = unread > 99 ? '99+' : String(unread);
    button.appendChild(badge);
  }).catch(() => {});
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button aria-label="Activity">${icons.heart}</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">${icons.bell}</button></div></header>
    <div class="stories"><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div></div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>${nav('home')}</div>`;

  renderNotificationBadge(app);

  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');

  loadHomeVideos().then((videos) => {
    if (!videos.length) {
      status.textContent = 'No videos yet. Upload your first video.';
      return;
    }
    status.remove();
    feed.innerHTML = videos.map(renderVideoCard).join('');
    bindVideoCards(feed);
    feed.querySelectorAll('video[data-video-id], .video-post video').forEach((videoElement) => {
      const card = videoElement.closest('[data-video-id]');
      if (!card) return;
      let counted = false;
      videoElement.addEventListener('play', () => {
        if (counted) return;
        counted = true;
        recordVideoView(card.dataset.videoId).catch(() => {});
      }, { once: true });
    });
  }).catch((error) => {
    status.textContent = error.message || 'Could not load videos.';
  });
}
