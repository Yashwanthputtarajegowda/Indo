const NAV_STYLE_ID = "indo-bottom-nav-design-v7";

function installNavStyles() {
  if (document.getElementById(NAV_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = NAV_STYLE_ID;
  style.textContent = `
    .indo-persistent-nav-host {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      height: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      isolation: isolate !important;
    }
    .indo-persistent-nav-host .bottom-nav.indo-nav-v7 {
      position: fixed !important;
      left: 50% !important;
      bottom: 0 !important;
      transform: translateX(-50%) !important;
      width: min(520px, 100%) !important;
      height: 74px !important;
      display: grid !important;
      grid-template-columns: repeat(5, 1fr) !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 7px 8px !important;
      background: rgba(8,8,12,.98) !important;
      border-top: 1px solid rgba(255,255,255,.08) !important;
      box-shadow: 0 -10px 28px rgba(0,0,0,.24) !important;
      backdrop-filter: blur(18px) !important;
      -webkit-backdrop-filter: blur(18px) !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      isolation: isolate !important;
    }
    .bottom-nav.indo-nav-v7 button {
      position: relative !important;
      width: 100% !important;
      height: 58px !important;
      min-width: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      padding: 6px 3px !important;
      margin: 0 !important;
      color: #8a8994 !important;
      background: rgba(255,255,255,.018) !important;
      border: 1px solid rgba(255,255,255,.045) !important;
      border-radius: 15px !important;
      line-height: 1 !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
      pointer-events: auto !important;
      user-select: none !important;
    }
    .bottom-nav.indo-nav-v7 button span { font-size:9px !important; font-weight:700 !important; color:currentColor !important; }
    .bottom-nav.indo-nav-v7 button svg { width:23px !important; height:23px !important; fill:none !important; stroke:currentColor !important; stroke-width:1.9 !important; stroke-linecap:round !important; stroke-linejoin:round !important; pointer-events:none !important; }
    .bottom-nav.indo-nav-v7 button.active { color:#ff4fc4 !important; background:linear-gradient(180deg,rgba(255,79,196,.14),rgba(255,79,196,.045)) !important; border-color:rgba(255,79,196,.32) !important; box-shadow:0 0 18px rgba(255,79,196,.10),inset 0 0 0 1px rgba(255,79,196,.06) !important; }
    .bottom-nav.indo-nav-v7 button.indo-nav-pressed { transform:scale(.94) !important; }
    .bottom-nav.indo-nav-v7 button.active::before { content:""; position:absolute; top:0; left:25%; right:25%; height:2px; border-radius:999px; background:#ff4fc4; box-shadow:0 0 12px rgba(255,79,196,.48); }
    @media (max-width:360px) { .bottom-nav.indo-nav-v7 { height:70px !important; padding:6px 5px !important; gap:3px !important; } .bottom-nav.indo-nav-v7 button { height:56px !important; } }
  `;
  document.head.appendChild(style);
}

const icon = (type) => {
  const common = 'class="indo-nav-icon" viewBox="0 0 24 24" aria-hidden="true"';
  switch (type) {
    case "home": return `<svg ${common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>`;
    case "messages": return `<svg ${common}><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>`;
    case "reels": return `<svg ${common}><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m9 4 3 4M15 4l3 4"/><path d="m10 11 5 3-5 3v-6Z"/></svg>`;
    case "video": return `<svg ${common}><rect x="4" y="5" width="16" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>`;
    case "profile": return `<svg ${common}><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.4 3.1-5.2 6.5-5.2s5.8 1.8 6.5 5.2"/></svg>`;
    default: return "";
  }
};

export function nav(active) {
  installNavStyles();
  const isActive = (screen) => active === screen ? "active" : "";
  return `<nav class="bottom-nav indo-nav-v7" aria-label="Primary navigation">
    <button type="button" data-screen="home" class="${isActive("home")}" aria-label="Home">${icon("home")}<span>Home</span></button>
    <button type="button" data-screen="messages" class="${isActive("messages")}" aria-label="Messages">${icon("messages")}<span>Message</span></button>
    <button type="button" data-screen="reels" class="${isActive("reels")}" aria-label="Reels">${icon("reels")}<span>Reel</span></button>
    <button type="button" data-screen="video" class="${isActive("video")}" aria-label="Videos">${icon("video")}<span>Video</span></button>
    <button type="button" data-screen="profile" data-own-profile="1" class="${isActive("profile")}" aria-label="Profile">${icon("profile")}<span>Profile</span></button>
  </nav>`;
}
