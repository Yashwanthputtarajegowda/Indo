import { auth } from '../auth/firebase-client.js';

const KEY = Symbol.for('indo.profileFollowersList');

function styleOnce() {
  if (document.getElementById('indo-profile-followers-list-style')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-followers-list-style';
  style.textContent = `
    .indo-profile-stat-click{cursor:pointer;border:0;background:transparent;color:inherit;font:inherit;padding:0;}
    .indo-rel-modal{position:fixed;inset:0;z-index:35000;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:20px;}
    .indo-rel-card{width:min(100%,420px);max-height:min(78vh,620px);overflow:auto;background:#101016;border:1px solid #282830;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.65);}
    .indo-rel-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#101016;border-bottom:1px solid #24242b;z-index:1;}
    .indo-rel-head strong{font-size:15px;color:#fff;}
    .indo-rel-close{width:34px;height:34px;border:0;border-radius:50%;background:#1b1b22;color:#fff;font-size:22px;cursor:pointer;}
    .indo-rel-list{display:flex;flex-direction:column;}
    .indo-rel-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #1c1c23;color:#fff;}
    .indo-rel-avatar{width:38px;height:38px;min-width:38px;border-radius:50%;display:grid;place-items:center;background:#2a2a31;font-weight:800;}
    .indo-rel-name{font-size:13px;font-weight:700;line-height:1.2;}
    .indo-rel-id{font-size:11px;color:#92929d;margin-top:2px;}
    .indo-rel-empty{padding:28px 16px;text-align:center;color:#8d8d98;font-size:13px;}
  `;
  document.head.appendChild(style);
}

async function request(path) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load list.');
  return data;
}

function currentUsername(root) {
  return String(root.querySelector('.profile-direct-head h2')?.textContent || '').trim().replace(/^@/, '');
}

async function resolveUid(root) {
  const username = currentUsername(root);
  if (!username) throw new Error('Profile username is missing.');
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(username)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.profile?.uid) throw new Error(data.error || 'Profile not found.');
  return String(data.profile.uid);
}

function closeModal() {
  document.querySelector('.indo-rel-modal')?.remove();
}

async function openList(root, relation) {
  styleOnce();
  closeModal();
  const modal = document.createElement('div');
  modal.className = 'indo-rel-modal';
  modal.innerHTML = `<section class="indo-rel-card"><header class="indo-rel-head"><strong>${relation === 'followers' ? 'Followers' : 'Following'}</strong><button class="indo-rel-close" type="button" aria-label="Close">×</button></header><div class="indo-rel-list"><div class="indo-rel-empty">Loading...</div></div></section>`;
  document.body.appendChild(modal);
  modal.querySelector('.indo-rel-close')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  try {
    const uid = await resolveUid(root);
    const data = await request(`/api/social/${relation}/${encodeURIComponent(uid)}`);
    const list = Array.isArray(data.items) ? data.items : [];
    const container = modal.querySelector('.indo-rel-list');
    container.innerHTML = list.length ? list.map((item) => {
      const id = String(item.userId || '').replace(/^@/, '');
      const name = String(item.name || 'Indo User');
      const initial = (name.trim().charAt(0) || id.charAt(0) || 'U').toUpperCase();
      return `<div class="indo-rel-row"><div class="indo-rel-avatar">${initial}</div><div><div class="indo-rel-name">${name}</div><div class="indo-rel-id">@${id}</div></div></div>`;
    }).join('') : '<div class="indo-rel-empty">No users yet.</div>';

    const stat = relation === 'followers' ? root.querySelector('.profile-direct-stats > div:nth-child(2) b') : root.querySelector('.profile-direct-stats > div:nth-child(3) b');
    if (stat) stat.textContent = String(list.length);
  } catch (error) {
    modal.querySelector('.indo-rel-list').innerHTML = `<div class="indo-rel-empty">${String(error?.message || 'Could not load list.')}</div>`;
  }
}

function install(root = document) {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  styleOnce();
  const bind = (container) => {
    const stats = container.querySelector?.('.profile-direct-stats');
    if (!stats || stats.dataset.followersBound === '1') return;
    stats.dataset.followersBound = '1';
    const followerStat = stats.querySelector(':scope > div:nth-child(2)');
    const followingStat = stats.querySelector(':scope > div:nth-child(3)');
    [followerStat, followingStat].forEach((item) => item?.classList.add('indo-profile-stat-click'));
    followerStat?.addEventListener('click', () => openList(container, 'followers'));
    followingStat?.addEventListener('click', () => openList(container, 'following'));
  };
  bind(root);
  const observer = new MutationObserver(() => bind(root));
  observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });
}

install();
export { install };
