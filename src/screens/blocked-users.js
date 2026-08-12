import { loadBlockedUsers, toggleBlockedUser } from '../features/social/blocked-users.js';

function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c])); }

export async function renderBlockedUsers(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="settings" aria-label="Back">‹</button><h2>Blocked Users</h2><span></span></header><main class="settings-page"><div data-blocked-list><div class="profile-empty">Loading...</div></div><p class="settings-message" data-blocked-message aria-live="polite"></p></main></div>`;
  const list = app.querySelector('[data-blocked-list]');
  const message = app.querySelector('[data-blocked-message]');
  try {
    const data = await loadBlockedUsers();
    const users = Array.isArray(data.users) ? data.users : [];
    if (!users.length) { list.innerHTML = '<div class="profile-empty">No blocked users.</div>'; return; }
    list.innerHTML = users.map((u) => `<div class="search-user"><div class="avatar small">${escapeHtml((u.name || u.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I')}</div><div><b>${escapeHtml(u.username || '@user')}</b><small>${escapeHtml(u.name || 'Indo User')}</small></div><button data-unblock-uid="${escapeHtml(u.uid)}">Unblock</button></div>`).join('');
    list.querySelectorAll('[data-unblock-uid]').forEach((button) => button.addEventListener('click', async () => {
      button.disabled = true;
      try { await toggleBlockedUser(button.dataset.unblockUid, false); button.closest('.search-user')?.remove(); if (!list.children.length) list.innerHTML = '<div class="profile-empty">No blocked users.</div>'; }
      catch (error) { message.textContent = error.message || 'Could not unblock user.'; button.disabled = false; }
    }));
  } catch (error) { list.innerHTML = `<div class="profile-empty">${escapeHtml(error.message || 'Could not load blocked users.')}</div>`; }
}
