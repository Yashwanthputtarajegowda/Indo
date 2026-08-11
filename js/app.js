import { renderFlashPage } from "./pages/flash.js";
import { navigate } from "./router.js";
import { watchAuthState } from "./services/firebase-auth.js";
import { startActivityTracking } from "./services/activity.js";

const app = document.querySelector("#app");

const flashStyles = document.createElement("link");
flashStyles.rel = "stylesheet";
flashStyles.href = "./css/flash.css";
document.head.appendChild(flashStyles);

const activityTracker = startActivityTracking();

window.addEventListener("indo:auth-action", (event) => {
  navigate(app, event.detail.action === "create" ? "create" : "login");
});

window.addEventListener("indo:navigate", (event) => {
  navigate(app, event.detail.page);
});

window.addEventListener("indo:login", () => {
  navigate(app, "home");
});

window.addEventListener("indo:create-account", () => {
  navigate(app, "home");
});

window.addEventListener("indo:profile-updated", () => {
  if (document.querySelector(".profile-page")) {
    navigate(app, "profile");
  }
});

watchAuthState((user) => {
  if (user) {
    activityTracker.start();
  } else {
    activityTracker.stop();
  }
});

renderFlashPage(app);

setTimeout(() => {
  navigate(app, "auth");
}, 1200);
