import { auth } from '../auth/firebase-client.js';

const KEY = Symbol.for('indo.profileRelations');

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function closeOverlay() {
  document.querySelector('.indo-profile-relations-overlay')?.remove();
}

function installStyles() {
  if (document.getElementById('indo-profile-relations-style')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-relations-style';
  style.textContent = `
    .indo-profile-relations-overlay{position:fixed;inset:0;z-index:40000;background:rgba(0,0,0,.84);display:grid;place-items:center;padding:14px}
    .indo-profile-relations-card{width:min(100%,520px);height:min(80vh,650px);background:#101015;border:1px solid #2a2a34;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
    .indo-profile-relations-head{height:56px;flex:0 0 56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #25252d;color:#fff}
    .indo-profile-relations-head strong{font-size:15px}.indo-profile-relations-head button{width:36px;height:36px;border:0;background:transparent;color:#fff;font-size:25px;cursor:pointer}
    .indo-profile-relations-list{flex:1;overflow:auto;padding:8px}
    .indo-profile-relations-row{width:100%;display:flex;align-items:center;gap:12px;padding:9px 10px;min-height:60px;border:0;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer}
    .indo-profile-relations-row:hover{background:#1a1a21}
    .indo-profile-relations-avatar{width:40px;height:40px;min-width:40px;border-radius:50%;display:grid;place-items:center;background:#292932;color:#fff;font-weight:800}
    .indo-profile-relations-user{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-profile-relations-name{font-size:11px;color:#8f8f99;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-profile-relations-empty{padding:42px 14px;text-align:center;color:#8f8f99;font-size:13px}
  `;
  document.head.appendChild(style);
}

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  return user.getIdToken();
}

async function loadRelation(targetUid, username, relation) {
  const apiBase = window.INDO_API_BASE || '';
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };
  const direct = await fetch(`${apiBase}/api/social/${relation}/${encodeURIComponent(targetUid)}`, { headers });
  if (direct.ok) {
    const data = await direct.json().catch(() => ({}));
    if (Array.isArray(data.items)) return data.items;
  }
  if (!username) return [];
  const profileResponse = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(username)}`, { headers });
  if (!profileResponse.ok) return [];
  const profileData = await profileResponse.json().catch(() => ({}));
  const profile = profileData.profile || {};
  const value = profile[relation] || {};
  return Object.values(value).filter((item) => item && item.uid).map((item) => ({
    uid: String(item.uid),
    userId: String(item.userId || ''),
    name: String(item.name || 'Indo User'),
  }));
}

function openRelation(targetUid, username, relation) {
  closeOverlay();
  installStyles();
  const title = relation === 'followers' ? 'Followers' : 'Following';
  const overlay = document.createElement('div');
  overlay.className = 'indo-profile-relations-overlay';
  overlay.innerHTML = `<div class="indo-profile-relations-card"><header class="indo-profile-relations-head"><strong>${title}</strong><button type="button" data-rel-close aria-label="Close">×</button></header><div class="indo-profile-relations-list"><div class="indo-profile-relations-empty">Loading...</div></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('[data-rel-close]')?.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeOverlay(); });

  const list = overlay.querySelector('.indo-profile-relations-list');
  loadRelation(targetUid, username, relation).then((items) => {
    if (!items.length) {
      list.innerHTML = '<div class="indo-profile-relations-empty">No users yet.</div>';
      return;
    }
    list.innerHTML = items.map((item) => {
      const userId = String(item.userId || '').replace(/^@/, '');
      const initial = (String(item.name || userId || 'U').trim().charAt(0) || 'U').toUpperCase();
      return `<button class="indo-profile-relations-row" type="button" data-rel-uid="${esc(item.uid)}" data-rel-user="${esc(userId)}"><div class="indo-profile-relations-avatar">${esc(initial)}</div><div><div class="indo-profile-relations-user">@${esc(userId || 'user')}</div><div class="indo-profile-relations-name">${esc(item.name || 'Indo User')}</div></div></button>`;
    }).join('');
    list.querySelectorAll('[data-rel-uid]').forEach((button) => button.addEventListener('click', async () => {
      const uid = button.dataset.relUid || '';
      const userId = button.dataset.relUser || '';
      closeOverlay();
      const { state } = await import('../../state.js');
      state.profile = { uid, ownerUid: uid, username: userId };
      state.screen = 'profile';
      if (window.__indoNavigate) await window.__indoNavigate('profile');
    }));
  }).catch((error) => {
    list.innerHTML = `<div class="indo-profile-relations-empty">${esc(error?.message || 'Could not load list.')}</div>`;
  });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('.profile-direct-stat[data-relation]') : null;
    if (!button) return;
    const relation = button.dataset.relation;
    if (relation !== 'followers' && relation !== 'following') return;
    const app = document.getElementById('root');
    if (!app || !app.contains(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const username = String(app.querySelector('.profile-direct-head h2')?.textContent || '').replace(/^@/, '').trim();
    const stateProfile = button.closest('#root')?.dataset?.profile;
    const targetUid = String(auth.currentUser?.uid || '').trim();
    openRelation(targetUid, username, relation);
  }, true);
}

install();
export { openRelation };
