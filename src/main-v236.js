import { bindAuthSwitches, bindLoginForm, bindSignupForm } from './features/auth/auth-controller.js?v=236';
import { installProfileLinkNavigation } from './features/ui/profile-link-navigation-v236.js';

const app = document.getElementById('root');
const ROUTER_VERSION = '236';
const SPLASH_MS = 2500;
let navigationBusy = false;
let splashStartedAt = Date.now();

async function navigate(screen) {
  const target = String(screen || '').trim();
  if (!target || navigationBusy) return;
  navigationBusy = true;
  try {
    const { state } = await import('./state.js');
    // Profile navigation may legitimately target the same screen with a different user.
    if (state.screen === target && target !== 'profile') return;
    state.screen = target;
    window.__indoRecommendationScreen = target;
    await render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  } finally { navigationBusy = false; }
}

function installNavigationClicks() {
  if (window.__indoNavigationClicksInstalledV236) return;
  window.__indoNavigationClicksInstalledV236 = true;
  document.addEventListener('click', (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const button = element?.closest('[data-screen]');
    if (!button) return;
    const surface = button.closest('.indo-option5-topbar,.indo-global-bottom-nav,.indo-brand-topbar,.bottom-nav,.page-head,.reels-top');
    if (!surface) return;
    const screen = button.getAttribute('data-screen');
    if (!screen) return;
    if (screen === 'profile' && button.hasAttribute('data-own-profile')) {
      event.preventDefault();
      event.stopPropagation();
      import('./state.js').then(({ state }) => {
        state.profile = null;
        state.screen = 'profile';
        return render();
      }).then(() => window.scrollTo({ top: 0, behavior: 'auto' }))
        .catch((error) => console.error('Own profile navigation failed:', error));
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    navigate(screen).catch((error) => console.error('Indo navigation failed:', error));
  }, true);
}

async function waitForSplash() {
  const elapsed = Date.now() - splashStartedAt;
  const remaining = Math.max(0, SPLASH_MS - elapsed);
  if (remaining) await new Promise((resolve) => setTimeout(resolve, remaining));
}

async function render() {
  const { state } = await import('./state.js');
  window.__indoRecommendationScreen = String(state.screen || 'auth-login');
  const { render } = await import(`./router-v236.js?v=${ROUTER_VERSION}`);
  await render(app);
  bindAuthSwitches();
  bindLoginForm();
  bindSignupForm();
}

function showBootError(error) {
  console.error('Indo startup failed:', error);
  app.innerHTML = '<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not start.</p><small>Please reload the app.</small></main>';
}

async function start() {
  installNavigationClicks();
  installProfileLinkNavigation();
  try {
    try {
      const mod = await import(`./features/feed/recommendation.js?v=${ROUTER_VERSION}`);
      if (typeof mod.initRecommendationEngine === 'function') mod.initRecommendationEngine();
    } catch (error) { console.warn('Recommendation engine disabled for this boot:', error); }
    const { auth } = await import('./features/auth/firebase-client.js');
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');
    onAuthStateChanged(auth, async (user) => {
      const { state } = await import('./state.js');
      state.authenticated = Boolean(user);
      window.__indoRecommendationUid = String(user?.uid || 'guest');
      if (user && (state.screen === 'auth-login' || state.screen === 'auth-signup')) state.screen = 'home';
      if (!user && !String(state.screen || '').startsWith('auth-')) state.screen = 'auth-login';
      window.__indoRecommendationScreen = String(state.screen || 'auth-login');
      try { await waitForSplash(); await render(); } catch (error) { showBootError(error); }
    });
  } catch (error) {
    await waitForSplash();
    showBootError(error);
  }
}

window.__indoNavigate = navigate;
start();
