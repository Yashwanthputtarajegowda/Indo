const NAV_STYLE_ID = "indo-bottom-nav-design-v5";

function installNavStyles() {
  if (document.getElementById(NAV_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = NAV_STYLE_ID;
  style.textContent = `
    .bottom-nav.indo-nav-v5 {
      position: fixed !important;
      left: 50% !important;
      bottom: 0 !important;
      transform: translateX(-50%) !important;
      width: min(520px, 100%) !important;
      height: 72px !important;
      display: grid !important;
      grid-template-columns: repeat(5, 1fr) !important;
      align-items: end !important;
      gap: 0 !important;
      padding: 0 8px !important;
      background: rgba(7, 7, 11, 0.97) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.22) !important;
      backdrop-filter: blur(18px) !important;
      -webkit-backdrop-filter: blur(18px) !important;
      z-index: 100 !important;
      isolation: isolate;
    }

    .bottom-nav.indo-nav-v5::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(255,255,255,.018), transparent 55%);
      z-index: -1;
    }

    .bottom-nav.indo-nav-v5 button {
      position: relative !important;
      height: 62px !important;
      min-width: 0 !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 4px !important;
      padding: 0 4px 9px !important;
      margin: 0 !important;
      color: #777783 !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 15px 15px 0 0 !important;
      font-size: 22px !important;
      line-height: 1 !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
      transition: color 140ms ease, transform 140ms ease, background 140ms ease !important;
    }

    .bottom-nav.indo-nav-v5 button span {
      display: block !important;
      font-size: 9px !important;
      line-height: 1 !important;
      font-weight: 650 !important;
      letter-spacing: .05px !important;
      color: currentColor !important;
    }

    .bottom-nav.indo-nav-v5 button svg {
      width: 23px !important;
      height: 23px !important;
      display: block !important;
      flex: 0 0 auto !important;
      fill: none !important;
      stroke: currentColor !important;
      stroke-width: 1.9 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }

    .bottom-nav.indo-nav-v5 button[data-screen="video"] svg {
      width: 24px !important;
      height: 24px !important;
    }

    .bottom-nav.indo-nav-v5 button.active {
      height: 70px !important;
      margin-bottom: -1px !important;
      padding-bottom: 11px !important;
      color: #ff4fc4 !important;
      background: linear-gradient(180deg, rgba(255,79,196,.055), rgba(255,79,196,.015)) !important;
      border: 1px solid rgba(255, 79, 196, .22) !important;
      border-bottom: 0 !important;
      border-radius: 18px 18px 0 0 !important;
      box-shadow: 0 -6px 22px rgba(255, 79, 196, .08) !important;
      transform: translateY(-1px) !important;
      z-index: 2 !important;
    }

    .bottom-nav.indo-nav-v5 button.active::before {
      content: "";
      position: absolute;
      left: 22%;
      right: 22%;
      top: 0;
      height: 2px;
      border-radius: 999px;
      background: #ff4fc4;
      box-shadow: 0 0 12px rgba(255, 79, 196, .45);
    }

    .bottom-nav.indo-nav-v5 button.indo-nav-pressed {
      transform: translateY(1px) scale(.97) !important;
    }

    .bottom-nav.indo-nav-v5 button.active.indo-nav-pressed {
      transform: translateY(0) scale(.97) !important;
    }

    .bottom-nav.indo-nav-v5 button:focus-visible {
      outline: 2px solid #ff4fc4 !important;
      outline-offset: 2px !important;
    }

    @media (max-width: 360px) {
      .bottom-nav.indo-nav-v5 {
        height: 68px !important;
        padding-left: 4px !important;
        padding-right: 4px !important;
      }
      .bottom-nav.indo-nav-v5 button {
        height: 59px !important;
        padding-bottom: 8px !important;
      }
      .bottom-nav.indo-nav-v5 button.active {
        height: 66px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

const icon = (type) => {
  const common = 'class="indo-nav-icon" viewBox="0 0 24 24" aria-hidden="true"';
  switch (type) {
    case "home":
      return `<svg ${common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>`;
    case "messages":
      return `<svg ${common}><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>`;
    case "reels":
      return `<svg ${common}><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m9 4 3 4M15 4l3 4"/><path d="m10 11 5 3-5 3v-6Z"/></svg>`;
    case "video":
      return `<svg ${common}><rect x="4" y="5" width="16" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>`;
    case "profile":
      return `<svg ${common}><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.4 3.1-5.2 6.5-5.2s5.8 1.8 6.5 5.2"/></svg>`;
    default:
      return "";
  }
};

export function nav(active) {
  installNavStyles();

  const isActive = (screen) => active === screen ? "active" : "";

  return `<nav class="bottom-nav indo-nav-v5" aria-label="Primary navigation">
    <button type="button" data-screen="home" class="${isActive("home")}" aria-label="Home">${icon("home")}<span>Home</span></button>
    <button type="button" data-screen="messages" class="${isActive("messages")}" aria-label="Messages">${icon("messages")}<span>Message</span></button>
    <button type="button" data-screen="reels" class="${isActive("reels")}" aria-label="Reels">${icon("reels")}<span>Reel</span></button>
    <button type="button" data-screen="video" class="${isActive("video")}" aria-label="Videos">${icon("video")}<span>Video</span></button>
    <button type="button" data-screen="profile" data-own-profile="1" class="${isActive("profile")}" aria-label="Profile">${icon("profile")}<span>Profile</span></button>
  </nav>`;
}
