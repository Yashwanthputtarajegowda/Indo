import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadProfileMedia } from '../features/profile/profile-media.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function profileMarkup(profile, posts) {
  const username = escapeHtml(profile?.username || '');
  const bio = escapeHtml(profile?.bio || 'Welcome to Indo.');
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const safePosts = Array.isArray(posts) ? posts : [];
  const postCount = safePosts.length;

  return `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>${username || 'Profile'}</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">${initial}<span class="plus">+</span></div><div class="stats"><div><b>${postCount}</b><span>Posts</span></div><div><b>${Number(profile?.followersCount || 0)}</b><span>Followers</span></div><div><b>${Number(profile?.followingCount || 0)}</b><span>Following</span></div></div></section><div class="userid">${username || 'User ID not available'}</div><p class="bio">${bio}</p><button class="edit-btn">Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid">${safePosts.map((post) => `<img src="${escapeHtml(post.secureUrl || '')}" alt="${escapeHtml(post.title || 'Video')}">`).join('')}</div><p class="feed-status">${postCount ? '' : 'You have not uploaded any videos yet.'}</p></main>${nav('profile')}</div>`;
}

export function renderProfile(app, profile = null) {
  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>Profile</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header><main class="profile-page"><div class="feed-status">Loading profile...</div></main>${nav('profile')}</div>`;

  loadProfileMedia().then(({ profile: currentProfile, videos }) => {
    app.innerHTML = profileMarkup(currentProfile || profile || {}, videos);
  }).catch((error) => {
    const content = app.querySelector('.profile-page');
    if (content) content.innerHTML = `<div class="feed-status">${escapeHtml(error.message || 'Could not load profile.')}</div>`;
  });
}
