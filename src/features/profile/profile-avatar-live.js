import { auth } from '../auth/firebase-client.js';

const CACHE = new Map();
const pending = new Map();
const STYLE_ID = 'indo-live-profile-avatar-v4';
const REFRESH_MS = 2500;
const CHANNEL_NAME = 'indo-profile-avatar-live';

const API = () => window.INDO_API_BASE || '';
const norm = (value = '') => String(value ?? '').trim().replace(/^@+/, '');
const validUserId = (value = '') => /^[A-Za-z0-9._-]{2,80}$/.test(norm(value));

async function loadProfile(key, { byUid = false, force = false } = {}) {
  const clean = norm(key);
  if (!clean) return null;
  const cacheKey = `${byUid ? 'uid' : 'id'}:${clean}`;
  if (!force && CACHE.has(cacheKey)) return CACHE.get(cacheKey);
  if (pending.has(cacheKey)) return pending.get(cacheKey);

  const promise = (async () => {
    try {
      const headers = {};
      if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken(false)}`;
      const path = byUid
        ? `/api/account/public-profile/${encodeURIComponent(clean)}`
        : `/api/account/profile/${encodeURIComponent(clean)}`;
      const response = await fetch(`${API()}${path}`, { headers, cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json().catch(() => ({}));
      const profile = data?.profile || null;
      if (profile) CACHE.set(cacheKey, profile);
      return profile;
    } catch {
      return null;
    }
  })();

  pending.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    pending.delete(cacheKey);
  }
}

function getAvatarUrl(profile) {
  return String(profile?.avatarUrl || profile?.photoURL || profile?.photoUrl || '').trim();
}

function ensureImage(host) {
  if (!(host instanceof Element)) return null;
  let img = host.querySelector(':scope > img.indo-live-avatar-img');
  if (!img) {
    img = document.createElement('img');
    img.className = 'indo-live-avatar-img';
    img.alt = 'Profile';
    img.loading = 'lazy';
    host.appendChild(img);
  }
  return img;
}

function paint(host, profile) {
  const url = getAvatarUrl(profile);
  if (!(host instanceof Element) || !url) return;
  const img = ensureImage(host);
  if (!img) return;
  if (img.src !== url) img.src = url;
  host.classList.add('indo-live-avatar-has-image');
}

function readIdentityFromDataset(el) {
  if (!(el instanceof Element)) return null;
  const uid = norm(el.dataset.profileUid || el.dataset.actorUid || el.dataset.userUid || el.dataset.storyOwner || '');
  const userId = norm(el.dataset.profileUsername || el.dataset.profileUser || el.dataset.userId || el.dataset.username || el.dataset.actorUserId || '');
  return uid || validUserId(userId) ? { uid, userId } : null;
}

function findUserIdInText(el) {
  if (!(el instanceof Element)) return '';
  const candidates = [
    el.querySelector?.('.search-profile-id')?.textContent,
    el.querySelector?.('.indo-notice-line b')?.textContent,
    el.querySelector?.('.indo-notice-meta span')?.textContent,
    el.querySelector?.('.indo-comment-name')?.textContent,
    el.querySelector?.('.indo-watch-creator-name')?.textContent,
    el.querySelector?.('.indo-rel-v7-id')?.textContent,
    el.querySelector?.('[class*="user-id"]')?.textContent,
    el.querySelector?.('[class*="username"]')?.textContent,
    el.querySelector?.('[data-user-id]')?.getAttribute('data-user-id'),
    el.querySelector?.('[data-username]')?.getAttribute('data-username'),
  ];
  for (const value of candidates) {
    const match = String(value || '').match(/@?([A-Za-z0-9._-]{2,80})/);
    const id = norm(match?.[1] || '');
    if (validUserId(id) && !['profile', 'user', 'users', 'indo'].includes(id.toLowerCase())) return id;
  }
  return '';
}

function resolveIdentity(el) {
  if (!(el instanceof Element)) return null;
  const direct = readIdentityFromDataset(el);
  if (direct) return direct;

  const host = el.closest?.('[data-profile-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],[data-story-owner],[data-actor-uid],[data-actor-user-id],[data-profile-user]');
  const hostIdentity = readIdentityFromDataset(host);
  if (hostIdentity) return hostIdentity;

  const relation = el.closest?.('.indo-rel-v7-row,.indo-rel-row,.follower-row,.following-row,.user-row,.user-card,.profile-card,.search-profile-card');
  const relationIdentity = readIdentityFromDataset(relation);
  if (relationIdentity) return relationIdentity;
  if (relation) {
    const uid = norm(relation?.dataset?.uid || relation?.dataset?.relUid || '');
    const userId = norm(relation?.dataset?.relUser || relation?.dataset?.profileUser || '');
    if (uid || validUserId(userId)) return { uid, userId };
    const inferred = findUserIdInText(relation);
    if (inferred) return { uid: '', userId: inferred };
  }

  const notice = el.closest?.('.indo-notice-card');
  if (notice) {
    const inferred = findUserIdInText(notice);
    if (inferred) return { uid: norm(notice.dataset?.actorUid || ''), userId: inferred };
  }

  const comment = el.closest?.('.indo-comment');
  if (comment) {
    const inferred = findUserIdInText(comment);
    if (inferred) return { uid: norm(comment.dataset?.profileUid || ''), userId: inferred };
  }

  const broad = el.closest?.('[class*="user-card"],[class*="user-row"],[class*="profile-card"],[class*="conversation"],[class*="message"]');
  if (broad) {
    const inferred = findUserIdInText(broad);
    if (inferred) return { uid: '', userId: inferred };
  }

  return null;
}

function avatarHosts(root) {
  const selectors = [
    '.neon-edge-avatar', '.indo-story-avatar', '.indo-notice-avatar', '.indo-watch-avatar',
    '.search-profile-avatar', '.indo-rel-v7-avatar', '.indo-rel-avatar', '.follower-avatar',
    '.following-avatar', '.message-avatar', '.conversation-avatar', '.user-avatar',
    '.profile-avatar', '[data-profile-avatar]', '[data-user-avatar]', '[data-avatar]'
  ];
  const out = [];
  for (const selector of selectors) {
    if (root?.matches?.(selector)) out.push(root);
    root?.querySelectorAll?.(selector).forEach((el) => out.push(el));
  }
  return [...new Set(out)];
}

async function hydrate(host, force = false) {
  const identity = resolveIdentity(host);
  if (!identity) return;
  const profile = identity.uid
    ? await loadProfile(identity.uid, { byUid: true, force })
    : await loadProfile(identity.userId, { force });
  if (profile) paint(host, profile);
}

function scan(root = document, force = false) {
  if (!root) return;
  for (const host of avatarHosts(root)) hydrate(host, force);
  const identityHosts = root.querySelectorAll?.('[data-profile-uid],[data-profile-username],[data-profile-user],[data-user-id],[data-username],[data-story-owner],[data-actor-uid],[data-actor-user-id],.search-profile-card,.indo-notice-card,.indo-rel-v7-row,.follower-row,.following-row,.user-row,.user-card,.profile-card,.conversation,.message');
  identityHosts?.forEach((host) => {
    if (avatarHosts(host).length) hydrate(host, force);
  });
}

function invalidate(uid, userId) {
  if (uid) CACHE.delete(`uid:${norm(uid)}`);
  if (userId) CACHE.delete(`id:${norm(userId)}`);
  scan(document, true);
}

function publish(profile) {
  const payload = {
    uid: profile?.uid || '',
    userId: profile?.username || profile?.userId || '',
    avatarUrl: getAvatarUrl(profile),
    ts: Date.now(),
  };
  try { localStorage.setItem('indo:profile-avatar-update', JSON.stringify(payload)); } catch {}
  try { window.__indoProfileAvatarChannel?.postMessage(payload); } catch {}
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .indo-live-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
    .indo-live-avatar-has-image>span:first-child{display:none!important}
    .search-profile-avatar,.indo-notice-avatar,.indo-watch-avatar,.neon-edge-avatar,.indo-story-avatar,.indo-rel-v7-avatar,.indo-rel-avatar,.follower-avatar,.following-avatar,.message-avatar,.conversation-avatar,.user-avatar,.profile-avatar{overflow:hidden}
    .indo-comment>.indo-live-avatar-img{width:28px;height:28px;float:left;margin:0 8px 4px 0;border-radius:50%}
    .indo-comment:after{content:"";display:block;clear:both}
  `;
  document.head.appendChild(style);
}

function install() {
  if (window.__indoLiveProfileAvatarsInstalled) return;
  window.__indoLiveProfileAvatarsInstalled = true;
  installStyles();
  scan(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    }
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  window.addEventListener('indo:profile-updated', (event) => {
    const profile = event.detail?.profile || event.detail || {};
    invalidate(profile.uid, profile.username || profile.userId);
    publish(profile);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== 'indo:profile-avatar-update' || !event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue);
      invalidate(payload.uid, payload.userId);
    } catch {}
  });

  try {
    window.__indoProfileAvatarChannel = new BroadcastChannel(CHANNEL_NAME);
    window.__indoProfileAvatarChannel.addEventListener('message', (event) => {
      const payload = event.data || {};
      invalidate(payload.uid, payload.userId);
    });
  } catch {}

  setInterval(() => {
    if (!document.hidden) scan(document, true);
  }, REFRESH_MS);
}

install();
export function installLiveProfileAvatars() { install(); }
export { invalidate as invalidateProfileAvatar };
