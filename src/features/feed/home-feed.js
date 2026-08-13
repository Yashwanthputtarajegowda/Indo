import { auth } from '../auth/firebase-client.js';
import { recordWatchProgress } from '../earning/earning.js';

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const DEFAULT_FEED_LIMIT = 10;
const FEED_ONCE_KEY_PREFIX = 'indo:feed-seen:';
const FEED_STYLE_ID = 'indo-feed-neon-edge-v11';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char]));
}

function ensureFeedDesignStyles() {
  if (document.getElementById(FEED_STYLE_ID)) return;
  const style = document.createElement('style');
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
      box-shadow:0 0 0 1px rgba(108,81,255,.12),0 0 18px rgba(225,52,218,.18),0 10px 30px rgba(0,0,0,.18);
    }
    .video-post.neon-edge-post .neon-edge-head{
      position:relative;display:flex;align-items:center;justify-content:space-between;
      min-height:50px;padding:0 12px;background:#0d0d13;
      border:0;border-bottom:1px solid rgba(143,86,255,.2);
    }
    .video-post.neon-edge-post .neon-edge-head::before{
      content:'';position:absolute;left:14px;right:14px;top:0;height:1px;
      background:linear-gradient(90deg,transparent,#ff3bc7,#7a48ff,transparent);opacity:.9;
    }
    .video-post.neon-edge-post .post-video{
      display:block;width:100%;margin:0;background:#000;border:0;border-radius:0;
    }
    .video-post.neon-edge-post .neon-edge-actions{
      display:flex;align-items:center;gap:16px;min-height:46px;padding:0 12px;
      background:#0a0a10;border:0;border-top:1px solid rgba(226,51,207,.2);
    }
    .video-post.neon-edge-post .neon-edge-actions button{
      border:0;background:transparent;color:#f7f7fb;padding:5px 0;font:500 14px/1 system-ui,sans-serif;
    }
    .video-post.neon-edge-post .neon-edge-actions button small{font-size:12px;color:#f3f3f6;margin-left:2px}
    .video-post.neon-edge-post .neon-edge-copy{
      display:block;padding:4px 12px 13px;background:#08080d;border:0;
    }
    .video-post.neon-edge-post .neon-edge-copy strong{
      display:block;font-size:12px;color:#f4f4f7;line-height:1.3;margin:0;
    }
    .video-post.neon-edge-post .neon-edge-caption{
      display:block;margin:3px 0 0;font-size:12px;color:#bfc0c9;line-height:1.35;
    }
    .video-post.neon-edge-post .neon-edge-more{
      width:30px;height:30px;display:grid;place-items:center;border:0;
      border-radius:50%;background:#11111a;color:#fff;
    }
    .video-post.neon-edge-post .neon-edge-creator{
      display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0;
      border:0;background:transparent;color:#fff;padding:0;margin:0;
    }
    .video-post.neon-edge-post .neon-edge-avatar{
      width:34px;height:34px;min-width:34px;display:grid;place-items:center;
      border-radius:50%;background:#24242d;color:#fff;font-weight:800;overflow:hidden;
    }
    .video-post.neon-edge-post .neon-edge-avatar img{width:100%;height:100%;object-fit:cover;display:block}
    .video-post.neon-edge-post .neon-edge-name{
      font-size:13px;font-weight:700;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
  `;
  document.head.appendChild(style);
}

function cloudinaryBrowserUrl(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url;
  const marker = '/video/upload/';
  const index = url.indexOf(marker);
  if (index < 0) return url;
  const prefix = url.slice(0, index + marker.length);
  const rest = url.slice(index + marker.length);
  if (rest.startsWith('f_mp4,vc_h264,ac_aac/')) return url;
  const queryIndex = rest.indexOf('?');
  const path = queryIndex >= 0 ? rest.slice(0, queryIndex) : rest;
  const query = queryIndex >= 0 ? rest.slice(queryIndex) : '';
  return `${prefix}f_mp4,vc_h264,ac_aac/${path}${query}`;
}

function getFeedSeenKey() { return `${FEED_ONCE_KEY_PREFIX}${String(auth.currentUser?.uid || 'guest')}`; }
function readFeedSeen() {
  try {
    const value = JSON.parse(localStorage.getItem(getFeedSeenKey()) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}
function markFeedSeen(videos) {
  if (!auth.currentUser || !Array.isArray(videos) || !videos.length) return;
  const seen = readFeedSeen();
  const now = Date.now();
  for (const video of videos) {
    const id = String(video?.id || '').trim();
    if (id) seen[id] = now;
  }
  const entries = Object.entries(seen).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0)).slice(0, 5000);
  localStorage.setItem(getFeedSeenKey(), JSON.stringify(Object.fromEntries(entries)));
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
  if (!auth.currentUser) return all.slice(0, limit);
  const seen = readFeedSeen();
  const fresh = all.filter((video) => {
    const id = String(video?.id || '').trim();
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
  const response = await fetch(`${apiBase}/api/media/videos${query}`, { headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Could not load videos (${response.status}).`);
  }
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function loadHomeVideos(limit = DEFAULT_FEED_LIMIT) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const requested = Math.max(1, Math.min(50, Number(limit) || DEFAULT_FEED_LIMIT));
  const fetchLimit = Math.max(requested * 5, 50);
  const typed = await fetchVideos(apiBase, headers, `?type=video&limit=${fetchLimit}`);
  if (typed.length) return filterAndTakeOnce(typed, requested);
  const fallback = await fetchVideos(apiBase, headers, `?limit=${fetchLimit}`);
  const videos = fallback.filter((item) => {
    const type = String(item.mediaType || item.resourceType || 'video').toLowerCase();
    return type === 'video' || type === 'mp4' || type === 'reel';
  });
  return filterAndTakeOnce(videos, requested);
}

export async function recordVideoView(videoId) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/view`, { method: 'POST', headers });
}

export async function deleteVideo(videoId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/delete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.error || `Delete failed (${response.status}).`);
  return data;
}

function maybeRecordVideoView(videoId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !videoId) return;
  const key = `indo:view:${uid}:${videoId}`;
  const now = Date.now();
  const lastViewedAt = Number(localStorage.getItem(key) || 0);
  if (Number.isFinite(lastViewedAt) && now - lastViewedAt < VIEW_COOLDOWN_MS) return;
  localStorage.setItem(key, String(now));
  recordVideoView(videoId).catch(() => localStorage.removeItem(key));
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
  videoElement.addEventListener('timeupdate', sendDelta);
  videoElement.addEventListener('pause', sendDelta);
  videoElement.addEventListener('ended', sendDelta);
}
function stopOtherVideos(current) {
  document.querySelectorAll('video').forEach((video) => {
    if (video === current) return;
    if (!video.paused) video.pause();
  });
}
function enableAudioFromInteraction(current) {
  if (!(current instanceof HTMLVideoElement)) return;
  stopOtherVideos(current);
  current.autoplay = true;
  current.removeAttribute('muted');
  current.defaultMuted = false;
  current.muted = false;
  current.volume = 1;
  window.__indoAudioUnlocked = true;
  current.play().catch(() => {});
}
function unlockAudiblePlaybackFromGesture() {
  if (window.__indoAudioUnlocked) return;
  window.__indoAudioUnlocked = true;
  const videos = Array.from(document.querySelectorAll('video'));
  const current = videos.find((video) => !video.paused) || videos.find((video) => video.matches('.post-video'));
  if (!current) return;
  stopOtherVideos(current);
  current.autoplay = true;
  current.removeAttribute('muted');
  current.defaultMuted = false;
  current.muted = false;
  current.volume = 1;
  current.play().catch(() => {});
}
function bindGlobalAudioUnlock() {
  if (window.__indoGlobalAudioUnlockBound) return;
  window.__indoGlobalAudioUnlockBound = true;
  const unlock = () => unlockAudiblePlaybackFromGesture();
  document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  document.addEventListener('touchstart', unlock, { capture: true, passive: true });
  document.addEventListener('keydown', unlock, { capture: true, passive: true });
}
function enforceSingleVideoPlayback() {
  if (window.__indoSingleVideoPlaybackBound) return;
  window.__indoSingleVideoPlaybackBound = true;
  document.addEventListener('play', (event) => {
    const current = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!current) return;
    stopOtherVideos(current);
    window.__indoActiveVideo = current;
    if (window.__indoAudioUnlocked) {
      current.removeAttribute('muted'); current.defaultMuted = false; current.muted = false; current.volume = 1;
    }
  }, true);
  document.addEventListener('playing', (event) => {
    const current = event.target instanceof HTMLVideoElement ? event.target : null;
    if (!current) return;
    stopOtherVideos(current);
    window.__indoActiveVideo = current;
    if (window.__indoAudioUnlocked) {
      current.removeAttribute('muted'); current.defaultMuted = false; current.muted = false; current.volume = 1;
    }
  }, true);
  document.addEventListener('pause', (event) => {
    if (event.target === window.__indoActiveVideo) window.__indoActiveVideo = null;
  }, true);
}

export function renderVideoCard(video) {
  ensureFeedDesignStyles();
  const creatorRaw = String(video.creator || '@indo');
  const creator = escapeHtml(creatorRaw);
  const usernameKey = escapeHtml(creatorRaw.replace(/^@/, ''));
  const ownerUid = escapeHtml(video.ownerUid || '');
  const creatorAvatar = escapeHtml(video.creatorAvatar || video.avatarUrl || video.profilePhoto || video.photoURL || '');
  const caption = escapeHtml(video.caption || '');
  const views = Number(video.views || 0).toLocaleString();
  const likes = Number(video.likes || 0).toLocaleString();
  const rawMediaUrl = video.secureUrl || video.videoUrl || video.url || '';
  const mediaUrl = cloudinaryBrowserUrl(rawMediaUrl);
  const fallbackUrl = rawMediaUrl && mediaUrl !== rawMediaUrl ? rawMediaUrl : '';
  const poster = video.thumbnailUrl ? ` poster=\"${escapeHtml(video.thumbnailUrl)}\"` : '';
  const initial = escapeHtml(creatorRaw.replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const avatar = creatorAvatar
    ? `<span class=\"neon-edge-avatar\"><img src=\"${creatorAvatar}\" alt=\"${creator}\" loading=\"lazy\"></span>`
    : `<span class=\"neon-edge-avatar\">${initial}</span>`;
  const source = mediaUrl
    ? `<video class=\"post-video\" playsinline preload=\"metadata\" data-original-video-src=\"${escapeHtml(rawMediaUrl)}\" data-video-src=\"${escapeHtml(mediaUrl)}\"${poster}><source src=\"${escapeHtml(mediaUrl)}\" type=\"video/mp4\">${fallbackUrl ? `<source src=\"${escapeHtml(fallbackUrl)}\">` : ''}</video>`
    : '<div class=\"post-video video-unavailable\">Video unavailable</div>';
  return `<article class=\"post-card video-post neon-edge-post\" data-video-id=\"${escapeHtml(video.id)}\" data-owner-uid=\"${ownerUid}\"><div class=\"post-head neon-edge-head\"><button class=\"post-creator neon-edge-creator\" type=\"button\" data-profile-username=\"${usernameKey}\" data-profile-uid=\"${ownerUid}\" aria-label=\"Open ${creator} profile\">${avatar}<span class=\"neon-edge-name\">${creator}</span></button><button class=\"icon-btn post-more neon-edge-more\" type=\"button\" data-feed-more aria-label=\"More options\">⋯</button></div>${source}<div class=\"post-actions neon-edge-actions\"><button data-engagement=\"like\" aria-label=\"Like\">♡ <small>${likes}</small></button><button data-engagement=\"comment\" aria-label=\"Comment\">◯</button><button data-engagement=\"share\" aria-label=\"Share\">↗</button><button class=\"push-right\" data-engagement=\"save\" aria-label=\"Save\">🔖</button></div><div class=\"post-copy neon-edge-copy\"><strong>${views} views</strong><p class=\"neon-edge-caption\"><b>${creator}</b> ${caption}</p></div></article>`;
}

function closeAllFeedMenus(except = null) {
  document.querySelectorAll('.indo-feed-menu').forEach((menu) => { if (menu !== except) menu.remove(); });
}
async function handleFeedDelete(button, card, menu) {
  const videoId = String(card?.dataset.videoId || '').trim();
  if (!videoId) { menu.remove(); return; }
  const user = auth.currentUser;
  if (!user || String(card.dataset.ownerUid || '') !== String(user.uid || '')) { menu.remove(); return; }
  if (!window.confirm('Delete this video permanently?')) return;
  button.disabled = true;
  button.textContent = 'Deleting...';
  try {
    await deleteVideo(videoId);
    const seen = readFeedSeen();
    delete seen[videoId];
    localStorage.setItem(getFeedSeenKey(), JSON.stringify(seen));
    menu.remove();
    card.querySelector('video')?.pause();
    card.remove();
  } catch (error) {
    console.error('Video delete failed:', error);
    button.disabled = false;
    button.textContent = error?.message || 'Delete video';
  }
}
function openFeedMoreMenu(button, card) {
  closeAllFeedMenus();
  const menu = document.createElement('div');
  menu.className = 'indo-feed-menu';
  const isOwner = Boolean(auth.currentUser?.uid && String(card.dataset.ownerUid || '') === String(auth.currentUser.uid));
  menu.innerHTML = `${isOwner ? '<button type=\"button\" data-feed-action=\"delete\" style=\"color:#ff6b6b\">Delete video</button>' : ''}<button type=\"button\" data-feed-action=\"save\">Save</button><button type=\"button\" data-feed-action=\"share\">Share</button><button type=\"button\" data-feed-action=\"report\">Report</button><button type=\"button\" data-feed-action=\"close\">Cancel</button>`;
  menu.style.cssText = 'position:absolute;right:8px;top:42px;z-index:1000;min-width:160px;padding:6px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#15151c;box-shadow:0 12px 32px rgba(0,0,0,.55);';
  menu.querySelectorAll('button').forEach((item) => {
    item.style.cssText = `${item.style.cssText};display:block;width:100%;padding:10px 12px;border:0;border-radius:8px;background:transparent;color:${item.dataset.feedAction === 'delete' ? '#ff6b6b' : '#fff'};text-align:left;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;`;
    item.addEventListener('mouseenter', () => { item.style.background = '#24242d'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', async (event) => {
      event.preventDefault(); event.stopPropagation();
      const action = item.dataset.feedAction;
      if (action === 'close') { menu.remove(); return; }
      if (action === 'delete') { await handleFeedDelete(item, card, menu); return; }
      if (action === 'save') item.dataset.menuSaved = 'true';
      if (action === 'share') navigator.clipboard?.writeText(window.location.href.split('#')[0]).catch(() => {});
      if (action === 'report') item.dataset.menuReported = 'true';
      menu.remove();
    });
  });
  const head = card.querySelector('.post-head');
  if (!head) return;
  head.style.position = 'relative';
  head.appendChild(menu);
}
function bindFeedMoreMenus(root) {
  root.querySelectorAll('[data-feed-more]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault(); event.stopPropagation();
      const card = button.closest('[data-video-id]');
      if (!card) return;
      const existing = card.querySelector('.indo-feed-menu');
      if (existing) existing.remove(); else openFeedMoreMenu(button, card);
    });
  });
  if (!window.__indoFeedMenuGlobalBound) {
    window.__indoFeedMenuGlobalBound = true;
    document.addEventListener('click', () => closeAllFeedMenus());
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAllFeedMenus(); });
  }
}
function loadVideoSource(video) {
  if (video.dataset.loaded === '1') return true;
  const source = video.dataset.videoSrc;
  if (!source) return false;
  video.src = source;
  video.dataset.loaded = '1';
  video.preload = 'auto';
  video.load();
  return true;
}
function bindLazyVideo(video, videoId) {
  let observer = null;
  const card = video.closest('[data-video-id]');
  const originalSource = String(video.dataset.originalVideoSrc || '');
  const transformedSource = String(video.dataset.videoSrc || '');
  const hideBrokenCard = () => { observer?.disconnect(); card?.remove(); };
  let hasRetriedOriginal = false;
  const retryOriginalSource = () => {
    if (!originalSource || hasRetriedOriginal) { hideBrokenCard(); return; }
    hasRetriedOriginal = true;
    video.dataset.loaded = '0';
    video.dataset.videoSrc = originalSource;
    video.src = originalSource;
    video.load();
  };
  const playIfVisible = () => {
    if (!loadVideoSource(video)) return;
    stopOtherVideos(video);
    video.autoplay = true;
    if (window.__indoAudioUnlocked) {
      video.removeAttribute('muted'); video.defaultMuted = false; video.muted = false; video.volume = 1;
    } else {
      video.muted = true;
    }
    video.play().catch(() => {});
  };
  const pause = () => { if (!video.paused) video.pause(); };
  video.addEventListener('error', () => { if (video.dataset.videoSrc === transformedSource) retryOriginalSource(); else hideBrokenCard(); });
  video.addEventListener('abort', () => { if (video.dataset.videoSrc === transformedSource) retryOriginalSource(); else hideBrokenCard(); });
  video.addEventListener('play', () => maybeRecordVideoView(videoId), { passive: true });
  video.addEventListener('pointerdown', () => enableAudioFromInteraction(video), { passive: true });
  video.addEventListener('click', () => enableAudioFromInteraction(video), { passive: true });
  if ('IntersectionObserver' in window) {
    const observerOptions = { threshold: [0, 0.45, 0.9], rootMargin: '120px 0px' };
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) playIfVisible();
        else pause();
      }
    }, observerOptions);
    observer.observe(video);
  } else playIfVisible();
  video.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation();
    if (!loadVideoSource(video)) return;
    if (video.paused) {
      stopOtherVideos(video);
      video.autoplay = true;
      video.removeAttribute('muted'); video.defaultMuted = false; video.muted = false; video.volume = 1;
      video.play().catch(() => {});
      window.__indoAudioUnlocked = true;
    } else video.pause();
  });
  bindWatchProgress(video, videoId);
}

export function bindVideoCards(root) {
  ensureFeedDesignStyles();
  bindGlobalAudioUnlock();
  enforceSingleVideoPlayback();
  root.querySelectorAll('[data-video-id] .post-video[data-video-src]').forEach((video) => {
    const card = video.closest('[data-video-id]');
    if (!card) return;
    bindLazyVideo(video, card.dataset.videoId);
  });
  bindFeedMoreMenus(root);
}
