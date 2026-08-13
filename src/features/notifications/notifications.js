import { auth } from '../auth/firebase-client.js';

async function getAuthContext() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  return { apiBase, headers: { Authorization: `Bearer ${token}` } };
}

export async function loadNotifications() {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load notifications.');
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function markNotificationRead(id) {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST',
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not update notification.');
  return data;
}

export async function markAllNotificationsRead(items = []) {
  const unreadIds = items
    .filter((item) => item && !item.read && item.id)
    .map((item) => item.id);

  if (!unreadIds.length) return;

  await Promise.allSettled(unreadIds.map((id) => markNotificationRead(id)));
}
