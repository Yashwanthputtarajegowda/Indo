import { icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderSearch(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><h2>Search</h2><span></span></header><main class="search-page"><div class="search-box">${icons.search}<input placeholder="Search users, reels, posts, hashtags..." /></div><h4>Recent</h4>${['@riya_07','@karthik','@anu_12'].map(x=>`<div class="search-user"><div class="avatar small">${x[1].toUpperCase()}</div><div><b>${x}</b><small>View profile</small></div><button>×</button></div>`).join('')}<h4>Trending Hashtags</h4>${['#nature','#travel','#reels'].map((x,i)=>`<div class="trend"><span>#</span><b>${x}</b><small>${[2.1,1.5,3.2][i]}M posts</small></div>`).join('')}</main>${nav('search')}</div>`;
}
