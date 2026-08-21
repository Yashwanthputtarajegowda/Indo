import { icons } from "../data.js";

const NAV_STYLE_ID = "indo-bottom-nav-v4";

function installNavStyles() {
  if (document.getElementById(NAV_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = NAV_STYLE_ID;
  style.textContent = `
    .bottom-nav {
      height: 70px !important;
      background: #09090d !important;
      border-top: 1px solid #1b1a21 !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      align-items: center !important;
      overflow: visible !important;
      padding: 0 8px !important;
    }

    .bottom-nav button {
      position: relative !important;
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 92px !important;
      height: 62px !important;
      padding: 7px 5px 6px !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      border-radius: 14px !important;
      color: #7f7f8a !important;
      font-size: 24px !important;
      line-height: 1 !important;
      transform: none !important;
      transition: color 140ms ease, transform 140ms ease, background 140ms ease, border-color 140ms ease !important;
      touch-action: manipulation !important;
    }

    .bottom-nav button span {
      font-size: 9px !important;
      line-height: 1 !important;
    }

    .bottom-nav button.active {
      height: 78px !important;
      margin-top: -16px !important;
      padding-top: 14px !important;
      color: #ff4fc4 !important;
      background: #0d0d12 !important;
      border: 1px solid #2a2630 !important;
      border-bottom-color: #0d0d12 !important;
      border-radius: 18px 18px 0 0 !important;
      box-shadow: none !important;
      z-index: 2 !important;
    }

    .bottom-nav button.active::after {
      content: "";
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 7px;
      height: 2px;
      border-radius: 2px;
      background: #ff4fc4;
      opacity: .9;
    }

    .bottom-nav button.indo-nav-pressed {
      transform: translateY(1px) scale(.98) !important;
    }

    .bottom-nav button:focus-visible {
      outline: 2px solid #ff4fc4 !important;
      outline-offset: 2px !important;
    }

    @media (max-width: 380px) {
      .bottom-nav { padding: 0 4px !important; }
      .bottom-nav button { font-size: 22px !important; }
      .bottom-nav button span { font-size: 8px !important; }
    }
  `;
  document.head.appendChild(style);
}

export function nav(active) {
  installNavStyles();
  const isActive = (screen) => active === screen ? "active" : "";
  return `<nav class="bottom-nav" aria-label="Primary navigation">
    <button type="button" data-screen="home" class="${isActive("home")}" aria-label="Home">${icons.home}<span>Home</span></button>
    <button type="button" data-screen="messages" class="${isActive("messages")}" aria-label="Messages">⌕<span>Message</span></button>
    <button type="button" data-screen="reels" class="${isActive("reels")}" aria-label="Reels">${icons.reel}<span>Reel</span></button>
    <button type="button" data-screen="video" class="${isActive("video")}" aria-label="Video">▣<span>Video</span></button>
    <button type="button" data-screen="profile" data-own-profile="1" class="${isActive("profile")}" aria-label="Profile">${icons.profile}<span>Profile</span></button>
  </nav>`;
}
