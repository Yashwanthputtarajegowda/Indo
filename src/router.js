import { state } from "./state.js";
import {
  renderLogin,
  renderSignup,
} from "./screens/auth.js";
import { nav } from "./components/nav.js";
import "./features/ui/feed-follow-button.js";
import {
  renderHomeTopbar,
  installHomeTopbarStyles,
} from "./screens/home-topbar-v2.js";

const NAV_STYLE_ID = "indo-universal-nav";
const moduleCache = new Map();
let preloadStarted = false;

const SCREEN_MODULES = {
  messages: [
    "./screens/messages.js",
    "renderMessages",
  ],
  reels: [
    "./screens/reels.js",
    "renderReels",
  ],
  video: [
    "./screens/video.js",
    "renderVideo",
  ],
  search: [
    "./screens/search.js?v=20260815-search-v7",
    "renderSearch",
  ],
  profile: [
    "./screens/profile.js",
    "renderProfile",
  ],
  notifications: [
    "./screens/notifications.js",
    "renderNotifications",
  ],
  create: [
    "./screens/create.js",
    "renderCreate",
  ],
  settings: [
    "./screens/settings.js",
    "renderSettings",
  ],
  "profile-relation": [
    "./screens/profile-relation.js",
    "renderProfileRelation",
  ],
  "edit-profile": [
    "./screens/edit-profile.js",
    "renderEditProfile",
  ],
  "watch-video": [
    "./screens/watch-video.js",
    "renderWatchVideo",
  ],
  "upload-video": [
    "./screens/upload-video.js",
    "renderUploadVideo",
  ],
  "story-create": [
    "./screens/story-create.js",
    "renderStoryCreate",
  ],
  wallet: [
    "./screens/wallet.js",
    "renderWallet",
  ],
  "blocked-users": [
    "./screens/blocked-users.js",
    "renderBlockedUsers",
  ],
  report: [
    "./screens/report.js",
    "renderReport",
  ],
};

const HIGH_PRIORITY = [
  "messages",
  "reels",
  "video",
  "search",
  "profile",
  "notifications",
];

const SECONDARY_PRIORITY = [
  "create",
  "settings",
  "profile-relation",
  "edit-profile",
  "watch-video",
  "upload-video",
  "story-create",
  "wallet",
  "blocked-users",
  "report",
];

function fail(app, error) {
  console.error("Indo route error:", error);

  app.innerHTML = `
    <main class="splash-screen splash-error">
      <div class="splash-name">Indo</div>
      <p>Indo could not open this screen.</p>
      <small>
        ${String(
          error?.message ||
            error ||
            "Unable to open this screen.",
        ).replace(/[&<>\"']/g, "")}
      </small>
      <button type="button" data-screen="home">
        Back to Home
      </button>
    </main>
  `;
}

function installNavStyles() {
  if (document.getElementById(NAV_STYLE_ID)) return;

  const s = document.createElement("style");
  s.id = NAV_STYLE_ID;
  s.textContent = `
    .indo-global-bottom-nav,.bottom-nav{
      position:fixed!important;
      left:50%!important;
      bottom:0!important;
      transform:translateX(-50%)!important;
      width:min(100%,520px)!important;
      height:68px!important;
      z-index:99999!important;
      display:grid!important;
      grid-template-columns:repeat(5,1fr)!important;
      gap:0!important;
      background:#0f0f14!important;
      border-top:1px solid #24242b!important;
      box-sizing:border-box!important;
      padding:0!important;
      margin:0!important;
    }
    .indo-global-bottom-nav button,.bottom-nav button{
      border:0!important;
      background:transparent!important;
      color:#85858f!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      gap:4px!important;
      padding:6px 2px!important;
      margin:0!important;
      font:700 11px/1.1 Arial,sans-serif!important;
      cursor:pointer!important;
    }
    .indo-global-bottom-nav button.active,
    .bottom-nav button.active{
      color:#fff!important;
    }
    .indo-global-bottom-nav svg,.bottom-nav svg{
      width:20px!important;
      height:20px!important;
    }
    .indo-global-bottom-nav span,.bottom-nav span{
      display:block!important;
    }
  `;

  document.head.appendChild(s);
}

function activeNav() {
  if (state.screen === "messages") return "messages";
  if (state.screen === "reels") return "reels";

  if (
    state.screen === "video" ||
    state.screen === "watch-video"
  ) {
    return "video";
  }

  if (
    ["profile", "settings", "edit-profile"].includes(
      state.screen,
    )
  ) {
    return "profile";
  }

  return "home";
}

function ensureUniversalNav(app) {
  if (
    !app ||
    [
      "auth-login",
      "auth-signup",
      "edit-profile",
      "watch-video",
      "report",
    ].includes(state.screen)
  ) {
    return;
  }

  installNavStyles();
  app
    .querySelectorAll(
      ".bottom-nav,.indo-global-bottom-nav",
    )
    .forEach((n) => n.remove());

  const wrapper = document.createElement("div");
  wrapper.innerHTML = nav(activeNav());
  const bottom = wrapper.firstElementChild;

  if (bottom) {
    bottom.classList.add("indo-global-bottom-nav");
    app.appendChild(bottom);
  }
}

function ensureHomeTopbar(app) {
  if (state.screen !== "home") return;

  installHomeTopbarStyles();
  app.querySelector(".topbar")?.remove();

  const w = document.createElement("div");
  w.innerHTML = renderHomeTopbar();
  const node = w.firstElementChild;

  if (node) {
    app.querySelector(".app-shell")?.prepend(node);
  }
}

async function loadScreenModule(
  screen,
  path,
) {
  const key = `${screen}:${path}`;

  if (!moduleCache.has(key)) {
    moduleCache.set(key, import(path));
  }

  return moduleCache.get(key);
}

async function preloadScreen(screen) {
  const config = SCREEN_MODULES[screen];
  if (!config) return;

  try {
    await loadScreenModule(screen, config[0]);
  } catch (error) {
    console.warn(
      `Background preload failed for ${screen}:`,
      error,
    );
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
  if (preloadStarted) return;
  preloadStarted = true;

  let highIndex = 0;
  let secondaryIndex = 0;

  const warmNext = async () => {
    const batch = HIGH_PRIORITY.slice(
      highIndex,
      highIndex + 2,
    );

    if (batch.length) {
      highIndex += batch.length;
      await Promise.allSettled(
        batch.map(preloadScreen),
      );
      scheduleIdle(warmNext);
      return;
    }

    const secondary = SECONDARY_PRIORITY.slice(
      secondaryIndex,
      secondaryIndex + 2,
    );

    if (!secondary.length) return;

    secondaryIndex += secondary.length;
    await Promise.allSettled(
      secondary.map(preloadScreen),
    );
    scheduleIdle(warmNext);
  };

  scheduleIdle(warmNext);
}

async function lazy(app, screen, path, name, args = []) {
  try {
    const m = await loadScreenModule(screen, path);

    if (typeof m[name] !== "function") {
      throw new Error(
        `Missing screen renderer: ${name}`,
      );
    }

    await m[name](app, ...args);
  } catch (e) {
    fail(app, e);
  }
}

export async function render(app) {
  try {
    switch (state.screen) {
      case "auth-login":
        return renderLogin(app);

      case "auth-signup":
        return renderSignup(app);

      case "home":
        await lazy(
          app,
          "home",
          "./screens/home-v2.js",
          "renderHome",
        );
        ensureHomeTopbar(app);
        preloadAppSections();
        break;

      case "messages":
        await lazy(
          app,
          "messages",
          SCREEN_MODULES.messages[0],
          SCREEN_MODULES.messages[1],
        );
        break;

      case "reels":
        await lazy(
          app,
          "reels",
          SCREEN_MODULES.reels[0],
          SCREEN_MODULES.reels[1],
        );
        break;

      case "video":
        await lazy(
          app,
          "video",
          SCREEN_MODULES.video[0],
          SCREEN_MODULES.video[1],
        );
        break;

      case "watch-video":
        await lazy(
          app,
          "watch-video",
          SCREEN_MODULES["watch-video"][0],
          SCREEN_MODULES["watch-video"][1],
        );
        break;

      case "create":
        await lazy(
          app,
          "create",
          SCREEN_MODULES.create[0],
          SCREEN_MODULES.create[1],
        );
        break;

      case "upload-video":
        await lazy(
          app,
          "upload-video",
          SCREEN_MODULES["upload-video"][0],
          SCREEN_MODULES["upload-video"][1],
        );
        break;

      case "story-create":
        await lazy(
          app,
          "story-create",
          SCREEN_MODULES["story-create"][0],
          SCREEN_MODULES["story-create"][1],
          [
            window.__indoStoryDraftFile instanceof File
              ? window.__indoStoryDraftFile
              : null,
          ],
        );
        break;

      case "profile":
        await lazy(
          app,
          "profile",
          SCREEN_MODULES.profile[0],
          SCREEN_MODULES.profile[1],
          [state.profile],
        );
        break;

      case "profile-relation":
        await lazy(
          app,
          "profile-relation",
          SCREEN_MODULES["profile-relation"][0],
          SCREEN_MODULES["profile-relation"][1],
        );
        break;

      case "edit-profile":
        await lazy(
          app,
          "edit-profile",
          SCREEN_MODULES["edit-profile"][0],
          SCREEN_MODULES["edit-profile"][1],
          [state.profile],
        );
        break;

      case "settings":
        await lazy(
          app,
          "settings",
          SCREEN_MODULES.settings[0],
          SCREEN_MODULES.settings[1],
          [
            state.accountType,
            state.earning,
            state.earningSummary,
          ],
        );
        break;

      case "search":
        await lazy(
          app,
          "search",
          SCREEN_MODULES.search[0],
          SCREEN_MODULES.search[1],
        );
        break;

      case "notifications":
        await lazy(
          app,
          "notifications",
          SCREEN_MODULES.notifications[0],
          SCREEN_MODULES.notifications[1],
        );
        break;

      case "activity":
        await lazy(
          app,
          "activity",
          SCREEN_MODULES.notifications[0],
          SCREEN_MODULES.notifications[1],
          ["activity"],
        );
        break;

      case "wallet":
        await lazy(
          app,
          "wallet",
          SCREEN_MODULES.wallet[0],
          SCREEN_MODULES.wallet[1],
        );
        break;

      case "blocked-users":
        await lazy(
          app,
          "blocked-users",
          SCREEN_MODULES["blocked-users"][0],
          SCREEN_MODULES["blocked-users"][1],
        );
        break;

      case "report":
        await lazy(
          app,
          "report",
          SCREEN_MODULES.report[0],
          SCREEN_MODULES.report[1],
        );
        break;

      default:
        state.screen = "home";
        await lazy(
          app,
          "home",
          "./screens/home-v2.js",
          "renderHome",
        );
        ensureHomeTopbar(app);
        preloadAppSections();
    }

    ensureUniversalNav(app);
  } catch (e) {
    fail(app, e);
  }
}
