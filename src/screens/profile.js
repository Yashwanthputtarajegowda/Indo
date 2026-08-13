import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadProfileMedia } from '../features/profile/profile-media.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function ensureProfileLayoutStyles() {
  if (document.getElementById('indo-profile-layout-v3')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-layout-v3';
  style.textContent = `
    .profile-identity-row{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:14px!important;width:100%!important;margin:4px 0 18px!important;padding:0!important}
    .profile-identity-row .profile-avatar{flex:0 0 88px!important;width:88px!important;height:88px!important;margin:0!important}
    .profile-userid-block{display:flex!important;flex:1 1 auto!important;align-items:center!important;justify-content:flex-start!important;min-width:0!important}
    .profile-userid{display:block!important;margin:0!important;padding:0!important;color:#fff!important;font-size:16px!important;font-weight:800!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .profile-stats-row{width:100%!important;margin:0 0 18px!important}
  `;
  document.head.appendChild(style);
}

function renderMediaGrid(videos) {
  if (!videos.length) return '<div class="profile-empty">No posts yet.</div>';
  return videos.map((video) => {
    const id = escapeHtml(video.id || '');
    const url = escapeHtml(video.secureUrl || '');
    const title = escapeHtml(video.title || 'Video');
    return `<button class="profile-media" data-video-id="${id}" type="button" aria-label="${title}"><video muted playsinline preload="metadata" src="${url}"></video><span>▶</span></button>`;
  }).join('');
}

export async function renderProfile(app, profile = null) {
  ensureProfileLayoutStyles();
  const username = escapeHtml(profile?.username || '');
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const followers = Number(profile?.followersCount || 0);
  const following = Number(profile?.followingCount || 0);

  app.innerHTML = `<div class="app-shell">
    <header class="page-head profile-head"><button data-screen="home" aria-label="Back">‹</button><h2>${username || 'Profile'}</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header>
    <main class="profile-page">
      <section class="profile-identity-row">
        <div class="avatar profile-avatar">${initial}<span class="plus">+</span></div>
        <div class="profile-userid-block"><div class="profile-userid">${username ? `@${username.replace(/^@/, '')}` : '@user'}</div></div>
      </section>
      <section class="stats profile-stats-row">
        <div><b data-post-count>0</b><span>Posts</span></div>
        <div><b>${followers}</b><span>Followers</span></div>
        <div><b>${following}</b><span>Following</span></div>
      </section>
      <button class="edit-btn" data-edit-profile>Edit Profile</button>
      <div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div>
      <div class="grid" data-profile-media><div class="profile-empty">Loading posts...</div></div>
    </main>
    ${nav('profile')}
  </div>`;

  const mediaGrid = app.querySelector('[data-profile-media]');
  const postCount = app.querySelector('[data-post-count]');

  try {
    const { videos } = await loadProfileMedia(profile);
    postCount.textContent = String(videos.length);
    mediaGrid.innerHTML = renderMediaGrid(videos);
  } catch (error) {
    postCount.textContent = '0';
    mediaGrid.innerHTML = '<div class="profile-empty">Could not load posts right now.</div>';
    console.error('Profile media failed:', error);
  }
}
