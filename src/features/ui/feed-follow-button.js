import { auth } from '../auth/firebase-client.js';

const KEY = Symbol.for('indo.feedFollowButton');

function style() {
  if (document.getElementById('indo-feed-follow-button-style')) return;
  const node = document.createElement('style');
  node.id = 'indo-feed-follow-button-style';
  node.textContent = `
    .post-head{display:flex;align-items:center!important;gap:8px!important;}
    .post-creator{flex:0 1 auto!important;min-width:0!important;}
    .indo-feed-follow{flex:0 0 auto!important;width:auto!important;min-width:76px!important;height:30px!important;padding:0 12px!important;margin-left:auto!important;border:1px solid #303039!important;border-radius:8px!important;background:#17171d!important;color:#fff!important;font:700 12px/1 system-ui,sans-serif!important;cursor:pointer!important;}
    .indo-feed-follow.following{background:#2a2a31!important;}
    .indo-feed-follow:disabled{opacity:.65!important;cursor:default!important;}
    .post-more{flex:0 0 auto!important;margin-left:0!important;}
  `;
  document.head.appendChild(node);
}

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  return fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'Content-Type':'application/json', Authorization:`Bearer ${token}` }
  });
}

async function setupButton(button, ownerUid) {
  const uid = String(ownerUid || '').trim();
  const currentUid = String(auth.currentUser?.uid || '').trim();
  if (!uid || !currentUid || uid === currentUid) { button.remove(); return; }
  try {
    const response = await request(`/api/social/follow-status/${encodeURIComponent(uid)}`);
    const data = await response.json().catch(() => ({}));
    const following = Boolean(data.following || data.isFollowing);
    button.textContent = following ? 'Following' : 'Follow';
    button.classList.toggle('following', following);
  } catch {
    button.textContent = 'Follow';
  }
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !button.classList.contains('following');
    button.disabled = true;
    try {
      const response = await request('/api/social/follow', { method:'POST', body:JSON.stringify({ targetUid:uid, follow:next }) });
      if (!response.ok) throw new Error('Could not update follow status.');
      button.classList.toggle('following', next);
      button.textContent = next ? 'Following' : 'Follow';
    } catch {
      button.textContent = button.classList.contains('following') ? 'Following' : 'Follow';
    } finally {
      button.disabled = false;
    }
  });
}

function process(root = document) {
  root.querySelectorAll?.('.post-card.video-post .post-head').forEach((head) => {
    if (head.querySelector('.indo-feed-follow')) return;
    const card = head.closest('.post-card.video-post');
    const ownerUid = card?.dataset.ownerUid || '';
    if (!ownerUid) return;
    const more = head.querySelector('.post-more');
    if (!more) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'indo-feed-follow';
    button.setAttribute('aria-label','Follow creator');
    button.textContent = 'Follow';
    head.insertBefore(button, more);
    setupButton(button, ownerUid);
  });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  style();
  process(document);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) process(node);
      }
    }
  });
  observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });
}

install();
