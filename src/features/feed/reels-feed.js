import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";
import { loadArchiveKannadaVideosProgressive } from "../archive/archive-videos.js";

const OPEN_VIDEO_SOURCE_RE = /^(archive|openverse|wikimedia-commons|internet-archive|peertube|library-of-congress):/i;

export async function loadReels(options = {}) {
  const videos = await loadArchiveKannadaVideosProgressive({ limit: 100, ...options });
  return videos.filter((video) => OPEN_VIDEO_SOURCE_RE.test(String(video?.id || "")));
}

export async function recordReelView(reelId) {
  if (OPEN_VIDEO_SOURCE_RE.test(String(reelId || ""))) return { ok: true, source: "open-video-provider" };
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
  if (OPEN_VIDEO_SOURCE_RE.test(String(mediaId || ""))) return;
  let lastReportedAt = 0;
  const sendDelta = () => { const current = Number(videoElement.currentTime || 0), delta = current - lastReportedAt; if (delta >= 10) { lastReportedAt = current; recordWatchProgress(mediaId, Math.min(15, delta)); } };
  videoElement.addEventListener("timeupdate", sendDelta);
  videoElement.addEventListener("pause", sendDelta);
  videoElement.addEventListener("ended", sendDelta);
}

export function renderReel(video) {
  const creatorRaw = String(video.userId || video.username || video.creator || video.provider || "Open-source video");
  const creator = escapeHtml(creatorRaw.replace(/^@/, ""));
  const userId = escapeHtml(cleanUserId(video.userId || video.username || video.creator || video.provider || "open-video"));
  const targetUid = escapeHtml(video.ownerUid || "");
  const caption = escapeHtml(video.caption || video.title || "");
  const id = escapeHtml(video.id);
  const likes = Number(video.likes || 0).toLocaleString();
  const mediaUrl = String(video.secureUrl || video.videoUrl || video.url || "").trim();
  const candidates = Array.isArray(video.sourceCandidates) ? video.sourceCandidates.map((url) => String(url || "").trim()).filter(Boolean) : [];
  const provider = escapeHtml(video.provider || "Open-source");
  const candidateData = escapeHtml(JSON.stringify([...new Set([mediaUrl, ...candidates].filter(Boolean))]));
  return `<article class="reel-view" data-video-id="${id}" data-source="${escapeHtml(video.source || "")}" data-video-candidates="${candidateData}">
    <video class="reel-video" src="${escapeHtml(mediaUrl)}" muted="true" loop playsinline autoplay preload="auto"></video>
    <div class="reel-gradient"></div>
    <div class="reel-info"><div class="reel-user" data-profile-uid="${targetUid}" data-profile-username="${userId}">
      <button class="avatar small reel-avatar" type="button" data-profile-avatar data-profile-uid="${targetUid}" data-profile-username="${userId}" data-open-profile="${userId}" aria-label="Open @${userId} profile">${escapeHtml(creator.charAt(0).toUpperCase() || "O")}</button>
      <button class="reel-user-id" type="button" data-open-profile="${userId}" data-profile-uid="${targetUid}" data-profile-username="${userId}">@${userId}</button>
      ${targetUid ? `<button class="follow-btn" data-follow-uid="${targetUid}" type="button">Follow</button>` : ""}
    </div><p>${caption}</p><small>♪ ${provider}</small></div>
    <div class="reel-actions"><button data-engagement="like" type="button" aria-label="Like">♡<small>${likes}</small></button><button data-engagement="comment" type="button" aria-label="Comment">◯<small>Comment</small></button><button data-engagement="share" type="button" aria-label="Share">↗<small>Share</small></button><button data-engagement="save" type="button" aria-label="Save">🔖</button></div>
  </article>`;
}

function getCandidates(video) {
  const card = video.closest("[data-video-candidates]");
  try { const parsed = JSON.parse(card?.getAttribute("data-video-candidates") || "[]"); return Array.isArray(parsed) ? parsed.map((url) => String(url || "").trim()).filter(Boolean) : []; } catch { return []; }
}

export function bindReelWatchProgress(root) {
  root.querySelectorAll(".reel-view .reel-video").forEach((video) => {
    const card = video.closest("[data-video-id]");
    if (card) bindWatchProgress(video, card.dataset.videoId);
    if (video.dataset.bound === "1") return;
    video.dataset.bound = "1";
    video.addEventListener("error", () => {
      const candidates = getCandidates(video);
      const current = String(video.currentSrc || video.src || "");
      const index = candidates.findIndex((url) => url === current);
      const next = candidates[index + 1];
      if (!next) return;
      video.src = next;
      video.load();
      attemptAutoplay(video);
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
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      setTimeout(() => {
        if (!video.paused) return;
        video.muted = true;
        video.play().catch(() => {});
      }, 250);
    });
  }
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
    const play = () => attemptAutoplay(video);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
    else {
      video.addEventListener("loadeddata", play, { once: true });
      video.addEventListener("canplay", play, { once: true });
      video.addEventListener("canplaythrough", play, { once: true });
    }
  };

  if (!("IntersectionObserver" in window)) {
    videos.slice(0, 2).forEach(start);
  } else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        start(video);
        const index = videos.indexOf(video);
        const next = videos[index + 1];
        if (next) { next.preload = "auto"; if (next.readyState === HTMLMediaElement.HAVE_NOTHING) next.load(); }
      } else {
        video.pause();
      }
    }), { root, rootMargin: "1000px 0px", threshold: 0.1 });
    videos.forEach((video) => observer.observe(video));
  }

  // A user gesture on the reels surface unlocks playback on stricter mobile WebViews.
  const gestureStart = () => videos.find((video) => video.closest(".reel-view")?.matches(":hover")) || videos.find((video) => video.getBoundingClientRect().top >= -window.innerHeight * 0.5 && video.getBoundingClientRect().top < window.innerHeight * 0.75);
  const resumeVisible = () => { const video = gestureStart(); if (video) attemptAutoplay(video); };
  root.addEventListener("touchstart", resumeVisible, { passive: true });
  root.addEventListener("click", resumeVisible, { passive: true });
}
