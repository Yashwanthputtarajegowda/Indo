import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";

const DEFAULT_FEED_LIMIT = 10;
const FEED_ONCE_KEY_PREFIX = "indo:feed-seen:";
const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const STYLE_ID = "indo-feed-safe-v1";

function esc(value = "") {
  return String(value).replace(/[&<>\"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#039;",
  })[c]);
}

function apiBase() {
  return String(window.INDO_API_BASE || "").replace(/\/$/, "");
}

function seenKey() {
  return `${FEED_ONCE_KEY_PREFIX}${String(auth.currentUser?.uid || "guest")}`;
}

function readSeen() {
  try {
    const parsed = JSON.parse(localStorage.getItem(seenKey()) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function markSeen(items) {
  if (!auth.currentUser || !Array.isArray(items)) return;
  const seen = readSeen();
  const now = Date.now();
  for (const item of items) {
    const id = String(item?.id || "").trim();
    if (id) seen[id] = now;
  }
  const compact = Object.entries(seen)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
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

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-safe-video-stage{position:relative;width:100%;aspect-ratio:4/5;background:#000;overflow:hidden;display:grid;place-items:center}
    .indo-safe-video-stage video{width:100%;height:100%;object-fit:cover;background:#000;display:block}
    .indo-safe-video-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;display:block}
    .indo-safe-video-overlay{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.22))}
    .indo-safe-video-play{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.35);font-size:26px;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.4)}
    .indo-safe-video-stage.is-playing .indo-safe-video-overlay{display:none}
    .indo-safe-video-note{padding:10px 12px;color:#9696a1;font-size:11px;text-align:center;background:#08080d}
  `;
  document.head.appendChild(style);
}

async function fetchVideos(query, headers) {
  const response = await fetch(`${apiBase()}/api/media/videos${query}`, {
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Could not load videos (${response.status}).`);
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function loadHomeVideos(limit = DEFAULT_FEED_LIMIT) {
  const headers = {};
  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const requested = Math.max(1, Math.min(20, Number(limit) || DEFAULT_FEED_LIMIT));
  const poolLimit = Math.max(requested * 3, 30);
  let items = await fetchVideos(`?type=video&limit=${poolLimit}`, headers);
  if (!items.length) items = await fetchVideos(`?limit=${poolLimit}`, headers);

  const seen = readSeen();
  const fresh = items.filter((item) => {
    const id = String(item?.id || "").trim();
    return !id || !seen[id];
  });
  const selected = shuffle(fresh.length ? fresh : items).slice(0, requested);
  markSeen(selected);
  return selected;
}

function titleOf(video) {
  return String(video?.title || video?.postTitle || video?.caption || video?.description || "").trim();
}

function sourceOf(video) {
  return String(video?.secureUrl || video?.videoUrl || video?.streamUrl || video?.url || "").trim();
}

function avatarOf(video) {
  return String(video?.creatorAvatar || video?.avatarUrl || video?.profilePhoto || video?.photoURL || "").trim();
}

export function renderVideoCard(video) {
  installStyles();
  const id = esc(video?.id || "");
  const ownerUid = esc(video?.ownerUid || "");
  const creatorRaw = String(video?.creator || video?.username || video?.creatorName || "@indo");
  const creator = esc(creatorRaw);
  const title = titleOf(video);
  const source = sourceOf(video);
  const poster = String(video?.thumbnailUrl || video?.thumbUrl || "").trim();
  const avatarUrl = avatarOf(video);
  const initial = esc(creatorRaw.replace(/^@/, "").charAt(0).toUpperCase() || "I");
  const likeCount = Number(video?.likes || 0).toLocaleString();
  const commentCount = Number(video?.comments || 0).toLocaleString();
  const shareCount = Number(video?.shares || 0).toLocaleString();
  const saveCount = Number(video?.saves || 0).toLocaleString();

  const avatar = avatarUrl
    ? `<span class="neon-edge-avatar"><img src="${esc(avatarUrl)}" alt="" loading="lazy" decoding="async"></span>`
    : `<span class="neon-edge-avatar">${initial}</span>`;

  return `
    <article class="post-card video-post neon-edge-post" data-video-id="${id}" data-owner-uid="${ownerUid}">
      <div class="post-head neon-edge-head">
        <button class="post-creator neon-edge-creator" type="button" data-profile-uid="${ownerUid}" data-profile-username="${esc(creatorRaw.replace(/^@/, ""))}">
          ${avatar}<span class="neon-edge-name">${creator}</span>
        </button>
        <button class="icon-btn post-more neon-edge-more" type="button" data-feed-more aria-label="More options">⋯</button>
      </div>
      <div class="neon-video-stage indo-safe-video-stage" data-video-stage>
        ${poster ? `<img class="indo-safe-video-poster" src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ""}
        ${source ? `<video class="post-video" playsinline preload="none" data-video-source="${esc(source)}" data-video-stage-video aria-label="Indo video"></video>` : `<div class="indo-safe-video-note">Video unavailable</div>`}
        ${source ? `<div class="indo-safe-video-overlay"><span class="indo-safe-video-play">▶</span></div>` : ""}
      </div>
      <div class="post-actions neon-edge-actions" aria-label="Post actions">
        <button class="like-action" data-engagement="like" data-liked="0" type="button" aria-label="Like">♡ <small>${likeCount}</small></button>
        <button data-engagement="comment" type="button" aria-label="Comment">◌ <small>${commentCount}</small></button>
        <button data-engagement="share" type="button" aria-label="Share">↗ <small>${shareCount}</small></button>
        <button class="save-action" data-engagement="save" data-saved="0" type="button" aria-label="Save">▱ <small>${saveCount}</small></button>
      </div>
      ${title ? `<div class="post-copy neon-edge-copy"><div class="neon-edge-title-row"><p class="neon-edge-title" title="${esc(title)}">${esc(title)}</p></div></div>` : ""}
    </article>
  `;
}

function stopOtherVideos(current) {
  document.querySelectorAll("video[data-video-stage-video]").forEach((video) => {
    if (video !== current && !video.paused) video.pause();
  });
}

function maybeRecordView(videoId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !videoId) return;
  const key = `indo:view:${uid}:${videoId}`;
  const last = Number(localStorage.getItem(key) || 0);
  const now = Date.now();
  if (Number.isFinite(last) && now - last < VIEW_COOLDOWN_MS) return;
  localStorage.setItem(key, String(now));
  fetch(`${apiBase()}/api/media/${encodeURIComponent(videoId)}/view`, {
    method: "POST",
    headers: { Authorization: `Bearer ${awaitTokenSync()}` },
  }).catch(() => localStorage.removeItem(key));
}

function awaitTokenSync() {
  return "";
}

async function loadAndPlay(video, stage) {
  const src = String(video.dataset.videoSource || "").trim();
  if (!src) return;
  stopOtherVideos(video);
  if (!video.dataset.loaded) {
    video.dataset.loaded = "1";
    video.src = src;
    video.preload = "metadata";
    video.controls = true;
    video.load();
  }
  stage?.classList.add("is-playing");
  try {
    await video.play();
    maybeRecordViewSafe(video.closest("[data-video-id]")?.dataset.videoId || "");
  } catch {
    stage?.classList.remove("is-playing");
  }
}

async function maybeRecordViewSafe(videoId) {
  const user = auth.currentUser;
  if (!user || !videoId) return;
  const key = `indo:view:${user.uid}:${videoId}`;
  const last = Number(localStorage.getItem(key) || 0);
  const now = Date.now();
  if (Number.isFinite(last) && now - last < VIEW_COOLDOWN_MS) return;
  localStorage.setItem(key, String(now));
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(videoId)}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
}

async function bindVideoElement(card) {
  const video = card.querySelector("[data-video-stage-video]");
  const stage = card.querySelector("[data-video-stage]");
  if (!video || video.dataset.bound === "1") return;
  video.dataset.bound = "1";
  video.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (video.paused) void loadAndPlay(video, stage);
    else video.pause();
  });
  stage?.addEventListener("click", (event) => {
    if (event.target === video || event.target.closest("button")) return;
    if (video.paused) void loadAndPlay(video, stage);
    else video.pause();
  });
  video.addEventListener("pause", () => stage?.classList.remove("is-playing"));
  video.addEventListener("ended", () => stage?.classList.remove("is-playing"));
  video.addEventListener("error", () => stage?.classList.remove("is-playing"));
}

async function getEngagement(card) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/engagement`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json().catch(() => null);
  } catch {
    return null;
  }
}

async function setLike(card) {
  const user = auth.currentUser;
  if (!user) return;
  const button = card.querySelector('[data-engagement="like"]');
  const next = button?.dataset.liked !== "1";
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ like: next }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not update like.");
    button.dataset.liked = next ? "1" : "0";
    button.classList.toggle("is-active", next);
    const small = button.querySelector("small");
    if (small) small.textContent = String(Number(data.likes ?? small.textContent ?? 0));
  } catch (error) {
    console.warn("Like failed:", error);
  }
}

async function setSaved(card) {
  const user = auth.currentUser;
  if (!user) return;
  const button = card.querySelector('[data-engagement="save"]');
  const next = button?.dataset.saved !== "1";
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/save`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ save: next }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not update save.");
    button.dataset.saved = next ? "1" : "0";
    button.classList.toggle("is-active", next);
  } catch (error) {
    console.warn("Save failed:", error);
  }
}

async function shareVideo(card) {
  const url = `${window.location.origin}${window.location.pathname}#video=${encodeURIComponent(card.dataset.videoId || "")}`;
  try {
    if (navigator.share) await navigator.share({ title: "Indo video", url });
    else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
  } catch (error) {
    if (error?.name !== "AbortError") console.warn("Share failed:", error);
  }
}

function closeMenus() {
  document.querySelectorAll(".indo-safe-feed-menu").forEach((node) => node.remove());
}

function bindMore(card) {
  const button = card.querySelector("[data-feed-more]");
  if (!button || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenus();
    const menu = document.createElement("div");
    menu.className = "indo-safe-feed-menu";
    menu.style.cssText = "position:absolute;right:8px;top:44px;z-index:1000;min-width:150px;padding:6px;border-radius:10px;background:#15151c;border:1px solid #2a2a33;box-shadow:0 12px 30px rgba(0,0,0,.55)";
    const owner = String(card.dataset.ownerUid || "");
    const uid = String(auth.currentUser?.uid || "");
    menu.innerHTML = `${owner && uid && owner === uid ? '<button type="button" data-safe-delete>Delete video</button>' : ""}<button type="button" data-safe-share>Share</button><button type="button" data-safe-close>Cancel</button>`;
    card.querySelector(".post-head")?.appendChild(menu);
    menu.querySelector("[data-safe-close]")?.addEventListener("click", closeMenus);
    menu.querySelector("[data-safe-share]")?.addEventListener("click", async () => { await shareVideo(card); closeMenus(); });
    menu.querySelector("[data-safe-delete]")?.addEventListener("click", async () => {
      if (!confirm("Delete this video permanently?")) return;
      const user = auth.currentUser;
      if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const response = await fetch(`${apiBase()}/api/media/${encodeURIComponent(card.dataset.videoId)}/delete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Delete failed.");
        card.remove();
        closeMenus();
      } catch (error) {
        alert(error.message || "Delete failed.");
      }
    });
  });
}

function bindEngagement(card) {
  if (card.dataset.engagementBound === "1") return;
  card.dataset.engagementBound = "1";
  card.querySelector('[data-engagement="like"]')?.addEventListener("click", (event) => { event.stopPropagation(); void setLike(card); });
  card.querySelector('[data-engagement="save"]')?.addEventListener("click", (event) => { event.stopPropagation(); void setSaved(card); });
  card.querySelector('[data-engagement="share"]')?.addEventListener("click", (event) => { event.stopPropagation(); void shareVideo(card); });
  card.querySelector('[data-engagement="comment"]')?.addEventListener("click", (event) => { event.stopPropagation(); card.dispatchEvent(new CustomEvent("indo:comment", { detail: card.dataset.videoId })); });
}

export function bindVideoCards(root) {
  installStyles();
  root?.querySelectorAll?.("[data-video-id]").forEach((card) => {
    void bindVideoElement(card);
    bindMore(card);
    bindEngagement(card);
    void getEngagement(card).then((data) => {
      if (!data) return;
      const like = card.querySelector('[data-engagement="like"]');
      const save = card.querySelector('[data-engagement="save"]');
      like?.classList.toggle("is-active", Boolean(data.liked));
      if (like) like.dataset.liked = data.liked ? "1" : "0";
      save?.classList.toggle("is-active", Boolean(data.saved));
      if (save) save.dataset.saved = data.saved ? "1" : "0';
    });
  });

  document.addEventListener("click", () => closeMenus(), { once: true });
}

export function recordVideoView(videoId) {
  return maybeRecordViewSafe(String(videoId || ""));
}

export function deleteVideo(videoId) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("Please login first."));
  return user.getIdToken(true).then((token) => fetch(`${apiBase()}/api/media/videos/${encodeURIComponent(videoId)}/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.detail || `Delete failed (${response.status}).`);
    return data;
  });
}

export function bindWatchProgress(videoElement, mediaId) {
  let last = 0;
  const report = () => {
    const now = Number(videoElement?.currentTime || 0);
    const delta = now - last;
    if (delta >= 10) {
      last = now;
      void recordWatchProgress(mediaId, Math.min(15, delta));
    }
  };
  videoElement?.addEventListener("timeupdate", report);
  videoElement?.addEventListener("pause", report);
  videoElement?.addEventListener("ended", report);
}
