import { state } from './state.js';
import { renderLogin, renderSignup } from './screens/auth.js';

const VERSION = '20260813-60';

function renderRouteError(app, error) {
  const message = String(error?.message || error || 'Unable to open this screen.').replace(/[&<>\\"']/g, '');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not open this screen.</p><small>${message}</small><button type="button" data-screen="home">Back to Home</button></main>`;
}

function fixStoryCreateActions() {
  const preview = document.getElementById('story-preview');
  const publish = document.getElementById('story-publish-button');
  const addButton = document.getElementById('story-add-button');
  if (!preview || !publish || !addButton) return;

  if (publish.parentElement !== preview) preview.appendChild(publish);
  publish.textContent = 'Done';
  publish.style.cssText = 'position:absolute;left:auto;right:0;bottom:12px;width:20%;max-width:none;height:46px;z-index:40;margin:0;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800;cursor:pointer;pointer-events:auto;touch-action:manipulation;';
  addButton.style.cssText += ';position:absolute;right:14px;bottom:68px;z-index:41;pointer-events:auto;touch-action:manipulation;';

  if (publish.dataset.doneActionBound !== '1') {
    publish.dataset.doneActionBound = '1';
    publish.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    }, true);
    publish.addEventListener('pointerup', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!publish.disabled) publish.click();
    }, true);
    publish.addEventListener('click', (event) => {
      event.stopPropagation();
    }, true);
  }
}

async function renderLazy(app, modulePath, exportName, args = []) {
  try {
    const module = await import(`${modulePath}?v=${VERSION}`);
    const renderer = module[exportName];
    if (typeof renderer !== 'function') throw new Error(`Missing screen renderer: ${exportName}`);
    await renderer(app, ...args);
    if (modulePath === './screens/story-create.js') {
      window.__indoFixStoryEditor?.();
      fixStoryCreateActions();
    }
  } catch (error) {
    console.error(`Failed to load ${modulePath}:`, error);
    renderRouteError(app, error);
  }
}

export async function render(app) {
  if (state.screen === 'auth-login') return renderLogin(app);
  if (state.screen === 'auth-signup') return renderSignup(app);
  if (state.screen === 'home') return renderLazy(app, './screens/home-v2.js', 'renderHome');
  if (state.screen === 'reels') return renderLazy(app, './screens/reels.js', 'renderReels');
  if (state.screen === 'create') return renderLazy(app, './screens/create.js', 'renderCreate');
  if (state.screen === 'story-create') return renderLazy(app, './screens/story-create.js', 'renderStoryCreate', [window.__indoStoryDraftFile instanceof File ? window.__indoStoryDraftFile : null]);
  if (state.screen === 'profile') return renderLazy(app, './screens/profile-direct.js', 'renderProfile', [state.profile]);
  if (state.screen === 'settings') return renderLazy(app, './screens/settings.js', 'renderSettings', [state.accountType, state.earning, state.earningSummary]);
  if (state.screen === 'search') return renderLazy(app, './screens/search.js', 'renderSearch');
  if (state.screen === 'notifications') return renderLazy(app, './screens/notifications.js', 'renderNotifications');
  if (state.screen === 'activity') return renderLazy(app, './screens/activity.js', 'renderActivity');
  if (state.screen === 'wallet') return renderLazy(app, './screens/wallet.js', 'renderWallet');
  if (state.screen === 'blocked-users') return renderLazy(app, './screens/blocked-users.js', 'renderBlockedUsers');
  return renderLazy(app, './screens/home-v2.js', 'renderHome');
}
