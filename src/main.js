import { state } from "./state.js";
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
import "./features/ui/button-touch-hardener.js?v=20260821-touch-v3";
import "./features/feed/report-handler.js";
import "./features/profile/profile-relation-navigation.js";
import "./features/profile/profile-id-navigation.js?v=20260815-profile-id-v10";
import "./features/feed/video-delete-manager.js?v=20260821-video-delete-v2";

const app = document.getElementById("root");
let started = false;
let renderId = 0;
let navigationId = 0;
const ROUTER_VERSION = "./router.js?v=20260821-upload-v8";
const routerWarmup = import(ROUTER_VERSION).catch(() => null);

const backendWarmup = (() => {
  const base = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  if (!base) return Promise.resolve(null);
  return fetch(`${base}/api/health`, { method: "GET", cache: "no-store", credentials: "omit", keepalive: true }).catch(() => null);
})();

function scheduleProfileEnhancement(root, id) {
  const run = () => {
    if (id !== renderId) return;
    enhanceProfileIdentity(root).catch(() => {});
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1200 });
  else window.setTimeout(run, 40);
}

function scheduleLiveAvatarInstaller() {
  const run = async () => {
    try { await import("./features/profile/profile-avatar-live.js?v=20260815-avatar-v8"); } catch {}
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => run().catch(() => {}), { timeout: 1600 });
  else window.setTimeout(() => run().catch(() => {}), 80);
}

async function render() {
  const currentRender = ++renderId;
  const router = (await routerWarmup) || await import(ROUTER_VERSION);
  await router.render(app);
  if (currentRender !== renderId) return;
  applyIndoPinkThunderTheme();
  installHomeFeedDesign();
  installVideoPlaybackFix();
  scheduleProfileEnhancement(app, currentRender);
  scheduleLiveAvatarInstaller();
  bindAuthSwitches();
  bindLoginForm();
  bindSignupForm();
}

function activateNavigation(target) {
  const watchId = target.getAttribute("data-watch-video-id");
  if (watchId) {
    const item = window.__indoWatchVideoItems?.get(String(watchId));
    if (!item) return;
    try { sessionStorage.setItem("indo:watch-video-current", JSON.stringify(item)); } catch {}
    void navigate("watch-video");
    return;
  }
  const screen = target.getAttribute("data-screen");
  if (!screen) return;
  target.classList.add("indo-nav-pressed");
  window.setTimeout(() => target.classList.remove("indo-nav-pressed"), 140);
  void navigate(screen);
}

async function navigate(screen) {
  const nextScreen = String(screen || "home");
  const requestId = ++navigationId;
  if (nextScreen === "profile") state.profile = null;
  state.screen = nextScreen;
  window.__indoUpdatePersistentNav?.(nextScreen);

  if (nextScreen === "video") {
    const fastSequence = ++renderId;
    app.innerHTML = `<main style="min-height:100vh;background:#030308;color:#fff;padding:20px 14px 100px"><div style="font-weight:900;font-size:18px;margin-bottom:14px">Video</div><div style="height:180px;border-radius:14px;background:linear-gradient(90deg,#101018,#181822,#101018);background-size:200% 100%;animation:indoVideoLoad 1.1s ease-in-out infinite"></div><style>@keyframes indoVideoLoad{0%{background-position:0% 0}50%{background-position:100% 0}100%{background-position:0% 0}}</style></main>`;
    try {
      const mod = await import("./screens/video.js?nav-fast-v6");
      if (fastSequence !== renderId || state.screen !== "video" || requestId !== navigationId) return;
      await mod.renderVideo(app);
      if (fastSequence !== renderId || state.screen !== "video" || requestId !== navigationId) return;
      applyIndoPinkThunderTheme();
      installHomeFeedDesign();
      installVideoPlaybackFix();
    } catch (error) {
      console.error("Fast video navigation failed:", error);
    }
    return;
  }

  try { await render(); } catch (error) { console.error("Indo navigation failed:", error); }
  if (requestId !== navigationId) return;
}

if (!window.__indoUniversalNavigation) {
  window.__indoUniversalNavigation = true;
  const handleActivation = (event) => {
    const el = event.target instanceof Element ? event.target : null;
    const target = el?.closest("[data-screen],[data-watch-video-id]");
    if (!target) return;
    if (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const now = performance.now();
    const last = Number(target.dataset.indoActivatedAt || 0);
    const cooldown = target.getAttribute("data-screen") === "video" ? 150 : 700;
    if (now - last < cooldown) return;
    target.dataset.indoActivatedAt = String(now);
    activateNavigation(target);
  };
  document.addEventListener("pointerdown", handleActivation, { capture: true, passive: false });
  document.addEventListener("click", handleActivation, { capture: true, passive: false });
}

function showBootFailure(message = "Could not start Indo. Please reload the app.") {
  if (!app) return;
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>${message}</p><button type="button" id="indo-retry-boot">Retry</button></main>`;
  document.getElementById("indo-retry-boot")?.addEventListener("click", () => window.location.reload());
}

async function start() {
  if (started) return;
  started = true;
  try {
    const { auth, authPersistenceReady } = await (async () => {
      const m = await import("./features/auth/firebase-client.js?v=20260815-auth-v6");
      return m;
    })();
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");
    await authPersistenceReady;
    const user = await new Promise((resolve) => {
      let done = false;
      const finish = (value) => { if (done) return; done = true; resolve(value); };
      const unsub = onAuthStateChanged(auth, (u) => { try { unsub?.(); } catch {} finish(u); }, () => finish(auth.currentUser || null));
      window.setTimeout(() => finish(auth.currentUser || null), 8000);
    });
    state.authenticated = Boolean(user);
    if (user && String(state.screen).startsWith("auth-")) state.screen = "home";
    if (!user && !String(state.screen).startsWith("auth-")) state.screen = "auth-login";
    const warmed = await routerWarmup;
    if (state.authenticated && typeof warmed?.preloadAppSections === "function") warmed.preloadAppSections();
    void backendWarmup;
    await render();
  } catch (error) {
    console.error("Indo boot failed:", error);
    showBootFailure(error?.message || "Indo could not start.");
  }
}

window.__indoNavigate = navigate;
installProfileIdentityEnhancer();
start();
