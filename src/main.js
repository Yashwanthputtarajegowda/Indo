import { state } from "./state.js";
import { auth, authPersistenceReady } from "./features/auth/firebase-client.js?v=20260822-auth-stable-v1";
import {
  bindAuthSwitches,
  bindLoginForm,
  bindSignupForm,
} from "./features/auth/auth-controller.js";
import { applyIndoPinkThunderTheme } from "./features/ui/indo-pink-thunder-theme.js?v=20260815-pink-thunder-v1";
import { installHomeFeedDesign } from "./features/ui/home-feed-design-v2.js?v=20260815-home-video-v3";
import { installVideoPlaybackFix } from "./features/feed/video-playback-fix.js?v=20260817-telegram-playback-v2";
import "./features/ui/button-touch-hardener.js?v=20260821-touch-v3";
import "./features/feed/report-handler.js";
import "./features/profile/profile-relation-navigation.js";
import "./features/profile/profile-id-navigation.js?v=20260815-profile-id-v10";
import "./features/feed/video-delete-manager.js?v=20260822-video-delete-v10";
import { render } from "./router.js?v=20260822-router-stable-v1";

const app = document.getElementById("root");
let started = false;
let rendering = false;
let navigationId = 0;

function showBootFailure(message = "Could not start Indo. Please reload the app.") {
  if (!app) return;
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>${String(message).replace(/[&<>\\\"']/g, "")}</p><button type="button" id="indo-retry-boot">Retry</button></main>`;
  document.getElementById("indo-retry-boot")?.addEventListener("click", () => window.location.reload());
}

async function renderApp() {
  if (!app || rendering) return;
  rendering = true;
  try {
    await render(app);
    applyIndoPinkThunderTheme();
    installHomeFeedDesign();
    installVideoPlaybackFix();
    bindAuthSwitches();
    bindLoginForm();
    bindSignupForm();
  } catch (error) {
    console.error("Indo render failed:", error);
    showBootFailure(error?.message || "Indo could not render.");
  } finally {
    rendering = false;
  }
}

async function navigate(screen) {
  const next = String(screen || "home");
  const id = ++navigationId;
  state.screen = next;
  window.__indoUpdatePersistentNav?.(next);
  await renderApp();
  if (id !== navigationId) return;
}

function activateNavigation(target) {
  const watchId = target.getAttribute("data-watch-video-id");
  if (watchId) {
    const item = window.__indoWatchVideoItems?.get(String(watchId));
    if (!item) return;
    try {
      sessionStorage.setItem("indo:watch-video-current", JSON.stringify(item));
    } catch {}
    void navigate("watch-video");
    return;
  }

  const screen = target.getAttribute("data-screen");
  if (!screen) return;
  target.classList.add("indo-nav-pressed");
  window.setTimeout(() => target.classList.remove("indo-nav-pressed"), 140);
  void navigate(screen);
}

if (!window.__indoStableNavigationBound) {
  window.__indoStableNavigationBound = true;
  document.addEventListener(
    "click",
    (event) => {
      const element = event.target instanceof Element ? event.target : null;
      const target = element?.closest("[data-screen],[data-watch-video-id]");
      if (!target) return;
      if (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
      event.preventDefault();
      event.stopPropagation();
      activateNavigation(target);
    },
    true,
  );
}

async function start() {
  if (started) return;
  started = true;

  try {
    await authPersistenceReady;

    const { onAuthStateChanged } = await import(
      "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
    );

    onAuthStateChanged(
      auth,
      async (user) => {
        state.authenticated = Boolean(user);
        if (user && String(state.screen).startsWith("auth-")) state.screen = "home";
        if (!user && !String(state.screen).startsWith("auth-")) state.screen = "auth-login";
        await renderApp();
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        state.authenticated = Boolean(auth.currentUser);
        if (!state.authenticated) state.screen = "auth-login";
        void renderApp();
      },
    );
  } catch (error) {
    console.error("Indo boot failed:", error);
    showBootFailure(error?.message || "Indo could not start.");
  }
}

window.__indoNavigate = navigate;
void start();
