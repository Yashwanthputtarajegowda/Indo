import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadHomeVideos, recordVideoView, renderVideoCard, bindVideoCards } from '../features/feed/home-feed.js';
import { loadNotifications } from '../features/notifications/notifications.js';
import { loadStories, renderStoriesRow, bindStoryButtons } from '../features/stories/stories.js';

function renderNotificationBadge(app) {
  const button = app.querySelector('[data-screen="notifications"]');
  if (!button) return;
  loadNotifications().then((items) => {
    const unread = items.filter((item) => !item.read).length;
    button.querySelector('.notification-badge')?.remove();
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.style.cssText = 'position:absolute;top:-5px;right:-8px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#ff3b81;color:#fff;font-size:9px;font-weight:800;line-height:17px;text-align:center;border:2px solid #07070a;';
    badge.textContent = unread > 99 ? '99+' : String(unread);
    button.style.position = 'relative';
    button.appendChild(badge);
  }).catch(() => {});
}

function renderStories(app) {
  const row = app.querySelector('[data-stories]');
  if (!row) return;
  loadStories().then((stories) => {
    if (!stories.length) {
      row.innerHTML = '<div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>';
      return;
    }
    row.innerHTML = '<div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>' + renderStoriesRow(stories);
    bindStoryButtons(row);
  }).catch(() => {});
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button aria-label="Activity">${icons.heart}</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">${icons.bell}</button></div></header>
    <div class="stories" data-stories><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div></div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>${nav('home')}</div>`;

  renderNotificationBadge(app);
  renderStories(app);

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
