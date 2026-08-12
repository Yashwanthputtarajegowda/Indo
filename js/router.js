import { renderAuthChoicePage } from "./pages/auth-choice.js";
import { renderCreateAccountPage } from "./pages/create-account.js";
import { renderHomePage } from "./pages/home.js";
import { renderLoginPage } from "./pages/login.js";
import { renderReelsPage } from "./pages/reels.js";
import { renderProfilePage } from "./pages/profile.js";
import { renderPublicProfilePage } from "./pages/public-profile.js";
import { renderUploadVideoPage } from "./pages/upload-video.js";
import { renderUploadReelPage } from "./pages/upload-reel.js";
import { renderNotificationsPage } from "./pages/notifications.js";
import { renderSavedPage } from "./pages/saved.js";
import { renderVideoPlayerPage } from "./pages/video-player.js";
import { renderMessagesPage } from "./pages/messages.js";
import { renderChatPage } from "./pages/chat.js";
import { renderNewMessagePage } from "./pages/new-message.js";
import { getProfile } from "./services/profile-state.js";

const styles = new Set();
function loadStyle(path) {
  if (styles.has(path)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  const theme = document.querySelector('link[data-indo-theme]');
  if (theme && path !== "./css/theme.css") document.head.insertBefore(link, theme);
  else document.head.appendChild(link);
  styles.add(path);
}

export function navigate(container, page, data = {}) {
  if (!document.querySelector('link[data-indo-theme]')) {
    const theme = document.createElement("link");
    theme.rel = "stylesheet";
    theme.href = "./css/theme.css";
    theme.dataset.indoTheme = "true";
    document.head.appendChild(theme);
    styles.add("./css/theme.css");
  }

  switch (page) {
    case "auth": loadStyle("./css/auth-choice.css"); renderAuthChoicePage(container); return;
    case "login": loadStyle("./css/login.css"); renderLoginPage(container); return;
    case "create": loadStyle("./css/create-account.css"); renderCreateAccountPage(container); return;
    case "reels": loadStyle("./css/reels.css"); renderReelsPage(container); return;
    case "profile": loadStyle("./css/profile.css"); renderProfilePage(container, getProfile()); return;
    case "public-profile": loadStyle("./css/public-profile.css"); renderPublicProfilePage(container, data.profile || {}); return;
    case "upload-video": loadStyle("./css/upload-video.css"); renderUploadVideoPage(container); return;
    case "upload-reel": loadStyle("./css/upload-reel.css"); renderUploadReelPage(container); return;
    case "notifications": loadStyle("./css/notifications.css"); renderNotificationsPage(container); return;
    case "saved": loadStyle("./css/saved.css"); renderSavedPage(container); return;
    case "messages":
    case "message": loadStyle("./css/messages.css"); renderMessagesPage(container); return;
    case "new-message": loadStyle("./css/new-message.css"); renderNewMessagePage(container); return;
    case "chat": loadStyle("./css/chat.css"); renderChatPage(container, data.thread || {}); return;
    case "video-player": loadStyle("./css/video-player.css"); renderVideoPlayerPage(container, data.video || {}); return;
    case "home":
    default: loadStyle("./css/home.css"); renderHomePage(container);
  }
}
