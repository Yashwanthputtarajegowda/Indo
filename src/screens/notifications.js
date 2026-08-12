import { nav } from '../components/nav.js';
import { loadNotifications, markNotificationRead } from '../features/notifications/notifications.js';
import { respondToFollowRequest } from '../features/social/follow.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char]));
}

function timeAgo(timestamp) {
  const diff = Math.max(0, Date.now() - Number(timestamp || Date.now()));
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function renderNotification(item) {
  const actor = escapeHtml(item.actorUserId || '@user');
  const message = escapeHtml(item.text || 'You have a new notification.');
  const initial = escapeHtml((item.actorName || actor.replace(/^@/, 'I')).charAt(0).toUpperCase() || 'I');
  const requestActions = item.type === 'follow-request'
    ? `<div class="notice-actions"><button data-follow-response="accept" data-requester-uid="${escapeHtml(item.actorUid || '')}">Accept</button><button data-follow-response="reject" data-requester-uid="${escapeHtml(item.actorUid || '')}">Reject</button></div>`
    : '';
  return `<div class="notice-wrap"><button class="notice ${item.read ? '' : 'unread'}" data-notification-id="${escapeHtml(item.id || '')}" type="button"><div class="avatar small">${initial}</div><p><b>${actor}</b> ${message}<small>${timeAgo(item.createdAt)}</small></p></button>${requestActions}</div>`;
}

export function renderNotifications(app, mode = 'all') {
  const isActivity = mode === 'activity';
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home" aria-label="Back">‹</button><h2>${isActivity ? 'Activity' : 'Notifications'}</h2><span></span></header><main class="notifications"><div class="feed-status" data-notification-status>Loading ${isActivity ? 'activity' : 'notifications'}...</div><div data-notifications-list></div></main>${nav('home')}</div>`;

  const list = app.querySelector('[data-notifications-list]');
  const status = app.querySelector('[data-notification-status]');

  loadNotifications().then((items) => {
    const visibleItems = isActivity
      ? items.filter((item) => ['like', 'comment'].includes(item.type))
      : items;

    status.remove();
    if (!visibleItems.length) {
      list.innerHTML = `<div class="feed-status">No ${isActivity ? 'activity' : 'notifications'} yet.</div>`;
      return;
    }
    list.innerHTML = visibleItems.map(renderNotification).join('');
    list.querySelectorAll('[data-notification-id]').forEach((item) => {
      item.addEventListener('click', async () => {
        if (!item.classList.contains('unread')) return;
        try {
          await markNotificationRead(item.dataset.notificationId);
          item.classList.remove('unread');
        } catch {}
      });
    });
    list.querySelectorAll('[data-follow-response]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const requesterUid = button.dataset.requesterUid;
        const accept = button.dataset.followResponse === 'accept';
        button.disabled = true;
        try {
          await respondToFollowRequest(requesterUid, accept);
          button.closest('.notice-wrap')?.remove();
        } catch (error) {
          button.title = error.message || 'Could not respond to request.';
          button.disabled = false;
        }
      });
    });
  }).catch((error) => {
    status.textContent = error.message || `Could not load ${isActivity ? 'activity' : 'notifications'}.`;
  });
}
