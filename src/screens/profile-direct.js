import { auth } from '../features/auth/firebase-client.js';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function installStyles() {
  if (document.getElementById('indo-profile-direct-v3')) return;
  const s = document.createElement('style');
  s.id = 'indo-profile-direct-v3';
  s.textContent = `
    .profile-direct-page{width:100%;max-width:520px;min-height:calc(100vh - 64px);padding:20px 15px 88px;margin:0 auto;box-sizing:border-box}
    .profile-direct-head{width:100%;max-width:520px;height:64px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 18px;margin:0 auto;border-bottom:1px solid #18181e;background:rgba(7,7,10,.92);position:sticky;top:0;z-index:5;backdrop-filter:blur(16px)}
    .profile-direct-head button{width:40px;height:40px;border:0;background:none;color:#fff;font-size:30px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer}
    .profile-direct-head h2{font-size:17px;line-height:1;margin:0;font-weight:800;color:#fff}
    .profile-direct-head>span{width:40px;text-align:right;font-size:20px}
    .profile-direct-row{display:flex;align-items:center;gap:24px;width:100%;margin:0 0 18px}
    .profile-direct-avatar{width:70px;height:70px;min-width:70px;flex:0 0 70px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#333,#121217);color:#fff;font-size:23px;font-weight:800}
    .profile-direct-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
    .profile-direct-username{font-size:15px;font-weight:800;line-height:1.15;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .profile-direct-follow{width:100%;height:38px;border:1px solid #303039;border-radius:7px;background:#17171d;color:#fff;font-weight:700;cursor:pointer}
    .profile-direct-follow.following{background:#2a2a31}
    .profile-direct-follow:disabled{opacity:.65}
    .profile-direct-stats{display:flex;justify-content:space-between;flex:1;gap:14px;margin:0 0 20px;text-align:center}
    .profile-direct-stats>div{display:flex;flex-direction:column;text-align:center;gap:4px;flex:1}
    .profile-direct-stats b{display:block;font-size:16px;line-height:1.1}.profile-direct-stats span{display:block;font-size:10px;color:#8e8e98;margin:0}
    .profile-direct-edit{width:100%;height:38px;border:1px solid #292931;border-radius:7px;background:#17171d;color:#fff;font-weight:700;margin:0 0 18px}
    .profile-direct-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:2px;width:100%}
    .profile-direct-item{aspect-ratio:1;border:0;padding:0;position:relative;overflow:hidden;background:#111}
    .profile-direct-item video{width:100%;height:100%;object-fit:cover;display:block}
    .profile-direct-empty{grid-column:1/-1;padding:45px 15px;text-align:center;color:#858591;font-size:13px}
    .profile-direct-nav{position:fixed!important;left:50%!important;right:auto!important;bottom:0!important;transform:translateX(-50%)!important;width:520px!important;max-width:100vw!important;height:70px!important;box-sizing:border-box!important;background:rgba(9,9,12,.96)!important;border-top:1px solid #1a1a21!important;display:flex!important;justify-content:space-around!important;align-items:center!important;z-index:9999!important;backdrop-filter:blur(18px)!important}
    .profile-direct-nav button{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;min-width:55px!important;padding:0!important;border:0!important;background:none!important;color:#888893!important;font-size:24px!important;line-height:1!important}.profile-direct-nav button span{display:block!important;font-size:9px!important;line-height:1!important}.profile-direct-nav button[data-screen="create"]{font-size:31px!important}
  `;
  document.head.appendChild(s);
}

function removeForeignBottomNavs(app) {
  document.querySelectorAll('.bottom-nav').forEach((node) => { if (!app.contains(node)) node.remove(); });
  document.querySelectorAll('.profile-direct-nav').forEach((node) => { if (!app.contains(node)) node.remove(); });
}

async function authRequest(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  return fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
}

async function loadTargetVideos(targetUid) {
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/videos?limit=50`);
  if (!response.ok) return [];
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data.videos) ? data.videos.filter((v) => String(v.ownerUid || '') === String(targetUid || '')) : [];
}

export async function renderProfile(app, profile = null) {
  installStyles();
  removeForeignBottomNavs(app);

  const currentUid = String(auth.currentUser?.uid || '').trim();
  const requestedUid = String(profile?.uid || profile?.userId || profile?.ownerUid || '').trim();
  const targetUid = requestedUid || currentUid;
  const own = !!currentUid && !!targetUid && currentUid === targetUid;
  const fallbackUsername = String(auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || currentUid.slice(0, 8) || 'user').replace(/^@/, '');
  const username = String(profile?.username || (own ? fallbackUsername : 'user')).replace(/^@/, '');
  const initial = username.charAt(0).toUpperCase() || 'U';
  const followers = Number(profile?.followersCount || 0);
  const following = Number(profile?.followingCount || 0);

  app.innerHTML = `<div class="app-shell">
    <header class="profile-direct-head"><button type="button" data-screen="home" aria-label="Back">‹</button><h2>${esc(username)}</h2><span>${own ? '⚙' : ''}</span></header>
    <main class="profile-direct-page">
      <section class="profile-direct-row">
        <div class="profile-direct-avatar">${esc(initial)}</div>
        <div class="profile-direct-info">
          <div class="profile-direct-username">@${esc(username)}</div>
          ${own ? '' : '<button class="profile-direct-follow" type="button" data-follow>Follow</button>'}
        </div>
      </section>
      <section class="profile-direct-stats"><div><b data-posts>0</b><span>Posts</span></div><div><b>${followers}</b><span>Followers</span></div><div><b>${following}</b><span>Following</span></div></section>
      ${own ? '<button class="profile-direct-edit" type="button" data-screen="settings">Edit Profile</button>' : ''}
      <div class="profile-direct-grid" data-grid><div class="profile-direct-empty">Loading posts...</div></div>
    </main>
    <nav class="profile-direct-nav" style="position:fixed;left:50%;right:auto;bottom:0;transform:translateX(-50%);width:520px;max-width:100vw;height:70px;display:flex;justify-content:space-around;align-items:center;z-index:9999"><button data-screen="home">⌂<span>Home</span></button><button data-screen="search">⌕<span>Search</span></button><button data-screen="reels">▶<span>Reels</span></button><button data-screen="create">＋<span>Create</span></button><button data-screen="profile">●<span>Profile</span></button></nav>
  </div>`;

  const followButton = app.querySelector('[data-follow]');
  if (followButton && targetUid) {
    try {
      const statusResponse = await authRequest(`/api/social/follow-status/${encodeURIComponent(targetUid)}`);
      const status = await statusResponse.json().catch(() => ({}));
      const isFollowing = Boolean(status.following || status.isFollowing);
      followButton.textContent = isFollowing ? 'Following' : 'Follow';
      followButton.classList.toggle('following', isFollowing);
    } catch {}
    followButton.addEventListener('click', async () => {
      const next = !followButton.classList.contains('following');
      followButton.disabled = true;
      try {
        const response = await authRequest('/api/social/follow', { method:'POST', body:JSON.stringify({ targetUid, follow:next }) });
        if (!response.ok) throw new Error('Could not update follow status.');
        followButton.classList.toggle('following', next);
        followButton.textContent = next ? 'Following' : 'Follow';
      } catch (error) {
        followButton.textContent = error.message || 'Try again';
      } finally {
        followButton.disabled = false;
      }
    });
  }

  try {
    const videos = await loadTargetVideos(targetUid);
    app.querySelector('[data-posts]').textContent = String(videos.length);
    const grid = app.querySelector('[data-grid]');
    grid.innerHTML = videos.length ? videos.map((v) => `<button class="profile-direct-item" type="button"><video muted playsinline preload="metadata" src="${esc(v.secureUrl || v.videoUrl || v.url || '')}"></video></button>`).join('') : '<div class="profile-direct-empty">No posts yet.</div>';
  } catch {
    app.querySelector('[data-grid]').innerHTML = '<div class="profile-direct-empty">Could not load posts right now.</div>';
  }
}
