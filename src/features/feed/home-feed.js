import { auth } from '../auth/firebase-client.js';
import { recordWatchProgress } from '../earning/earning.js';

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
  const creator = escapeHtml(video.creator || '@indo');
  const title = escapeHtml(video.title || 'Video');
  const caption = escapeHtml(video.caption || '');
  const views = Number(video.views || 0).toLocaleString();
  const likes = Number(video.likes || 0).toLocaleString();
  const mediaUrl = video.secureUrl || video.videoUrl || video.url || '';
  const poster = video.thumbnailUrl ? ` poster="${escapeHtml(video.thumbnailUrl)}"` : '';
  const source = mediaUrl
    ? `<video class="post-video" controls autoplay muted playsinline preload="metadata"${poster} src="${escapeHtml(mediaUrl)}"></video>`
    : '<div class="post-video video-unavailable">Video unavailable</div>';
  return `<article class="post-card video-post" data-video-id="${escapeHtml(video.id)}">
    <div class="post-head"><div class="avatar small">${escapeHtml(creator.replace(/^@/, '').charAt(0).toUpperCase() || 'I')}</div><div><strong>${creator}</strong><small>${title}</small></div><button class="icon-btn" aria-label="More options">⋯</button></div>
    ${source}
    <div class="post-actions"><button data-engagement="like" aria-label="Like">♡ <small>${likes}</small></button><button data-engagement="comment" aria-label="Comment">◯</button><button data-engagement="share" aria-label="Share">↗</button><button class="push-right" data-engagement="save" aria-label="Save">🔖</button></div>
    <div class="post-copy"><strong>${views} views</strong><p><b>${creator}</b> ${caption}</p></div>
  </article>`;
}

export function bindVideoCards(root) {
  root.querySelectorAll('[data-video-id] .post-video').forEach((video) => {
    const card = video.closest('[data-video-id]');
    if (!card) return;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'post-video video-unavailable';
      fallback.textContent = 'Video unavailable. Please try again later.';
      video.replaceWith(fallback);
    }, { once: true });

    const playWhenVisible = () => video.play().catch(() => {});
    const pauseWhenHidden = () => { if (!video.paused) video.pause(); };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) playWhenVisible();
          else pauseWhenHidden();
        }
      }, { threshold: [0, 0.5, 1] });
      observer.observe(video);
    } else {
      playWhenVisible();
    }

    bindWatchProgress(video, card.dataset.videoId);
  });
}
