import {
  loadNotifications,
  markNotificationRead,
} from "../features/notifications/notifications.js";

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function timeAgo(timestamp) {
  const diff = Math.max(
    0,
    Date.now() - Number(timestamp || Date.now()),
  );
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function renderItem(item) {
  const actor = escapeHtml(item.actorUserId || "@user");
  const message = escapeHtml(
    item.text || "You have new activity.",
  );
  const initial = escapeHtml(
    (item.actorName || actor.replace(/^@/, "I"))
      .charAt(0)
      .toUpperCase() || "I",
  );
  return `<button class="notice ${item.read ? "" : "unread"}" data-notification-id="${escapeHtml(item.id || "")}" type="button"><div class="avatar small">${initial}</div><p><b>${actor}</b> ${message}<small>${timeAgo(item.createdAt)}</small></p></button>`;
}

export function renderActivity(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home" aria-label="Back">‹</button><h2>Activity</h2><span></span></header><main class="notifications"><div class="feed-status" data-activity-status>Loading activity...</div><div data-activity-list></div></main></div>`;

  const list = app.querySelector("[data-activity-list]");
  const status = app.querySelector(
    "[data-activity-status]",
  );

  loadNotifications()
    .then((items) => {
      const activity = items.filter((item) =>
        ["like", "comment"].includes(item.type),
      );
      status.remove();
      if (!activity.length) {
        list.innerHTML =
          '<div class="feed-status">No activity yet.</div>';
        return;
      }
      list.innerHTML = activity.map(renderItem).join("");
      list
        .querySelectorAll("[data-notification-id]")
        .forEach((item) => {
          item.addEventListener("click", async () => {
            if (!item.classList.contains("unread")) return;
            try {
              await markNotificationRead(
                item.dataset.notificationId,
              );
              item.classList.remove("unread");
            } catch {}
          });
        });
    })
    .catch((error) => {
      status.textContent =
        error.message || "Could not load activity.";
    });
}
