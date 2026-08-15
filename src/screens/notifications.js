import { nav } from "../components/nav.js";
import {
  renderHomeTopbar,
  installHomeTopbarStyles,
} from "./home-topbar-v230.js";
import {
  loadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../features/notifications/notifications.js";
import { respondToFollowRequest } from "../features/social/follow.js";

const STYLE_ID = "indo-notifications-screen-v240";

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

function cleanUserId(value = "") {
  return String(value || "")
    .trim()
    .replace(/^@+/, "");
}

function timeAgo(timestamp) {
  const diff = Math.max(
    0,
    Date.now() - Number(timestamp || Date.now()),
  );
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function notificationKind(item) {
  if (
    item?.type === "follow-request" ||
    item?.type === "follow"
  ) {
    return "follow";
  }
  if (item?.type === "comment") return "comment";
  if (item?.type === "like") return "like";
  if (item?.type === "save") return "save";
  return "default";
}

function renderKindBadge(kind) {
  const icons = {
    follow: "♟",
    comment: "▢",
    like: "♥",
    save: "⌑",
    default: "•",
  };
  return `<span class="indo-notice-kind indo-notice-kind-${kind}" aria-hidden="true">${icons[kind] || icons.default}</span>`;
}

function renderNotification(item) {
  const actorUserId = cleanUserId(
    item.actorUserId || item.actorUsername || "user",
  );
  const actorName = escapeHtml(
    item.actorName ||
      actorUserId ||
      "Indo User",
  );
  const initial = escapeHtml(
    (item.actorName || actorUserId || "I")
      .charAt(0)
      .toUpperCase() || "I",
  );
  const message = escapeHtml(
    item.text || "sent you a notification.",
  );
  const kind = notificationKind(item);
  const unread = item.read !== true;
  const requesterUid = escapeHtml(item.actorUid || "");
  const actorUid = escapeHtml(item.actorUid || "");
  const safeActorId = escapeHtml(actorUserId);
  const followAction =
    kind === "follow"
      ? `<button class="indo-notice-action" type="button" data-follow-response="accept" data-requester-uid="${requesterUid}">Follow back</button>`
      : "";

  return `<article
    class="indo-notice-card ${unread ? "is-unread" : "is-read"}"
    data-notification-id="${escapeHtml(item.id || "")}"
    data-actor-uid="${actorUid}"
    data-actor-user-id="${safeActorId}"
  >
    <span
      class="indo-notice-unread-dot"
      aria-hidden="true"
    ></span>
    <button
      class="indo-notice-avatar"
      type="button"
      data-open-profile="${safeActorId}"
      data-profile-uid="${actorUid}"
      data-profile-username="${safeActorId}"
      data-profile-avatar
      aria-label="Open @${safeActorId} profile"
    >
      <span>${initial}</span>
      ${renderKindBadge(kind)}
    </button>
    <div class="indo-notice-copy">
      <div class="indo-notice-line">
        <button
          class="indo-notice-user-id"
          type="button"
          data-open-profile="${safeActorId}"
          data-profile-uid="${actorUid}"
          data-profile-username="${safeActorId}"
        >
          @${safeActorId}
        </button>
        <span>${message}</span>
      </div>
      <div class="indo-notice-meta">
        <span>${actorName}</span>
        <span>•</span>
        <time>${timeAgo(item.createdAt)}</time>
      </div>
    </div>
    <div class="indo-notice-end">${followAction}</div>
  </article>`;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `.indo-notifications-shell{min-height:100vh;background:#030307;color:#f7f4fb;display:flex;flex-direction:column}.indo-notifications-shell .indo-option5-topbar{position:sticky;top:0;z-index:40}.indo-notifications-main{width:100%;max-width:760px;margin:0 auto;padding:18px 12px 92px;box-sizing:border-box;background:radial-gradient(circle at 50% 0%,rgba(152,59,255,.09),transparent 33%),linear-gradient(180deg,#05050a 0%,#030307 100%)}.indo-notifications-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 4px 14px;border-bottom:1px solid rgba(176,91,255,.22)}.indo-notifications-title{margin:0;font:800 24px/1.05 Arial,sans-serif;letter-spacing:-.4px;color:#fff}.indo-notifications-readall{border:0;background:transparent;color:#ff35b5;font:800 12px/1 Arial,sans-serif;padding:8px 0;cursor:pointer}.indo-notifications-list{display:flex;flex-direction:column;gap:9px;padding-top:11px}.indo-notice-card{position:relative;display:grid;grid-template-columns:10px 48px minmax(0,1fr) auto;align-items:center;gap:10px;min-height:82px;padding:10px 10px 10px 8px;border:1px solid rgba(135,69,222,.42);border-radius:13px;background:linear-gradient(145deg,rgba(18,15,27,.96),rgba(8,8,14,.98));box-sizing:border-box}.indo-notice-card.is-read{border-color:rgba(88,78,108,.34)}.indo-notice-unread-dot{width:7px;height:7px;border-radius:999px;background:#3a3743;justify-self:center}.indo-notice-card.is-unread .indo-notice-unread-dot{background:#ff2fad;box-shadow:0 0 10px rgba(255,47,173,.65)}.indo-notice-avatar{position:relative;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#324257,#1b2431 66%,#121722);color:#fff;font:900 18px/1 Arial,sans-serif;overflow:hidden;border:0;padding:0;cursor:pointer}.indo-notice-avatar .indo-live-avatar-img{position:absolute;inset:0}.indo-notice-kind{position:absolute;right:-4px;bottom:-3px;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;color:#fff;font:800 10px/1 Arial,sans-serif;border:2px solid #08080d}.indo-notice-copy{min-width:0;display:flex;flex-direction:column;gap:5px}.indo-notice-line{display:flex;align-items:baseline;gap:6px;min-width:0;color:#f4f1f6;font-size:13px;line-height:1.22}.indo-notice-line span{color:#d6d0dc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.indo-notice-user-id{border:0;background:transparent;color:#fff;padding:0;font:900 13px/1.22 Arial,sans-serif;white-space:nowrap;cursor:pointer}.indo-notice-user-id:hover{color:#ff48b9;text-decoration:underline}.indo-notice-meta{display:flex;align-items:center;gap:5px;color:#8d8795;font:600 10px/1.2 Arial,sans-serif}.indo-notice-end{display:flex;align-items:center;justify-content:flex-end;min-width:62px}.indo-notice-action{border:1px solid #ff34b4;background:rgba(255,45,178,.07);color:#ff43b9;border-radius:9px;padding:8px 10px;font:800 10px/1 Arial,sans-serif;cursor:pointer;white-space:nowrap}.indo-notice-kind-follow{background:linear-gradient(145deg,#8d42ff,#5f30ff)}.indo-notice-kind-comment{background:linear-gradient(145deg,#ff49a7,#ff1f86)}.indo-notice-kind-like{background:linear-gradient(145deg,#ff55b7,#ef1889)}.indo-notice-kind-save{background:linear-gradient(145deg,#9d50ff,#7f36ff)}.indo-notifications-empty{padding:36px 14px;text-align:center;color:#7f7887;font:600 13px/1.45 Arial,sans-serif;border:1px dashed rgba(122,98,152,.3);border-radius:12px;margin-top:12px}.indo-notifications-status{color:#77707f;font:600 12px/1.4 Arial,sans-serif;padding:12px 2px}@media(max-width:420px){.indo-notifications-main{padding:12px 7px 92px}.indo-notice-card{grid-template-columns:8px 42px minmax(0,1fr) auto;gap:8px;min-height:74px;padding:8px 8px 8px 6px;border-radius:11px}.indo-notice-avatar{width:40px;height:40px;font-size:16px}.indo-notice-kind{width:19px;height:19px;font-size:9px}.indo-notice-line{font-size:11px;gap:4px}.indo-notice-user-id{font-size:11px}.indo-notice-meta{font-size:9px}.indo-notice-end{min-width:52px}.indo-notice-action{padding:7px 7px;font-size:8px}}`;
  document.head.appendChild(style);
}

export async function renderNotifications(
  app,
  mode = "all",
) {
  installStyles();
  installHomeTopbarStyles();
  const isActivity = mode === "activity";

  app.innerHTML = `
    <div class="indo-notifications-shell">
      ${renderHomeTopbar()}
      <main class="indo-notifications-main">
        <section class="indo-notifications-heading">
          <h1 class="indo-notifications-title">
            ${isActivity ? "Activity" : "Notifications"}
          </h1>
          <button
            class="indo-notifications-readall"
            type="button"
            data-mark-all
          >
            ✓ Mark all as read
          </button>
        </section>
        <div
          class="indo-notifications-list"
          data-notifications-list
        >
          <div class="indo-notifications-status">
            Loading...
          </div>
        </div>
      </main>
      ${nav("home")}
    </div>
  `;

  const list = app.querySelector(
    "[data-notifications-list]",
  );
  const readAllButton = app.querySelector(
    "[data-mark-all]",
  );

  const attachEvents = () => {
    list
      .querySelectorAll("[data-notification-id]")
      .forEach((card) => {
        if (card.dataset.bound === "1") return;
        card.dataset.bound = "1";

        card.addEventListener("click", async (event) => {
          if (
            event.target.closest(
              "[data-follow-response],[data-open-profile]",
            )
          ) {
            return;
          }
          if (!card.classList.contains("is-unread")) return;

          try {
            await markNotificationRead(
              card.dataset.notificationId,
            );
            card.classList.remove("is-unread");
            card.classList.add("is-read");
            window.dispatchEvent(
              new CustomEvent("indo:notifications-read"),
            );
          } catch {}
        });
      });

    list
      .querySelectorAll("[data-follow-response]")
      .forEach((button) => {
        if (button.dataset.bound === "1") return;
        button.dataset.bound = "1";

        button.addEventListener("click", async (event) => {
          event.stopPropagation();
          const requesterUid =
            button.dataset.requesterUid;
          button.disabled = true;

          try {
            await respondToFollowRequest(
              requesterUid,
              true,
            );
            button.textContent = "Following";
          } catch (error) {
            button.disabled = false;
            button.title =
              error?.message ||
              "Could not follow back.";
          }
        });
      });
  };

  const refresh = async () => {
    try {
      const items = await loadNotifications();
      const visible = isActivity
        ? items.filter((item) =>
            ["like", "comment"].includes(item.type),
          )
        : items;

      list.innerHTML = visible.length
        ? visible.map(renderNotification).join("")
        : `<div class="indo-notifications-empty">No ${isActivity ? "activity" : "notifications"} yet.</div>`;

      attachEvents();
    } catch (error) {
      list.innerHTML = `<div class="indo-notifications-empty">${escapeHtml(error?.message || "Could not load notifications.")}</div>`;
    }
  };

  await refresh();

  if (!isActivity) {
    try {
      await markAllNotificationsRead();
      app
        .querySelectorAll(".indo-notice-card.is-unread")
        .forEach((card) => {
          card.classList.remove("is-unread");
          card.classList.add("is-read");
        });
      window.dispatchEvent(
        new CustomEvent("indo:notifications-read"),
      );
    } catch {}
  }

  readAllButton.addEventListener("click", async () => {
    try {
      await markAllNotificationsRead();
      app
        .querySelectorAll(".indo-notice-card.is-unread")
        .forEach((card) => {
          card.classList.remove("is-unread");
          card.classList.add("is-read");
        });
      window.dispatchEvent(
        new CustomEvent("indo:notifications-read"),
      );
    } catch {}
  });
}
