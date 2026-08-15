import { auth } from '../features/auth/firebase-client.js';
import { renderIndoBrandTopbar } from '../components/indo-brand-topbar.js';
import { nav } from '../components/nav.js';

const STYLE_ID = 'indo-profile-v241-clean';
const API_BASE = () => window.INDO_API_BASE || '';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function fmtCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function initialFor(profile) {
  return (String(profile?.name || profile?.userId || 'I').replace(/^@/, '').trim().charAt(0) || 'I').toUpperCase();
}

async function token() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  return user.getIdToken(true);
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

function avatarHtml(profile) {
  const avatar = String(profile?.avatarUrl || profile?.photoURL || profile?.photoUrl || '').trim();
  if (avatar) return `<div class="profile-v241-avatar"><img src="${esc(avatar)}" alt="${esc(profile?.name || 'Profile')}" loading="lazy"></div>`;
  return `<div class="profile-v241-avatar profile-v241-avatar-fallback">${esc(initialFor(profile))}</div>`;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .profile-v241-shell{width:min(100%,520px);min-height:100vh;margin:0 auto;background:#05070d;color:#f7f8ff;position:relative;padding-bottom:82px;overflow-x:hidden}
    .profile-v241-main{padding:10px 16px 28px;max-width:520px;margin:0 auto}
    .profile-v241-head{display:flex;align-items:center;justify-content:space-between;margin:8px 0 4px}
    .profile-v241-head-title{font-size:14px;font-weight:800;color:#fff}
    .profile-v241-head-actions{display:flex;gap:8px}
    .profile-v241-head-btn{width:38px;height:38px;border:1px solid #252b3d;border-radius:12px;background:#0b0f19;color:#fff;display:grid;place-items:center;font-size:18px;cursor:pointer}
    .profile-v241-head-btn:hover{border-color:#7b52ff;box-shadow:0 0 14px rgba(123,82,255,.18)}
    .profile-v241-hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:8px 0 4px}
    .profile-v241-avatar-wrap{position:relative;width:132px;height:132px;margin:8px auto 13px;display:grid;place-items:center}
    .profile-v241-avatar-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 210deg,#6c4cff,#bd3eff,#ff3e9d,#36b7ff,#6c4cff);padding:3px;box-shadow:0 0 30px rgba(129,78,255,.22)}
    .profile-v241-avatar-ring::before{content:'';position:absolute;inset:5px;border-radius:50%;background:#05070d}
    .profile-v241-avatar{position:relative;width:116px;height:116px;border-radius:50%;overflow:hidden;background:#171b28;border:2px solid #101421;display:grid;place-items:center;z-index:1}
    .profile-v241-avatar img{width:100%;height:100%;object-fit:cover;display:block}
    .profile-v241-avatar-fallback{font-size:42px;font-weight:900}
    .profile-v241-online{position:absolute;right:4px;bottom:11px;width:14px;height:14px;border-radius:50%;background:#27de8a;border:3px solid #05070d;box-shadow:0 0 12px rgba(39,222,138,.45);z-index:2}
    .profile-v241-name{font-size:26px;font-weight:900;line-height:1.08;letter-spacing:-.3px}
    .profile-v241-verified{display:inline-grid;place-items:center;width:19px;height:19px;margin-left:5px;border-radius:50%;background:linear-gradient(135deg,#6b48ff,#be38e8);font-size:11px;vertical-align:4px}
    .profile-v241-userid{margin-top:5px;color:#8e96aa;font-size:13px}
    .profile-v241-bio{max-width:360px;margin:13px auto 0;color:#d9ddea;font-size:13px;line-height:1.45}
    .profile-v241-location{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:7px 12px;border:1px solid #252b3d;border-radius:999px;background:#0b0f1a;color:#9ca4b6;font-size:11px}
    .profile-v241-divider{height:1px;background:#171d2a;margin:22px 0 18px}
    .profile-v241-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid #171d2a;border-bottom:1px solid #171d2a}
    .profile-v241-stat{padding:12px 4px;text-align:center;border:0;background:transparent;color:#fff;cursor:pointer}
    .profile-v241-stat:not(:last-child){border-right:1px solid #171d2a}
    .profile-v241-stat b{display:block;font-size:17px;line-height:1.1}.profile-v241-stat span{display:block;margin-top:4px;color:#7f8798;font-size:9px;text-transform:uppercase;letter-spacing:.7px}
    .profile-v241-actions{display:grid;grid-template-columns:1.9fr 1fr 46px;gap:8px;margin:18px 0 22px}
    .profile-v241-action{height:40px;border:1px solid #2a3042;border-radius:11px;background:#0b0f19;color:#fff;font-size:12px;font-weight:800;cursor:pointer}
    .profile-v241-action.primary{border:0;background:linear-gradient(105deg,#6748ff,#b43ce7,#ef3c9e);box-shadow:0 9px 24px rgba(156,58,226,.2)}
    .profile-v241-action.icon{font-size:18px}
    .profile-v241-section-title{display:flex;justify-content:space-between;align-items:center;margin:0 2px 11px}
    .profile-v241-section-title strong{font-size:16px}.profile-v241-section-title button{border:0;background:transparent;color:#a778ff;font-size:11px;font-weight:800;cursor:pointer}
    .profile-v241-videos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
    .profile-v241-video{position:relative;aspect-ratio:4/5;border:1px solid #1e2534;border-radius:12px;overflow:hidden;background:#111625;padding:0;cursor:pointer}
    .profile-v241-video img,.profile-v241-video video{width:100%;height:100%;object-fit:cover;display:block}
    .profile-v241-video::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(transparent,rgba(0,0,0,.8));pointer-events:none}
    .profile-v241-view{position:absolute;left:8px;bottom:7px;color:#fff;font-size:9px;font-weight:900;z-index:2}
    .profile-v241-play{position:absolute;right:7px;top:7px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.5);display:grid;place-items:center;color:#fff;font-size:9px;z-index:2}
    .profile-v241-empty{padding:44px 12px;text-align:center;color:#7e8799;font-size:12px;border:1px dashed #20283a;border-radius:14px}
    .profile-v241-other-actions{display:grid;grid-template-columns:1.5fr 1fr 46px;gap:8px;margin:18px 0 22px}
    @media(max-width:390px){.profile-v241-name{font-size:24px}.profile-v241-main{padding-left:12px;padding-right:12px}}
  `;
  document.head.appendChild(style);
}

async function loadProfile(userId) {
  const clean = String(userId || '').replace(/^@/, '').trim();
  if (!clean) return null;
  const data = await api(`/api/account/profile/${encodeURIComponent(clean)}`);
  return data?.profile ? { ...data.profile, stats: data.stats || {}, social: data.social || {} } : null;
}

async function loadVideos(uid) {
  if (!uid) return [];
  try {
    const data = await api('/api/media/videos?limit=50', { auth: false });
    return Array.isArray(data?.videos) ? data.videos.filter((item) => String(item.ownerUid || '') === String(uid)) : [];
  } catch { return []; }
}

function renderVideoCards(videos) {
  if (!videos.length) return '<div class="profile-v241-empty">No videos uploaded yet.</div>';
  return videos.slice(0,9).map((video) => {
    const poster = String(video.thumbnailUrl || video.thumbUrl || video.poster || '').trim();
    const src = String(video.secureUrl || video.videoUrl || video.url || '').trim();
    return `<button class="profile-v241-video" type="button" data-video-url="${esc(src)}" data-video-title="${esc(video.title || '')}">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : `<video src="${esc(src)}" muted playsinline preload="metadata"></video>`}<span class="profile-v241-play">▶</span><span class="profile-v241-view">${esc(fmtCount(video.views || 0))} views</span></button>`;
  }).join('');
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
  if (!targetUid) return;
  try {
    const current = await api(`/api/social/follow-status/${encodeURIComponent(targetUid)}`);
    const next = !Boolean(current?.following);
    button.disabled = true;
    const data = await api('/api/social/follow', { method:'POST', body:JSON.stringify({ targetUid, follow:next }) });
    button.textContent = data?.pending ? 'Requested' : data?.following ? 'Following' : 'Follow';
  } catch (error) {
    button.textContent = error?.message || 'Follow';
  } finally { button.disabled = false; }
}

export async function renderProfile(app, profileArg = null) {
  installStyles();
  const currentUid = String(auth.currentUser?.uid || '').trim();
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
    app.innerHTML = `<div class="profile-v241-shell"><main style="padding:40px 18px;text-align:center;color:#9199ad"><h2>Profile unavailable</h2><p>${esc(error?.message || 'Could not load this profile.')}</p></main>${nav('profile')}</div>`;
    return;
  }

  const uid = String(profile.uid || profile.ownerUid || currentUid || '').trim();
  const userId = String(profile.userId || profile.username || '').replace(/^@/, '');
  const name = String(profile.name || 'Indo User');
  const bio = String(profile.bio || profile.about || 'Creating moments, ideas and stories on Indo.');
  const location = String(profile.location || '').trim();
  const followers = Number(profile.followersCount ?? profile.stats?.followersCount ?? 0);
  const following = Number(profile.followingCount ?? profile.stats?.followingCount ?? 0);
  const videosCount = Number(profile.videosCount ?? profile.stats?.videosCount ?? profile.postsCount ?? 0);
  const likes = Number(profile.likesCount ?? profile.stats?.likesCount ?? 0);
  const videos = await loadVideos(uid);

  const topbar = renderIndoBrandTopbar({ rightLabel:'Profile' });
  const ownActions = `<div class="profile-v241-actions"><button class="profile-v241-action primary" type="button" data-screen="settings">✎ Edit Profile</button><button class="profile-v241-action" type="button" data-profile-share>Share</button><button class="profile-v241-action icon" type="button" data-screen="settings" aria-label="Settings">⚙</button></div>`;
  const otherActions = `<div class="profile-v241-other-actions"><button class="profile-v241-action primary" type="button" data-follow-owner="${esc(uid)}">Follow</button><button class="profile-v241-action" type="button" data-screen="messages">Message</button><button class="profile-v241-action icon" type="button" data-profile-share aria-label="Share profile">↗</button></div>`;

  app.innerHTML = `<div class="profile-v241-shell">${topbar}<main class="profile-v241-main">
    <div class="profile-v241-head"><div class="profile-v241-head-title">${own ? 'My Profile' : 'Profile'}</div><div class="profile-v241-head-actions">${own ? '<button class="profile-v241-head-btn" type="button" data-screen="settings" aria-label="Settings">⚙</button>' : '<button class="profile-v241-head-btn" type="button" data-profile-share aria-label="Share profile">↗</button>'}</div></div>
    <section class="profile-v241-hero">
      <div class="profile-v241-avatar-wrap"><div class="profile-v241-avatar-ring"></div>${avatarHtml(profile)}<span class="profile-v241-online" aria-hidden="true"></span></div>
      <div class="profile-v241-name">${esc(name)}${profile.verified ? '<span class="profile-v241-verified">✓</span>' : ''}</div>
      <div class="profile-v241-userid">@${esc(userId)}</div>
      <div class="profile-v241-bio">${esc(bio)}</div>
      ${location ? `<div class="profile-v241-location">⌖ ${esc(location)}</div>` : ''}
    </section>
    <div class="profile-v241-divider"></div>
    <section class="profile-v241-stats" aria-label="Profile statistics">
      <button class="profile-v241-stat" type="button"><b>${fmtCount(videosCount)}</b><span>Videos</span></button>
      <button class="profile-v241-stat" type="button"><b>${fmtCount(followers)}</b><span>Followers</span></button>
      <button class="profile-v241-stat" type="button"><b>${fmtCount(following)}</b><span>Following</span></button>
      <button class="profile-v241-stat" type="button"><b>${fmtCount(likes)}</b><span>Likes</span></button>
    </section>
    ${own ? ownActions : otherActions}
    <section><div class="profile-v241-section-title"><strong>${own ? 'Recent Videos' : 'Videos'}</strong><button type="button" data-screen="video">View all</button></div><div class="profile-v241-videos">${renderVideoCards(videos)}</div></section>
  </main>${nav('profile')}</div>`;

  app.querySelectorAll('.profile-v241-video').forEach((button) => button.addEventListener('click', () => showVideo(button.dataset.videoUrl, button.dataset.videoTitle)));
  app.querySelectorAll('[data-profile-share]').forEach((button) => button.addEventListener('click', async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(userId)}`;
    try { if (navigator.share) await navigator.share({ title:`${name} on Indo`, url:shareUrl }); else if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl); } catch {}
  }));
  app.querySelectorAll('[data-follow-owner]').forEach((button) => button.addEventListener('click', () => followUser(button.dataset.followOwner, button)));
}
