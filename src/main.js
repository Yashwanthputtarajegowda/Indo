import './styles.css';
import './features/splash/splash.css';
import { state } from './state.js';
import { render } from './router.js';
import { submitSignup } from './features/auth/signup-form.js';
import { submitLogin } from './features/auth/login-form.js';
import { startSplash } from './features/splash/splash-flow.js';
import { setSettingsVisibility } from './features/account/settings-visibility.js';
import { watchAuthSession } from './features/auth/auth-session.js';
import { handleLogout } from './features/auth/logout-button.js';
import { loadEngagement, toggleLike, toggleSave, addComment, loadComments, shareMedia } from './features/feed/media-engagement.js';
import { loadCurrentProfile } from './features/profile/current-profile.js';
import { updateCurrentProfile } from './features/profile/update-profile.js';
import { renderEditProfile } from './screens/edit-profile.js';
import { loadFollowStatus, toggleFollow } from './features/social/follow.js';

const app = document.getElementById('root');
let splashFinished = false;
let sessionUser = null;

function goTo(screen) {
  state.screen = screen;
  render(app);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderEditProfileScreen() {
  state.screen = 'edit-profile';
  renderEditProfile(app, state.profile);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function refreshProfile() {
  state.profile = await loadCurrentProfile();
  if (state.profile?.accountType) state.accountType = state.profile.accountType;
}

async function handleEngagement(event) {
  const target = event.target.closest('[data-engagement]');
  if (!target) return false;
  const card = target.closest('[data-video-id]');
  if (!card) return false;
  const mediaId = card.dataset.videoId;
  const action = target.dataset.engagement;

  try {
    if (action === 'like') {
      const current = await loadEngagement(mediaId);
      const result = await toggleLike(mediaId, !current.liked);
      const small = target.querySelector('small');
      if (small) small.textContent = Number(result.likes || 0).toLocaleString();
      target.classList.toggle('active', Boolean(result.liked));
    } else if (action === 'save') {
      const current = await loadEngagement(mediaId);
      const result = await toggleSave(mediaId, !current.saved);
      target.classList.toggle('active', Boolean(result.saved));
    } else if (action === 'share') {
      const result = await shareMedia(mediaId);
      if (result?.copied) target.title = 'Link copied';
    } else if (action === 'comment') {
      const existing = await loadComments(mediaId);
      const latest = existing.slice(-3).map((item) => `${item.username}: ${item.text}`).join('\n');
      const text = window.prompt(latest ? `Recent comments:\n${latest}\n\nWrite a comment:` : 'Write a comment:');
      if (!text?.trim()) return true;
      await addComment(mediaId, text.trim());
      target.title = 'Comment added';
    }
  } catch (error) {
    target.title = error.message || 'Action failed';
  }
  return true;
}

async function handleFollow(event) {
  const target = event.target.closest('[data-follow-uid]');
  if (!target) return false;
  const targetUid = target.dataset.followUid;
  if (!targetUid) return false;
  if (sessionUser?.uid === targetUid) return true;

  target.disabled = true;
  try {
    const current = await loadFollowStatus(targetUid);
    const result = await toggleFollow(targetUid, !current.following);
    target.textContent = result.following ? 'Following' : 'Follow';
    target.classList.toggle('active', Boolean(result.following));
  } catch (error) {
    target.title = error.message || 'Could not update follow status.';
  } finally {
    target.disabled = false;
  }
  return true;
}

async function hydrateFollowButtons(root) {
  const buttons = root.querySelectorAll('[data-follow-uid]');
  for (const button of buttons) {
    const uid = button.dataset.followUid;
    if (!uid || sessionUser?.uid === uid) continue;
    try {
      const result = await loadFollowStatus(uid);
      button.textContent = result.following ? 'Following' : 'Follow';
      button.classList.toggle('active', Boolean(result.following));
    } catch {}
  }
}

watchAuthSession(async (user) => {
  sessionUser = user;
  state.authenticated = true;
  await refreshProfile().catch(() => {});
  if (splashFinished && (state.screen === 'auth-login' || state.screen === 'auth-signup')) goTo('home');
}, () => {
  sessionUser = null;
  state.authenticated = false;
  state.profile = null;
  state.accountType = 'public';
  if (splashFinished && !String(state.screen).startsWith('auth-')) goTo('auth-login');
});

document.addEventListener('click', async (event) => {
  if (await handleEngagement(event)) return;
  if (await handleFollow(event)) return;

  const editProfileTarget = event.target.closest('[data-edit-profile]');
  if (editProfileTarget) {
    await refreshProfile().catch(() => {});
    renderEditProfileScreen();
    return;
  }

  const logoutTarget = event.target.closest('[data-logout]');
  if (logoutTarget) {
    await handleLogout(document.querySelector('.settings-message'));
    return;
  }

  const screenTarget = event.target.closest('[data-screen]');
  if (screenTarget) {
    const nextScreen = screenTarget.dataset.screen;
    if (nextScreen === 'profile' && state.authenticated) await refreshProfile().catch(() => {});
    goTo(nextScreen);
    if (nextScreen === 'reels') await hydrateFollowButtons(app);
    return;
  }

  const authTarget = event.target.closest('[data-auth]');
  if (authTarget) goTo(`auth-${authTarget.dataset.auth}`);
});

document.addEventListener('change', async (event) => {
  const visibility = event.target.closest('[data-visibility]');
  if (!visibility) return;
  const nextType = visibility.value;
  const message = document.querySelector('.settings-message');
  visibility.disabled = true;
  if (message) message.textContent = 'Saving privacy setting...';
  try {
    const result = await setSettingsVisibility(nextType);
    state.accountType = result.accountType;
    if (state.profile) state.profile.accountType = result.accountType;
    if (message) message.textContent = `Account is now ${result.accountType}.`;
  } catch (error) {
    visibility.value = state.accountType;
    if (message) message.textContent = error.message || 'Could not update privacy setting.';
  } finally {
    visibility.disabled = false;
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;

  if (form.id === 'edit-profile-form') {
    event.preventDefault();
    const button = form.querySelector('.primary-btn');
    const message = form.querySelector('.edit-profile-message');
    const name = form.querySelector('[name="name"]')?.value || '';
    const bio = form.querySelector('[name="bio"]')?.value || '';
    if (button) button.disabled = true;
    if (message) message.textContent = 'Saving...';
    try {
      state.profile = await updateCurrentProfile({ name, bio });
      state.accountType = state.profile?.accountType || state.accountType;
      if (message) message.textContent = 'Profile updated.';
      setTimeout(() => goTo('profile'), 400);
    } catch (error) {
      if (message) message.textContent = error.message || 'Could not update profile.';
      if (button) button.disabled = false;
    }
    return;
  }

  if (!['signup-form', 'login-form'].includes(form.id)) return;
  event.preventDefault();
  const button = form.querySelector('.auth-submit');
  const message = form.querySelector('.auth-message');
  if (button) button.disabled = true;
  if (message) message.textContent = form.id === 'signup-form' ? 'Creating account...' : 'Logging in...';
  try {
    if (form.id === 'signup-form') {
      const result = await submitSignup(form);
      state.accountType = result.accountType || 'public';
      await refreshProfile().catch(() => {});
      if (message) message.textContent = `Account created. Your User ID is ${result.username}.`;
    } else {
      const result = await submitLogin(form);
      state.accountType = result?.accountType || state.accountType;
      await refreshProfile().catch(() => {});
      if (message) message.textContent = 'Login successful.';
    }
    setTimeout(() => goTo('home'), 500);
  } catch (error) {
    if (message) message.textContent = error.message || 'Something went wrong.';
    if (button) button.disabled = false;
  }
});

startSplash(app, () => {
  splashFinished = true;
  goTo(sessionUser ? 'home' : 'auth-login');
});
