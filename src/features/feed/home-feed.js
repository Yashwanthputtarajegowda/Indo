import { auth } from '../auth/firebase-client.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export async function loadHomeVideos(limit = 20) {
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/videos?type=video&limit=${limit}`);
  if (!response.ok) throw new Error('Could not load videos.');
  const data = await response.json();
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function recordVideoView(videoId) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(videoId)}/view`, { method: 'POST', headers });
}

export function renderVideoCard(video) {
  const creator = escapeHtml(video.creator || '@indo');
  const title = escapeHtml(video.title || 'Video');
  const caption = escapeHtml(video.caption || '');
  const views = Number(video.views || 0).toLocaleString();
  const likes = Number(video.likes || 0).toLocaleString();
  const poster = video.thumbnailUrl ? ` poster="${escapeHtml(video.thumbnailUrl)}"` : '';
  return `<article class="post-card video-post" data-video-id="${escapeHtml(video.id)}">
    <div class="post-head"><div class="avatar small">${escapeHtml(creator.replace(/^@/, '').charAt(0).toUpperCase() || 'I')}</div><div><strong>${creator}</strong><small>${title}</small></div><button class="icon-btn" aria-label="More options">⋯</button></div>
    <video class="post-video" controls playsinline preload="metadata"${poster} src="${escapeHtml(video.secureUrl)}"></video>
    <div class="post-actions"><button data-engagement="like" aria-label="Like">♡ <small>${likes}</small></button><button data-engagement="comment" aria-label="Comment">◯</button><button data-engagement="share" aria-label="Share">↗</button><button class="push-right" data-engagement="save" aria-label="Save">🔖</button></div>
    <div class="post-copy"><strong>${views} views</strong><p><b>${creator}</b> ${caption}</p></div>
  </article>`;
}
