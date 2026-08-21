import { state } from "./state.js";
import { renderLogin, renderSignup } from "./screens/auth.js";
import { nav } from "./components/nav.js";
import { renderHomeTopbar, installHomeTopbarStyles } from "./screens/home-topbar-v2.js";
import { prefetchVideoSection } from "./features/feed/video-prefetch.js";
import { installExternalVideoLinkCreate } from "./features/feed/external-video-link.js";

const NAV_HOST_ID = "indo-persistent-nav-host";
const RENDER_STAGE_PREFIX = "indo-render-stage-";
const moduleCache = new Map();
let preloadStarted = false;
let renderSequence = 0;
const SCREEN_MODULES = {
  messages: ["./screens/messages.js", "renderMessages"],
  reels: ["./screens/reels.js", "renderReels"],
  video: ["./screens/video.js", "renderVideo"],
  search: ["./screens/search.js?v=20260815-search-v7", "renderSearch"],
  profile: ["./screens/profile.js", "renderProfile"],
  notifications: ["./screens/notifications.js", "renderNotifications"],
  create: ["./screens/create.js?v=20260817-create-v3", "renderCreate"],
  "reel-create": ["./screens/reel-create.js?v=20260815-reel-create-v8", "renderReelCreate"],
  settings: ["./screens/settings.js", "renderSettings"],
  "profile-relation": ["./screens/profile-relation.js", "renderProfileRelation"],
  "edit-profile": ["./screens/edit-profile.js", "renderEditProfile"],
  "watch-video": ["./screens/watch-video.js?v=20260821-watch-stable-v1", "renderWatchVideo"],
  "upload-video": ["./screens/upload-video.js?v=20260821-upload-v7", "renderUploadVideo"],
  "story-create": ["./screens/story-create.js", "renderStoryCreate"],
  wallet: ["./screens/wallet.js", "renderWallet"],
  "blocked-users": ["./screens/blocked-users.js", "renderBlockedUsers"],
  report: ["./screens/report.js", "renderReport"],
};
const HIGH_PRIORITY = ["messages", "reels", "video", "search", "profile", "notifications"];
const SECONDARY_PRIORITY = ["create", "reel-create", "settings", "profile-relation", "edit-profile", "watch-video", "upload-video", "story-create", "wallet", "blocked-users", "report"];
const AUTH_SCREENS = new Set(["auth-login", "auth-signup"]);
const HIDE_NAV_SCREENS = new Set(["auth-login", "auth-signup", "edit-profile", "watch-video", "report", "reel-create", "story-create"]);

function fail(app, error) {
  console.error("Indo route error:", error);
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not open this screen.</p><small>${String(error?.message || error || "Unable to open this screen.").replace(/[&<>\\\"']/g, "")}</small><button type="button" data-screen="home">Back to Home</button></main>`;
}
function enforceAuthGuard() { if (state.authenticated || AUTH_SCREENS.has(state.screen)) return false; state.screen = "auth-login"; return true; }
function activeNavForScreen(screen) { if (screen === "messages") return "messages"; if (screen === "reels") return "reels"; if (screen === "video" || screen === "watch-video") return "video"; if (["profile", "settings", "edit-profile"].includes(screen)) return "profile"; return "home"; }

function updatePersistentNav(screen = state.screen) {
  const shouldHide = HIDE_NAV_SCREENS.has(screen) || !state.authenticated;
  const existingHost = document.getElementById(NAV_HOST_ID);
  if (shouldHide) { existingHost?.remove(); return; }
  const host = existingHost || document.createElement("div");
  host.id = NAV_HOST_ID;
  host.className = "indo-persistent-nav-host";
  host.style.cssText = "position:fixed;left:0;right:0;bottom:0;height:0;z-index:2147483647;pointer-events:none;";
  host.innerHTML = nav(activeNavForScreen(screen));
  document.body.appendChild(host);
  document.getElementById("root")?.querySelectorAll(".bottom-nav,.indo-global-bottom-nav").forEach((node) => node.remove());
}
window.__indoUpdatePersistentNav = updatePersistentNav;

function ensureHomeTopbar(app) {
  if (state.screen !== "home") return;
  installHomeTopbarStyles();
  app.querySelector(".topbar")?.remove();
  const w = document.createElement("div");
  w.innerHTML = renderHomeTopbar();
  const node = w.firstElementChild;
  if (node) app.querySelector(".app-shell")?.prepend(node);
}

async function loadScreenModule(screen, path) { const key = `${screen}:${path}`; if (!moduleCache.has(key)) moduleCache.set(key, import(path)); return moduleCache.get(key); }
async function preloadScreen(screen) { const config = SCREEN_MODULES[screen]; if (!config) return; try { await loadScreenModule(screen, config[0]); } catch (error) { console.warn(`Background preload failed for ${screen}:`, error); } }
function scheduleIdle(task) { if (typeof window.requestIdleCallback === "function") { window.requestIdleCallback(task, { timeout: 1200 }); return; } window.setTimeout(task, 60); }
export function preloadAppSections() {
  if (preloadStarted || !state.authenticated) return;
  preloadStarted = true;
  prefetchVideoSection();
  let highIndex = 0;
  let secondaryIndex = 0;
  const warmNext = async () => {
    if (!state.authenticated) return;
    const batch = HIGH_PRIORITY.slice(highIndex, highIndex + 2);
    if (batch.length) { highIndex += batch.length; await Promise.allSettled(batch.map(preloadScreen)); scheduleIdle(warmNext); return; }
    const secondary = SECONDARY_PRIORITY.slice(secondaryIndex, secondaryIndex + 2);
    if (!secondary.length) return;
    secondaryIndex += secondary.length;
    await Promise.allSettled(secondary.map(preloadScreen));
    scheduleIdle(warmNext);
  };
  scheduleIdle(warmNext);
}

async function lazy(app, screen, path, name, args = []) { const m = await loadScreenModule(screen, path); if (typeof m[name] !== "function") throw new Error(`Missing screen renderer: ${name}`); await m[name](app, ...args); }
async function installHomeReels(app) {
  if (state.screen !== "home" || !state.authenticated) return;
  try { const { installHomeReelsBridge } = await import("./features/feed/home-reels-bridge.js?v=20260815-home-reels-v2"); await installHomeReelsBridge(app); } catch (error) { console.warn("Home reels bridge failed:", error); }
}

async function renderIntoStage(stage, screen) {
  switch (screen) {
    case "auth-login": return renderLogin(stage);
    case "auth-signup": return renderSignup(stage);
    case "home": await lazy(stage, "home", "./screens/home-v2.js", "renderHome"); ensureHomeTopbar(stage); await installHomeReels(stage); preloadAppSections(); return;
    case "messages": return lazy(stage, "messages", SCREEN_MODULES.messages[0], SCREEN_MODULES.messages[1]);
    case "reels": return lazy(stage, "reels", SCREEN_MODULES.reels[0], SCREEN_MODULES.reels[1]);
    case "video": return lazy(stage, "video", SCREEN_MODULES.video[0], SCREEN_MODULES.video[1]);
    case "watch-video": return lazy(stage, "watch-video", SCREEN_MODULES["watch-video"][0], SCREEN_MODULES["watch-video"][1]);
    case "create": await lazy(stage, "create", SCREEN_MODULES.create[0], SCREEN_MODULES.create[1]); installExternalVideoLinkCreate(stage); return;
    case "reel-create": return lazy(stage, "reel-create", SCREEN_MODULES["reel-create"][0], SCREEN_MODULES["reel-create"][1]);
    case "upload-video": return lazy(stage, "upload-video", SCREEN_MODULES["upload-video"][0], SCREEN_MODULES["upload-video"][1]);
    case "story-create": return lazy(stage, "story-create", SCREEN_MODULES["story-create"][0], SCREEN_MODULES["story-create"][1], [window.__indoStoryDraftFile instanceof File ? window.__indoStoryDraftFile : null]);
    case "profile": return lazy(stage, "profile", SCREEN_MODULES.profile[0], SCREEN_MODULES.profile[1], [state.profile]);
    case "profile-relation": return lazy(stage, "profile-relation", SCREEN_MODULES["profile-relation"][0], SCREEN_MODULES["profile-relation"][1]);
    case "edit-profile": return lazy(stage, "edit-profile", SCREEN_MODULES["edit-profile"][0], SCREEN_MODULES["edit-profile"][1], [state.profile]);
    case "settings": return lazy(stage, "settings", SCREEN_MODULES.settings[0], SCREEN_MODULES.settings[1], [state.accountType, state.earning, state.earningSummary]);
    case "search": return lazy(stage, "search", SCREEN_MODULES.search[0], SCREEN_MODULES.search[1]);
    case "notifications": return lazy(stage, "notifications", SCREEN_MODULES.notifications[0], SCREEN_MODULES.notifications[1]);
    case "wallet": return lazy(stage, "wallet", SCREEN_MODULES.wallet[0], SCREEN_MODULES.wallet[1]);
    case "blocked-users": return lazy(stage, "blocked-users", SCREEN_MODULES["blocked-users"][0], SCREEN_MODULES["blocked-users"][1]);
    case "report": return lazy(stage, "report", SCREEN_MODULES.report[0], SCREEN_MODULES.report[1]);
    default: state.screen = "home"; return renderIntoStage(stage, "home");
  }
}

export async function render(app) {
  const mySequence = ++renderSequence;
  const requestedScreen = state.screen;
  if (enforceAuthGuard()) { updatePersistentNav(state.screen); try { await renderLogin(app); } catch (error) { fail(app, error); } return; }
  updatePersistentNav(requestedScreen);
  const stage = document.createElement("div");
  stage.id = `${RENDER_STAGE_PREFIX}${mySequence}`;
  stage.setAttribute("data-screen", requestedScreen);
  stage.setAttribute("aria-hidden", "true");
  stage.style.cssText = "position:fixed;inset:0;z-index:-1;visibility:hidden;pointer-events:none;overflow:auto;";
  app.appendChild(stage);
  try {
    await renderIntoStage(stage, requestedScreen);
    if (mySequence !== renderSequence || state.screen !== requestedScreen) { stage.remove(); return; }
    const fragment = document.createDocumentFragment();
    while (stage.firstChild) fragment.appendChild(stage.firstChild);
    stage.remove();
    app.replaceChildren(fragment);
  } catch (error) {
    stage.remove();
    if (mySequence === renderSequence) fail(app, error);
  }
}
