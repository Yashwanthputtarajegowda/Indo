import { nav } from '../components/nav.js';

export function renderNotifications(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home">‹</button><h2>Notifications</h2><span></span></header><main class="notifications">${[['R','@riya_07 started following you.','2m'],['♥','@karthik liked your post.','5m'],['A','@anu_12 commented on your reel.','10m'],['S','@sam____ shared your post.','20m'],['$','Earning eligibility completed.','1h'],['$','Earning is now available. You can turn it ON.','1h']].map(n=>`<div class="notice"><div class="avatar small">${n[0]}</div><p>${n[1]}<small>${n[2]}</small></p></div>`).join('')}</main>${nav('home')}</div>`;
}
