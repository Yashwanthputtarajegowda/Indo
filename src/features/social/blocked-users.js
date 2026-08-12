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
  if (!response.ok) throw new Error(data.error || 'Blocked-user request failed.');
  return data;
}

export const loadBlockedUsers = () => request('/api/social/blocked');
export const toggleBlockedUser = (targetUid, blocked) => request('/api/social/block', { method: 'POST', body: JSON.stringify({ targetUid, blocked: Boolean(blocked) }) });
