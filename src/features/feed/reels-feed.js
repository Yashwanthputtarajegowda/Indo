import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";

export async function loadReels(options = {}) {
  const apiBase = window.INDO_API_BASE || "";
  const params = new URLSearchParams({ limit: String(options.limit || 100) });
  if (options.cursor) params.set("cursor", String(options.cursor));
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const response = await fetch(`${apiBase}/api/media/videos?${params.toString()}`, { headers });
  if (!response.ok) throw new Error("Could not load reels.");
  const payload = await response.json();
  const videos = Array.isArray(payload) ? payload : (Array.isArray(payload.videos) ? payload.videos : []);
  return videos;
}

export async function recordReelView(reelId) {
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const response = await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(reelId)}/view`, { method: "POST", headers });
  if (!response.ok) throw new Error("Could not record reel view.");
  return response.json();
}

function escapeHtml(value = "") { return String(value).replace(/[&<>\\"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '\"':"&quot;", "'":"&#039;" })[char]); }
function cleanUserId(value = "") { return String(value || "").trim().replace(/^@+/, ""); }
function bindWatchProgress(videoElement, mediaId) {
  let lastReportedAt = 0;
  const sendDelta = () => {
    const current = Number(videoElement.currentTime || 0);
    const delta = current - lastReportedAt;
    if (delta >= 10) {
      lastReportedAt = current;
      recordWatchProgress(mediaId, Math.min(15, delta));
    }
  };
  videoElement.addEventListener("timeupdate", sendDelta);
  videoElement.addEventListener("pause", sendDelta);
  videoElement.addEventListener("ended", sendDelta);
}

export function renderReel(video) {
  const creatorRaw = String(video.userId || video.username || video.creator || "Indo creator");
  const creator = escapeHtml(creatorRaw.replace(/^@/, ""));
  const userId = escapeHtml(cleanUserId(video.userId || video.username || video.creator || "indo"));
  const targetUid = escapeHtml(video.ownerUid || "");
  const caption = escapeHtml(video.caption || video.title || "");
  const id = escapeHtml(video.id);
  const likes = Number(video.likes || 0).toLocaleString();
  const mediaUrl = String(video.secureUrl || video.videoUrl || video.url || "").trim();
  return `<article class="reel-view" data-video-id="${id}">
    <video class="reel-video" src="${escapeHtml(mediaUrl)}" muted="true" loop playsinline autoplay preload="auto"></video>
    <div class="reel-gradient"></div>
    <div class="reel-info"><div class="reel-user" data-profile-uid="${targetUid}" data-profile-username="${userId}">
      <button class="avatar small reel-avatar" type="button" data-profile-avatar data-profile-uid="${targetUid}" data-profile-username="${userId}" data-open-profile="${userId}" aria-label="Open @${userId} profile">${escapeHtml(creator.charAt(0).toUpperCase() || "I")}</button>
      <button class="reel-user-id" type="button" data-open-profile="${userId}" data-profile-uid="${targetUid}" data-profile-username="${userId}">@${userId}</button>
      ${targetUid ? `<button class="follow-btn" data-follow-uid="${targetUid}" type="button">Follow</button>` : ""}
    </div><p>${caption}</p></div>
    <div class="reel-actions"><button data-engagement="like" type="button" aria-label="Like">♡<small>${likes}</small></button><button data-engagement="comment" type="button" aria-label="Comment">◯<small>Comment</small></button><button data-engagement="share" type="button" aria-label="Share">↗<small>Share</small></button><button data-engagement="save" type="button" aria-label="Save">🔖</button></div>
  </article>`;
}

export function bindReelWatchProgress(root) {
  root.querySelectorAll(".reel-view .reel-video").forEach((video) => {
    const card = video.closest("[data-video-id]");
    if (card) bindWatchProgress(video, card.dataset.videoId);
    if (video.dataset.bound === "1") return;
    video.dataset.bound = "1";
    video.addEventListener("error", () => {
      video.pause();
    });
  });
}

function attemptAutoplay(video) {
  if (!video || !video.isConnected) return;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  const result = video.play();
  if (result && typeof result.catch === "function") result.catch(() => {});
}

export function installReelVideoObserver(root) {
  const videos = [...root.querySelectorAll(".reel-video")];
  const activate = (video) => {
    video.preload = "auto";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();
  };
  const start = (video) => {
    activate(video);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) attemptAutoplay(video);
    else video.addEventListener("loadeddata", () => attemptAutoplay(video), { once: true });
  };

  if (!("IntersectionObserver" in window)) {
    videos.slice(0, 2).forEach(start);
    return;
  }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) start(video);
    else video.pause();
  }), { root, rootMargin: "1000px 0px", threshold: 0.1 });
  videos.forEach((video) => observer.observe(video));

  const resumeVisible = () => {
    const video = videos.find((item) => {
      const rect = item.getBoundingClientRect();
      return rect.top >= -window.innerHeight * 0.5 && rect.top < window.innerHeight * 0.75;
    });
    if (video) attemptAutoplay(video);
  };
  root.addEventListener("touchstart", resumeVisible, { passive: true });
  root.addEventListener("click", resumeVisible, { passive: true });
}
