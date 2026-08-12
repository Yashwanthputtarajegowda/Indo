import { auth } from '../auth/firebase-client.js';

async function request(path, method = 'GET', body) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const headers = { Authorization: `Bearer ${token}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${apiBase}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export function loadEngagement(mediaId) {
  return request(`/api/media/${encodeURIComponent(mediaId)}/engagement`);
}

export function toggleLike(mediaId, like) {
  return request(`/api/media/${encodeURIComponent(mediaId)}/like`, 'POST', { like });
}

export function toggleSave(mediaId, save) {
  return request(`/api/media/${encodeURIComponent(mediaId)}/save`, 'POST', { save });
}

export function addComment(mediaId, text) {
  return request(`/api/media/${encodeURIComponent(mediaId)}/comments`, 'POST', { text });
}

export async function loadComments(mediaId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/${encodeURIComponent(mediaId)}/comments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load comments.');
  return data.comments || [];
}

export async function shareMedia(mediaId) {
  const url = new URL(window.location.href);
  url.searchParams.set('video', mediaId);
  const shareData = { title: 'Indo video', text: 'Watch this video on Indo', url: url.toString() };
  if (navigator.share) return navigator.share(shareData);
  await navigator.clipboard.writeText(url.toString());
  return { copied: true };
}
