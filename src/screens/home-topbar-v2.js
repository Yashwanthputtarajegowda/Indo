export function renderHomeTopbar() {
  return `
    <header class="topbar indo-option6-topbar">
      <button class="indo-option6-brand" type="button" data-screen="home" aria-label="Indo Home" title="Home">
        <span class="indo-option6-mark" aria-hidden="true">T</span>
        <span class="indo-option6-wordmark">Indo</span>
      </button>

      <div class="top-actions indo-option6-actions" aria-label="Home actions">
        <button class="create-button top-action-button" data-screen="create" aria-label="Create" title="Create">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="search-button top-action-button" data-screen="search" aria-label="Search" title="Search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="notification-button top-action-button" data-screen="notifications" aria-label="Notifications" title="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2zM10 19h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>`;
}

export function installHomeTopbarStyles() {
  const id = 'indo-home-topbar-v2';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .indo-option6-topbar{
      position:sticky;
      top:0;
      z-index:20;
      height:64px;
      padding:0 16px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      background:
        radial-gradient(circle at 18% 0%,rgba(255,55,190,.13),transparent 32%),
        linear-gradient(135deg,rgba(18,15,34,.97),rgba(7,7,12,.97));
      border-bottom:1px solid rgba(170,91,255,.22);
      box-shadow:0 8px 26px rgba(0,0,0,.18);
      backdrop-filter:blur(16px);
    }

    .indo-option6-topbar::after{
      content:'';
      position:absolute;
      left:16px;
      right:16px;
      bottom:-1px;
      height:1px;
      background:linear-gradient(90deg,transparent,#ff3bbf 30%,#7c4dff 70%,transparent);
      opacity:.65;
      pointer-events:none;
    }

    .indo-option6-brand{
      min-width:0;
      display:flex;
      align-items:center;
      gap:9px;
      padding:0;
      border:0;
      background:transparent;
      color:#fff;
      cursor:pointer;
      text-align:left;
    }

    .indo-option6-mark{
      width:31px;
      height:31px;
      display:grid;
      place-items:center;
      flex:0 0 31px;
      border-radius:9px;
      color:#fff;
      font-size:20px;
      font-weight:950;
      line-height:1;
      font-family:Arial,sans-serif;
      background:linear-gradient(145deg,#ff2fbe 5%,#b341ff 48%,#ff9b2f 100%);
      box-shadow:
        0 0 14px rgba(235,56,218,.28),
        inset 0 1px 0 rgba(255,255,255,.28);
      transform:skew(-5deg);
    }

    .indo-option6-wordmark{
      font-size:25px;
      line-height:1;
      font-weight:900;
      letter-spacing:-1.4px;
      color:#f8f7fb;
      text-shadow:0 0 14px rgba(167,104,255,.12);
    }

    .indo-option6-actions{
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap:8px;
      padding-left:8px;
    }

    .indo-option6-actions .top-action-button{
      width:36px;
      height:36px;
      min-width:36px;
      display:grid;
      place-items:center;
      padding:0;
      border:1px solid rgba(255,255,255,.08);
      border-radius:11px;
      background:rgba(255,255,255,.035);
      color:#d9d7e4;
      transition:transform .16s ease,background .16s ease,border-color .16s ease,color .16s ease;
    }

    .indo-option6-actions .top-action-button:hover{
      transform:translateY(-1px);
      background:rgba(255,59,193,.09);
      border-color:rgba(255,59,193,.28);
      color:#fff;
    }

    .indo-option6-actions .top-action-button:active{
      transform:scale(.96);
    }

    .indo-option6-actions .top-action-button svg{
      width:19px;
      height:19px;
      display:block;
      overflow:visible;
    }

    .indo-option6-actions .create-button svg,
    .indo-option6-actions .notification-button svg{
      width:20px;
      height:20px;
    }

    @media (max-width:380px){
      .indo-option6-topbar{padding:0 12px}
      .indo-option6-mark{width:29px;height:29px;flex-basis:29px;font-size:18px}
      .indo-option6-wordmark{font-size:23px}
      .indo-option6-actions{gap:5px}
      .indo-option6-actions .top-action-button{width:33px;height:33px;min-width:33px}
    }
  `;
  document.head.appendChild(style);
}
