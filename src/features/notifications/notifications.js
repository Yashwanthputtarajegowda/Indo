import { auth } from "../auth/firebase-client.js";

async function getAuthContext() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || "";
  return { apiBase, headers: { Authorization: `Bearer ${token}` } };
}

export async function loadNotifications() {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications`, {
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load notifications.");
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function loadUnreadCount() {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications/unread-count`, {
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not load unread notification count.");
  return Number(data.unreadCount || 0);
}

export async function markNotificationRead(id) {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not update notification.");
  return data;
}

export async function markAllNotificationsRead() {
  const { apiBase, headers } = await getAuthContext();
  const response = await fetch(`${apiBase}/api/notifications/read-all`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not mark notifications as read.");
  return data;
}
