import { watchNotifications, markNotificationRead } from "../services/notifications.js";

function formatTime(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - Number(timestamp || 0)) / 60000));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

function renderItem(item) {
  const actor = item.actorUserId || item.actorName || "Someone";
  const message = item.text || (item.type === "follow" ? "started following you" : "interacted with you");
  return `<button type="button" class="notifications-item ${item.read ? "" : "is-unread"}" data-notification-id="${item.id}">
    <span class="notification-dot" aria-hidden="true"></span>
    <span><strong>${actor}</strong> ${message}<small>${formatTime(item.createdAt)}</small></span>
  </button>`;
}

export function renderNotificationsPage(container) {
  container.innerHTML = `<main class="notifications-page"><header class="notifications-header"><button type="button" data-notifications-back aria-label="Back">←</button><h1 class="notifications-title">Notifications</h1></header><section class="notifications-list" data-notifications-list><p>Loading…</p></section></main>`;
  const list = container.querySelector("[data-notifications-list]");
  const unsubscribe = watchNotifications((items) => {
    list.innerHTML = items.length ? items.map(renderItem).join("") : "<p>No notifications yet.</p>";
  });

  container.querySelector("[data-notifications-back]").addEventListener("click", () => {
    unsubscribe();
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "home" } }));
  });

  list.addEventListener("click", async (event) => {
    const item = event.target.closest("[data-notification-id]");
    if (!item) return;
    try { await markNotificationRead(item.dataset.notificationId); } catch (error) { item.title = error.message || "Could not mark notification read."; }
  });
}
