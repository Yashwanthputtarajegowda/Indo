import { auth } from "../features/auth/firebase-client.js";

const STYLE_ID = "indo-home-topbar-badge-v229";
let pollTimer = null;
let pollBusy = false;

async function loadUnreadCount() {
  const user = auth.currentUser;
  if (!user) return 0;
  try {
    const token = await user.getIdToken();
    const response = await fetch(
      `${window.INDO_API_BASE || ""}/api/notifications`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (!response.ok) return 0;
    const data = await response.json().catch(() => ({}));
    return Array.isArray(data.notifications)
      ? data.notifications.reduce(
          (n, item) => n + (item?.read === false ? 1 : 0),
          0,
        )
      : 0;
  } catch {
    return 0;
  }
}

function paintUnreadBadge(count) {
  const button = document.querySelector(
    ".indo-option5-topbar .notification-button",
  );
  if (!button) return;
  const n = Math.max(0, Number(count) || 0);
  const existing = button.querySelector(".indo-notification-badge");
  if (n === 0) {
    existing?.remove();
    button.removeAttribute("data-unread-count");
    button.setAttribute("aria-label", "Notifications");
    return;
  }
  const badge = existing || document.createElement("span");
  badge.className = "indo-notification-badge";
  badge.textContent = n > 99 ? "99+" : String(n);
  if (!existing) button.appendChild(badge);
  button.setAttribute("data-unread-count", String(n));
  button.setAttribute("aria-label", `Notifications, ${n} unread`);
}

async function refreshUnreadBadge() {
  if (pollBusy) return;
  pollBusy = true;
  try {
    paintUnreadBadge(await loadUnreadCount());
  } finally {
    pollBusy = false;
  }
}

function clearUnreadBadge() {
  paintUnreadBadge(0);
}

function installEvents() {
  window.removeEventListener("indo:notifications-read", clearUnreadBadge);
  window.addEventListener("indo:notifications-read", clearUnreadBadge);
  window.removeEventListener("indo:notification-received", refreshUnreadBadge);
  window.addEventListener("indo:notification-received", refreshUnreadBadge);
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  refreshUnreadBadge();
  pollTimer = setInterval(refreshUnreadBadge, 2500);
}

export function renderHomeTopbar() {
  installEvents();
  startPolling();
  return `<header class="topbar indo-option5-topbar"><button class="indo-option5-brand" type="button" data-screen="home" aria-label="Indo Home" title="Home"><span class="indo-option5-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M19.7 2 7.3 17.1h7.2L11.8 30 25 13.2h-7.1L19.7 2Z" fill="currentColor"/></svg></span><span class="indo-option5-wordmark">INDO</span></button><div class="top-actions indo-option5-actions" aria-label="Home actions"><button class="search-button top-action-button" data-screen="search" aria-label="Search" title="Search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="notification-button top-action-button" data-screen="notifications" aria-label="Notifications" title="Notifications"><svg viewBox="0 0 24 24"><path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2zM10 19h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="create-button top-action-button indo-option5-create" data-screen="create" aria-label="Create" title="Create"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div></header>`;
}

export function installHomeTopbarStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `.indo-option5-topbar{position:sticky;top:0;z-index:20;width:100%;height:58px;min-height:58px;box-sizing:border-box;padding:0 12px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;overflow:hidden;background:radial-gradient(circle at 72% 115%,rgba(255,42,181,.13),transparent 28%),linear-gradient(115deg,#09080e 0%,#100a17 55%,#07070c 100%);border-bottom:1px solid rgba(143,66,255,.18);box-shadow:0 7px 22px rgba(0,0,0,.32);backdrop-filter:blur(14px)}.indo-option5-topbar::before{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent 0%,#8f36ff 38%,#ff2eaa 62%,transparent 100%);opacity:.72;pointer-events:none}.indo-option5-topbar::after{content:'';position:absolute;width:180px;height:1px;right:62px;bottom:1px;background:linear-gradient(90deg,transparent,#ff3ab8,#873eff,transparent);box-shadow:0 0 8px rgba(255,48,183,.8);transform:rotate(-5deg);opacity:.8;pointer-events:none}.indo-option5-brand{min-width:0;height:100%;display:flex;align-items:center;gap:9px;padding:0;margin:0;border:0;background:transparent;color:#fff;cursor:pointer;text-align:left}.indo-option5-mark{width:31px;height:35px;flex:0 0 31px;display:grid;place-items:center;color:#ff3cac;filter:drop-shadow(0 0 7px rgba(255,47,173,.28));transform:rotate(-4deg)}.indo-option5-mark svg{width:29px;height:32px;display:block}.indo-option5-wordmark{display:block;color:#f8f7fb;font-family:Impact,"Arial Black",Arial,sans-serif;font-size:24px;font-weight:950;font-style:italic;line-height:.95;letter-spacing:-1.2px;transform:skew(-6deg);text-shadow:1px 0 0 rgba(255,255,255,.15),0 0 10px rgba(255,255,255,.06)}.indo-option5-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex:0 0 auto;padding:0}.indo-option5-actions .top-action-button{width:30px;height:30px;min-width:30px;padding:0;margin:0;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#f0edf7;box-shadow:none;transition:transform .16s ease,color .16s ease,background .16s ease;position:relative}.indo-option5-actions .top-action-button svg{width:19px;height:19px;display:block;overflow:visible}.indo-option5-actions .notification-button svg{width:20px;height:20px}.indo-option5-actions .indo-option5-create{width:31px;height:31px;min-width:31px;color:#fff;background:linear-gradient(145deg,#ff3fb7 0%,#d83b9f 45%,#963bff 100%);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 0 13px rgba(240,51,180,.28)}.indo-notification-badge{position:absolute;top:-2px;right:-3px;min-width:15px;height:15px;padding:0 4px;border-radius:999px;background:#ff2caf;color:#fff;display:flex;align-items:center;justify-content:center;font:800 8px/1 Arial,sans-serif;box-shadow:0 0 0 2px #0b0910,0 0 9px rgba(255,44,177,.6);pointer-events:none}@media(max-width:380px){.indo-option5-topbar{height:55px;min-height:55px;padding-left:11px;padding-right:9px}.indo-option5-brand{gap:7px}.indo-option5-mark{width:28px;height:32px;flex-basis:28px}.indo-option5-mark svg{width:27px;height:30px}.indo-option5-wordmark{font-size:22px;letter-spacing:-1px}.indo-option5-actions{gap:5px}.indo-option5-actions .top-action-button{width:28px;height:28px;min-width:28px}.indo-option5-actions .indo-option5-create{width:29px;height:29px;min-width:29px}.indo-notification-badge{top:-1px;right:-2px;min-width:14px;height:14px;font-size:7px}}`;
  document.head.appendChild(style);
}
