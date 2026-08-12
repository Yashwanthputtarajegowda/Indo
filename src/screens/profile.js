import { samplePosts, icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderProfile(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>@yash123</h2><button data-screen="settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">Y<span class="plus">+</span></div><div class="stats"><div><b>24</b><span>Posts</span></div><div><b>1.2K</b><span>Followers</span></div><div><b>180</b><span>Following</span></div></div></section><h3>Yashwanth</h3><div class="userid">@yash123</div><p class="bio">Live | Love | Laugh<br>Stay Positive 😎</p><button class="edit-btn">Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid">${samplePosts.concat(samplePosts).map(p=>`<img src="${p.image}" alt="Post">`).join('')}</div></main>${nav('profile')}</div>`;
}
