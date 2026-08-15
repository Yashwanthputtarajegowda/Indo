import { auth } from '../features/auth/firebase-client.js';
import { renderIndoBrandTopbar } from '../components/indo-brand-topbar.js';

const STYLE_ID = 'indo-profile-clean-v239';
const API_BASE = () => window.INDO_API_BASE || '';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function fmt(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function initials(name, userId) {
  return (String(name || userId || 'I').replace(/^@/, '').trim().charAt(0) || 'I').toUpperCase();
}

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  return user.getIdToken();
}

async function api(path) {
  const token = await getToken();
  const response = await fetch(`${API_BASE()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

async function loadProfile(profile, own) {
  const current = auth.currentUser;
  const hintedUserId = String(profile?.userId || profile?.username || '').replace(/^@/, '').trim();
  const hintedUid = String(profile?.uid || profile?.ownerUid || '').trim();
  const fallbackId = hintedUserId || String(current?.displayName || current?.email?.split('@')[0] || hintedUid || 'user').replace(/^@/, '').trim();
  let data = null;
  try { data = await api(`/api/account/profile/${encodeURIComponent(fallbackId)}`); } catch {}
  const source = data?.profile || {};
  return {
    ...source,
    ...profile,
    uid: source.uid || source.ownerUid || hintedUid || (own ? current?.uid || '' : ''),
    userId: String(source.userId || source.username || hintedUserId || fallbackId).replace(/^@/, ''),
    username: String(source.userId || source.username || hintedUserId || fallbackId).replace(/^@/, ''),
    name: source.name || profile?.name || current?.displayName || fallbackId,
    bio: source.bio || source.about || profile?.bio || 'Creating moments, ideas and stories on Indo.',
    location: source.location || profile?.location || '',
    avatarUrl: source.avatarUrl || source.photoURL || source.photoUrl || profile?.avatarUrl || '',
    followersCount: Number(source.followersCount ?? profile?.followersCount ?? 0),
    followingCount: Number(source.followingCount ?? profile?.followingCount ?? 0),
    videosCount: Number(source.videosCount ?? profile?.videosCount ?? profile?.postsCount ?? 0),
    likesCount: Number(source.likesCount ?? profile?.likesCount ?? 0),
  };
}

async function loadVideos(uid) {
  if (!uid) return [];
  try {
    const data = await fetch(`${API_BASE()}/api/media/videos?limit=20`, { cache: 'no-store' }).then((r) => r.json());
    return (Array.isArray(data.videos) ? data.videos : []).filter((v) => String(v.ownerUid || '') === String(uid));
  } catch { return []; }
}

function avatar(profile) {
  const url = String(profile.avatarUrl || '').trim();
  if (url) return `<img src="${esc(url)}" alt="${esc(profile.name)}" loading="lazy">`;
  return `<span>${esc(initials(profile.name, profile.userId))}</span>`;
}

function mediaCard(video) {
  const poster = String(video.thumbnailUrl || video.thumbUrl || video.poster || '').trim();
  const src = String(video.secureUrl || video.videoUrl || video.url || '').trim();
  return `<button class="pc239-media" type="button" data-video-src="${esc(src)}">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : src ? `<video src="${esc(src)}" muted playsinline preload="metadata"></video>` : '<span class="pc239-no-media">Video</span>'}<span class="pc239-views">▶ ${esc(fmt(video.views || 0))}</span></button>`;
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .pc239-shell{min-height:100vh;width:min(100%,520px);margin:0 auto;background:radial-gradient(circle at 50% 0%,rgba(103,74,255,.14),transparent 28%),#05060b;color:#f7f8ff;padding-bottom:78px;box-sizing:border-box;overflow:hidden}
    .pc239-top{padding:12px 16px 0}.pc239-bar{display:flex;align-items:center;justify-content:space-between}.pc239-bar button{width:36px;height:36px;border:1px solid #24293a;border-radius:12px;background:#0b0e17;color:#fff;font-size:18px;cursor:pointer}
    .pc239-avatar{width:122px;height:122px;border-radius:50%;margin:24px auto 14px;padding:3px;background:linear-gradient(135deg,#6b4cff,#e933b5,#2ecfff);box-shadow:0 0 30px rgba(116,76,255,.22)}.pc239-avatar>img,.pc239-avatar>span{width:100%;height:100%;display:grid;place-items:center;border-radius:50%;object-fit:cover;background:#141827;color:#fff;font-size:42px;font-weight:900;border:4px solid #070912;box-sizing:border-box}.pc239-status{position:relative;width:100%}.pc239-status:after{content:'';position:absolute;width:14px;height:14px;background:#2adf83;border:3px solid #05060b;border-radius:50%;left:calc(50% + 42px);bottom:12px}
    .pc239-name{text-align:center;font-size:26px;font-weight:900;letter-spacing:-.4px}.pc239-id{text-align:center;color:#8b93a7;font-size:13px;margin-top:5px}.pc239-bio{max-width:350px;margin:14px auto 6px;text-align:center;color:#dce1ed;font-size:14px;line-height:1.45}.pc239-location{text-align:center;color:#8c95aa;font-size:12px;margin:8px 0 18px}
    .pc239-stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #1d2230;border-bottom:1px solid #1d2230;padding:16px 0}.pc239-stat{text-align:center;border-right:1px solid #202537}.pc239-stat:last-child{border-right:0}.pc239-stat b{display:block;font-size:18px}.pc239-stat span{display:block;color:#7f889d;font-size:10px;margin-top:4px}
    .pc239-actions{display:grid;grid-template-columns:1fr 48px 48px;gap:8px;margin:18px 0}.pc239-action{height:42px;border:1px solid #2c3142;border-radius:13px;background:#0b0f19;color:#fff;font-weight:800;cursor:pointer}.pc239-primary{background:linear-gradient(105deg,#6548ff,#d72db5);border:0}.pc239-icon{font-size:18px}
    .pc239-section-head{display:flex;align-items:center;justify-content:space-between;margin:14px 0 10px}.pc239-section-head strong{font-size:17px}.pc239-section-head button{border:0;background:none;color:#a97aff;font-size:12px;font-weight:800;cursor:pointer}.pc239-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.pc239-media{position:relative;aspect-ratio:1;border:0;border-radius:12px;overflow:hidden;background:#111625;padding:0;cursor:pointer}.pc239-media img,.pc239-media video{width:100%;height:100%;object-fit:cover}.pc239-media:after{content:'';position:absolute;left:0;right:0;bottom:0;height:35%;background:linear-gradient(transparent,rgba(0,0,0,.84));pointer-events:none}.pc239-views{position:absolute;left:8px;bottom:7px;color:#fff;font-size:10px;font-weight:800;z-index:2}.pc239-no-media{display:grid;place-items:center;width:100%;height:100%;color:#8c95aa}
    .pc239-empty{text-align:center;padding:34px 8px;color:#7f879a;font-size:12px;grid-column:1/-1}.pc239-bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,520px);height:68px;background:#0b0f19;border-top:1px solid #22283a;display:grid;grid-template-columns:repeat(5,1fr);z-index:9001}.pc239-bottom button{border:0;background:transparent;color:#7e879c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:9px;font-weight:800;cursor:pointer}.pc239-bottom button strong{font-size:20px}.pc239-bottom button.active{color:#fff}.pc239-bottom .pc239-create{width:46px;height:46px;border-radius:50%;align-self:center;justify-self:center;background:linear-gradient(135deg,#6c45ff,#e834b0);color:#fff;font-size:28px;box-shadow:0 0 20px rgba(181,54,220,.3)}
    .pc239-modal{position:fixed;inset:0;z-index:40000;background:#000;display:grid;place-items:center}.pc239-modal video{width:min(100%,520px);height:100%;object-fit:contain}.pc239-close{position:absolute;top:14px;left:14px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:24px;z-index:2}
    @media(max-width:390px){.pc239-name{font-size:24px}.pc239-stats{padding:14px 0}.pc239-stat b{font-size:16px}}
  `;
  document.head.appendChild(style);
}

async function followUser(uid, button) {
  if (!uid) return;
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE()}/api/social/follow`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetUid: uid, follow: true }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not follow user.');
    button.textContent = data.pending ? 'Requested' : 'Following';
    button.disabled = true;
  } catch (error) { console.warn(error); }
}

function openVideo(src) {
  if (!src) return;
  const modal = document.createElement('div');
  modal.className = 'pc239-modal';
  modal.innerHTML = `<button class="pc239-close" type="button">×</button><video controls playsinline autoplay src="${esc(src)}"></video>`;
  document.body.appendChild(modal);
  modal.querySelector('.pc239-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

export async function renderProfile(app, incoming = null) {
  installStyles();
  const currentUid = String(auth.currentUser?.uid || '');
  const requestedUid = String(incoming?.uid || incoming?.ownerUid || '').trim();
  const own = !requestedUid || requestedUid === currentUid;
  const profile = await loadProfile(incoming, own);
  const targetUid = String(profile.uid || (own ? currentUid : '')).trim();
  const videos = await loadVideos(targetUid);
  const name = String(profile.name || profile.userId || 'Indo User');
  const userId = String(profile.userId || 'user').replace(/^@/, '');
  const bio = String(profile.bio || 'Creating moments, ideas and stories on Indo.');
  const location = String(profile.location || '').trim();

  app.innerHTML = `<div class="pc239-shell">
    ${renderIndoBrandTopbar({ rightLabel: 'Profile' })}
    <main class="pc239-top">
      <div class="pc239-bar"><button type="button" data-screen="home" aria-label="Home">‹</button><div style="display:flex;gap:8px"><button type="button" data-screen="notifications" aria-label="Notifications">♧</button><button type="button" data-screen="settings" aria-label="Settings">⚙</button></div></div>
      <div class="pc239-status"><div class="pc239-avatar">${avatar(profile)}</div></div>
      <div class="pc239-name">${esc(name)} ${own ? '' : ''}</div>
      <div class="pc239-id">@${esc(userId)}</div>
      <div class="pc239-bio">${esc(bio)}</div>
      ${location ? `<div class="pc239-location">⌖ ${esc(location)}</div>` : ''}
      <div class="pc239-stats"><div class="pc239-stat"><b>${esc(fmt(profile.videosCount || videos.length))}</b><span>Videos</span></div><div class="pc239-stat"><b>${esc(fmt(profile.followersCount))}</b><span>Followers</span></div><div class="pc239-stat"><b>${esc(fmt(profile.followingCount))}</b><span>Following</span></div><div class="pc239-stat"><b>${esc(fmt(profile.likesCount))}</b><span>Likes</span></div></div>
      <div class="pc239-actions">${own ? '<button class="pc239-action pc239-primary" type="button" data-screen="settings">✎ Edit Profile</button>' : `<button class="pc239-action pc239-primary" type="button" data-follow-owner="${esc(targetUid)}">Follow</button>`}<button class="pc239-action pc239-icon" type="button" data-share>↗</button><button class="pc239-action pc239-icon" type="button" data-screen="settings">⋯</button></div>
      <div class="pc239-section-head"><strong>Recent Videos</strong><button type="button" data-open-video-section="1">View all</button></div>
      <div class="pc239-grid">${videos.length ? videos.slice(0,6).map(mediaCard).join('') : '<div class="pc239-empty">No videos uploaded yet.</div>'}</div>
    </main>
    <nav class="pc239-bottom" aria-label="Primary navigation"><button type="button" data-screen="home"><strong>⌂</strong><span>Home</span></button><button type="button" data-screen="messages"><strong>◌</strong><span>Message</span></button><button type="button" class="pc239-create" data-screen="create" aria-label="Create">＋</button><button type="button" data-screen="video"><strong>▣</strong><span>Video</span></button><button type="button" class="active" data-own-profile="1" data-screen="profile"><strong>●</strong><span>Profile</span></button></nav>
  </div>`;

  app.querySelectorAll('[data-video-src]').forEach((button) => button.addEventListener('click', () => openVideo(button.dataset.videoSrc || '')));
  app.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', async () => {
    const url = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(userId)}`;
    try { if (navigator.share) await navigator.share({ title: `${name} on Indo`, url }); else await navigator.clipboard?.writeText(url); } catch {}
  }));
  app.querySelectorAll('[data-follow-owner]').forEach((button) => button.addEventListener('click', () => followUser(button.dataset.followOwner, button)));
}
