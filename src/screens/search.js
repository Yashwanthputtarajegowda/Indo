import { icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderSearch(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><h2>Search</h2><span></span></header><main class="search-page"><form class="search-box" id="user-search-form"><span>${icons.search}</span><input id="user-search-input" name="query" autocomplete="off" placeholder="Search @User ID..." aria-label="Search User ID" /><button type="submit" aria-label="Search">⌕</button></form><div class="search-result" data-search-result aria-live="polite"></div><h4>Search</h4><div class="search-hint">Type an exact <b>@User ID</b> to find an Indo user.</div><h4>Trending</h4><div class="trend"><span>#</span><b>#nature</b></div><div class="trend"><span>#</span><b>#travel</b></div><div class="trend"><span>#</span><b>#reels</b></div></main>${nav('search')}</div>`;
}
