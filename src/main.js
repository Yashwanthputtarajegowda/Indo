import {
  bindAuthSwitches,
  bindLoginForm,
  bindSignupForm,
} from "./features/auth/auth-controller.js";
import {
  enhanceProfileIdentity,
  installProfileIdentityEnhancer,
} from "./features/profile/profile-identity.js?v=20260815-profile-identity-v5";
import { applyIndoPinkThunderTheme } from "./features/ui/indo-pink-thunder-theme.js?v=20260815-pink-thunder-v1";
import { installHomeFeedDesign } from "./features/ui/home-feed-design-v2.js?v=20260815-home-video-v3";
import { installVideoPlaybackFix } from "./features/feed/video-playback-fix.js?v=20260817-telegram-playback-v2";
import "./features/feed/report-handler.js";
import "./features/profile/profile-relation-navigation.js";
import "./features/profile/profile-id-navigation.js?v=20260815-profile-id-v10";

const app = document.getElementById("root");
let busy = false;
let started = false;
let renderId = 0;

const routerWarmup = import("./router.js?v=20260817-router-create-clean-v3").catch((error) => {
  console.warn("Router warmup failed; normal startup import will retry:", error);
  return null;
});

const backendWarmup = (() => {
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) return Promise.resolve(null);
  return fetch(`${base}/api/health`, { method: "GET", cache: "no-store", credentials: "omit", keepalive: true }).catch((error) => {
    console.warn("Backend warmup failed; request will retry when needed:", error);
    return null;
  });
})();

function scheduleProfileEnhancement(root, id) {
  const run = () => {
    if (id !== renderId) return;
    enhanceProfileIdentity(root).catch((error) => console.warn("Profile identity enhancement failed:", error));
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1200 });
  else window.setTimeout(run, 40);
}

function scheduleLiveAvatarInstaller() {
  const run = async () => {
    try { await import("./features/profile/profile-avatar-live.js?v=20260815-avatar-v8"); }
    catch (error) { console.warn("Live profile avatars unavailable:", error); }
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => run().catch(() => {}), { timeout: 1600 });
  else window.setTimeout(() => run().catch(() => {}), 80);
}

async function render() {
  const currentRender = ++renderId;
  const warmedRouter = await routerWarmup;
  const { render } = warmedRouter || await import("./router.js?v=20260817-router-create-clean-v3");
  await render(app);
  applyIndoPinkThunderTheme();
  installHomeFeedDesign();
  installVideoPlaybackFix();
  scheduleProfileEnhancement(app, currentRender);
  scheduleLiveAvatarInstaller();
  bindAuthSwitches();
  bindLoginForm();
  bindSignupForm();
}

async function navigate(screen) {
  if (busy) return;
  busy = true;
  try {
    const { state } = await import("./state.js");
    if (screen === "profile") state.profile = null;
    state.screen = String(screen || "home");
    await render();
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch (error) {
    console.error("Indo navigation failed:", error);
    throw error;
  } finally {
    busy = false;
  }
}

if (!window.__indoUniversalNavigation) {
  window.__indoUniversalNavigation = true;
  document.addEventListener("click", (event) => {
    const el = event.target instanceof Element ? event.target : null;
    const button = el?.closest("[data-screen],[data-watch-video-id]");
    if (!button) return;
    const watchId = button.getAttribute("data-watch-video-id");
    if (watchId) {
      // Only handle watch cards when this global bridge actually owns the
      // item. The Video screen has its own local click handler which stores
      // the exact selected video. Previously this capture-phase handler
      // navigated first, leaving the previous sessionStorage video selected.
      const item = window.__indoWatchVideoItems?.get(String(watchId));
      if (!item) return;
      try { sessionStorage.setItem("indo:watch-video-current", JSON.stringify(item)); } catch {}
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate("watch-video").catch(console.error);
      return;
    }
    const screen = button.getAttribute("data-screen");
    if (!screen) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.classList.add("indo-nav-pressed");
    window.setTimeout(() => button.classList.remove("indo-nav-pressed"), 140);
    navigate(screen).catch(console.error);
  }, true);
}

function showBootFailure(message = "Could not start Indo. Please reload the app.\") {
  if (!app) return;
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>${message}</p><button type="button" id="indo-retry-boot" style="margin-top:14px;padding:10px 16px;border-radius:10px;background:#743cff;color:#fff;font-weight:800;cursor:pointer">Retry</button></main>`;
  document.getElementById("indo-retry-boot")?.addEventListener("click", () => window.location.reload());
}

async function start() {
  if (started) return;
  started = true;
  try {
    const { auth, authPersistenceReady } = await import("./features/auth/firebase-client.js?v=20260815-auth-v6");
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");
    await authPersistenceReady;
    let settled = false;
    const bootWithUser = async (user) => {
      if (settled) return;
      settled = true;
      const { state } = await import("./state.js");
      state.authenticated = Boolean(user);
      if (user && (state.screen === "auth-login" || state.screen === "auth-signup")) state.screen = "home";
      if (!user && !String(state.screen || "").startsWith("auth-")) state.screen = "auth-login";
      try {
        const { preloadAppSections } = (await routerWarmup) || {};
        if (state.authenticated && typeof preloadAppSections === "function") preloadAppSections();
        void backendWarmup;
        await Promise.race([render(), new Promise((_, reject) => setTimeout(() => reject(new Error("Startup timed out.")), 10000))]);
      } catch (error) {
        console.error("Indo startup failed:", error);
        showBootFailure();
      }
    };
    let unsubscribe;
    const firstAuth = new Promise((resolve) => {
      unsubscribe = onAuthStateChanged(auth, (user) => resolve(user), () => resolve(auth.currentUser || null));
    });
    const user = await Promise.race([firstAuth, new Promise((resolve) => setTimeout(() => resolve(auth.currentUser || null), 8000))]);
    try { unsubscribe?.(); } catch {}
    await bootWithUser(user || null);
  } catch (error) {
    console.error("Indo boot failed:", error);
    showBootFailure("Indo could not start.");
  }
}

window.__indoNavigate = navigate;
installProfileIdentityEnhancer();
start();
