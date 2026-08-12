import { icons } from '../data.js';
import { nav } from '../components/nav.js';

async function searchUserId(query) {
  const value = String(query || '').trim().replace(/^@/, '').toLowerCase();
  if (!value) throw new Error('Enter a User ID.');
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/account/check-user-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: value })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not search User ID.');
  return data;
}

function renderSearchResult(data) {
  if (!data?.exists || !data?.user) {
    return '<div class="profile-empty">No Indo user found for that User ID.</div>';
  }
  const user = data.user;
  const initial = String(user.name || user.userId || 'I').replace(/^@/, '').trim().charAt(0).toUpperCase() || 'I';
  return `<div class="search-user" data-user-uid="${String(user.uid || '').replace(/"/g, '&quot;')}"><div class="avatar small gradient">${initial}</div><div><b>${String(user.name || 'Indo User')}</b><small>${String(user.userId || '')}</small></div></div>`;
}

export function renderSearch(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><h2>Search</h2><span></span></header><main class="search-page"><form class="search-box" id="user-search-form"><span>${icons.search}</span><input id="user-search-input" name="query" autocomplete="off" placeholder="Search @User ID..." aria-label="Search User ID" /><button type="submit" aria-label="Search">⌕</button></form><div class="search-result" data-search-result aria-live="polite"></div><h4>Search</h4><div class="search-hint">Type an exact <b>@User ID</b> to find an Indo user.</div><h4>Trending</h4><div class="trend"><span>#</span><b>#nature</b></div><div class="trend"><span>#</span><b>#travel</b></div><div class="trend"><span>#</span><b>#reels</b></div></main>${nav('search')}</div>`;

  const form = app.querySelector('#user-search-form');
  const input = app.querySelector('#user-search-input');
  const result = app.querySelector('[data-search-result]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    result.innerHTML = '<div class="profile-empty">Searching...</div>';
    try {
      result.innerHTML = renderSearchResult(await searchUserId(input.value));
    } catch (error) {
      result.innerHTML = `<div class="profile-empty">${String(error.message || 'Could not search.').replace(/</g, '&lt;')}</div>`;
    }
  });
}
