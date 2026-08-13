import { state } from '../../state.js';

const KEY = Symbol.for('indo.profileRelationsV6');

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;'
  }[c]));
}

function styleOnce() {
  if (document.getElementById('indo-profile-relations-v6-style')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-relations-v6-style';
  style.textContent = `
    .indo-rel-v6{position:fixed;inset:0;z-index:35000;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:14px}
    .indo-rel-v6-card{width:min(100%,520px);height:min(80vh,640px);background:#101016;border:1px solid #282830;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 18px 60px rgba(0,0,0,.65)}
    .indo-rel-v6-head{height:56px;flex:0 0 56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #24242b;color:#fff}
    .indo-rel-v6-head strong{font-size:15px}.indo-rel-v6-close{width:34px;height:34px;border:0;border-radius:50%;background:#1b1b22;color:#fff;font-size:22px;cursor:pointer}
    .indo-rel-v6-list{flex:1;overflow:auto;padding:8px}.indo-rel-v6-row{width:100%;display:flex;align-items:center;gap:12px;padding:11px 10px;min-height:60px;border:0;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer}.indo-rel-v6-row:hover{background:#1a1a21}
    .indo-rel-v6-avatar{width:40px;height:40px;min-width:40px;border-radius:50%;display:grid;place-items:center;background:#2a2a31;font-weight:800}.indo-rel-v6-name{font-size:13px;font-weight:700;line-height:1.2}.indo-rel-v6-id{font-size:11px;color:#92929d;margin-top:2px}.indo-rel-v6-empty{padding:36px 16px;text-align:center;color:#8d8d98;font-size:13px}
  `;
  document.head.appendChild(style);
}

function closeList() { document.querySelector('.indo-rel-v6')?.remove(); }

async function getProfile(username) {
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(username)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.profile) throw new Error(data.error || 'Profile could not be loaded.');
  return data.profile;
}

function mapRelation(value) {
  return Object.values(value || {}).filter((item) => item && item.uid).map((item) => ({
    uid: String(item.uid),
    userId: String(item.userId || item.username || ''),
    name: String(item.name || 'Indo User')
  }));
}

async function loadRelation(username, relation) {
  const profile = await getProfile(username);
  let items = mapRelation(profile[relation]);
  if (items.length) return items;
  const countKey = relation === 'followers' ? 'followersCount' : 'followingCount';
  if (Number(profile[countKey] || 0) === 0) return [];
  const targetUid = String(profile.uid || profile.ownerUid || '').trim();
  if (!targetUid) return [];
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/social/${relation}/${encodeURIComponent(targetUid)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Could not load ${relation}.`);
  return Array.isArray(data.items) ? data.items : [];
}

function openRelation(username, relation) {
  closeList();
  styleOnce();
  const modal = document.createElement('div');
  modal.className = 'indo-rel-v6';
  modal.innerHTML = `<section class="indo-rel-v6-card"><header class="indo-rel-v6-head"><strong>${relation === 'followers' ? 'Followers' : 'Following'}</strong><button class="indo-rel-v6-close" type="button" aria-label="Close">×</button></header><div class="indo-rel-v6-list"><div class="indo-rel-v6-empty">Loading...</div></div></section>`;
  document.body.appendChild(modal);
  modal.querySelector('.indo-rel-v6-close')?.addEventListener('click', closeList);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeList(); });
  const list = modal.querySelector('.indo-rel-v6-list');

  loadRelation(username, relation).then((items) => {
    if (!items.length) {
      list.innerHTML = '<div class="indo-rel-v6-empty">No users yet.</div>';
      return;
    }
    list.innerHTML = items.map((item) => {
      const userId = String(item.userId || item.username || '').replace(/^@/, '');
      const name = String(item.name || 'Indo User');
      const initial = (name.trim().charAt(0) || userId.charAt(0) || 'U').toUpperCase();
      return `<button class="indo-rel-v6-row" type="button" data-rel-uid="${esc(item.uid)}" data-rel-user="${esc(userId)}"><div class="indo-rel-v6-avatar">${esc(initial)}</div><div><div class="indo-rel-v6-name">${esc(name)}</div><div class="indo-rel-v6-id">@${esc(userId || 'user')}</div></div></button>`;
    }).join('');
    list.querySelectorAll('[data-rel-uid]').forEach((button) => button.addEventListener('click', async () => {
      const uid = button.dataset.relUid || '';
      const userId = button.dataset.relUser || '';
      closeList();
      state.profile = { uid, ownerUid: uid, username: userId };
      state.screen = 'profile';
      if (window.__indoNavigate) await window.__indoNavigate('profile');
    }));
  }).catch((error) => {
    list.innerHTML = `<div class="indo-rel-v6-empty">${esc(error?.message || 'Could not load list.')}</div>`;
  });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  styleOnce();
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('.profile-direct-stat[data-relation]') : null;
    if (!target) return;
    const relation = target.dataset.relation;
    if (relation !== 'followers' && relation !== 'following') return;
    const root = document.getElementById('root');
    if (!root?.contains(target)) return;
    const username = String(root.querySelector('.profile-direct-head h2')?.textContent || '').trim().replace(/^@/, '');
    if (!username) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openRelation(username, relation);
  }, true);
}

install();
export { install };
