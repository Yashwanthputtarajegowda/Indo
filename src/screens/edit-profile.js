import { icons } from '../data.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export function renderEditProfile(app, profile = null) {
  const name = escapeHtml(profile?.name || '');
  const bio = escapeHtml(profile?.bio || '');
  const username = escapeHtml(profile?.username || '');

  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="profile" aria-label="Back">${icons.back}</button><h2>Edit Profile</h2><span></span></header><main class="settings-page edit-profile-page"><form id="edit-profile-form" class="upload-form"><div class="profile-edit-id">${username}</div><label>User Name<input id="edit-profile-name" name="name" value="${name}" maxlength="80" required autocomplete="name"></label><label>Bio<textarea id="edit-profile-bio" name="bio" maxlength="160" rows="4" placeholder="Tell people about yourself">${bio}</textarea></label><div class="edit-profile-message" aria-live="polite"></div><button class="primary-btn" type="submit">Save Changes</button></form></main></div>`;
}
