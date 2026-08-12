import { auth } from '../auth/firebase-client.js';

export async function loadReels(limit = 20) {
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/videos?type=reel&limit=${limit}`);
  if (!response.ok) throw new Error('Could not load reels.');
  const data = await response.json();
  return Array.isArray(data.videos) ? data.videos : [];
}

export async function recordReelView(reelId) {
  const apiBase = window.INDO_API_BASE || '';
  const headers = {};
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const response = await fetch(`${apiBase}/api/media/videos/${encodeURIComponent(reelId)}/view`, { method: 'POST', headers });
  if (!response.ok) throw new Error('Could not record reel view.');
  return response.json();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function renderReel(video) {
  const creator = escapeHtml(video.creator || '@indo');
  const caption = escapeHtml(video.caption || video.title || '');
  const id = escapeHtml(video.id);
  const targetUid = escapeHtml(video.ownerUid || '');
  const likes = Number(video.likes || 0).toLocaleString();
  return `<article class="reel-view" data-video-id="${id}">
    <video class="reel-video" src="${escapeHtml(video.secureUrl)}" autoplay muted loop playsinline preload="metadata"></video>
    <div class="reel-gradient"></div>
    <div class="reel-info"><div class="reel-user"><div class="avatar small">${escapeHtml(creator.replace(/^@/, '').charAt(0).toUpperCase() || 'I')}</div><b>${creator}</b>${targetUid ? `<button class="follow-btn" data-follow-uid="${targetUid}" type="button">Follow</button>` : ''}</div><p>${caption}</p><small>♪ Original audio</small></div>
    <div class="reel-actions"><button data-engagement="like" type="button" aria-label="Like">♡<small>${likes}</small></button><button data-engagement="comment" type="button" aria-label="Comment">◯<small>Comment</small></button><button data-engagement="share" type="button" aria-label="Share">↗<small>Share</small></button><button data-engagement="save" type="button" aria-label="Save">🔖</button></div>
  </article>`;
}
