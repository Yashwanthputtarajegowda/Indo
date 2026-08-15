import { auth } from '../features/auth/firebase-client.js';
import { renderIndoBrandTopbar } from '../components/indo-brand-topbar.js';
import { renderHomeTopbar } from './home-topbar-v230.js';
import { nav } from '../components/nav.js';

const STYLE_ID = 'indo-profile-v237-styles';
const API_BASE = () => window.INDO_API_BASE || '';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[c]));
}

function fmtCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function initialFor(name, userId) {
  return (String(name || userId || 'I').replace(/^@/, '').trim().charAt(0) || 'I').toUpperCase();
}

async function token() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  return user.getIdToken();
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth !== false) headers.Authorization = `Bearer ${await token()}`;
  const response = await fetch(`${API_BASE()}${path}`, { ...options, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

function avatarHtml(profile, size = 'lg') {
  const avatar = String(profile?.avatarUrl || profile?.photoURL || profile?.photoUrl || '').trim();
  const sizeClass = size === 'sm' ? 'profile-v237-avatar-sm' : 'profile-v237-avatar-lg';
  if (avatar) return `<div class="${sizeClass} profile-v237-avatar"><img src="${esc(avatar)}" alt="${esc(profile?.name || 'Profile')}" loading="lazy"></div>`;
  return `<div class="${sizeClass} profile-v237-avatar profile-v237-avatar-fallback">${esc(initialFor(profile?.name, profile?.userId || profile?.username))}</div>`;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .profile-v237-shell{width:min(100%,520px);min-height:100vh;margin:0 auto;background:#05070d;color:#f4f7ff;position:relative;padding-bottom:78px;overflow-x:hidden}
    .profile-v237-top{position:relative;padding:18px 16px 0;background:radial-gradient(circle at 50% 0%,rgba(116,73,255,.16),transparent 38%),linear-gradient(180deg,#060914 0%,#05070d 100%);overflow:hidden}
    .profile-v237-top::before,.profile-v237-top::after{content:'';position:absolute;border:1px solid rgba(82,217,255,.12);border-radius:50%;pointer-events:none}.profile-v237-top::before{width:270px;height:110px;left:50%;top:25px;transform:translateX(-50%) rotate(-7deg)}.profile-v237-top::after{width:320px;height:160px;left:50%;top:5px;transform:translateX(-50%) rotate(8deg)}
    .profile-v237-head{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2}.profile-v237-icon{width:38px;height:38px;border:1px solid #272c45;border-radius:12px;background:#0d1120;color:#fff;display:grid;place-items:center;font-size:18px}.profile-v237-icon button,.profile-v237-icon{cursor:pointer}
    .profile-v237-avatar-wrap{position:relative;z-index:2;width:148px;height:148px;margin:18px auto 0;display:grid;place-items:center}.profile-v237-avatar-orbit{position:absolute;inset:0;border:2px solid transparent;border-radius:50%;background:linear-gradient(135deg,#ff39a8,#774cff,#27d8ff) border-box;-webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}.profile-v237-avatar-orbit::before{content:'';position:absolute;inset:10px;border:1px solid rgba(255,255,255,.25);border-radius:50%;transform:rotate(27deg) scaleX(.72)}.profile-v237-avatar-orbit::after{content:'';position:absolute;width:10px;height:10px;border-radius:50%;background:#2bdf86;right:7px;bottom:25px;box-shadow:0 0 0 3px #05070d,0 0 12px #2bdf86}.profile-v237-avatar{overflow:hidden;display:grid;place-items:center}.profile-v237-avatar-lg{width:118px;height:118px;border-radius:50%;background:#171c2d;border:4px solid #0b0f1b;box-shadow:0 0 32px rgba(129,74,255,.23)}.profile-v237-avatar img{width:100%;height:100%;object-fit:cover}.profile-v237-avatar-fallback{font-size:42px;font-weight:900;color:#fff}
    .profile-v237-name{text-align:center;position:relative;z-index:2;margin-top:8px;font-size:24px;font-weight:900;letter-spacing:.2px}.profile-v237-userid{text-align:center;color:#8d94a9;font-size:12px;margin-top:4px}.profile-v237-role{text-align:center;color:#fff;margin-top:10px;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}.profile-v237-quote{position:relative;z-index:2;max-width:360px;margin:12px auto 18px;padding:12px 18px;border-left:2px solid #ff3ea9;border-right:2px solid #27d8ff;color:#e7eaf3;text-align:center;font-size:14px;line-height:1.45;font-style:italic;background:rgba(11,15,28,.48);border-radius:16px}
    .profile-v237-create{position:relative;z-index:3;margin:6px auto 16px;width:280px;height:170px}.profile-v237-create-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:108px;height:108px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 25%,#ff56bd,#7a48ff 60%,#3b2f9a);box-shadow:0 0 36px rgba(152,67,255,.38);color:#fff;font-weight:900;letter-spacing:1px;cursor:pointer;border:0}.profile-v237-create-center span{font-size:27px;display:block;text-align:center}.profile-v237-create-center small{display:block;font-size:10px;margin-top:3px}.profile-v237-create-item{position:absolute;width:92px;height:56px;border:1px solid #26304a;border-radius:16px;background:rgba(10,14,25,.9);color:#eaf0ff;font-size:10px;font-weight:800;display:grid;place-items:center;cursor:pointer}.profile-v237-create-upload{left:0;top:56px;color:#bb9cff}.profile-v237-create-live{right:0;top:56px;color:#2ce4ff}.profile-v237-create-write{left:26px;top:4px;color:#ff4fae}.profile-v237-create-drafts{right:26px;top:4px;color:#ffc44a}.profile-v237-create-idea{left:50%;bottom:-16px;transform:translateX(-50%);color:#5cf3b7}
    .profile-v237-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:10px 0 16px;padding:1px;border:1px solid #22283a;border-radius:18px;overflow:hidden;background:#1f2536;position:relative;z-index:3}.profile-v237-stat{background:#080b13;padding:12px 6px;text-align:center}.profile-v237-stat b{display:block;font-size:18px}.profile-v237-stat span{display:block;margin-top:4px;font-size:9px;color:#8b92a5;text-transform:uppercase;letter-spacing:.7px}
    .profile-v237-actions{display:grid;grid-template-columns:1.8fr 1fr 52px;gap:8px;margin-bottom:16px}.profile-v237-action{height:40px;border:1px solid #29324c;border-radius:12px;background:#0c1020;color:#fff;font-weight:800;cursor:pointer}.profile-v237-action.primary{background:linear-gradient(110deg,#743cff,#d72db5,#ff6e3f);border:0}.profile-v237-action.icon{font-size:17px}
    .profile-v237-section{padding:0 14px}.profile-v237-section-head{display:flex;align-items:center;justify-content:space-between;margin:16px 2px 10px}.profile-v237-section-head strong{font-size:15px}.profile-v237-section-head button{border:0;background:none;color:#a876ff;font-size:11px;font-weight:800;cursor:pointer}
    .profile-v237-worlds{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;overflow-x:auto;padding-bottom:2px}.profile-v237-world{min-width:70px;height:76px;border-radius:18px;background:linear-gradient(155deg,#12182c,#0a0e18);border:1px solid #26304a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}.profile-v237-world span{font-size:21px}.profile-v237-world b{font-size:9px}.profile-v237-world small{font-size:8px;color:#7e879d}
    .profile-v237-content{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.profile-v237-media{aspect-ratio:4/5;position:relative;overflow:hidden;border-radius:12px;background:#111725;cursor:pointer;border:1px solid #1f2738}.profile-v237-media img,.profile-v237-media video{width:100%;height:100%;object-fit:cover}.profile-v237-media::after{content:'';position:absolute;left:0;right:0;bottom:0;height:32%;background:linear-gradient(transparent,rgba(0,0,0,.78));pointer-events:none}.profile-v237-views{position:absolute;left:7px;bottom:7px;z-index:2;font-size:9px;font-weight:900;color:#fff}.profile-v237-empty{padding:34px 8px;text-align:center;color:#777f94;font-size:12px;grid-column:1/-1}
    .profile-v237-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:16px 0 10px;padding:4px;border:1px solid #22283a;background:#090d18;border-radius:14px;position:sticky;top:0;z-index:20;backdrop-filter:blur(12px)}.profile-v237-tab{height:36px;border:0;border-radius:10px;background:transparent;color:#858ea3;font-size:10px;font-weight:800;cursor:pointer}.profile-v237-tab.active{background:linear-gradient(100deg,rgba(121,64,255,.28),rgba(255,53,185,.24));color:#fff}
    .profile-v237-panel{display:none}.profile-v237-panel.active{display:block}.profile-v237-about-card{border:1px solid #222b44;border-radius:18px;padding:16px;background:linear-gradient(145deg,#0d1322,#080c15);margin-bottom:10px}.profile-v237-about-title{font-size:12px;color:#c8d1e8;font-weight:900;margin-bottom:8px}.profile-v237-about-text{font-size:13px;line-height:1.55;color:#dce2f0}.profile-v237-about-row{display:flex;gap:9px;padding:9px 0;border-bottom:1px solid #182033;font-size:11px;color:#9ba4b7}.profile-v237-about-row:last-child{border-bottom:0}.profile-v237-about-row strong{color:#fff;font-weight:800;min-width:82px}
    .profile-v237-person-list{display:grid;gap:8px}.profile-v237-person{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #202941;border-radius:15px;background:#090d18}.profile-v237-person-meta{min-width:0;flex:1}.profile-v237-person-name{font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.profile-v237-person-id{font-size:9px;color:#7f889d;margin-top:2px}.profile-v237-person-action{width:84px;height:32px;border:1px solid #7d43ff;border-radius:10px;background:transparent;color:#c8b4ff;font-size:9px;font-weight:900}.profile-v237-person-action.following{border-color:#2adf97;color:#2adf97}
    .profile-v237-other-card{border:1px solid #212b43;border-radius:18px;padding:14px;background:linear-gradient(150deg,#10162a,#080d17);margin-bottom:12px}.profile-v237-other-actions{display:grid;grid-template-columns:1fr 1fr 44px;gap:8px;margin-top:12px}.profile-v237-other-actions button{height:38px;border:1px solid #2a3551;border-radius:11px;background:#0a0f1c;color:#fff;font-weight:800}.profile-v237-other-actions .follow{background:linear-gradient(110deg,#6f43ff,#d52cb4);border:0}
    .profile-v237-bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,520px);height:68px;background:#0a0e18;border-top:1px solid #21273a;display:grid;grid-template-columns:repeat(5,1fr);z-index:9001}.profile-v237-bottom button{border:0;background:transparent;color:#798197;font-size:9px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.profile-v237-bottom button strong{font-size:20px;line-height:1}.profile-v237-bottom button.active{color:#ff49b7}.profile-v237-bottom .create{font-size:30px;color:#fff;background:linear-gradient(135deg,#7044ff,#e937af);width:48px;height:48px;border-radius:50%;justify-self:center;align-self:center;box-shadow:0 0 20px rgba(197,44,198,.35)}
    @media(max-width:390px){.profile-v237-content{grid-template-columns:repeat(3,1fr)}.profile-v237-world{min-width:62px}.profile-v237-create{width:250px}.profile-v237-create-item{width:80px}}
  `;
  document.head.appendChild(style);
}

function renderWorlds() {
  const worlds = [
    ['✈','Travel','24'], ['🌿','Nature','18'], ['🎬','BTS','12'], ['☀','Life','16'], ['＋','New','']
  ];
  return worlds.map(([icon,name,count]) => `<div class="profile-v237-world"><span>${icon}</span><b>${name}</b><small>${count}</small></div>`).join('');
}

function renderMedia(videos) {
  if (!videos.length) return '<div class="profile-v237-empty">No videos uploaded yet.</div>';
  return videos.slice(0,12).map((video) => {
    const poster = String(video.thumbnailUrl || video.thumbUrl || video.poster || '').trim();
    const src = String(video.secureUrl || video.videoUrl || video.url || '').trim();
    return `<button class="profile-v237-media" type="button" data-video-url="${esc(src)}" data-video-title="${esc(video.title || '')}">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : `<video src="${esc(src)}" muted playsinline preload="metadata"></video>`}<span class="profile-v237-views">▶ ${esc(fmtCount(video.views || 0))}</span></button>`;
  }).join('');
}

function renderPersonList(items = [], empty = 'No users yet.') {
  if (!items.length) return `<div class="profile-v237-empty">${esc(empty)}</div>`;
  return `<div class="profile-v237-person-list">${items.map((item) => {
    const userId = String(item.userId || item.username || '').replace(/^@/, '');
    return `<button class="profile-v237-person" type="button" data-profile-link="${esc(userId)}">${avatarHtml({ ...item, userId }, 'sm')}<span class="profile-v237-person-meta"><span class="profile-v237-person-name">${esc(item.name || 'Indo User')}</span><span class="profile-v237-person-id">@${esc(userId)}</span></span><span class="profile-v237-person-action ${item.following ? 'following' : ''}">${item.following ? 'Following' : 'Follow'}</span></button>`;
  }).join('')}</div>`;
}

async function loadProfile(username) {
  const clean = String(username || '').replace(/^@/, '').trim();
  if (!clean) return null;
  const data = await api(`/api/account/profile/${encodeURIComponent(clean)}`);
  return data?.profile ? { ...data.profile, stats: data.stats || {}, social: data.social || {} } : null;
}

async function loadVideosFor(uid) {
  if (!uid) return [];
  try {
    const data = await api('/api/media/videos?limit=50', { auth: false });
    return Array.isArray(data?.videos) ? data.videos.filter((video) => String(video.ownerUid || '') === String(uid)) : [];
  } catch { return []; }
}

async function loadRelations(uid, kind) {
  try {
    const data = await api(`/api/social/${kind}/${encodeURIComponent(uid)}`);
    return Array.isArray(data?.items) ? data.items : [];
  } catch { return []; }
}

function showVideo(url, title='') {
  if (!url) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:30000;display:grid;place-items:center;padding:0';
  overlay.innerHTML = `<div style="position:relative;width:min(100%,520px);height:100vh;background:#000"><button type="button" style="position:absolute;z-index:3;top:14px;left:14px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:24px">×</button><div style="position:absolute;z-index:2;left:64px;right:20px;top:20px;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(title || 'Indo video')}</div><video src="${esc(url)}" controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;background:#000"></video></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('button')?.addEventListener('click', () => { overlay.querySelector('video')?.pause(); overlay.remove(); });
}

async function followUser(targetUid, button) {
  try {
    const current = await api(`/api/social/follow-status/${encodeURIComponent(targetUid)}`);
    const next = !Boolean(current?.following);
    button.disabled = true;
    const data = await api('/api/social/follow', { method: 'POST', body: JSON.stringify({ targetUid, follow: next }) });
    button.textContent = data?.pending ? 'Requested' : data?.following ? 'Following' : 'Follow';
    button.classList.toggle('following', Boolean(data?.following));
  } catch (error) {
    button.textContent = error?.message || 'Follow';
  } finally { button.disabled = false; }
}

export async function renderProfile(app, profileArg = null) {
  installStyles();
  const currentUid = String(auth.currentUser?.uid || '');
  const requestedUid = String(profileArg?.uid || profileArg?.ownerUid || '').trim();
  const requestedUserId = String(profileArg?.userId || profileArg?.username || '').replace(/^@/, '').trim();
  let own = false;
  let profile = null;

  try {
    if (requestedUid && requestedUid === currentUid) own = true;
    else if (requestedUserId) {
      profile = await loadProfile(requestedUserId);
      own = Boolean(currentUid && profile?.uid && String(profile.uid) === currentUid);
    } else own = true;

    if (own) {
      const me = auth.currentUser;
      const fallback = String(me?.displayName || me?.email?.split('@')[0] || 'user').replace(/^@/, '');
      profile = await loadProfile(profile?.userId || fallback).catch(() => null) || profile || { uid: currentUid, userId: fallback, name: me?.displayName || fallback };
    }
    if (!profile) throw new Error('Profile could not be loaded.');
  } catch (error) {
    app.innerHTML = `<div class="profile-v237-shell"><main style="padding:40px 18px;text-align:center;color:#9199ad"><h2>Profile unavailable</h2><p>${esc(error?.message || 'Could not load this profile.')}</p></main></div>`;
    return;
  }

  const userId = String(profile.userId || profile.username || '').replace(/^@/, '');
  const name = String(profile.name || 'Indo User');
  const bio = String(profile.bio || profile.about || 'Creating moments, ideas and stories on Indo.');
  const followers = Number(profile.followersCount ?? profile.stats?.followersCount ?? 0);
  const following = Number(profile.followingCount ?? profile.stats?.followingCount ?? 0);
  const videos = Number(profile.videosCount ?? profile.stats?.videosCount ?? profile.postsCount ?? 0);
  const worlds = String(profile.interests || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0,5);
  const videoItems = await loadVideosFor(profile.uid || profile.ownerUid || currentUid);
  const followersList = await loadRelations(profile.uid || profile.ownerUid || currentUid, 'followers');
  const followingList = await loadRelations(profile.uid || profile.ownerUid || currentUid, 'following');

  const topbar = renderIndoBrandTopbar({ rightLabel: 'Profile' });
  app.innerHTML = `<div class="profile-v237-shell">
    ${topbar}
    <main class="profile-v237-top">
      <div class="profile-v237-head">
        <button class="profile-v237-icon" type="button" data-screen="home" aria-label="Back">☰</button>
        <div style="display:flex;gap:8px"><button class="profile-v237-icon" type="button" data-profile-share aria-label="Share">↗</button><button class="profile-v237-icon" type="button" data-screen="settings" aria-label="Settings">⚙</button></div>
      </div>
      <div class="profile-v237-avatar-wrap"><div class="profile-v237-avatar-orbit"></div>${avatarHtml(profile)}</div>
      <div class="profile-v237-name">${esc(name)}</div>
      <div class="profile-v237-userid">@${esc(userId)}</div>
      <div class="profile-v237-role">${esc(profile.role || (own ? 'Content Creator' : 'Indo Creator'))}</div>
      <div class="profile-v237-quote">“${esc(bio)}”</div>
      ${own ? `<div class="profile-v237-create"><button class="profile-v237-create-center" type="button" data-screen="create"><span>＋</span><small>CREATE</small></button><button class="profile-v237-create-item profile-v237-create-upload" type="button" data-screen="upload-video">▣ Upload</button><button class="profile-v237-create-item profile-v237-create-live" type="button">● Go Live</button><button class="profile-v237-create-item profile-v237-create-write" type="button">✎ Write</button><button class="profile-v237-create-item profile-v237-create-drafts" type="button">□ Drafts</button><button class="profile-v237-create-item profile-v237-create-idea" type="button">✦ Idea Lab</button></div>` : `<div class="profile-v237-other-card"><div>${esc(profile.location || 'Indo creator')}</div><div class="profile-v237-other-actions"><button class="follow" type="button" data-follow-owner="${esc(profile.uid || '')}">Follow</button><button type="button" data-screen="messages">Message</button><button type="button" data-profile-share>↗</button></div></div>`}
      <div class="profile-v237-stats"><button class="profile-v237-stat" type="button" data-tab="videos"><b>${fmtCount(videos)}</b><span>Videos</span></button><button class="profile-v237-stat" type="button" data-tab="followers"><b>${fmtCount(followers)}</b><span>Followers</span></button><button class="profile-v237-stat" type="button" data-tab="following"><b>${fmtCount(following)}</b><span>Following</span></button></div>
    </main>

    <section class="profile-v237-section">
      ${own ? `<div class="profile-v237-actions"><button class="profile-v237-action primary" type="button" data-screen="settings">✎ Edit Profile</button><button class="profile-v237-action" type="button" data-profile-share>Share</button><button class="profile-v237-action icon" type="button" data-screen="settings">⋯</button></div>` : ''}
      <div class="profile-v237-tabs"><button class="profile-v237-tab active" data-tab="videos">Videos</button><button class="profile-v237-tab" data-tab="about">About</button><button class="profile-v237-tab" data-tab="followers">Followers</button><button class="profile-v237-tab" data-tab="following">Following</button></div>

      <div class="profile-v237-panel active" data-panel="videos">
        <div class="profile-v237-section-head"><strong>My Worlds</strong><button type="button">View all</button></div>
        <div class="profile-v237-worlds">${worlds.length ? worlds.map((w, i) => `<div class="profile-v237-world"><span>${['✈','🌿','🎬','☀','♡'][i] || '✦'}</span><b>${esc(w)}</b><small>${i+1}</small></div>`).join('') : renderWorlds()}</div>
        <div class="profile-v237-section-head"><strong>${own ? 'Recent Content' : 'Content'}</strong><button type="button">See all</button></div>
        <div class="profile-v237-content" data-profile-content>${renderMedia(videoItems)}</div>
      </div>

      <div class="profile-v237-panel" data-panel="about">
        <div class="profile-v237-about-card"><div class="profile-v237-about-title">About</div><div class="profile-v237-about-text">${esc(bio)}</div></div>
        <div class="profile-v237-about-card"><div class="profile-v237-about-title">Profile details</div><div class="profile-v237-about-row"><strong>Location</strong><span>${esc(profile.location || 'Not added')}</span></div><div class="profile-v237-about-row"><strong>Joined</strong><span>${esc(profile.joinedDate || profile.createdAt ? new Date(Number(profile.createdAt || Date.now())).toLocaleDateString() : 'Indo')}</span></div><div class="profile-v237-about-row"><strong>Interests</strong><span>${esc(worlds.length ? worlds.join(' · ') : 'Not added')}</span></div><div class="profile-v237-about-row"><strong>User ID</strong><span>@${esc(userId)}</span></div></div>
      </div>

      <div class="profile-v237-panel" data-panel="followers">${renderPersonList(followersList, 'No followers yet.')}</div>
      <div class="profile-v237-panel" data-panel="following">${renderPersonList(followingList, 'Not following anyone yet.')}</div>
    </section>

    <nav class="profile-v237-bottom" aria-label="Primary navigation"><button type="button" data-screen="home"><strong>⌂</strong>Home</button><button type="button" data-screen="search"><strong>⌕</strong>Search</button><button class="create" type="button" data-screen="create">＋</button><button type="button" data-screen="messages"><strong>▢</strong>Inbox</button><button class="active" type="button" data-own-profile="1" data-screen="profile"><strong>●</strong>Profile</button></nav>
  </div>`;

  const setTab = (tab) => {
    app.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    app.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('active', p.dataset.panel === tab));
  };
  app.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));
  app.querySelectorAll('[data-profile-link]').forEach((button) => button.addEventListener('click', async () => {
    const target = button.dataset.profileLink || '';
    if (!target) return;
    const { state } = await import('../state.js');
    state.profile = { username: target, userId: target };
    state.screen = 'profile';
    await window.__indoNavigate?.('profile');
  }));
  app.querySelectorAll('.profile-v237-media').forEach((button) => button.addEventListener('click', () => showVideo(button.dataset.videoUrl, button.dataset.videoTitle)));
  app.querySelectorAll('[data-profile-share]').forEach((button) => button.addEventListener('click', async () => {
    const url = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(userId)}`;
    try {
      if (navigator.share) await navigator.share({ title: `${name} on Indo`, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {}
  }));
  app.querySelectorAll('[data-follow-owner]').forEach((button) => button.addEventListener('click', () => followUser(button.dataset.followOwner, button)));
}
