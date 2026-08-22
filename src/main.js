import { state } from "./state.js";
import { auth, authPersistenceReady } from "./features/auth/firebase-client.js?v=20260822-auth-stable-v1";
import { render } from "./router.js?v=20260822-router-stable-v1";

const app = document.getElementById("root");
let started = false;
let rendering = false;
let navigationId = 0;
let enhancementsStarted = false;

function showBootFailure(message = "Could not start Indo. Please reload the app.") {
  if (!app) return;
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>${String(message).replace(/[&<>\\\"']/g, "")}</p><button type="button" id="indo-retry-boot">Retry</button></main>`;
  document.getElementById("indo-retry-boot")?.addEventListener("click", () => window.location.reload());
}

function startEnhancements() {
  if (enhancementsStarted) return;
  enhancementsStarted = true;

  const run = () => {
    // Non-critical UI modules are intentionally loaded after the first paint.
    // None of these modules is allowed to block the initial render.
    void import("./features/ui/indo-pink-thunder-theme.js?v=20260815-pink-thunder-v1")
      .then((mod) => mod.applyIndoPinkThunderTheme?.())
      .catch((error) => console.warn("Theme enhancement unavailable:", error));

    void import("./features/ui/home-feed-design-v2.js?v=20260815-home-video-v3")
      .then((mod) => mod.installHomeFeedDesign?.())
      .catch((error) => console.warn("Feed design enhancement unavailable:", error));

    void import("./features/ui/button-touch-hardener.js?v=20260821-touch-v3")
      .catch((error) => console.warn("Touch enhancement unavailable:", error));

    void import("./features/feed/report-handler.js")
      .catch((error) => console.warn("Report handler unavailable:", error));

    void import("./features/profile/profile-relation-navigation.js")
      .catch((error) => console.warn("Profile relation navigation unavailable:", error));

    void import("./features/profile/profile-id-navigation.js?v=20260815-profile-id-v10")
      .catch((error) => console.warn("Profile ID navigation unavailable:", error));

    void import("./features/auth/auth-controller.js")
      .then((mod) => {
        mod.bindAuthSwitches?.();
        mod.bindLoginForm?.();
        mod.bindSignupForm?.();
      })
      .catch((error) => console.warn("Auth controller unavailable:", error));
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1200 });
  } else {
    window.setTimeout(run, 0);
  }
}

async function renderApp() {
  if (!app || rendering) return;
  rendering = true;
  try {
    await render(app);
    startEnhancements();
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
