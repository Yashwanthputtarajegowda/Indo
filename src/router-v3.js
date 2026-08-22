import { state } from "./state.js";
import { renderLogin, renderSignup } from "./screens/auth.js";
import { nav } from "./components/nav.js";
import { renderHomeTopbar, installHomeTopbarStyles } from "./screens/home-topbar-v2.js";
import { installExternalVideoLinkCreate } from "./features/feed/external-video-link.js";

const NAV_HOST_ID = "indo-persistent-nav-host";
const moduleCache = new Map();
const AUTH_SCREENS = new Set(["auth-login", "auth-signup"]);
const HIDE_NAV_SCREENS = new Set(["auth-login", "auth-signup", "edit-profile", "watch-video", "report", "reel-create", "story-create"]);

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

function cleanError(error) {
  return String(error?.message || error || "Unable to open this screen.").replace(/[&<>\\\"']/g, "");
}

function fail(app, error) {
  console.error("Indo route error:", error);
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>Indo could not open this screen.</p><small>${cleanError(error)}</small><button type="button" data-screen="home">Back to Home</button></main>`;
}

function enforceAuthGuard() {
  if (state.authenticated || AUTH_SCREENS.has(state.screen)) return false;
  state.screen = "auth-login";
  return true;
}

function activeNavForScreen(screen) {
  if (screen === "messages") return "messages";
  if (screen === "reels") return "reels";
  if (screen === "video" || screen === "watch-video") return "video";
  if (["profile", "settings", "edit-profile"].includes(screen)) return "profile";
  return "home";
}

function updatePersistentNav(screen = state.screen) {
  const shouldHide = HIDE_NAV_SCREENS.has(screen) || !state.authenticated;
  const existingHost = document.getElementById(NAV_HOST_ID);
  if (shouldHide) {
    existingHost?.remove();
    return;
  }
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

async function renderScreen(app, screen) {
  switch (screen) {
    case "auth-login":
      return renderLogin(app);
    case "auth-signup":
      return renderSignup(app);
    case "home": {
      const mod = await loadScreenModule("home", "./screens/home-v2.js?v=20260822-home-premium-v4");
      if (typeof mod.renderHome !== "function") throw new Error("Home renderer is unavailable.");
      await mod.renderHome(app);
      ensureHomeTopbar(app);
      return;
    }
    default: {
      const config = SCREEN_MODULES[screen];
      if (!config) {
        state.screen = "home";
        return renderScreen(app, "home");
      }
      const mod = await loadScreenModule(screen, config[0]);
      const renderer = mod?.[config[1]];
      if (typeof renderer !== "function") throw new Error(`Missing screen renderer: ${screen}`);
      if (screen === "create") {
        await renderer(app);
        installExternalVideoLinkCreate(app);
        return;
      }
      if (screen === "story-create") {
        await renderer(app, window.__indoStoryDraftFile instanceof File ? window.__indoStoryDraftFile : null);
        return;
      }
      if (screen === "profile" || screen === "edit-profile") {
        await renderer(app, state.profile);
        return;
      }
      if (screen === "settings") {
        await renderer(app, state.accountType, state.earning, state.earningSummary);
        return;
      }
      await renderer(app);
    }
  }
}

export async function render(app) {
  if (!app) throw new Error("Indo root element is missing.");
  if (enforceAuthGuard()) {
    updatePersistentNav(state.screen);
    try { await renderLogin(app); } catch (error) { fail(app, error); }
    return;
  }
  const requestedScreen = state.screen;
  updatePersistentNav(requestedScreen);
  app.replaceChildren();
  try {
    await renderScreen(app, requestedScreen);
    if (state.screen !== requestedScreen) return render(app);
  } catch (error) {
    fail(app, error);
  }
}
