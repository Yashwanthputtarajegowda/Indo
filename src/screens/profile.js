import { icons } from '../data.js';
import { nav } from '../components/nav.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function renderProfile(app, profile = null) {
  const username = escapeHtml(profile?.username || '');
  const bio = escapeHtml(profile?.bio || 'Welcome to Indo.');
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const posts = Array.isArray(profile?.posts) ? profile.posts : [];

  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>${username || 'Profile'}</h2><button data-screen="settings" aria-label="Settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">${initial}<span class="plus">+</span></div><div class="stats"><div><b>${Number(profile?.postCount || posts.length || 0)}</b><span>Posts</span></div><div><b>${Number(profile?.followersCount || 0)}</b><span>Followers</span></div><div><b>${Number(profile?.followingCount || 0)}</b><span>Following</span></div></div></section><div class="userid">${username || 'User ID not available'}</div><p class="bio">${bio}</p><button class="edit-btn">Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid">${posts.map((post) => `<img src="${escapeHtml(post.secureUrl || post.image || '')}" alt="Post">`).join('')}</div></main>${nav('profile')}</div>`;
}
