import { nav } from '../components/nav.js';
import { loadNotifications, markNotificationRead } from '../features/notifications/notifications.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function timeAgo(timestamp) {
  const diff = Math.max(0, Date.now() - Number(timestamp || Date.now()));
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function renderNotification(item) {
  const actor = escapeHtml(item.actorUserId || '@user');
  const message = escapeHtml(item.text || 'You have a new notification.');
  const initial = escapeHtml((item.actorName || actor.replace(/^@/, 'I')).charAt(0).toUpperCase() || 'I');
  return `<button class="notice ${item.read ? '' : 'unread'}" data-notification-id="${escapeHtml(item.id || '')}" type="button"><div class="avatar small">${initial}</div><p><b>${actor}</b> ${message}<small>${timeAgo(item.createdAt)}</small></p></button>`;
}

export function renderNotifications(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home" aria-label="Back">‹</button><h2>Notifications</h2><span></span></header><main class="notifications"><div class="feed-status" data-notification-status>Loading notifications...</div><div data-notifications-list></div></main>${nav('home')}</div>`;

  const list = app.querySelector('[data-notifications-list]');
  const status = app.querySelector('[data-notification-status]');

  loadNotifications().then((items) => {
    status.remove();
    if (!items.length) {
      list.innerHTML = '<div class="feed-status">No notifications yet.</div>';
      return;
    }
    list.innerHTML = items.map(renderNotification).join('');
    list.querySelectorAll('[data-notification-id]').forEach((item) => {
      item.addEventListener('click', async () => {
        if (!item.classList.contains('unread')) return;
        try {
          await markNotificationRead(item.dataset.notificationId);
          item.classList.remove('unread');
        } catch {}
      });
    });
  }).catch((error) => {
    status.textContent = error.message || 'Could not load notifications.';
  });
}
