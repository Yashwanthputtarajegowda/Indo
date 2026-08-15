import { auth } from "../features/auth/firebase-client.js";
import { renderWatchVideo as renderStyledWatchVideo } from "./watch-video-v225.js";

const STYLE_ID = "indo-watch-live-actions-v226";
const API_BASE = () => window.INDO_API_BASE || "";
const cloneAndReplace = (node) => {
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
};
async function token() {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  return user.getIdToken(true);
}
async function request(
  path,
  { method = "GET", body, authRequired = true } = {},
) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authRequired) headers.Authorization = `Bearer ${await token()}`;
  const r = await fetch(`${API_BASE()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed.");
  return d;
}
function style() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.indo-watch-actions button.is-working{opacity:.55!important}.indo-watch-actions button.active-like{color:#ff4abf!important}.indo-watch-actions button.active-save{color:#b071ff!important}.indo-watch-live-status{min-height:12px;margin:4px 12px;color:#8d8795;font-size:8px;text-align:right}.indo-watch-live-toast{position:fixed;left:50%;bottom:82px;transform:translateX(-50%);z-index:12000;max-width:min(92vw,360px);padding:8px 12px;border:1px solid #5a3a75;border-radius:10px;background:#12101a;color:#eee8f4;font-size:10px;box-shadow:0 8px 24px rgba(0,0,0,.35)}`;
  document.head.appendChild(s);
}
function showStatus(app, text) {
  let el = app.querySelector(".indo-watch-live-status");
  if (!el) {
    el = document.createElement("div");
    el.className = "indo-watch-live-status";
    const actions = app.querySelector(".indo-watch-actions");
    actions?.after(el);
  }
  el.textContent = text || "";
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.textContent = "";
  }, 2200);
}
async function notifyPoll() {
  try {
    const d = await request("/api/notifications");
    return Array.isArray(d.notifications) ? d.notifications : [];
  } catch {
    return [];
  }
}
function installNotificationLiveRefresh() {
  if (window.__indoNotificationLiveRefresh) return;
  window.__indoNotificationLiveRefresh = true;
  let lastFingerprint = "";
  const poll = async () => {
    if (String(location.hash || "").includes("notification")) return;
    const root = document.getElementById("root");
    if (!root || !root.querySelector(".notifications")) return;
    const items = await notifyPoll();
    const fp = items
      .slice(0, 8)
      .map((x) => `${x.id}:${x.read}:${x.createdAt}`)
      .join("|");
    if (lastFingerprint && fp !== lastFingerprint)
      window.dispatchEvent(
        new CustomEvent("indo:notification-updated", { detail: { items } }),
      );
    lastFingerprint = fp;
  };
  setInterval(poll, 4000);
}
function valueSpan(button) {
  return button?.querySelector("span");
}
function setButtonState(button, active, countValue) {
  button.classList.toggle(
    "active-like",
    active && button.dataset.action === "like",
  );
  button.classList.toggle(
    "active-save",
    active && button.dataset.action === "save",
  );
  const v = valueSpan(button);
  if (v && countValue !== undefined) v.textContent = String(countValue);
}
async function wireActions(app, video) {
  const original = [
    ...app.querySelectorAll(".indo-watch-actions button[data-action]"),
  ];
  const buttons = {};
  for (const b of original) {
    const clone = cloneAndReplace(b);
    buttons[clone.dataset.action] = clone;
  }
  const likeBtn = buttons.like,
    commentBtn = buttons.comment,
    shareBtn = buttons.share,
    saveBtn = buttons.save,
    viewsBtn = buttons.views;
  try {
    const e = await request(
      `/api/media/${encodeURIComponent(video.id)}/engagement`,
    );
    setButtonState(likeBtn, !!e.liked, e.likes);
    setButtonState(saveBtn, !!e.saved, 0);
  } catch {}
  likeBtn?.addEventListener("click", async () => {
    likeBtn.classList.add("is-working");
    likeBtn.disabled = true;
    try {
      const next = !likeBtn.classList.contains("active-like");
      const d = await request(
        `/api/media/${encodeURIComponent(video.id)}/like`,
        { method: "POST", body: { like: next } },
      );
      setButtonState(likeBtn, next, d.likes);
      showStatus(app, next ? "Liked" : "Unliked");
    } catch (error) {
      showStatus(app, error.message || "Like failed.");
    } finally {
      likeBtn.disabled = false;
      likeBtn.classList.remove("is-working");
    }
  });
  saveBtn?.addEventListener("click", async () => {
    saveBtn.classList.add("is-working");
    saveBtn.disabled = true;
    try {
      const next = !saveBtn.classList.contains("active-save");
      await request(`/api/media/${encodeURIComponent(video.id)}/save`, {
        method: "POST",
        body: { save: next },
      });
      setButtonState(saveBtn, next, 0);
      showStatus(app, next ? "Saved" : "Removed from saved");
    } catch (error) {
      showStatus(app, error.message || "Save failed.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.classList.remove("is-working");
    }
  });
  commentBtn?.addEventListener("click", () =>
    app.querySelector("#comment-input")?.focus(),
  );
  shareBtn?.addEventListener("click", async () => {
    try {
      const url = location.href;
      if (navigator.share)
        await navigator.share({ title: video.title || "Indo video", url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
      showStatus(app, "Link shared");
    } catch (error) {
      if (error?.name !== "AbortError") showStatus(app, "Share failed.");
    }
  });
  viewsBtn?.addEventListener("click", () =>
    app
      .querySelector(".indo-watch-player")
      ?.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
}
async function wireFollow(app, video) {
  const btn = app.querySelector("#watch-follow");
  if (!btn) return;
  const ownerUid = String(
    video.ownerUid || video.creatorUid || video.uid || "",
  ).trim();
  const me = String(auth.currentUser?.uid || "");
  if (!ownerUid || ownerUid === me) {
    btn.remove();
    return;
  }
  const status = await request(
    `/api/social/follow-status/${encodeURIComponent(ownerUid)}`,
  ).catch(() => ({}));
  let state = status.pending
    ? "pending"
    : status.following
      ? "following"
      : "idle";
  const paint = () => {
    btn.classList.toggle("following", state === "following");
    btn.classList.toggle("pending", state === "pending");
    btn.textContent =
      state === "following"
        ? "Following"
        : state === "pending"
          ? "Requested"
          : "Follow";
  };
  paint();
  const fresh = cloneAndReplace(btn);
  fresh.addEventListener("click", async () => {
    fresh.disabled = true;
    try {
      const next = state !== "following";
      const d = await request("/api/social/follow", {
        method: "POST",
        body: { targetUid: ownerUid, follow: next },
      });
      state = d.pending ? "pending" : next ? "following" : "idle";
      paint();
      showStatus(
        app,
        next ? (d.pending ? "Follow request sent" : "Following") : "Unfollowed",
      );
    } catch (error) {
      showStatus(app, error.message || "Follow failed.");
    } finally {
      fresh.disabled = false;
    }
  });
}
async function wireComments(app, video) {
  const form = app.querySelector("#comment-form");
  if (!form) return;
  const clean = cloneAndReplace(form);
  const input = clean.querySelector("#comment-input");
  const status = clean.querySelector("#comment-status");
  const list = app.querySelector("#watch-comments-list");
  const countEl = app.querySelector("#comment-count");
  const refresh = async () => {
    try {
      const d = await request(
        `/api/media/${encodeURIComponent(video.id)}/comments`,
      );
      const comments = Array.isArray(d.comments) ? d.comments : [];
      if (countEl) countEl.textContent = String(comments.length);
      if (list)
        list.innerHTML = comments.length
          ? comments
              .map(
                (c) =>
                  `<div class="indo-comment"><span class="indo-comment-name">@${String(
                    c.username || "user",
                  )
                    .replace(/^@/, "")
                    .replace(
                      /[<>]/g,
                      "",
                    )}</span><span class="indo-comment-time">${new Date(Number(c.createdAt || Date.now())).toLocaleString()}</span><div class="indo-comment-text">${String(c.text || "").replace(/[<>]/g, "")}</div></div>`,
              )
              .join("")
          : '<div class="indo-watch-status">No comments yet.</div>';
    } catch {}
  };
  await refresh();
  clean.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = String(input?.value || "").trim();
    if (!text) return;
    input.disabled = true;
    if (status) status.textContent = "Sending...";
    try {
      await request(`/api/media/${encodeURIComponent(video.id)}/comments`, {
        method: "POST",
        body: { text },
      });
      input.value = "";
      if (status) status.textContent = "";
      await refresh();
      showStatus(app, "Comment added");
    } catch (error) {
      if (status) status.textContent = error.message || "Comment failed.";
    } finally {
      input.disabled = video.allowComments === false;
    }
  });
}
export async function renderWatchVideo(app) {
  style();
  await renderStyledWatchVideo(app);
  const raw = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("indo:watch-video-current") || "null",
      );
    } catch {
      return null;
    }
  })();
  if (!raw) return;
  await wireActions(app, raw);
  await wireFollow(app, raw);
  await wireComments(app, raw);
  installNotificationLiveRefresh();
}
