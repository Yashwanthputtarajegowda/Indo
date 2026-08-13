import { state } from './state.js';
import { renderLogin, renderSignup } from './screens/auth.js';

const VERSION = '20260813-121';

function renderRouteError(app, error) {
  const message = String(error?.message || error || 'Unable to open this screen.').replace(/[&<>\\"']/g, '');
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-logo">I</div><div class="splash-name">Indo</div><p>Indo could not open this screen.</p><small>${message}</small><button type="button" data-screen="home">Back to Home</button></main>`;
}

async function renderLazy(app, modulePath, exportName, args = []) {
  try {
    const module = await import(`${modulePath}?v=${VERSION}`);
    const renderer = module[exportName];
    if (typeof renderer !== 'function') throw new Error(`Missing screen renderer: ${exportName}`);
    await renderer(app, ...args);
  } catch (error) {
    console.error(`Failed to load ${modulePath}:`, error);
    renderRouteError(app, error);
  }
}

export function preloadAppScreens() {
  // Intentionally disabled. Screens load only when opened so startup stays deterministic.
}

export async function render(app) {
  switch (state.screen) {
    case 'auth-login':
      return renderLogin(app);
    case 'auth-signup':
      return renderSignup(app);
    case 'home':
      return renderLazy(app, './screens/home-v2.js', 'renderHome');
    case 'reels':
      return renderLazy(app, './screens/reels.js', 'renderReels');
    case 'create':
      return renderLazy(app, './screens/create.js', 'renderCreate');
    case 'story-create':
      return renderLazy(app, './screens/story-create.js', 'renderStoryCreate', [window.__indoStoryDraftFile instanceof File ? window.__indoStoryDraftFile : null]);
    case 'profile':
      return renderLazy(app, './screens/profile-direct.js', 'renderProfile', [state.profile]);
    case 'settings':
      return renderLazy(app, './screens/settings.js', 'renderSettings', [state.accountType, state.earning, state.earningSummary]);
    case 'search':
      return renderLazy(app, './screens/search.js', 'renderSearch');
    case 'notifications':
      return renderLazy(app, './screens/notifications.js', 'renderNotifications');
    case 'activity':
      return renderLazy(app, './screens/activity.js', 'renderActivity');
    case 'wallet':
      return renderLazy(app, './screens/wallet.js', 'renderWallet');
    case 'blocked-users':
      return renderLazy(app, './screens/blocked-users.js', 'renderBlockedUsers');
    default:
      state.screen = 'home';
      return renderLazy(app, './screens/home-v2.js', 'renderHome');
  }
}
