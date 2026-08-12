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
import { searchUserId } from './features/search/user-search.js';
import { loadEarningStatus, loadEarningSummary, toggleEarning } from './features/earning/earning.js';
import { requestPayout } from './features/earning/wallet.js';

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

async function refreshEarning() {
  if (!state.authenticated) {
    state.earning = null;
    state.earningSummary = null;
    return;
  }
  const [status, summary] = await Promise.all([loadEarningStatus(), loadEarningSummary()]);
  state.earning = status;
  state.earningSummary = summary;
}

async function handleEarning(event) {
  const toggleTarget = event.target.closest('[data-earning-action]');
  const rowTarget = event.target.closest('[data-earning-toggle]');
  if (!toggleTarget && !rowTarget) return false;
  if (rowTarget && !toggleTarget) {
    const panel = document.querySelector('[data-earning-panel]');
    if (panel) panel.classList.toggle('open');
    return true;
  }

  const message = document.querySelector('[data-earning-message]');
  const button = toggleTarget;
  const nextEnabled = !Boolean(state.earning?.earningEnabled);
  button.disabled = true;
  if (message) message.textContent = 'Saving earning setting...';
  try {
    const result = await toggleEarning(nextEnabled);
    await refreshEarning();
    const status = document.querySelector('[data-earning-status]');
    if (status) status.textContent = result.earningEnabled ? 'ON' : (result.eligible ? 'READY' : 'OFF');
    button.textContent = result.earningEnabled ? 'Turn Earning OFF' : 'Turn Earning ON';
    if (message) message.textContent = result.earningEnabled ? 'Earning started.' : 'Earning turned off.';
  } catch (error) {
    if (message) message.textContent = error.message || 'Could not update earning setting.';
  } finally {
    button.disabled = false;
  }
  return true;
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
  if (!targetUid || sessionUser?.uid === targetUid) return true;
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
  await refreshEarning().catch(() => {});
  if (splashFinished && (state.screen === 'auth-login' || state.screen === 'auth-signup')) goTo('home');
}, () => {
  sessionUser = null;
  state.authenticated = false;
  state.profile = null;
  state.accountType = 'public';
  state.earning = null;
  state.earningSummary = null;
  if (splashFinished && !String(state.screen).startsWith('auth-')) goTo('auth-login');
});

document.addEventListener('click', async (event) => {
  if (await handleEarning(event)) return;
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
    if (nextScreen === 'settings' && state.authenticated) await refreshEarning().catch(() => {});
    goTo(nextScreen);
    if (nextScreen === 'reels') await hydrateFollowButtons(app);
    return;
  }

  const authTarget = event.target.closest('[data-auth]');
  if (authTarget) goTo(`auth-${authTarget.dataset.auth}`);
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.id === 'payout-form') {
    event.preventDefault();
    const button = form.querySelector('.primary-btn');
    const message = form.querySelector('[data-wallet-message]');
    const amount = Number(form.querySelector('[name="amount"]')?.value || 0);
    const method = form.querySelector('[name="method"]')?.value || 'manual';
    if (button) button.disabled = true;
    if (message) message.textContent = 'Creating payout request...';
    try {
      const result = await requestPayout(amount, method);
      if (message) message.textContent = `Payout request created for $${Number(result.payout.amount).toFixed(2)}.`;
      form.reset();
      setTimeout(() => goTo('wallet'), 500);
    } catch (error) {
      if (message) message.textContent = error.message || 'Could not create payout request.';
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (form.id === 'user-search-form') {
    event.preventDefault();
    const input = form.querySelector('[name="query"]');
    const resultBox = document.querySelector('[data-search-result]');
    const query = input?.value || '';
    if (!resultBox) return;
    resultBox.textContent = 'Searching...';
    try {
      const user = await searchUserId(query);
      if (!user) { resultBox.innerHTML = '<div class="search-empty">No Indo user found for that User ID.</div>'; return; }
      const initial = String(user.name || user.userId || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I';
      resultBox.innerHTML = `<div class="search-user-result"><div class="avatar small">${initial}</div><div><b>${user.userId}</b><small>${user.name || 'Indo User'}</small></div></div>`;
    } catch (error) { resultBox.textContent = error.message || 'Could not search User ID.'; }
    return;
  }

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
      await refreshEarning().catch(() => {});
      if (message) message.textContent = `Account created. Your User ID is ${result.username}.`;
    } else {
      const result = await submitLogin(form);
      state.accountType = result?.accountType || state.accountType;
      await refreshProfile().catch(() => {});
      await refreshEarning().catch(() => {});
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
