import { renderAuthChoicePage } from "./pages/auth-choice.js";
import { renderCreateAccountPage } from "./pages/create-account.js";
import { renderHomePage } from "./pages/home.js";
import { renderLoginPage } from "./pages/login.js";
import { renderReelsPage } from "./pages/reels.js";
import { renderProfilePage } from "./pages/profile.js";
import { getProfile } from "./services/profile-state.js";

const styles = new Set();

function loadStyle(path) {
  if (styles.has(path)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  document.head.appendChild(link);
  styles.add(path);
}

export function navigate(container, page) {
  switch (page) {
    case "auth":
      loadStyle("./css/auth-choice.css");
      renderAuthChoicePage(container);
      return;

    case "login":
      loadStyle("./css/login.css");
      renderLoginPage(container);
      return;

    case "create":
      loadStyle("./css/create-account.css");
      renderCreateAccountPage(container);
      return;

    case "reels":
      loadStyle("./css/reels.css");
      renderReelsPage(container);
      return;

    case "profile":
      loadStyle("./css/profile.css");
      renderProfilePage(container, getProfile());
      return;

    case "home":
    default:
      loadStyle("./css/home.css");
      renderHomePage(container);
  }
}
