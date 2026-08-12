import { samplePosts, icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderProfile(app, profile = null) {
  const username = profile?.username || '@user';
  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>${username}</h2><button data-screen="settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">I<span class="plus">+</span></div><div class="stats"><div><b>0</b><span>Posts</span></div><div><b>0</b><span>Followers</span></div><div><b>0</b><span>Following</span></div></div></section><div class="userid">${username}</div><p class="bio">Welcome to Indo.</p><button class="edit-btn">Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid">${samplePosts.concat(samplePosts).map(p=>`<img src="${p.image}" alt="Post">`).join('')}</div></main>${nav('profile')}</div>`;
}
