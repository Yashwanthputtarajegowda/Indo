import { auth } from '../auth/firebase-client.js';
import { state } from '../../state.js';

const KEY = Symbol.for('indo.profileLiveCountsV1');

async function refresh() {
  const root = document.getElementById('root');
  if (!root) return;
  const followersCount = root.querySelector('[data-followers-count]');
  const followingCount = root.querySelector('[data-following-count]');
  if (!followersCount && !followingCount) return;

  const targetUid = String(state.profile?.uid || state.profile?.ownerUid || state.profile?.userId || auth.currentUser?.uid || '').trim();
  if (!targetUid || !auth.currentUser) return;

  try {
    const token = await auth.currentUser.getIdToken(true);
    const base = window.INDO_API_BASE || '';
    const headers = { Authorization: `Bearer ${token}` };
    const [fr, fw] = await Promise.all([
      fetch(`${base}/api/social/followers/${encodeURIComponent(targetUid)}`, { headers, cache: 'no-store' }),
      fetch(`${base}/api/social/following/${encodeURIComponent(targetUid)}`, { headers, cache: 'no-store' }),
    ]);
    const [fd, wd] = await Promise.all([fr.json().catch(() => ({})), fw.json().catch(() => ({}))]);
    if (fr.ok && followersCount) followersCount.textContent = String(Number(fd.count ?? (Array.isArray(fd.items) ? fd.items.length : 0)));
    if (fw.ok && followingCount) followingCount.textContent = String(Number(wd.count ?? (Array.isArray(wd.items) ? wd.items.length : 0)));
  } catch (error) {
    console.warn('Live profile relation count refresh failed:', error);
  }
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  const root = document.getElementById('root') || document.body;
  const observer = new MutationObserver(() => {
    clearTimeout(install.timer);
    install.timer = setTimeout(refresh, 40);
  });
  observer.observe(root, { childList: true, subtree: true });
  setTimeout(refresh, 0);
  setTimeout(refresh, 300);
  setTimeout(refresh, 1000);
}

install();
export { install, refresh };
