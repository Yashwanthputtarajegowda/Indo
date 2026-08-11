import { renderFlashPage } from "./pages/flash.js";
import { navigate } from "./router.js";
import { watchAuthState } from "./services/firebase-auth.js";
import { startActivityTracking } from "./services/activity.js";
import { getMyProfile } from "./services/profile-api.js";
import { profileFromBackend, clearProfile } from "./services/profile-state.js";

const app = document.querySelector("#app");

const flashStyles = document.createElement("link");
flashStyles.rel = "stylesheet";
flashStyles.href = "./css/flash.css";
document.head.appendChild(flashStyles);

const activityTracker = startActivityTracking();
let authTransition = false;

async function hydrateProfile(user) {
  if (!user) return;
  try {
    const profile = await getMyProfile();
    profileFromBackend(profile);
  } catch (error) {
    console.warn("Indo profile hydration skipped:", error.message);
  }
}

window.addEventListener("indo:auth-action", (event) => {
  navigate(app, event.detail.action === "create" ? "create" : "login");
});

window.addEventListener("indo:navigate", (event) => {
  navigate(app, event.detail.page, event.detail.data || {});
});

window.addEventListener("indo:login", () => {
  navigate(app, "home");
});

window.addEventListener("indo:create-account", () => {
  navigate(app, "home");
});

window.addEventListener("indo:video-open", (event) => {
  navigate(app, "video-player", { video: event.detail || {} });
});

window.addEventListener("indo:message-open", (event) => {
  navigate(app, "chat", { thread: event.detail || {} });
});

window.addEventListener("indo:new-message", () => {
  navigate(app, "new-message");
});

window.addEventListener("indo:profile-open", (event) => {
  navigate(app, "public-profile", { profile: { userId: event.detail?.userId } });
});

window.addEventListener("indo:profile-updated", () => {
  if (document.querySelector(".profile-page")) navigate(app, "profile");
});

window.addEventListener("indo:account-deleted", () => {
  authTransition = true;
  clearProfile();
  renderFlashPage(app);
  setTimeout(() => {
    authTransition = false;
    navigate(app, "auth");
  }, 900);
});

watchAuthState(async (user) => {
  if (user) {
    activityTracker.start();
    await hydrateProfile(user);
  } else {
    activityTracker.stop();
    if (!authTransition) navigate(app, "auth");
  }
});

renderFlashPage(app);

setTimeout(() => {
  if (!authTransition) navigate(app, "auth");
}, 1200);
