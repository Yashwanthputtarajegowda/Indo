import { auth } from '../auth/firebase-client.js';

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Earning request failed.');
  return data;
}

export function loadEarningStatus() {
  return request('/api/earnings/status');
}

export function toggleEarning(enabled) {
  return request('/api/earnings/toggle', {
    method: 'POST',
    body: JSON.stringify({ enabled: Boolean(enabled) })
  });
}

export function recordWatchProgress(mediaId, seconds) {
  if (!mediaId || !(Number(seconds) > 0)) return Promise.resolve(null);
  return request('/api/earnings/watch-progress', {
    method: 'POST',
    body: JSON.stringify({ mediaId, seconds: Number(seconds) })
  }).catch(() => null);
}
