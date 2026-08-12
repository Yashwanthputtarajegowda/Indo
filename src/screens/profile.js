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
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');

  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>${username || 'Profile'}</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">${initial}<span class="plus">+</span></div><div class="stats"><div><b data-post-count>0</b><span>Posts</span></div><div><b>${Number(profile?.followersCount || 0)}</b><span>Followers</span></div><div><b>${Number(profile?.followingCount || 0)}</b><span>Following</span></div></div></section><div class="userid">${username || 'User ID not available'}</div><p class="bio">${bio}</p><button class="edit-btn" data-edit-profile>Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid" data-profile-media><div class="profile-empty">Loading posts...</div></div></main>${nav('profile')}</div>`;

  const mediaGrid = app.querySelector('[data-profile-media]');
  const postCount = app.querySelector('[data-post-count]');

  loadProfileMedia().then(({ profile: latestProfile, videos }) => {
    postCount.textContent = String(videos.length);
    mediaGrid.innerHTML = renderMediaGrid(videos);
    if (latestProfile?.username && latestProfile.username !== profile?.username) {
      const header = app.querySelector('.profile-head h2');
      const userId = app.querySelector('.userid');
      if (header) header.textContent = latestProfile.username;
      if (userId) userId.textContent = latestProfile.username;
    }
  }).catch(() => {
    postCount.textContent = '0';
    mediaGrid.innerHTML = '<div class="profile-empty">Could not load posts right now.</div>';
  });
}
