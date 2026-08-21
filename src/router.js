import { state } from "./state.js";
import { renderLogin, renderSignup } from "./screens/auth.js";
import { nav } from "./components/nav.js";
import { renderHomeTopbar, installHomeTopbarStyles } from "./screens/home-topbar-v2.js";
import { prefetchVideoSection } from "./features/feed/video-prefetch.js";
import { installExternalVideoLinkCreate } from "./features/feed/external-video-link.js";

const moduleCache = new Map();
let preloadStarted = false;

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
  "upload-video": ["./screens/upload-video.js?v=20260820-drive-final-v5", "renderUploadVideo"],
  "story-create": ["./screens/story-create.js", "renderStoryCreate"],
  wallet: ["./screens/wallet.js", "renderWallet"],
  "blocked-users": ["./screens/blocked-users.js", "renderBlockedUsers"],
  report: ["./screens/report.js", "renderReport"],
};

const HIGH_PRIORITY = ["messages", "reels", "video", "search", "profile", "notifications"];
const SECONDARY_PRIORITY = ["create", "reel-create", "settings", "profile-relation", "edit-profile", "watch-video", "upload-video", "story-create", "wallet", "blocked-users", "report"];
const AUTH_SCREENS = new Set(["auth-login", "auth-signup"]);

function fail(app, error) {
  console.error("Indo route error:", error);
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not open this screen.</p><small>${String(error?.message || error || "Unable to open this screen.").replace(/[&<>\\\"']/g, "")}</small><button type="button" data-screen="home">Back to Home</button></main>`;
}

function enforceAuthGuard() {
  if (state.authenticated || AUTH_SCREENS.has(state.screen)) return false;
  state.screen = "auth-login";
  return true;
}

function activeNav() {
  if (state.screen === "messages") return "messages";
  if (state.screen === "reels") return "reels";
  if (state.screen === "video" || state.screen === "watch-video") return "video";
  if (["profile", "settings", "edit-profile"].includes(state.screen)) return "profile";
  return "home";
}

function ensureUniversalNav(app) {
  if (!app || ["auth-login", "auth-signup", "edit-profile", "watch-video", "report", "reel-create", "story-create"].includes(state.screen)) return;

  // The navigation component is the single source of truth for its own design.
  // Do not add router-level styles/classes that can override nav.js.
  app.querySelectorAll(".bottom-nav").forEach((node) => node.remove());

  const wrapper = document.createElement("div");
  wrapper.innerHTML = nav(activeNav());
  const bottom = wrapper.firstElementChild;
  if (bottom) app.appendChild(bottom);
}

function ensureHomeTopbar(app) {
  if (state.screen !== "home") return;
  installHomeTopbarStyles();
  app.querySelector(".topbar")?.remove();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderHomeTopbar();
  const node = wrapper.firstElementChild;
  if (node) app.querySelector(".app-shell")?.prepend(node);
}

async function loadScreenModule(screen, path) {
  const key = `${screen}:${path}`;
  if (!moduleCache.has(key)) moduleCache.set(key, import(path));
  return moduleCache.get(key);
}

async function preloadScreen(screen) {
  const config = SCREEN_MODULES[screen];
  if (!config) return;
  try {
    await loadScreenModule(screen, config[0]);
  } catch (error) {
    console.warn(`Background preload failed for ${screen}:`, error);
  }
}

function scheduleIdle(task) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout: 1200 });
    return;
  }
  window.setTimeout(task, 60);
}

export function preloadAppSections() {
  if (preloadStarted || !state.authenticated) return;
  preloadStarted = true;
  prefetchVideoSection();

  let highIndex = 0;
  let secondaryIndex = 0;

  const warmNext = async () => {
    if (!state.authenticated) return;

    const batch = HIGH_PRIORITY.slice(highIndex, highIndex + 2);
    if (batch.length) {
      highIndex += batch.length;
      await Promise.allSettled(batch.map(preloadScreen));
      scheduleIdle(warmNext);
      return;
    }

    const secondary = SECONDARY_PRIORITY.slice(secondaryIndex, secondaryIndex + 2);
    if (!secondary.length) return;
    secondaryIndex += secondary.length;
    await Promise.allSettled(secondary.map(preloadScreen));
    scheduleIdle(warmNext);
  };

  scheduleIdle(warmNext);
}

async function lazy(app, screen, path, name, args = []) {
  try {
    const module = await loadScreenModule(screen, path);
    if (typeof module[name] !== "function") throw new Error(`Missing screen renderer: ${name}`);
    await module[name](app, ...args);
  } catch (error) {
    fail(app, error);
  }
}

async function installHomeReels(app) {
  if (state.screen !== "home" || !state.authenticated) return;
  try {
    const { installHomeReelsBridge } = await import("./features/feed/home-reels-bridge.js?v=20260815-home-reels-v2");
    await installHomeReelsBridge(app);
  } catch (error) {
    console.warn("Home reels bridge failed:", error);
  }
}

export async function render(app) {
  try {
    if (enforceAuthGuard()) return renderLogin(app);

    switch (state.screen) {
      case "auth-login":
        return renderLogin(app);
      case "auth-signup":
        return renderSignup(app);
      case "home":
        await lazy(app, "home", "./screens/home-v2.js", "renderHome");
        ensureHomeTopbar(app);
        await installHomeReels(app);
        preloadAppSections();
        break;
      case "messages":
        await lazy(app, "messages", SCREEN_MODULES.messages[0], SCREEN_MODULES.messages[1]);
        break;
      case "reels":
        await lazy(app, "reels", SCREEN_MODULES.reels[0], SCREEN_MODULES.reels[1]);
        break;
      case "video":
        await lazy(app, "video", SCREEN_MODULES.video[0], SCREEN_MODULES.video[1]);
        break;
      case "watch-video":
        await lazy(app, "watch-video", SCREEN_MODULES["watch-video"][0], SCREEN_MODULES["watch-video"][1]);
        break;
      case "create":
        await lazy(app, "create", SCREEN_MODULES.create[0], SCREEN_MODULES.create[1]);
        installExternalVideoLinkCreate(app);
        break;
      case "reel-create":
        await lazy(app, "reel-create", SCREEN_MODULES["reel-create"][0], SCREEN_MODULES["reel-create"][1]);
        break;
      case "upload-video":
        await lazy(app, "upload-video", SCREEN_MODULES["upload-video"][0], SCREEN_MODULES["upload-video"][1]);
        break;
      case "story-create":
        await lazy(app, "story-create", SCREEN_MODULES["story-create"][0], SCREEN_MODULES["story-create"][1], [window.__indoStoryDraftFile instanceof File ? window.__indoStoryDraftFile : null]);
        break;
      case "profile":
        await lazy(app, "profile", SCREEN_MODULES.profile[0], SCREEN_MODULES.profile[1], [state.profile]);
        break;
      case "profile-relation":
        await lazy(app, "profile-relation", SCREEN_MODULES["profile-relation"][0], SCREEN_MODULES["profile-relation"][1]);
        break;
      case "edit-profile":
        await lazy(app, "edit-profile", SCREEN_MODULES["edit-profile"][0], SCREEN_MODULES["edit-profile"][1], [state.profile]);
        break;
      case "settings":
        await lazy(app, "settings", SCREEN_MODULES.settings[0], SCREEN_MODULES.settings[1], [state.accountType, state.earning, state.earningSummary]);
        break;
      case "search":
        await lazy(app, "search", SCREEN_MODULES.search[0], SCREEN_MODULES.search[1]);
        break;
      case "notifications":
        await lazy(app, "notifications", SCREEN_MODULES.notifications[0], SCREEN_MODULES.notifications[1]);
        break;
      case "wallet":
        await lazy(app, "wallet", SCREEN_MODULES.wallet[0], SCREEN_MODULES.wallet[1]);
        break;
      case "blocked-users":
        await lazy(app, "blocked-users", SCREEN_MODULES["blocked-users"][0], SCREEN_MODULES["blocked-users"][1]);
        break;
      case "report":
        await lazy(app, "report", SCREEN_MODULES.report[0], SCREEN_MODULES.report[1]);
        break;
      default:
        state.screen = "home";
        await lazy(app, "home", "./screens/home-v2.js", "renderHome");
        ensureHomeTopbar(app);
        await installHomeReels(app);
        preloadAppSections();
    }

    ensureUniversalNav(app);
  } catch (error) {
    fail(app, error);
  }
}
