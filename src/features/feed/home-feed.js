import { auth } from "../auth/firebase-client.js";
import { recordWatchProgress } from "../earning/earning.js";

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const DEFAULT_FEED_LIMIT = 10;
const FEED_ONCE_KEY_PREFIX = "indo:feed-seen:";
const FEED_STYLE_ID = "indo-feed-neon-minimal-v3";

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

function svgIcon(name) {
  const common =
    'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

  const icons = {
    like: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path ${common} d="M20.8 8.7c0 5-4.6 7.9-8.8 11.3C7.8 16.6 3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/>
    </svg>`,

    comment: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path ${common} d="M20 11.5a7.7 7.7 0 0 1-8 7.5 8.2 8.2 0 0 1-4-.9L4 20l1-3.6a7.2 7.2 0 0 1-1-4.1A7.7 7.7 0 0 1 12 4a7.7 7.7 0 0 1 8 7.5Z"/>
    </svg>`,

    share: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path ${common} d="m21 3-7.5 18-3.2-7.1L3 10.7 21 3Z"/>
      <path ${common} d="M10.3 13.9 21 3"/>
    </svg>`,

    save: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path ${common} d="M6.5 4.2A1.7 1.7 0 0 1 8.2 3h7.6a1.7 1.7 0 0 1 1.7 1.2l.5 15.6-5.9-3.5-5.9 3.5.3-15.6Z"/>
    </svg>`,

    views: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path ${common} d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/>
      <circle ${common} cx="12" cy="12" r="2.4"/>
    </svg>`,
  };

  return icons[name] || "";
}

function ensureFeedDesignStyles() {
  if (document.getElementById(FEED_STYLE_ID)) return;

  const style = document.createElement("style");

  style.id = FEED_STYLE_ID;

  style.textContent = `
    .video-post.neon-edge-post{
      position:relative;
      margin:0 0 18px;
      overflow:hidden;
      border:1px solid transparent;
      border-radius:14px;
      background:
        linear-gradient(#08080d,#08080d) padding-box,
        linear-gradient(135deg,#ff35c9 0%,#7b4cff 48%,#ff35c9 100%) border-box;
      box-shadow:
        0 0 0 1px rgba(108,81,255,.12),
        0 0 18px rgba(225,52,218,.18),
        0 10px 30px rgba(0,0,0,.18);
    }

    .video-post.neon-edge-post .neon-edge-head{
      position:relative;
      display:flex;
      align-items:center;
      justify-content:space-between;
      min-height:50px;
      padding:0 12px;
      background:#0d0d13;
      border:0;
      border-bottom:1px solid rgba(143,86,255,.2);
    }

    .video-post.neon-edge-post .neon-edge-head::before{
      content:'';
      position:absolute;
      left:14px;
      right:14px;
      top:0;
      height:1px;
      background:linear-gradient(
        90deg,
        transparent,
        #ff3bc7,
        #7a48ff,
        transparent
      );
      opacity:.9;
    }

    .video-post.neon-edge-post .post-video{
      display:block;
      width:100%;
      margin:0;
      background:#000;
      border:0;
      border-radius:0;
    }

    .video-post.neon-edge-post .neon-edge-actions{
      display:grid;
      grid-template-columns:repeat(5,minmax(0,1fr));
      align-items:stretch;
      width:100%;
      min-height:52px;
      padding:0;
      background:#09090e;
      border:0;
      border-top:1px solid rgba(226,51,207,.18);
    }

    .video-post.neon-edge-post .neon-edge-actions button{
      min-width:0;
      width:100%;
      height:52px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:5px;
      border:0;
      border-right:1px solid rgba(255,255,255,.055);
      background:transparent;
      color:#d9d9e1;
      padding:0;
      font:700 11px/1 system-ui,sans-serif;
      cursor:pointer;
    }

    .video-post.neon-edge-post .neon-edge-actions button:last-child{
      border-right:0;
    }

    .video-post.neon-edge-post .neon-edge-actions button svg{
      width:21px;
      height:21px;
      display:block;
      flex:0 0 21px;
      overflow:visible;
    }

    .video-post.neon-edge-post .neon-edge-actions button small{
      font-size:11px;
      font-weight:700;
      color:inherit;
    }

    .video-post.neon-edge-post .neon-edge-actions button:hover{
      color:#fff;
      text-shadow:0 0 8px rgba(145,92,255,.55);
    }

    .video-post.neon-edge-post
    .neon-edge-actions
    button.is-active.like-action{
      color:#ff4fbf;
      text-shadow:0 0 10px rgba(255,79,191,.7);
    }

    .video-post.neon-edge-post
    .neon-edge-actions
    button.is-active.save-action{
      color:#a778ff;
      text-shadow:0 0 10px rgba(167,120,255,.65);
    }

    /*
      TITLE AREA
      User ID is intentionally NOT rendered here.
    */
    .video-post.neon-edge-post .neon-edge-copy{
      display:flex;
      align-items:center;
      width:100%;
      min-width:0;
      box-sizing:border-box;
      padding:8px 12px 12px;
      background:#08080d;
      border:0;
    }

    .video-post.neon-edge-post .neon-edge-title-row{
      width:100%;
      min-width:0;
      display:flex;
      align-items:center;
      gap:8px;
    }

    .video-post.neon-edge-post .neon-edge-title{
      flex:1 1 auto;
      min-width:0;
      margin:0;
      color:#f4f4f7;
      font-size:13px;
      font-weight:700;
      line-height:1.35;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .video-post.neon-edge-post .neon-edge-title-more{
      flex:0 0 auto;
      border:0;
      background:transparent;
      color:#a778ff;
      padding:2px 0;
      margin:0;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
      white-space:nowrap;
    }

    .video-post.neon-edge-post .neon-edge-title-more:hover{
      color:#ff4fc4;
      text-shadow:0 0 8px rgba(255,79,196,.5);
    }

    .video-post.neon-edge-post .neon-edge-more{
      width:30px;
      height:30px;
      display:grid;
      place-items:center;
      border:0;
      border-radius:50%;
      background:#11111a;
      color:#fff;
    }

    .video-post.neon-edge-post .neon-edge-creator{
      display:flex;
      flex-direction:row;
      align-items:center;
      gap:8px;
      min-width:0;
      border:0;
      background:transparent;
      color:#fff;
      padding:0;
      margin:0;
      cursor:pointer;
    }

    .video-post.neon-edge-post .neon-edge-avatar{
      width:34px;
      height:34px;
      min-width:34px;
      display:grid;
      place-items:center;
      border-radius:50%;
      background:#24242d;
      color:#fff;
      font-weight:800;
      overflow:hidden;
    }

    .video-post.neon-edge-post .neon-edge-avatar img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    .video-post.neon-edge-post .neon-edge-name{
      font-size:13px;
      font-weight:700;
      line-height:1;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .video-post.neon-edge-post .neon-edge-more{
      margin-left:auto;
    }

    /*
      FULL DETAILS SHEET
    */
    .indo-post-details-backdrop{
      position:fixed;
      inset:0;
      z-index:13000;
      display:grid;
      place-items:end center;
      background:rgba(0,0,0,.72);
      padding:0;
      animation:indoDetailsFade .16s ease-out;
    }

    .indo-post-details-sheet{
      width:min(560px,100%);
      max-height:82vh;
      overflow:auto;
      box-sizing:border-box;
      background:#101017;
      border:1px solid rgba(167,120,255,.35);
      border-bottom:0;
      border-radius:20px 20px 0 0;
      padding:16px;
      color:#f3f3f7;
      box-shadow:
        0 -20px 60px rgba(0,0,0,.65),
        0 0 30px rgba(122,72,255,.12);
      animation:indoDetailsUp .2s ease-out;
    }

    .indo-post-details-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:14px;
    }

    .indo-post-details-head strong{
      font-size:15px;
      font-weight:800;
    }

    .indo-post-details-close{
      width:34px;
      height:34px;
      border:0;
      border-radius:50%;
      background:#1b1b25;
      color:#fff;
      font-size:21px;
      line-height:1;
      cursor:pointer;
    }

    .indo-post-details-title{
      margin:0 0 14px;
      font-size:18px;
      font-weight:800;
      line-height:1.4;
      color:#fff;
      word-break:break-word;
    }

    .indo-post-details-meta{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:8px;
      margin-bottom:14px;
    }

    .indo-post-details-stat{
      padding:11px 8px;
      border:1px solid rgba(255,255,255,.07);
      border-radius:11px;
      background:#17171f;
      text-align:center;
    }

    .indo-post-details-stat b{
      display:block;
      font-size:14px;
      color:#fff;
    }

    .indo-post-details-stat span{
      display:block;
      margin-top:3px;
      font-size:10px;
      color:#8f8f9e;
      text-transform:uppercase;
      letter-spacing:.5px;
    }

    .indo-post-details-description{
      margin:0;
      padding:12px;
      border-radius:12px;
      background:#15151d;
      border:1px solid rgba(255,255,255,.06);
      color:#c8c8d1;
      font-size:13px;
      line-height:1.55;
      white-space:pre-wrap;
      word-break:break-word;
    }

    @keyframes indoDetailsFade{
      from{opacity:0}
      to{opacity:1}
    }

    @keyframes indoDetailsUp{
      from{transform:translateY(35px);opacity:.7}
      to{transform:translateY(0);opacity:1}
    }

    .indo-comments-backdrop{
      position:fixed;
      inset:0;
      z-index:12000;
      background:rgba(0,0,0,.66);
      display:grid;
      place-items:end center;
      padding:0;
    }

    .indo-comments-sheet{
      width:min(520px,100%);
      max-height:72vh;
      background:#111117;
      border:1px solid #292938;
      border-bottom:0;
      border-radius:18px 18px 0 0;
      padding:14px 14px 18px;
      box-shadow:0 -18px 50px rgba(0,0,0,.5);
    }

    .indo-comments-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:10px;
    }

    .indo-comments-list{
      max-height:48vh;
      overflow:auto;
      display:grid;
      gap:10px;
      padding:4px 0 8px;
    }

    .indo-comment{
      padding:9px 10px;
      border-radius:10px;
      background:#17171f;
      border:1px solid #22222d;
      color:#e7e7ec;
      font-size:12px;
    }

    .indo-comment b{
      display:block;
      color:#fff;
      margin-bottom:3px;
    }

    .indo-comment-form{
      display:flex;
      gap:8px;
      margin-top:10px;
    }

    .indo-comment-form input{
      flex:1;
      min-width:0;
      height:40px;
      border-radius:10px;
      border:1px solid #292934;
      background:#0c0c12;
      color:#fff;
      padding:0 12px;
      outline:none;
    }

    .indo-comment-form button{
      width:44px;
      height:40px;
      border-radius:10px;
      background:linear-gradient(135deg,#743cff,#d23cae);
      color:#fff;
      font-weight:800;
    }

    .indo-feed-menu{
      position:absolute;
      right:8px;
      top:42px;
      z-index:1000;
      min-width:160px;
      padding:6px;
      border:1px solid rgba(255,255,255,.12);
      border-radius:12px;
      background:#15151c;
      box-shadow:0 12px 32px rgba(0,0,0,.55);
    }

    .indo-feed-menu button{
      display:block;
      width:100%;
      padding:10px 12px;
      border:0;
      border-radius:8px;
      background:transparent;
      color:#fff;
      text-align:left;
      font:600 13px/1.2 system-ui,sans-serif;
      cursor:pointer;
    }

    .indo-feed-menu button:hover{
      background:#22222d;
    }

    @media (max-width:360px){
      .video-post.neon-edge-post .neon-edge-actions button{
        font-size:10px;
        gap:3px;
      }

      .video-post.neon-edge-post .neon-edge-actions button svg{
        width:19px;
        height:19px;
        flex-basis:19px;
      }

      .video-post.neon-edge-post .neon-edge-title{
        font-size:12px;
      }

      .video-post.neon-edge-post .neon-edge-title-more{
        font-size:11px;
      }
    }
  `;

  document.head.appendChild(style);
}

function cloudinaryBrowserUrl(rawUrl) {
  const url = String(rawUrl || "").trim();

  if (
    !url ||
    !url.includes("res.cloudinary.com") ||
    !url.includes("/video/upload/")
  ) {
    return url;
  }

  const marker = "/video/upload/";
  const index = url.indexOf(marker);

  if (index < 0) return url;

  const prefix = url.slice(0, index + marker.length);
  const rest = url.slice(index + marker.length);

  if (rest.startsWith("f_mp4,vc_h264,ac_aac/")) {
    return url;
  }

  const queryIndex = rest.indexOf("?");
  const path =
    queryIndex >= 0 ? rest.slice(0, queryIndex) : rest;
  const query =
    queryIndex >= 0 ? rest.slice(queryIndex) : "";

  return `${prefix}f_mp4,vc_h264,ac_aac/${path}${query}`;
}

function getFeedSeenKey() {
  return `${FEED_ONCE_KEY_PREFIX}${String(auth.currentUser?.uid || "guest")}`;
}

function readFeedSeen() {
  try {
    const value = JSON.parse(
      localStorage.getItem(getFeedSeenKey()) || "{}",
    );

    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function markFeedSeen(videos) {
  if (
    !auth.currentUser ||
    !Array.isArray(videos) ||
    !videos.length
  ) {
    return;
  }

  const seen = readFeedSeen();
  const now = Date.now();

  for (const video of videos) {
    const id = String(video?.id || "").trim();

    if (id) {
      seen[id] = now;
    }
  }

  const entries = Object.entries(seen)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 5000);

  localStorage.setItem(
    getFeedSeenKey(),
    JSON.stringify(Object.fromEntries(entries)),
  );
}

function shuffleVideos(items) {
  const result = Array.isArray(items) ? [...items] : [];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function filterAndTakeOnce(videos, limit) {
  const all = shuffleVideos(videos);

  if (!auth.currentUser) {
    return all.slice(0, limit);
  }

  const seen = readFeedSeen();

  const fresh = all.filter((video) => {
    const id = String(video?.id || "").trim();

    return !id || !seen[id];
  });

  if (fresh.length) {
    const selected = fresh.slice(0, limit);

    markFeedSeen(selected);

    return selected;
  }

  return shuffleVideos(all).slice(0, limit);
}

async function fetchVideos(apiBase, headers, query) {
  const response = await fetch(
    `${apiBase}/api/media/videos${query}`,
    {
      headers,
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.error ||
        `Could not load videos (${response.status}).`,
    );
  }

  const data = await response.json().catch(() => ({}));

  return Array.isArray(data.videos) ? data.videos : [];
}

export async function loadHomeVideos(
  limit = DEFAULT_FEED_LIMIT,
) {
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};

  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const requested = Math.max(
    1,
    Math.min(50, Number(limit) || DEFAULT_FEED_LIMIT),
  );

  const fetchLimit = Math.max(requested * 5, 50);

  const typed = await fetchVideos(
    apiBase,
    headers,
    `?type=video&limit=${fetchLimit}`,
  );

  if (typed.length) {
    return filterAndTakeOnce(typed, requested);
  }

  const fallback = await fetchVideos(
    apiBase,
    headers,
    `?limit=${fetchLimit}`,
  );

  return filterAndTakeOnce(
    fallback.filter((item) =>
      ["video", "mp4", "reel"].includes(
        String(
          item.mediaType || item.resourceType || "video",
        ).toLowerCase(),
      ),
    ),
    requested,
  );
}

export async function recordVideoView(videoId) {
  const apiBase = window.INDO_API_BASE || "";
  const headers = {};

  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  await fetch(
    `${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/view`,
    {
      method: "POST",
      headers,
    },
  );
}

export async function deleteVideo(videoId) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const response = await fetch(
    `${window.INDO_API_BASE || ""}/api/media/videos/${encodeURIComponent(videoId)}/delete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.error ||
        `Delete failed (${response.status}).`,
    );
  }

  return data;
}

function maybeRecordVideoView(videoId) {
  const uid = auth.currentUser?.uid;

  if (!uid || !videoId) return;

  const key = `indo:view:${uid}:${videoId}`;
  const now = Date.now();
  const last = Number(localStorage.getItem(key) || 0);

  if (
    Number.isFinite(last) &&
    now - last < VIEW_COOLDOWN_MS
  ) {
    return;
  }

  localStorage.setItem(key, String(now));

  recordVideoView(videoId).catch(() => {
    localStorage.removeItem(key);
  });
}

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

function stopOtherVideos(current) {
  document.querySelectorAll("video").forEach((video) => {
    if (video !== current && !video.paused) {
      video.pause();
    }
  });
}

function enableAudioFromInteraction(current) {
  if (!(current instanceof HTMLVideoElement)) {
    return;
  }

  stopOtherVideos(current);

  current.autoplay = true;
  current.removeAttribute("muted");
  current.defaultMuted = false;
  current.muted = false;
  current.volume = 1;

  window.__indoAudioUnlocked = true;

  current.play().catch(() => {});
}

function bindGlobalAudioUnlock() {
  if (window.__indoGlobalAudioUnlockBound) {
    return;
  }

  window.__indoGlobalAudioUnlockBound = true;

  const unlock = () => {
    if (window.__indoAudioUnlocked) {
      return;
    }

    const current = document.querySelector(
      ".post-video:not([hidden])",
    );

    if (current instanceof HTMLVideoElement) {
      enableAudioFromInteraction(current);
    }
  };

  document.addEventListener("pointerdown", unlock, {
    capture: true,
    passive: true,
  });

  document.addEventListener("touchstart", unlock, {
    capture: true,
    passive: true,
  });

  document.addEventListener("keydown", unlock, {
    capture: true,
    passive: true,
  });
}

function enforceSingleVideoPlayback() {
  if (window.__indoSingleVideoPlaybackBound) {
    return;
  }

  window.__indoSingleVideoPlaybackBound = true;

  document.addEventListener(
    "play",
    (event) => {
      const current =
        event.target instanceof HTMLVideoElement
          ? event.target
          : null;

      if (!current) return;

      stopOtherVideos(current);
      window.__indoActiveVideo = current;
    },
    true,
  );

  document.addEventListener(
    "playing",
    (event) => {
      const current =
        event.target instanceof HTMLVideoElement
          ? event.target
          : null;

      if (!current) return;

      stopOtherVideos(current);
      window.__indoActiveVideo = current;
    },
    true,
  );

  document.addEventListener(
    "pause",
    (event) => {
      if (event.target === window.__indoActiveVideo) {
        window.__indoActiveVideo = null;
      }
    },
    true,
  );
}

function getPostTitle(video) {
  return String(
    video?.title ||
      video?.postTitle ||
      video?.caption ||
      video?.description ||
      "",
  ).trim();
}

function isTitleLong(title) {
  return title.length > 58;
}

export function renderVideoCard(video) {
  ensureFeedDesignStyles();

  const creatorRaw = String(video.creator || "@indo");

  const creator = escapeHtml(creatorRaw);

  const usernameKey = escapeHtml(
    creatorRaw.replace(/^@/, ""),
  );

  const ownerUid = escapeHtml(video.ownerUid || "");

  const creatorAvatar = escapeHtml(
    video.creatorAvatar ||
      video.avatarUrl ||
      video.profilePhoto ||
      video.photoURL ||
      "",
  );

  /*
    IMPORTANT:
    We use title here.
    User ID is NOT included in the caption area.
  */
  const postTitle = getPostTitle(video);

  const safeTitle = escapeHtml(postTitle);

  const views = Number(video.views || 0).toLocaleString();

  const likes = Number(video.likes || 0).toLocaleString();

  const comments = Number(
    video.comments || 0,
  ).toLocaleString();

  const shares = Number(video.shares || 0).toLocaleString();

  const saves = Number(video.saves || 0).toLocaleString();

  const rawMediaUrl =
    video.secureUrl || video.videoUrl || video.url || "";

  const mediaUrl = cloudinaryBrowserUrl(rawMediaUrl);

  const fallbackUrl =
    rawMediaUrl && mediaUrl !== rawMediaUrl
      ? rawMediaUrl
      : "";

  const poster = video.thumbnailUrl
    ? ` poster="${escapeHtml(video.thumbnailUrl)}"`
    : "";

  const initial = escapeHtml(
    creatorRaw.replace(/^@/, "").charAt(0).toUpperCase() ||
      "I",
  );

  const avatar = creatorAvatar
    ? `
        <span class="neon-edge-avatar">
          <img
            src="${creatorAvatar}"
            alt="${creator}"
            loading="lazy"
          >
        </span>
      `
    : `
        <span class="neon-edge-avatar">
          ${initial}
        </span>
      `;

  const source = mediaUrl
    ? `
      <video
        class="post-video"
        playsinline
        preload="metadata"
        data-original-video-src="${escapeHtml(rawMediaUrl)}"
        data-video-src="${escapeHtml(mediaUrl)}"
        ${poster}
      >
        <source
          src="${escapeHtml(mediaUrl)}"
          type="video/mp4"
        >
        ${fallbackUrl ? `<source src="${escapeHtml(fallbackUrl)}">` : ""}
      </video>
    `
    : `
      <div class="post-video video-unavailable">
        Video unavailable
      </div>
    `;

  const showMore = isTitleLong(postTitle);

  return `
    <article
      class="post-card video-post neon-edge-post"
      data-video-id="${escapeHtml(video.id)}"
      data-owner-uid="${ownerUid}"
      data-post-title="${safeTitle}"
      data-post-description="${escapeHtml(video.description || postTitle)}"
      data-post-likes="${likes}"
      data-post-views="${views}"
      data-post-comments="${comments}"
      data-post-shares="${shares}"
      data-post-saves="${saves}"
    >

      <div class="post-head neon-edge-head">

        <button
          class="post-creator neon-edge-creator"
          type="button"
          data-profile-username="${usernameKey}"
          data-profile-uid="${ownerUid}"
          aria-label="Open ${creator} profile"
        >
          ${avatar}

          <span class="neon-edge-name">
            ${creator}
          </span>
        </button>

        <button
          class="icon-btn post-more neon-edge-more"
          type="button"
          data-feed-more
          aria-label="More options"
        >
          ⋯
        </button>

      </div>

      ${source}

      <div
        class="post-actions neon-edge-actions"
        aria-label="Post actions"
      >

        <button
          class="like-action"
          data-engagement="like"
          data-liked="0"
          aria-label="Like"
        >
          ${svgIcon("like")}
          <small>${likes}</small>
        </button>

        <button
          data-engagement="comment"
          aria-label="Comment"
        >
          ${svgIcon("comment")}
          <small>${comments}</small>
        </button>

        <button
          data-engagement="share"
          aria-label="Share"
        >
          ${svgIcon("share")}
          <small>${shares}</small>
        </button>

        <button
          class="save-action"
          data-engagement="save"
          data-saved="0"
          aria-label="Save"
        >
          ${svgIcon("save")}
          <small>${saves}</small>
        </button>

        <button
          class="views-action"
          aria-label="Views"
        >
          ${svgIcon("views")}
          <small>${views}</small>
        </button>

      </div>

      ${
        postTitle
          ? `
            <div class="post-copy neon-edge-copy">

              <div class="neon-edge-title-row">

                <p
                  class="neon-edge-title"
                  title="${safeTitle}"
                >
                  ${safeTitle}
                </p>

                ${
                  showMore
                    ? `
                      <button
                        type="button"
                        class="neon-edge-title-more"
                        data-post-more
                        aria-label="Read full post"
                      >
                        More
                      </button>
                    `
                    : ""
                }

              </div>

            </div>
          `
          : ""
      }

    </article>
  `;
}

function openPostDetails(card) {
  if (!card) return;

  document
    .querySelector(".indo-post-details-backdrop")
    ?.remove();

  const title = String(card.dataset.postTitle || "").trim();

  const description = String(
    card.dataset.postDescription || title,
  ).trim();

  const likes = card.dataset.postLikes || "0";

  const views = card.dataset.postViews || "0";

  const comments = card.dataset.postComments || "0";

  const shares = card.dataset.postShares || "0";

  const saves = card.dataset.postSaves || "0";

  const creator =
    card
      .querySelector(".neon-edge-name")
      ?.textContent?.trim() || "";

  const backdrop = document.createElement("div");

  backdrop.className = "indo-post-details-backdrop";

  backdrop.innerHTML = `
    <section
      class="indo-post-details-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Post details"
    >

      <div class="indo-post-details-head">

        <strong>
          ${escapeHtml(creator || "Post")}
        </strong>

        <button
          type="button"
          class="indo-post-details-close"
          data-post-details-close
          aria-label="Close"
        >
          ×
        </button>

      </div>

      <h2 class="indo-post-details-title">
        ${escapeHtml(title)}
      </h2>

      <div class="indo-post-details-meta">

        <div class="indo-post-details-stat">
          <b>${escapeHtml(likes)}</b>
          <span>Likes</span>
        </div>

        <div class="indo-post-details-stat">
          <b>${escapeHtml(views)}</b>
          <span>Views</span>
        </div>

        <div class="indo-post-details-stat">
          <b>${escapeHtml(comments)}</b>
          <span>Comments</span>
        </div>

      </div>

      <p class="indo-post-details-description">
        ${escapeHtml(description)}
      </p>

    </section>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();

  backdrop
    .querySelector("[data-post-details-close]")
    ?.addEventListener("click", close);

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      close();
    }
  });
}

function bindPostDetailsButtons(root) {
  root
    .querySelectorAll("[data-post-more]")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const card = button.closest("[data-video-id]");

        openPostDetails(card);
      });
    });

  if (!window.__indoPostDetailsEscapeBound) {
    window.__indoPostDetailsEscapeBound = true;

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document
          .querySelector(".indo-post-details-backdrop")
          ?.remove();
      }
    });
  }
}

function closeAllFeedMenus(except = null) {
  document
    .querySelectorAll(".indo-feed-menu")
    .forEach((menu) => {
      if (menu !== except) {
        menu.remove();
      }
    });
}

async function handleFeedDelete(button, card, menu) {
  const videoId = String(
    card?.dataset.videoId || "",
  ).trim();

  if (!videoId) {
    menu.remove();
    return;
  }

  const user = auth.currentUser;

  if (
    !user ||
    String(card.dataset.ownerUid || "") !==
      String(user.uid || "")
  ) {
    menu.remove();
    return;
  }

  if (!window.confirm("Delete this video permanently?")) {
    return;
  }

  button.disabled = true;
  button.textContent = "Deleting...";

  try {
    await deleteVideo(videoId);

    const seen = readFeedSeen();

    delete seen[videoId];

    localStorage.setItem(
      getFeedSeenKey(),
      JSON.stringify(seen),
    );

    menu.remove();

    card.querySelector("video")?.pause();

    card.remove();
  } catch (error) {
    button.disabled = false;

    button.textContent = error?.message || "Delete video";
  }
}

async function shareVideo(card) {
  const url = `${window.location.origin}${window.location.pathname}#video=${encodeURIComponent(card.dataset.videoId || "")}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Indo video",
        url,
      });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("Share failed:", error);
    }
  }
}

async function setSaved(card) {
  const user = auth.currentUser;

  if (!user) return;

  const button = card.querySelector(
    '[data-engagement="save"]',
  );

  const next = button?.dataset.saved !== "1";

  try {
    const response = await fetch(
      `${window.INDO_API_BASE || ""}/api/media/${encodeURIComponent(card.dataset.videoId)}/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          save: next,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Could not update save.");
    }

    button.dataset.saved = next ? "1" : "0";

    button.classList.toggle("is-active", next);
  } catch (error) {
    console.warn("Save failed:", error);
  }
}

function openFeedMoreMenu(button, card) {
  closeAllFeedMenus();

  const menu = document.createElement("div");

  menu.className = "indo-feed-menu";

  const isOwner = Boolean(
    auth.currentUser?.uid &&
    String(card.dataset.ownerUid || "") ===
      String(auth.currentUser.uid),
  );

  menu.innerHTML = `
    ${isOwner ? '<button type="button" data-feed-action="delete">Delete video</button>' : ""}

    <button
      type="button"
      data-feed-action="save"
    >
      Save
    </button>

    <button
      type="button"
      data-feed-action="share"
    >
      Share
    </button>

    <button
      type="button"
      data-feed-action="report"
    >
      Report
    </button>

    <button
      type="button"
      data-feed-action="close"
    >
      Cancel
    </button>
  `;

  menu.querySelectorAll("button").forEach((item) => {
    item.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const action = item.dataset.feedAction;

      if (action === "close") {
        menu.remove();
        return;
      }

      if (action === "delete") {
        await handleFeedDelete(item, card, menu);
        return;
      }

      if (action === "share") {
        await shareVideo(card);
      }

      if (action === "save") {
        await setSaved(card);
      }

      menu.remove();
    });
  });

  const head = card.querySelector(".post-head");

  if (!head) return;

  head.style.position = "relative";

  head.appendChild(menu);
}

function bindFeedMoreMenus(root) {
  root
    .querySelectorAll("[data-feed-more]")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const card = button.closest("[data-video-id]");

        if (!card) return;

        const existing = card.querySelector(
          ".indo-feed-menu",
        );

        if (existing) {
          existing.remove();
        } else {
          openFeedMoreMenu(button, card);
        }
      });
    });

  if (!window.__indoFeedMenuGlobalBound) {
    window.__indoFeedMenuGlobalBound = true;

    document.addEventListener("click", () =>
      closeAllFeedMenus(),
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllFeedMenus();
      }
    });
  }
}

function loadVideoSource(video) {
  if (video.dataset.loaded === "1") {
    return true;
  }

  const source = video.dataset.videoSrc;

  if (!source) {
    return false;
  }

  video.src = source;
  video.dataset.loaded = "1";
  video.preload = "auto";
  video.load();

  return true;
}

function bindLazyVideo(video, videoId) {
  let observer = null;

  const card = video.closest("[data-video-id]");

  const originalSource = String(
    video.dataset.originalVideoSrc || "",
  );

  const transformedSource = String(
    video.dataset.videoSrc || "",
  );

  const hideBrokenCard = () => {
    observer?.disconnect();
    card?.remove();
  };

  let hasRetriedOriginal = false;

  const retryOriginalSource = () => {
    if (!originalSource || hasRetriedOriginal) {
      hideBrokenCard();
      return;
    }

    hasRetriedOriginal = true;

    video.dataset.loaded = "0";
    video.dataset.videoSrc = originalSource;

    video.src = originalSource;

    video.load();
  };

  const playIfVisible = () => {
    if (!loadVideoSource(video)) {
      return;
    }

    stopOtherVideos(video);

    video.autoplay = true;

    if (window.__indoAudioUnlocked) {
      video.removeAttribute("muted");

      video.defaultMuted = false;
      video.muted = false;
      video.volume = 1;
    } else {
      video.muted = true;
    }

    video.play().catch(() => {});
  };

  const pause = () => {
    if (!video.paused) {
      video.pause();
    }
  };

  video.addEventListener("error", () => {
    if (video.dataset.videoSrc === transformedSource) {
      retryOriginalSource();
    } else {
      hideBrokenCard();
    }
  });

  video.addEventListener("abort", () => {
    if (video.dataset.videoSrc === transformedSource) {
      retryOriginalSource();
    } else {
      hideBrokenCard();
    }
  });

  video.addEventListener(
    "play",
    () => maybeRecordVideoView(videoId),
    {
      passive: true,
    },
  );

  video.addEventListener(
    "pointerdown",
    () => enableAudioFromInteraction(video),
    { passive: true },
  );

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.45
          ) {
            playIfVisible();
          } else {
            pause();
          }
        });
      },
      {
        threshold: [0, 0.45, 0.9],
        rootMargin: "120px 0px",
      },
    );

    observer.observe(video);
  } else {
    playIfVisible();
  }

  video.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!loadVideoSource(video)) {
      return;
    }

    if (video.paused) {
      enableAudioFromInteraction(video);
    } else {
      video.pause();
    }
  });

  bindWatchProgress(video, videoId);
}

async function getEngagement(videoId) {
  const user = auth.currentUser;

  if (!user) return null;

  const token = await user.getIdToken();

  const response = await fetch(
    `${window.INDO_API_BASE || ""}/api/media/${encodeURIComponent(videoId)}/engagement`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
}

async function setLike(card) {
  const user = auth.currentUser;

  if (!user) return;

  const button = card.querySelector(
    '[data-engagement="like"]',
  );

  const next = button?.dataset.liked !== "1";

  try {
    const response = await fetch(
      `${window.INDO_API_BASE || ""}/api/media/${encodeURIComponent(card.dataset.videoId)}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          like: next,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || "Could not update like.",
      );
    }

    button.dataset.liked = next ? "1" : "0";

    button.classList.toggle("is-active", next);

    const small = button.querySelector("small");

    if (small) {
      small.textContent = String(
        Number(data.likes ?? small.textContent ?? 0),
      );
    }
  } catch (error) {
    console.warn("Like failed:", error);
  }
}

async function openComments(card) {
  const user = auth.currentUser;

  if (!user) return;

  document
    .querySelector(".indo-comments-backdrop")
    ?.remove();

  const backdrop = document.createElement("div");

  backdrop.className = "indo-comments-backdrop";

  backdrop.innerHTML = `
    <section
      class="indo-comments-sheet"
    >

      <div
        class="indo-comments-head"
      >

        <strong>
          Comments
        </strong>

        <button
          type="button"
          data-comment-close
        >
          ×
        </button>

      </div>

      <div
        class="indo-comments-list"
        data-comment-list
      >
        Loading...
      </div>

      <form
        class="indo-comment-form"
      >

        <input
          name="text"
          maxlength="500"
          placeholder="Add a comment…"
          autocomplete="off"
        >

        <button
          type="submit"
        >
          ↗
        </button>

      </form>

    </section>
  `;

  document.body.appendChild(backdrop);

  backdrop
    .querySelector("[data-comment-close]")
    ?.addEventListener("click", () => backdrop.remove());

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      backdrop.remove();
    }
  });

  const list = backdrop.querySelector(
    "[data-comment-list]",
  );

  try {
    const token = await user.getIdToken();

    const response = await fetch(
      `${window.INDO_API_BASE || ""}/api/media/${encodeURIComponent(card.dataset.videoId)}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json().catch(() => ({}));

    const comments = Array.isArray(data.comments)
      ? data.comments
      : [];

    list.innerHTML = comments.length
      ? comments
          .map(
            (item) => `
                <div class="indo-comment">
                  <b>
                    ${escapeHtml(item.username || "@user")}
                  </b>

                  ${escapeHtml(item.text || "")}
                </div>
              `,
          )
          .join("")
      : `
          <div class="indo-comment">
            No comments yet.
          </div>
        `;
  } catch {
    list.textContent = "Could not load comments.";
  }

  backdrop
    .querySelector("form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const input = backdrop.querySelector("input");

      const text = String(input?.value || "").trim();

      if (!text) return;

      const response = await fetch(
        `${window.INDO_API_BASE || ""}/api/media/${encodeURIComponent(card.dataset.videoId)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            text,
          }),
        },
      );

      if (response.ok) {
        input.value = "";

        await openComments(card);
      }
    });
}

async function bindEngagementButtons(root) {
  root
    .querySelectorAll("[data-video-id]")
    .forEach(async (card) => {
      const like = card.querySelector(
        '[data-engagement="like"]',
      );

      const save = card.querySelector(
        '[data-engagement="save"]',
      );

      const comment = card.querySelector(
        '[data-engagement="comment"]',
      );

      const share = card.querySelector(
        '[data-engagement="share"]',
      );

      if (like) {
        like.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          setLike(card);
        });
      }

      if (save) {
        save.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();

          await setSaved(card);
        });
      }

      if (comment) {
        comment.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          openComments(card);
        });
      }

      if (share) {
        share.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          shareVideo(card);
        });
      }

      const data = await getEngagement(
        card.dataset.videoId,
      );

      if (!data) return;

      if (like) {
        like.dataset.liked = data.liked ? "1" : "0";

        like.classList.toggle(
          "is-active",
          Boolean(data.liked),
        );

        const small = like.querySelector("small");

        if (small) {
          small.textContent = String(
            Number(data.likes || 0),
          );
        }
      }

      if (save) {
        save.dataset.saved = data.saved ? "1" : "0";

        save.classList.toggle(
          "is-active",
          Boolean(data.saved),
        );
      }
    });
}

export function bindVideoCards(root) {
  ensureFeedDesignStyles();

  bindGlobalAudioUnlock();

  enforceSingleVideoPlayback();

  root
    .querySelectorAll(
      "[data-video-id] .post-video[data-video-src]",
    )
    .forEach((video) => {
      const card = video.closest("[data-video-id]");

      if (card) {
        bindLazyVideo(video, card.dataset.videoId);
      }
    });

  bindPostDetailsButtons(root);

  bindFeedMoreMenus(root);

  bindEngagementButtons(root);
}
