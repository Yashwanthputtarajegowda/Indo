import { renderFlashPage } from "./pages/flash.js";
import { watchAuthState } from "./services/firebase-auth.js";
import { startActivityTracking } from "./services/activity.js";

const app = document.querySelector("#app");

const flashStyles = document.createElement("link");

flashStyles.rel = "stylesheet";
flashStyles.href = "./css/flash.css";

document.head.appendChild(flashStyles);

const activityTracker = startActivityTracking();

watchAuthState((user) => {
  if (user) {
    activityTracker.start();
    return;
  }

  activityTracker.stop();
});

renderFlashPage(app);
