import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadProfileMedia } from '../features/profile/profile-media.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
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

export function renderProfile(app, profile = null) {
  const username = escapeHtml(profile?.username || '');
  const bio = escapeHtml(profile?.bio || 'Welcome to Indo.');
  const displayName = escapeHtml(profile?.name || profile?.username || 'Indo User');
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const followers = Number(profile?.followersCount || 0);
  const following = Number(profile?.followingCount || 0);

  app.innerHTML = `<div class="app-shell">
    <header class="page-head profile-head"><span></span><h2>${username || 'Profile'}</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header>
    <main class="profile-page">
      <section class="profile-summary profile-summary-v2">
        <div class="avatar profile-avatar">${initial}<span class="plus">+</span></div>
        <div class="profile-main-info">
          <div class="profile-name-row">
            <h3 class="profile-inline-name">${displayName}</h3>
            <span class="profile-inline-username">${username ? `@${username.replace(/^@/, '')}` : ''}</span>
          </div>
          <div class="stats">
            <div><b data-post-count>0</b><span>Posts</span></div>
            <div><b>${followers}</b><span>Followers</span></div>
            <div><b>${following}</b><span>Following</span></div>
          </div>
        </div>
      </section>
      <p class="bio">${bio}</p>
      <button class="edit-btn" data-edit-profile>Edit Profile</button>
      <div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div>
      <div class="grid" data-profile-media><div class="profile-empty">Loading posts...</div></div>
    </main>
    ${nav('profile')}
  </div>`;

  const mediaGrid = app.querySelector('[data-profile-media]');
  const postCount = app.querySelector('[data-post-count]');

  loadProfileMedia().then(({ profile: latestProfile, videos }) => {
    postCount.textContent = String(videos.length);
    mediaGrid.innerHTML = renderMediaGrid(videos);
    if (latestProfile) {
      const latestUsername = escapeHtml(latestProfile.username || '');
      const latestName = escapeHtml(latestProfile.name || latestProfile.username || 'Indo User');
      const inlineName = app.querySelector('.profile-inline-name');
      const inlineUsername = app.querySelector('.profile-inline-username');
      const header = app.querySelector('.profile-head h2');
      if (inlineName) inlineName.textContent = latestName;
      if (inlineUsername) inlineUsername.textContent = latestUsername ? `@${latestUsername.replace(/^@/, '')}` : '';
      if (header && latestUsername) header.textContent = latestUsername;
    }
  }).catch(() => {
    postCount.textContent = '0';
    mediaGrid.innerHTML = '<div class="profile-empty">Could not load posts right now.</div>';
  });
}
