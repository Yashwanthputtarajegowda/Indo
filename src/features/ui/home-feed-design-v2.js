const STYLE_ID = "indo-home-feed-design-v2";

export function installHomeFeedDesign() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root{
      --indo-pink:#ff39b7;
      --indo-pink-2:#d72cff;
      --indo-purple:#7a48ff;
      --indo-bg:#050507;
      --indo-surface:#09090e;
      --indo-border:rgba(255,57,183,.62);
      --indo-muted:#898995;
    }

    html,body{
      background:var(--indo-bg)!important;
      color:#fff!important;
    }

    .app-shell{
      width:100%!important;
      max-width:520px!important;
      background:#050507!important;
      padding-bottom:74px!important;
    }

    /* Keep existing top branding and stories layout unchanged. */
    .topbar{
      height:42px!important;
      min-height:42px!important;
      padding:0 12px!important;
      background:rgba(5,5,8,.97)!important;
      border-bottom:1px solid rgba(255,57,183,.75)!important;
      box-shadow:0 3px 16px rgba(213,38,204,.12)!important;
      backdrop-filter:blur(14px)!important;
    }

    .brand{
      font-size:14px!important;
      letter-spacing:-.8px!important;
      font-style:italic!important;
      font-weight:900!important;
    }

    .brand span{
      color:var(--indo-pink)!important;
      font-size:8px!important;
      margin-right:2px!important;
    }

    .top-actions{
      gap:9px!important;
      font-size:14px!important;
    }

    .top-actions button{
      width:24px!important;
      height:24px!important;
      display:grid!important;
      place-items:center!important;
      border-radius:50%!important;
      color:#dad5df!important;
    }

    .top-actions .create-button{
      background:linear-gradient(135deg,var(--indo-pink),#a93cff)!important;
      color:#fff!important;
      font-size:16px!important;
      box-shadow:0 0 10px rgba(255,57,183,.3)!important;
    }

    .notification-badge{
      top:-4px!important;
      right:-4px!important;
      min-width:11px!important;
      height:11px!important;
      line-height:11px!important;
      font-size:6px!important;
      border-width:1px!important;
    }

    .stories{
      gap:7px!important;
      padding:7px 7px 8px!important;
      min-height:68px!important;
      background:#050507!important;
      border-bottom:0!important;
    }

    .story{
      height:54px!important;
      min-width:54px!important;
      width:54px!important;
      padding:0!important;
      gap:0!important;
      flex-direction:column!important;
      justify-content:center!important;
    }

    .story span{
      font-size:6px!important;
      line-height:1!important;
      margin-top:3px!important;
      max-width:52px!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    .story-avatar{
      width:34px!important;
      height:34px!important;
      min-width:34px!important;
      border-radius:8px!important;
      border:1px solid rgba(255,255,255,.16)!important;
      box-shadow:0 0 10px rgba(255,57,183,.18)!important;
    }

    .feed{
      padding:8px 7px 14px!important;
    }

    /* OPTION 2 — clean floating-capsule video card only. */
    .video-post.neon-edge-post{
      position:relative!important;
      margin:0 0 14px!important;
      overflow:hidden!important;
      border:1px solid rgba(255,57,183,.58)!important;
      border-radius:15px!important;
      background:linear-gradient(180deg,#0a0910 0%,#06060a 100%)!important;
      box-shadow:
        0 0 0 1px rgba(122,72,255,.10),
        0 10px 28px rgba(0,0,0,.28),
        0 0 22px rgba(255,57,183,.10)!important;
    }

    .video-post.neon-edge-post .neon-edge-head{
      position:relative!important;
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      min-height:48px!important;
      height:48px!important;
      padding:0 9px!important;
      background:rgba(11,10,17,.96)!important;
      border-bottom:1px solid rgba(255,57,183,.16)!important;
    }

    .video-post.neon-edge-post .neon-edge-creator{
      flex:1 1 auto!important;
      min-width:0!important;
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
      color:#fff!important;
      background:transparent!important;
    }

    .video-post.neon-edge-post .neon-edge-avatar{
      width:30px!important;
      height:30px!important;
      min-width:30px!important;
      border-radius:50%!important;
      border:1px solid rgba(255,57,183,.82)!important;
      background:#1b1520!important;
      box-shadow:0 0 10px rgba(255,57,183,.18)!important;
      font-size:10px!important;
      overflow:hidden!important;
    }

    .video-post.neon-edge-post .neon-edge-avatar img{
      width:100%!important;
      height:100%!important;
      object-fit:cover!important;
    }

    .video-post.neon-edge-post .neon-edge-name{
      min-width:0!important;
      font-size:11px!important;
      font-weight:800!important;
      line-height:1!important;
      color:#f7f4fb!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    .video-post.neon-edge-post .neon-edge-follow{
      flex:0 0 auto!important;
      height:28px!important;
      min-width:76px!important;
      padding:0 12px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      border:1px solid rgba(210,92,255,.78)!important;
      border-radius:999px!important;
      background:rgba(89,46,150,.18)!important;
      color:#fff!important;
      font:800 10px/1 system-ui,sans-serif!important;
      letter-spacing:.2px!important;
      box-shadow:inset 0 0 10px rgba(160,92,255,.10),0 0 10px rgba(181,75,255,.12)!important;
      cursor:pointer!important;
    }

    .video-post.neon-edge-post .neon-edge-follow:hover{
      background:rgba(131,70,202,.28)!important;
      border-color:#efb7ff!important;
    }

    .video-post.neon-edge-post .neon-edge-more{
      flex:0 0 auto!important;
      width:30px!important;
      height:30px!important;
      min-width:30px!important;
      margin:0!important;
      display:grid!important;
      place-items:center!important;
      border:1px solid rgba(255,255,255,.10)!important;
      border-radius:50%!important;
      background:#14121a!important;
      color:#f4f1f8!important;
      font-size:15px!important;
    }

    .video-post.neon-edge-post .neon-video-stage{
      position:relative!important;
      overflow:hidden!important;
      aspect-ratio:4/5!important;
      min-height:0!important;
      max-height:none!important;
      background:#000!important;
      border:0!important;
    }

    .video-post.neon-edge-post .neon-video-stage::before{
      content:""!important;
      position:absolute!important;
      inset:0!important;
      z-index:1!important;
      pointer-events:none!important;
      background:
        linear-gradient(180deg,rgba(0,0,0,0) 44%,rgba(0,0,0,.25) 100%),
        radial-gradient(circle at 78% 10%,rgba(255,67,195,.10),transparent 26%),
        radial-gradient(circle at 20% 92%,rgba(98,82,255,.08),transparent 24%)!important;
    }

    .video-post.neon-edge-post .neon-video-stage .post-video{
      position:relative!important;
      z-index:0!important;
      display:block!important;
      width:100%!important;
      height:100%!important;
      min-height:100%!important;
      max-height:none!important;
      aspect-ratio:auto!important;
      background:#000!important;
      object-fit:cover!important;
      object-position:center!important;
      border-radius:0!important;
    }

    .video-post.neon-edge-post .neon-edge-actions{
      position:relative!important;
      z-index:3!important;
      width:calc(100% - 14px)!important;
      margin:7px auto!important;
      min-height:44px!important;
      height:44px!important;
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      background:rgba(13,12,19,.96)!important;
      border:1px solid rgba(255,57,183,.24)!important;
      border-radius:999px!important;
      box-shadow:0 8px 18px rgba(0,0,0,.24)!important;
      overflow:hidden!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button{
      height:44px!important;
      min-width:0!important;
      padding:0!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:4px!important;
      border:0!important;
      border-right:1px solid rgba(255,255,255,.05)!important;
      background:transparent!important;
      color:#d8d5df!important;
      font:700 9px/1 system-ui,sans-serif!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button:last-child{
      border-right:0!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button svg{
      width:15px!important;
      height:15px!important;
      flex:0 0 15px!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button small{
      font-size:8px!important;
      font-weight:800!important;
      color:inherit!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button:hover{
      background:rgba(255,255,255,.035)!important;
      color:#fff!important;
    }

    .video-post.neon-edge-post .neon-edge-actions .like-action.is-active{
      color:var(--indo-pink)!important;
      text-shadow:0 0 8px rgba(255,57,183,.40)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions .save-action.is-active{
      color:#b37aff!important;
      text-shadow:0 0 8px rgba(179,122,255,.30)!important;
    }

    .video-post.neon-edge-post .neon-edge-copy{
      padding:0 10px 10px!important;
      background:#08070c!important;
      border-top:0!important;
    }

    .video-post.neon-edge-post .neon-edge-title-row{
      display:flex!important;
      align-items:center!important;
      gap:8px!important;
    }

    .video-post.neon-edge-post .neon-edge-title{
      margin:0!important;
      min-width:0!important;
      color:#dad7df!important;
      font-size:9px!important;
      line-height:1.35!important;
      font-weight:600!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    .video-post.neon-edge-post .neon-edge-title-more{
      flex:0 0 auto!important;
      font-size:9px!important;
      color:#c477ff!important;
      font-weight:800!important;
    }

    /* Keep existing bottom navigation and its selected/active state intact. */
    .bottom-nav,
    .indo-global-bottom-nav{
      height:50px!important;
      background:rgba(8,8,12,.98)!important;
      border-top:1px solid rgba(255,57,183,.32)!important;
      box-shadow:0 -4px 18px rgba(214,39,193,.08)!important;
    }

    .bottom-nav button,
    .indo-global-bottom-nav button{
      min-width:40px!important;
      font-size:17px!important;
      gap:2px!important;
    }

    .bottom-nav button span,
    .indo-global-bottom-nav button span{
      font-size:6px!important;
    }

    @media (max-width:520px){
      .video-post.neon-edge-post .neon-video-stage{
        aspect-ratio:4/5!important;
      }

      .video-post.neon-edge-post .neon-edge-follow{
        min-width:72px!important;
        padding:0 10px!important;
        font-size:9px!important;
      }
    }

    @media (min-width:700px){
      .feed{padding-left:10px!important;padding-right:10px!important}
      .video-post.neon-edge-post{border-radius:16px!important}
    }
  `;

  document.head.appendChild(style);
}
