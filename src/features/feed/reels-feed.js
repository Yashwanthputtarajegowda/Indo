import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";
import { loadArchiveKannadaVideos } from "../archive/archive-videos.js";

export async function loadReels() {
  return loadArchiveKannadaVideos({ limit: 100 });
}

export async function recordReelView(reelId) {
  if (String(reelId || "").startsWith("archive:")) {
    return { ok: true, source: "internet-archive" };
  }
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const response = await fetch(
    `${apiBase}/api/media/videos/${encodeURIComponent(reelId)}/view`,
    { method: "POST", headers },
  );
  if (!response.ok) throw new Error("Could not record reel view.");
  return response.json();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>\\"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;",
  })[char]);
}

function cleanUserId(value = "") {
  return String(value || "").trim().replace(/^@+/, "");
}

function bindWatchProgress(videoElement, mediaId) {
  if (String(mediaId || "").startsWith("archive:")) return;
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
  const creatorRaw = String(video.userId || video.username || video.creator || "Internet Archive");
  const creator = escapeHtml(creatorRaw.replace(/^@/, ""));
  const userId = escapeHtml(cleanUserId(video.userId || video.username || video.creator || "internet-archive"));
  const targetUid = escapeHtml(video.ownerUid || "");
  const caption = escapeHtml(video.caption || video.title || "");
  const id = escapeHtml(video.id);
  const likes = Number(video.likes || 0).toLocaleString();
  const mediaUrl = String(video.secureUrl || video.videoUrl || video.url || "").trim();
  const candidates = Array.isArray(video.archiveVideoCandidates)
    ? video.archiveVideoCandidates.map((url) => String(url || "").trim()).filter(Boolean)
    : [];
  const candidateUrls = candidates.length ? candidates : [mediaUrl];
  const candidateAttr = escapeHtml(JSON.stringify(candidateUrls));

  return `<article class="reel-view" data-video-id="${id}" data-source="${escapeHtml(video.source || "")}">
    <video class="reel-video" src="${escapeHtml(candidateUrls[0] || "")}" data-video-candidates="${candidateAttr}" autoplay muted loop playsinline preload="metadata"></video>
    <div class="reel-gradient"></div>
    <div class="reel-info">
      <div class="reel-user" data-profile-uid="${targetUid}" data-profile-username="${userId}">
        <button class="avatar small reel-avatar" type="button" data-profile-avatar data-profile-uid="${targetUid}" data-profile-username="${userId}" data-open-profile="${userId}" aria-label="Open @${userId} profile">${escapeHtml(creator.charAt(0).toUpperCase() || "I")}</button>
        <button class="reel-user-id" type="button" data-open-profile="${userId}" data-profile-uid="${targetUid}" data-profile-username="${userId}">@${userId}</button>
        ${targetUid ? `<button class="follow-btn" data-follow-uid="${targetUid}" type="button">Follow</button>` : ""}
      </div>
      <p>${caption}</p>
      <small>♪ Internet Archive</small>
    </div>
    <div class="reel-actions">
      <button data-engagement="like" type="button" aria-label="Like">♡<small>${likes}</small></button>
      <button data-engagement="comment" type="button" aria-label="Comment">◯<small>Comment</small></button>
      <button data-engagement="share" type="button" aria-label="Share">↗<small>Share</small></button>
      <button data-engagement="save" type="button" aria-label="Save">🔖</button>
    </div>
  </article>`;
}

function getCandidates(video) {
  try {
    const raw = video.dataset.videoCandidates || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((url) => String(url || "").trim()).filter(Boolean);
  } catch {}
  const src = String(video.currentSrc || video.src || "").trim();
  return src ? [src] : [];
}

function installArchivePlaybackFallback(video) {
  if (video.dataset.archiveFallbackBound === "1") return;
  video.dataset.archiveFallbackBound = "1";

  const candidates = getCandidates(video);
  if (!candidates.length) return;

  let index = Math.max(0, candidates.indexOf(String(video.currentSrc || video.src || "").trim()));
  let attempts = 0;
  let started = false;

  const tryNext = () => {
    if (attempts >= candidates.length) {
      video.dataset.archiveUnavailable = "1";
      video.removeAttribute("src");
      return;
    }
    const next = candidates[index];
    index += 1;
    attempts += 1;
    if (!next) return tryNext();
    video.dataset.archiveCandidateIndex = String(attempts - 1);
    video.src = next;
    video.load();
    video.play().catch(() => {});
  };

  video.addEventListener("error", () => {
    if (video.dataset.archiveUnavailable === "1") return;
    tryNext();
  });

  video.addEventListener("loadeddata", () => {
    started = true;
    video.play().catch(() => {});
  }, { once: false });

  // The first Archive URL may be present before this handler is installed.
  // If it has already failed, immediately advance to the next derivative.
  if (video.error) tryNext();
  else if (!started) video.play().catch(() => {});
}

export function bindReelWatchProgress(root) {
  root.querySelectorAll(".reel-view .reel-video").forEach((video) => {
    const card = video.closest("[data-video-id]");
    if (card) bindWatchProgress(video, card.dataset.videoId);

    if (card?.dataset.source === "internet-archive") {
      installArchivePlaybackFallback(video);
      return;
    }

    if (video.dataset.fallbackBound === "1") return;
    video.dataset.fallbackBound = "1";
    video.addEventListener("error", () => {
      const fallback = String(video.dataset.fallbackSrc || "").trim();
      if (!fallback || fallback === video.currentSrc || video.dataset.fallbackUsed === "1") return;
      video.dataset.fallbackUsed = "1";
      video.src = fallback;
      video.load();
      video.play().catch(() => {});
    });
  });
}
