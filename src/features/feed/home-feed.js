import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";

const LIMIT = 10;
const SEEN_PREFIX = "indo:feed-seen:";
const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const STYLE_ID = "indo-feed-safe-v2";

const esc = (v = "") => String(v).replace(/[&<>\"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;",
}[c]));
const apiBase = () => String(window.INDO_API_BASE || "").replace(/\/$/, "");

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-safe-video-stage{position:relative;width:100%;aspect-ratio:4/5;background:#000;overflow:hidden;display:grid;place-items:center}
    .indo-safe-video-stage video{width:100%;height:100%;display:block;object-fit:cover;background:#000}
    .indo-safe-video-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#09090d}
    .indo-safe-video-overlay{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.18))}
    .indo-safe-video-play{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.58);border:1px solid rgba(255,255,255,.35);color:#fff;font-size:25px}
    .indo-safe-video-stage.is-playing .indo-safe-video-overlay{display:none}
  `;
  document.head.appendChild(style);
}

function seenKey() { return `${SEEN_PREFIX}${String(auth.currentUser?.uid || "guest")}`; }
function readSeen() {
  try {
    const v = JSON.parse(localStorage.getItem(seenKey()) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch { return {}; }
}
function markSeen(items) {
  if (!auth.currentUser) return;
  const seen = readSeen();
  const now = Date.now();
  for (const item of items) {
    const id = String(item?.id || "").trim();
    if (id) seen[id] = now;
  }
  const compact = Object.entries(seen)
    .sort((a,b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 2000);
  localStorage.setItem(seenKey(), JSON.stringify(Object.fromEntries(compact)));
}
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function fetchVideos(query, headers) {
  const response = await fetch(`${apiBase()}/api/media/videos${query}`, { headers, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Could not load videos (${response.status}).`);
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function loadHomeVideos(limit = LIMIT) {
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const requested = Math.max(1, Math.min(20, Number(limit) || LIMIT));
  let items = await fetchVideos(`?type=video&limit=${Math.max(30, requested * 3)}`, headers);
  if (!items.length) items = await fetchVideos(`?limit=${Math.max(30, requested * 3)}`, headers);
  const seen = readSeen();
  const fresh = items.filter((item) => !item?.id || !seen[String(item.id)]);
  const selected = shuffle(fresh.length ? fresh : items).slice(0, requested);
  markSeen(selected);
  return selected;
}

function titleOf(video) { return String(video?.title || video?.postTitle || video?.caption || video?.description || "").trim(); }
function sourceOf(video) { return String(video?.secureUrl || video?.videoUrl || video?.streamUrl || video?.url || "").trim(); }
function avatarOf(video) { return String(video?.creatorAvatar || video?.avatarUrl || video?.profilePhoto || video?.photoURL || "").trim(); }

export function renderVideoCard(video) {
  installStyles();
  const creatorRaw = String(video?.creator || video?.username || video?.creatorName || "@indo");
  const avatar = avatarOf(video);
  const title = titleOf(video);
  const source = sourceOf(video);
  const poster = String(video?.thumbnailUrl || video?.thumbUrl || "").trim();
  const initial = esc(creatorRaw.replace(/^@/, "").charAt(0).toUpperCase() || "I");
  const likeCount = Number(video?.likes || 0).toLocaleString();
  const comments = Number(video?.comments || 0).toLocaleString();
  const shares = Number(video?.shares || 0).toLocaleString();
  const saves = Number(video?.saves || 0).toLocaleString();
  const creatorHtml = avatar
    ? `<span class="neon-edge-avatar"><img src="${esc(avatar)}" alt="" loading="lazy"></span>`
    : `<span class="neon-edge-avatar">${initial}</span>`;
  return `
    <article class="post-card video-post neon-edge-post" data-video-id="${esc(video?.id || "")}" data-owner-uid="${esc(video?.ownerUid || "")}">
      <div class="post-head neon-edge-head">
        <button class="post-creator neon-edge-creator" type="button" data-profile-uid="${esc(video?.ownerUid || "")}" data-profile-username="${esc(creatorRaw.replace(/^@/, ""))}">${creatorHtml}<span class="neon-edge-name">${esc(creatorRaw)}</span></button>
        <button class="icon-btn post-more neon-edge-more" type="button" data-feed-more aria-label="More options">⋯</button>
      </div>
      <div class="neon-video-stage indo-safe-video-stage" data-video-stage>
        ${poster ? `<img class="indo-safe-video-poster" src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ""}
        ${source ? `<video class="post-video" playsinline preload="none" data-video-source="${esc(source)}"></video><div class="indo-safe-video-overlay"><span class="indo-safe-video-play">▶</span></div>` : `<div style="color:#777;font-size:11px">Video unavailable</div>`}
      </div>
      <div class="post-actions neon-edge-actions">
        <button class="like-action" data-engagement="like" data-liked="0" type="button">♡ <small>${likeCount}</small></button>
        <button data-engagement="comment" type="button">◌ <small>${comments}</small></button>
        <button data-engagement="share" type="button">↗ <small>${shares}</small></button>
        <button class="save-action" data-engagement="save" data-saved="0" type="button">▱ <small>${saves}</small></button>
      </div>
      ${title ? `<div class="post-copy neon-edge-copy"><p class="neon-edge-title">${esc(title)}</p></div>` : ""}
    </article>`;
}

function stopOthers(current) {
  document.querySelectorAll("video[data-video-source]").forEach((v) => { if (v !== current) v.pause(); });
}

async function playVideo(video, stage) {
  const src = String(video.dataset.videoSource || "").trim();
  if (!src) return;
  stopOthers(video);
  if (video.dataset.loaded !== "1") {
    video.src = src;
    video.dataset.loaded = "1";
    video.preload = "metadata";
    video.controls = true;
    video.load();
  }
  try { await video.play(); stage?.classList.add("is-playing"); }
  catch { stage?.classList.remove("is-playing"); }
}

async function recordView(videoId) {
  const user = auth.currentUser;
  if (!user || !videoId) return;
  const key = `indo:view:${user.uid}:${videoId}`;
  const last = Number(localStorage.getItem(key) || 0);
  const now = Date.now();
  if (Number.isFinite(last) && now - last < VIEW_COOLDOWN_MS) return;
  localStorage.setItem(key, String(now));
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(videoId)}/view`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) localStorage.removeItem(key);
  } catch { localStorage.removeItem(key); }
}

async function engagement(card) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/engagement`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return response.ok ? response.json().catch(() => null) : null;
  } catch { return null; }
}

async function toggleLike(card) {
  const user = auth.currentUser; if (!user) return;
  const button = card.querySelector('[data-engagement="like"]');
  const next = button?.dataset.liked !== "1";
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ like: next }), cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Like failed.");
    button.dataset.liked = next ? "1" : "0";
    button.classList.toggle("is-active", next);
    const small = button.querySelector("small"); if (small) small.textContent = String(Number(data.likes ?? small.textContent ?? 0));
  } catch (e) { console.warn("Like failed:", e); }
}

async function toggleSave(card) {
  const user = auth.currentUser; if (!user) return;
  const button = card.querySelector('[data-engagement="save"]');
  const next = button?.dataset.saved !== "1";
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/save`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ save: next }), cache: "no-store" });
    if (!response.ok) throw new Error("Save failed.");
    button.dataset.saved = next ? "1" : "0";
    button.classList.toggle("is-active", next);
  } catch (e) { console.warn("Save failed:", e); }
}

async function share(card) {
  const url = `${location.origin}${location.pathname}#video=${encodeURIComponent(card.dataset.videoId || "")}`;
  try {
    if (navigator.share) await navigator.share({ title: "Indo video", url });
    else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
  } catch (e) { if (e?.name !== "AbortError") console.warn("Share failed:", e); }
}

function bindMore(card) {
  const button = card.querySelector("[data-feed-more]"); if (!button || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  button.addEventListener("click", (event) => {
    event.preventDefault(); event.stopPropagation();
    card.querySelector(".indo-safe-menu")?.remove();
    const menu = document.createElement("div"); menu.className = "indo-safe-menu";
    menu.style.cssText = "position:absolute;right:8px;top:44px;z-index:999;min-width:150px;padding:6px;background:#15151d;border:1px solid #2b2b35;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.5)";
    const isOwner = Boolean(auth.currentUser?.uid && String(auth.currentUser.uid) === String(card.dataset.ownerUid || ""));
    menu.innerHTML = `${isOwner ? '<button type="button" data-safe-delete>Delete video</button>' : ""}<button type="button" data-safe-share>Share</button><button type="button" data-safe-cancel>Cancel</button>`;
    const head = card.querySelector(".post-head"); if (!head) return; head.style.position = "relative"; head.appendChild(menu);
    menu.querySelector("[data-safe-cancel]")?.addEventListener("click", () => menu.remove());
    menu.querySelector("[data-safe-share]")?.addEventListener("click", async () => { await share(card); menu.remove(); });
    menu.querySelector("[data-safe-delete]")?.addEventListener("click", async () => {
      if (!confirm("Delete this video permanently?")) return;
      const user = auth.currentUser; if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/delete`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!response.ok) throw new Error("Delete failed.");
        card.remove(); menu.remove();
      } catch (e) { alert(e.message || "Delete failed."); }
    });
  });
}

export function bindVideoCards(root) {
  installStyles();
  root?.querySelectorAll?.("[data-video-id]").forEach((card) => {
    const video = card.querySelector("video[data-video-source]");
    const stage = card.querySelector("[data-video-stage]");
    if (video && video.dataset.bound !== "1") {
      video.dataset.bound = "1";
      video.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); if (video.paused) void playVideo(video, stage); else video.pause(); });
      video.addEventListener("pause", () => stage?.classList.remove("is-playing"));
      video.addEventListener("ended", () => stage?.classList.remove("is-playing"));
      video.addEventListener("playing", () => { stage?.classList.add("is-playing"); void recordView(card.dataset.videoId || ""); });
      stage?.addEventListener("click", (e) => { if (e.target === video) return; if (video.paused) void playVideo(video, stage); else video.pause(); });
    }
    bindMore(card);
    if (card.dataset.actionsBound !== "1") {
      card.dataset.actionsBound = "1";
      card.querySelector('[data-engagement="like"]')?.addEventListener("click", (e) => { e.stopPropagation(); void toggleLike(card); });
      card.querySelector('[data-engagement="save"]')?.addEventListener("click", (e) => { e.stopPropagation(); void toggleSave(card); });
      card.querySelector('[data-engagement="share"]')?.addEventListener("click", (e) => { e.stopPropagation(); void share(card); });
      card.querySelector('[data-engagement="comment"]')?.addEventListener("click", (e) => { e.stopPropagation(); window.__indoOpenComments?.(card.dataset.videoId || ""); });
    }
    void engagement(card).then((data) => {
      if (!data) return;
      const like = card.querySelector('[data-engagement="like"]');
      const save = card.querySelector('[data-engagement="save"]');
      if (like) { like.dataset.liked = data.liked ? "1" : "0"; like.classList.toggle("is-active", Boolean(data.liked)); }
      if (save) { save.dataset.saved = data.saved ? "1" : "0"; save.classList.toggle("is-active", Boolean(data.saved)); }
    });
  });
}

export function recordVideoView(videoId) { return recordView(String(videoId || "")); }
export async function deleteVideo(videoId) {
  const user = auth.currentUser; if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken(true);
  const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(videoId)}/delete`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.detail || `Delete failed (${response.status}).`);
  return data;
}
export function bindWatchProgress(videoElement, mediaId) {
  let last = 0;
  const report = () => { const now = Number(videoElement?.currentTime || 0); const delta = now - last; if (delta >= 10) { last = now; void recordWatchProgress(mediaId, Math.min(15, delta)); } };
  videoElement?.addEventListener("timeupdate", report);
  videoElement?.addEventListener("pause", report);
  videoElement?.addEventListener("ended", report);
}
