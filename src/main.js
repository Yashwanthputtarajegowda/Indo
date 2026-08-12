import './styles.css';
import { renderAuth } from './auth.js';

const app = document.getElementById('root');

const icons = {
  home: '⌂', search: '⌕', reel: '▶', create: '+', profile: '●', heart: '♡', comment: '○', share: '➤', bookmark: '♧', bell: '♧', settings: '⚙', back: '‹', more: '⋯'
};

const state = { screen: 'auth' };

const samplePosts = [
  { user: 'Yashwanth', id: '@yash123', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', likes: '142', comments: '12', caption: 'Nature is peace ✨' },
  { user: 'Arjun', id: '@arjun31', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', likes: '98', comments: '8', caption: 'Keep moving forward.' }
];

function nav(active) {
  return `<nav class="bottom-nav">
    <button data-screen="home" class="${active === 'home' ? 'active' : ''}">${icons.home}<span>Home</span></button>
    <button data-screen="search" class="${active === 'search' ? 'active' : ''}">${icons.search}<span>Search</span></button>
    <button data-screen="reels" class="${active === 'reels' ? 'active' : ''}">${icons.reel}<span>Reels</span></button>
    <button data-screen="create" class="${active === 'create' ? 'active' : ''}">${icons.create}<span>Create</span></button>
    <button data-screen="profile" class="${active === 'profile' ? 'active' : ''}">${icons.profile}<span>Profile</span></button>
  </nav>`;
}

function postCard(post) {
  return `<article class="post-card">
    <div class="post-head"><div class="avatar small">Y</div><div><strong>${post.user}</strong><small>${post.id}</small></div><button class="icon-btn">${icons.more}</button></div>
    <img class="post-image" src="${post.image}" alt="Post">
    <div class="post-actions"><button>${icons.heart}</button><button>${icons.comment}</button><button>${icons.share}</button><button class="push-right">${icons.bookmark}</button></div>
    <div class="post-copy"><strong>${post.likes} likes</strong><p><b>${post.id}</b> ${post.caption}</p><span>View all ${post.comments} comments</span></div>
  </article>`;
}

function renderHome() {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>indo</div><div class="top-actions"><button>${icons.heart}</button><button data-screen="notifications">${icons.bell}</button></div></header>
    <div class="stories"><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>${['@riya_07','@karthik','@anu_12','@sam____'].map((x,i)=>`<div class="story"><div class="avatar ring">${['R','K','A','S'][i]}</div><span>${x}</span></div>`).join('')}</div>
    <main class="feed">${samplePosts.map(postCard).join('')}</main>${nav('home')}</div>`;
}

function renderReels() {
  app.innerHTML = `<div class="app-shell reels-shell"><header class="reels-top"><button data-screen="home">${icons.back}</button><h2>Reels</h2><button>▣</button></header><main class="reel-view"><div class="reel-bg" style="background-image:url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=85')"></div><div class="reel-gradient"></div><div class="reel-info"><div class="reel-user"><div class="avatar small">A</div><b>@arjun_31</b><button class="follow-btn">Follow</button></div><p>Live your life 🔥</p><small>♪ Original audio</small></div><div class="reel-actions"><button>${icons.heart}<small>12.5K</small></button><button>${icons.comment}<small>320</small></button><button>${icons.share}<small>120</small></button><button>${icons.bookmark}</button></div></main>${nav('reels')}</div>`;
}

function renderCreate() {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home">${icons.back}</button><h2>Create</h2><span></span></header><main class="create-page"><button class="create-card"><span class="create-icon">▣</span><div><b>Post</b><small>Photo or video</small></div></button><button class="create-card"><span class="create-icon pink">▶</span><div><b>Reel</b><small>Short vertical video</small></div></button><button class="create-card"><span class="create-icon blue">◉</span><div><b>Story</b><small>Photo or video</small></div></button><div class="upload-note">Your content will appear on your profile after publishing.</div></main>${nav('create')}</div>`;
}

function renderProfile() {
  app.innerHTML = `<div class="app-shell"><header class="page-head profile-head"><span></span><h2>@yash123</h2><button data-screen="settings">${icons.settings}</button></header><main class="profile-page"><section class="profile-summary"><div class="avatar profile-avatar">Y<span class="plus">+</span></div><div class="stats"><div><b>24</b><span>Posts</span></div><div><b>1.2K</b><span>Followers</span></div><div><b>180</b><span>Following</span></div></div></section><h3>Yashwanth</h3><div class="userid">@yash123</div><p class="bio">Live | Love | Laugh<br>Stay Positive 😎</p><button class="edit-btn">Edit Profile</button><div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div><div class="grid">${samplePosts.concat(samplePosts).map(p=>`<img src="${p.image}" alt="Post">`).join('')}</div></main>${nav('profile')}</div>`;
}

function renderSettings() {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="profile">${icons.back}</button><h2>Settings</h2><span></span></header><main class="settings-page"><div class="settings-group"><h4>Account</h4><button class="setting-row"><span>♙</span>Account <b>›</b></button><button class="setting-row"><span>⌁</span>Privacy <em>Public</em><b>›</b></button><button class="setting-row"><span>$</span>Earning <em>OFF</em><b>›</b></button></div><div class="settings-group"><h4>Preferences</h4><button class="setting-row"><span>♧</span>Notifications <b>›</b></button><button class="setting-row"><span>⊘</span>Blocked Users <b>›</b></button><button class="setting-row"><span>▣</span>Wallet <b>›</b></button></div><div class="settings-group"><button class="setting-row"><span>?</span>Help & Support <b>›</b></button><button class="setting-row danger"><span>↪</span>Logout</button></div></main></div>`;
}

function renderSearch() {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><h2>Search</h2><span></span></header><main class="search-page"><div class="search-box">${icons.search}<input placeholder="Search users, reels, posts, hashtags..." /></div><h4>Recent</h4>${['@riya_07','@karthik','@anu_12'].map(x=>`<div class="search-user"><div class="avatar small">${x[1].toUpperCase()}</div><div><b>${x}</b><small>View profile</small></div><button>×</button></div>`).join('')}<h4>Trending Hashtags</h4>${['#nature','#travel','#reels'].map((x,i)=>`<div class="trend"><span>#</span><b>${x}</b><small>${[2.1,1.5,3.2][i]}M posts</small></div>`).join('')}</main>${nav('search')}</div>`;
}

function renderNotifications() {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home">${icons.back}</button><h2>Notifications</h2><span></span></header><main class="notifications">${[['R','@riya_07 started following you.','2m'],['♥','@karthik liked your post.','5m'],['A','@anu_12 commented on your reel.','10m'],['S','@sam____ shared your post.','20m'],['$','Earning eligibility completed.','1h'],['$','Earning is now available. You can turn it ON.','1h']].map(n=>`<div class="notice"><div class="avatar small">${n[0]}</div><p>${n[1]}<small>${n[2]}</small></p></div>`).join('')}</main>${nav('home')}</div>`;
}

function render() {
  if (state.screen === 'auth') {
    renderAuth(app, (screen) => { state.screen = screen; render(); });
    return;
  }
  ({home:renderHome,reels:renderReels,create:renderCreate,profile:renderProfile,settings:renderSettings,search:renderSearch,notifications:renderNotifications}[state.screen] || renderHome)();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-screen]');
  if (!target) return;
  state.screen = target.dataset.screen;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

render();
