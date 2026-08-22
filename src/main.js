import { state } from "./state.js";
import { auth, authPersistenceReady } from "./features/auth/firebase-client.js?v=20260822-auth-stable-v3";
import { render } from "./router-v3.js?v=20260822-router-v4";

const app = document.getElementById("root");
let started = false;
let rendering = false;
let navigationId = 0;
let enhancementsStarted = false;

function showBootFailure(message = "Could not start Indo. Please reload the app.") {
  if (!app) return;
  app.innerHTML = `<main class="splash-screen splash-error"><div class="splash-name">Indo</div><p>${String(message).replace(/[&<>\\\"']/g, "")}</p><button type="button" id="indo-retry-boot">Retry</button></main>`;
  document.getElementById("indo-retry-boot")?.addEventListener("click", () => location.reload());
}

function startEnhancements() {
  if (enhancementsStarted) return;
  enhancementsStarted = true;
  const run = () => {
    void import("./features/ui/button-touch-hardener.js?v=20260822-touch-v5").catch(() => {});
    void import("./features/ui/home-feed-design-v2.js?v=20260822-feed-design-v4").then((mod) => mod.installHomeFeedDesign?.()).catch(() => {});
    void import("./features/profile/profile-relation-navigation.js?v=20260822-profile-v3").catch(() => {});
    void import("./features/profile/profile-id-navigation.js?v=20260822-profile-id-v12").catch(() => {});
    void import("./features/auth/auth-controller.js?v=20260822-auth-controller-v3")
      .then((mod) => {
        mod.bindAuthSwitches?.();
        mod.bindLoginForm?.();
        mod.bindSignupForm?.();
      })
      .catch(() => {});
  };
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1500 });
  else window.setTimeout(run, 0);
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

if (!window.__indoStableNavigationBound) {
  window.__indoStableNavigationBound = true;
  document.addEventListener("click", (event) => {
    const element = event.target instanceof Element ? event.target : null;
    const target = element?.closest("[data-screen],[data-watch-video-id]");
    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
    event.preventDefault();
    event.stopPropagation();
    activateNavigation(target);
  }, true);
}

async function start() {
  if (started) return;
  started = true;
  try {
    await authPersistenceReady;
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js?v=20260822");
    onAuthStateChanged(auth, async (user) => {
      state.authenticated = Boolean(user);
      if (user && String(state.screen).startsWith("auth-")) state.screen = "home";
      if (!user && !String(state.screen).startsWith("auth-")) state.screen = "auth-login";
      await renderApp();
    }, (error) => {
      console.error("Firebase auth state error:", error);
      state.authenticated = Boolean(auth.currentUser);
      if (!state.authenticated) state.screen = "auth-login";
      void renderApp();
    });
  } catch (error) {
    console.error("Indo boot failed:", error);
    showBootFailure(error?.message || "Indo could not start.");
  }
}

window.__indoNavigate = navigate;
void start();
