import { auth } from '../auth/firebase-client.js';
import { recordWatchProgress } from '../earning/earning.js';

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

async function fetchVideos(apiBase, headers, query) {
  const response = await fetch(`${apiBase}/api/media/videos${query}`, { headers });
  if (!response.ok) throw new Error('Could not load videos.');
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function loadHomeVideos(limit = 20) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const typed = await fetchVideos(apiBase, headers, `?type=video&limit=${limit}`);
  if (typed.length) return typed;
  const fallback = await fetchVideos(apiBase, headers, `?limit=${limit}`);
  return fallback.filter((item) => {
    const type = String(item.mediaType || item.resourceType || 'video').toLowerCase();
    return type === 'video' || type === 'mp4';
  });
}

export async function recordVideoView(videoId) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/view`, { method: 'POST', headers });
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

export function renderVideoCard(video) {
  const creatorRaw = String(video.creator || '@indo');
  const creator = escapeHtml(creatorRaw);
  const usernameKey = escapeHtml(creatorRaw.replace(/^@/, ''));
  const ownerUid = escapeHtml(video.ownerUid || '');
  const creatorAvatar = escapeHtml(video.creatorAvatar || video.avatarUrl || video.profilePhoto || video.photoURL || '');
  const caption = escapeHtml(video.caption || '');
  const views = Number(video.views || 0).toLocaleString();
  const likes = Number(video.likes || 0).toLocaleString();
  const mediaUrl = video.secureUrl || video.videoUrl || video.url || '';
  const poster = video.thumbnailUrl ? ` poster="${escapeHtml(video.thumbnailUrl)}"` : '';
  const initial = escapeHtml(creatorRaw.replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const avatar = creatorAvatar
    ? `<img class="avatar small post-avatar-image" src="${creatorAvatar}" alt="${creator}" loading="lazy" style="width:38px;height:38px;min-width:38px;max-width:38px;flex:0 0 38px;margin:0;display:block;border-radius:50%;object-fit:cover;">`
    : `<div class="avatar small" style="width:38px;height:38px;min-width:38px;max-width:38px;flex:0 0 38px;margin:0;display:grid;place-items:center;border-radius:50%;">${initial}</div>`;
  const source = mediaUrl
    ? `<video class="post-video" autoplay playsinline preload="metadata"${poster} src="${escapeHtml(mediaUrl)}"></video>`
    : '<div class="post-video video-unavailable">Video unavailable</div>';
  return `<article class="post-card video-post" data-video-id="${escapeHtml(video.id)}" data-owner-uid="${ownerUid}">
    <div class="post-head">
      <button class="post-creator" type="button" data-profile-username="${usernameKey}" data-profile-uid="${ownerUid}" aria-label="Open ${creator} profile" style="display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:9px;width:auto;min-width:0;height:100%;margin:0;padding:0;text-align:left;white-space:nowrap;">
        ${avatar}<span class="post-creator-name" style="display:block;margin:0;padding:0;font-size:13px;font-weight:700;line-height:1;white-space:nowrap;">${creator}</span>
      </button>
      <button class="icon-btn post-more" type="button" data-feed-more aria-label="More options">⋯</button>
    </div>
    ${source}
    <div class="post-actions"><button data-engagement="like" aria-label="Like">♡ <small>${likes}</small></button><button data-engagement="comment" aria-label="Comment">◯</button><button data-engagement="share" aria-label="Share">↗</button><button class="push-right" data-engagement="save" aria-label="Save">🔖</button></div>
    <div class="post-copy"><strong>${views} views</strong><p><b>${creator}</b> ${caption}</p></div>
  </article>`;
}

function closeAllFeedMenus(except = null) {
  document.querySelectorAll('.indo-feed-menu').forEach((menu) => {
    if (menu !== except) menu.remove();
  });
}

function openFeedMoreMenu(button, card) {
  closeAllFeedMenus();

  const menu = document.createElement('div');
  menu.className = 'indo-feed-menu';
  menu.innerHTML = `
    <button type="button" data-feed-action="save">Save</button>
    <button type="button" data-feed-action="share">Share</button>
    <button type="button" data-feed-action="report">Report</button>
    <button type="button" data-feed-action="close">Cancel</button>
  `;
  menu.style.cssText = 'position:absolute;right:8px;top:42px;z-index:1000;min-width:150px;padding:6px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#15151c;box-shadow:0 12px 32px rgba(0,0,0,.55);';
  menu.querySelectorAll('button').forEach((item) => {
    item.style.cssText = 'display:block;width:100%;padding:10px 12px;border:0;border-radius:8px;background:transparent;color:#fff;text-align:left;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;';
    item.addEventListener('mouseenter', () => { item.style.background = '#24242d'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = item.dataset.feedAction;
      if (action === 'close') {
        menu.remove();
        return;
      }
      if (action === 'save') {
        button.dataset.menuSaved = 'true';
      }
      if (action === 'share') {
        const url = window.location.href.split('#')[0];
        navigator.clipboard?.writeText(url).catch(() => {});
      }
      if (action === 'report') {
        button.dataset.menuReported = 'true';
      }
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
      event.preventDefault();
      event.stopPropagation();
      const card = button.closest('[data-video-id]');
      if (!card) return;
      const existing = card.querySelector('.indo-feed-menu');
      if (existing) existing.remove();
      else openFeedMoreMenu(button, card);
    });
  });

  if (!window.__indoFeedMenuGlobalBound) {
    window.__indoFeedMenuGlobalBound = true;
    document.addEventListener('click', () => closeAllFeedMenus());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllFeedMenus();
    });
  }
}

export function bindVideoCards(root) {
  root.querySelectorAll('[data-video-id] .post-video').forEach((video) => {
    const card = video.closest('[data-video-id]');
    if (!card) return;
    const videoId = card.dataset.videoId;
    video.muted = false;
    video.removeAttribute('muted');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'post-video video-unavailable';
      fallback.textContent = 'Video unavailable. Please try again later.';
      video.replaceWith(fallback);
    }, { once: true });
    const autoplayWithSound = () => {
      video.muted = false;
      video.removeAttribute('muted');
      video.play().catch(() => {});
    };
    const pauseWhenHidden = () => {
      if (!video.paused) video.pause();
    };
    video.addEventListener('play', () => maybeRecordVideoView(videoId), { passive: true });
    video.addEventListener('canplay', autoplayWithSound, { once: true });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) autoplayWithSound();
          else pauseWhenHidden();
        }
      }, { threshold: [0, 0.5, 1] });
      observer.observe(video);
    } else {
      autoplayWithSound();
    }
    video.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (video.paused) {
        video.muted = false;
        video.removeAttribute('muted');
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    bindWatchProgress(video, videoId);
  });
  bindFeedMoreMenus(root);
}
