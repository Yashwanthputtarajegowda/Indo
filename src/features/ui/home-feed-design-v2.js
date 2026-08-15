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
      padding:0 7px 14px!important;
    }

    .video-post.neon-edge-post{
      margin:0 0 10px!important;
      border:1px solid var(--indo-border)!important;
      border-radius:7px!important;
      background:#050507!important;
      box-shadow:0 0 0 1px rgba(122,72,255,.08),0 0 11px rgba(255,57,183,.08)!important;
    }

    .video-post.neon-edge-post .neon-edge-head{
      min-height:30px!important;
      height:30px!important;
      padding:0 6px!important;
      background:#09090e!important;
      border-bottom:1px solid rgba(255,57,183,.28)!important;
    }

    .video-post.neon-edge-post .neon-edge-head::before{
      display:none!important;
    }

    .video-post.neon-edge-post .neon-edge-creator{
      gap:5px!important;
    }

    .video-post.neon-edge-post .neon-edge-avatar{
      width:23px!important;
      height:23px!important;
      min-width:23px!important;
      border-radius:50%!important;
      border:1px solid rgba(255,57,183,.75)!important;
      font-size:8px!important;
    }

    .video-post.neon-edge-post .neon-edge-name{
      font-size:8px!important;
      line-height:1!important;
    }

    .video-post.neon-edge-post .neon-edge-more{
      width:23px!important;
      height:23px!important;
      min-width:23px!important;
      background:#111117!important;
      font-size:15px!important;
    }

    .video-post.neon-edge-post .post-video{
      width:100%!important;
      aspect-ratio:9/16!important;
      max-height:none!important;
      background:#000!important;
      object-fit:cover!important;
      border-radius:0!important;
    }

    .video-post.neon-edge-post .neon-edge-actions{
      min-height:30px!important;
      height:30px!important;
      grid-template-columns:repeat(5,1fr)!important;
      background:#07070c!important;
      border-top:1px solid rgba(255,57,183,.18)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button{
      height:30px!important;
      gap:3px!important;
      font-size:7px!important;
      color:#bdbdc7!important;
      border-right:1px solid rgba(255,255,255,.045)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button svg{
      width:12px!important;
      height:12px!important;
      flex-basis:12px!important;
    }

    .video-post.neon-edge-post .neon-edge-actions button small{
      font-size:7px!important;
      font-weight:700!important;
    }

    .video-post.neon-edge-post .neon-edge-actions .like-action.is-active{
      color:var(--indo-pink)!important;
    }

    .video-post.neon-edge-post .neon-edge-actions .save-action.is-active{
      color:#b16cff!important;
    }

    .video-post.neon-edge-post .neon-edge-copy{
      padding:4px 7px 5px!important;
      background:#050507!important;
      border-top:0!important;
    }

    .video-post.neon-edge-post .neon-edge-title{
      font-size:7px!important;
      line-height:1.25!important;
      font-weight:600!important;
      color:#d7d5dc!important;
    }

    .video-post.neon-edge-post .neon-edge-title-more{
      font-size:7px!important;
      color:#bf76ff!important;
    }

    .indo-comments-sheet,
    .indo-post-details-sheet,
    .indo-feed-menu{
      background:#0b0b11!important;
      border-color:rgba(255,57,183,.35)!important;
    }

    .indo-comment-form button{
      background:linear-gradient(135deg,var(--indo-pink),var(--indo-pink-2))!important;
    }

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

    @media (min-width:700px){
      .feed{padding-left:10px!important;padding-right:10px!important}
      .video-post.neon-edge-post{border-radius:8px!important}
    }
  `;

  document.head.appendChild(style);
}
