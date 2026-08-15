const STYLE_ID = "indo-home-video-option-1";

export function installHomeFeedDesign() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* OPTION 1 — FLOATING GLASS CAPSULE. Only video section is styled. */
    .video-post.neon-edge-post{
      position:relative!important;
      margin:0 0 16px!important;
      overflow:hidden!important;
      border:1px solid rgba(255,255,255,.16)!important;
      border-radius:18px!important;
      background:linear-gradient(180deg,rgba(16,16,22,.96),rgba(5,5,8,.99))!important;
      box-shadow:0 0 0 1px rgba(255,57,183,.08),0 14px 38px rgba(0,0,0,.38),0 0 28px rgba(255,57,183,.08)!important;
    }
    .video-post.neon-edge-post .neon-edge-head{
      position:relative!important;z-index:4!important;display:flex!important;align-items:center!important;gap:8px!important;
      min-height:48px!important;height:48px!important;padding:0 9px!important;
      background:linear-gradient(180deg,rgba(18,18,25,.92),rgba(10,10,15,.90))!important;
      border-bottom:1px solid rgba(255,255,255,.06)!important;
      backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;
    }
    .video-post.neon-edge-post .neon-edge-head::after{
      content:""!important;position:absolute!important;left:9px!important;right:9px!important;bottom:0!important;height:1px!important;
      background:linear-gradient(90deg,transparent,rgba(255,57,183,.42),rgba(125,85,255,.34),transparent)!important;pointer-events:none!important;
    }
    .video-post.neon-edge-post .neon-edge-creator{
      flex:1 1 auto!important;min-width:0!important;display:flex!important;align-items:center!important;gap:8px!important;color:#fff!important;background:transparent!important;
    }
    .video-post.neon-edge-post .neon-edge-avatar{
      width:30px!important;height:30px!important;min-width:30px!important;border-radius:50%!important;
      border:1px solid rgba(255,255,255,.22)!important;background:rgba(255,255,255,.06)!important;
      box-shadow:0 0 0 1px rgba(255,57,183,.16),0 0 12px rgba(255,57,183,.14)!important;font-size:10px!important;overflow:hidden!important;
    }
    .video-post.neon-edge-post .neon-edge-avatar img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
    .video-post.neon-edge-post .neon-edge-name{
      min-width:0!important;color:#f8f6fb!important;font-size:11px!important;font-weight:800!important;line-height:1!important;
      white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
    }
    .video-post.neon-edge-post .neon-edge-follow,.video-post.neon-edge-post .indo-feed-follow{
      flex:0 0 auto!important;height:28px!important;min-width:74px!important;padding:0 11px!important;
      display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;
      border:1px solid rgba(255,255,255,.22)!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;color:#fff!important;
      font:800 10px/1 system-ui,sans-serif!important;letter-spacing:.15px!important;
      box-shadow:inset 0 0 12px rgba(255,255,255,.03),0 0 12px rgba(255,57,183,.10)!important;
      backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;cursor:pointer!important;
    }
    .video-post.neon-edge-post .neon-edge-follow:hover,.video-post.neon-edge-post .indo-feed-follow:hover{
      border-color:rgba(255,177,233,.65)!important;background:rgba(255,57,183,.12)!important;box-shadow:0 0 14px rgba(255,57,183,.20)!important;
    }
    .video-post.neon-edge-post .neon-edge-follow.following,.video-post.neon-edge-post .indo-feed-follow.following{
      background:linear-gradient(135deg,rgba(255,57,183,.25),rgba(125,85,255,.26))!important;border-color:rgba(255,111,210,.76)!important;
      box-shadow:0 0 16px rgba(255,57,183,.18)!important;
    }
    .video-post.neon-edge-post .neon-edge-more{
      flex:0 0 auto!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;display:grid!important;place-items:center!important;
      border:1px solid rgba(255,255,255,.12)!important;border-radius:50%!important;background:rgba(255,255,255,.05)!important;color:#f7f5fb!important;font-size:15px!important;
      backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;
    }
    .video-post.neon-edge-post .neon-video-stage{
      position:relative!important;overflow:hidden!important;aspect-ratio:4/5!important;min-height:0!important;max-height:none!important;background:#000!important;border:0!important;isolation:isolate!important;
    }
    .video-post.neon-edge-post .neon-video-stage::before{
      content:""!important;position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;
      background:linear-gradient(180deg,rgba(0,0,0,.02) 35%,rgba(0,0,0,.20) 100%),radial-gradient(circle at 82% 9%,rgba(255,57,183,.10),transparent 28%),radial-gradient(circle at 14% 92%,rgba(125,85,255,.08),transparent 24%)!important;
    }
    .video-post.neon-edge-post .neon-video-stage .post-video{
      position:relative!important;z-index:0!important;display:block!important;width:100%!important;height:100%!important;min-height:100%!important;max-height:none!important;aspect-ratio:auto!important;
      background:#000!important;object-fit:cover!important;object-position:center!important;border-radius:0!important;
    }
    .video-post.neon-edge-post .neon-edge-actions{
      position:relative!important;z-index:4!important;width:calc(100% - 14px)!important;margin:-2px auto 8px!important;
      min-height:46px!important;height:46px!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;align-items:stretch!important;
      background:rgba(17,17,23,.88)!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;
      box-shadow:0 10px 22px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(255,57,183,.06)!important;
      overflow:hidden!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;
    }
    .video-post.neon-edge-post .neon-edge-actions button{
      height:46px!important;min-width:0!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;
      border:0!important;border-right:1px solid rgba(255,255,255,.06)!important;background:transparent!important;color:#dedbe4!important;font:700 9px/1 system-ui,sans-serif!important;
      transition:background .16s ease,color .16s ease,transform .16s ease!important;
    }
    .video-post.neon-edge-post .neon-edge-actions button:last-child{border-right:0!important}
    .video-post.neon-edge-post .neon-edge-actions button svg{width:16px!important;height:16px!important;flex:0 0 16px!important}
    .video-post.neon-edge-post .neon-edge-actions button small{font-size:8px!important;font-weight:800!important;color:inherit!important}
    .video-post.neon-edge-post .neon-edge-actions button:hover{background:rgba(255,255,255,.045)!important;color:#fff!important}
    .video-post.neon-edge-post .neon-edge-actions button:active{transform:scale(.97)!important}
    .video-post.neon-edge-post .neon-edge-actions .like-action.is-active{color:#ff58bc!important;text-shadow:0 0 10px rgba(255,88,188,.48)!important}
    .video-post.neon-edge-post .neon-edge-actions .save-action.is-active{color:#b98cff!important;text-shadow:0 0 10px rgba(185,140,255,.34)!important}
    .video-post.neon-edge-post .neon-edge-copy{padding:0 10px 10px!important;background:#08080d!important;border-top:0!important}
    .video-post.neon-edge-post .neon-edge-title-row{display:flex!important;align-items:center!important;gap:8px!important}
    .video-post.neon-edge-post .neon-edge-title{
      margin:0!important;min-width:0!important;color:#d6d2db!important;font-size:9px!important;line-height:1.35!important;font-weight:600!important;
      white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
    }
    .video-post.neon-edge-post .neon-edge-title-more{
      flex:0 0 auto!important;padding:2px 0!important;font-size:9px!important;color:#cb81ff!important;font-weight:800!important;background:transparent!important;
    }
    @media (max-width:520px){
      .video-post.neon-edge-post{border-radius:16px!important}
      .video-post.neon-edge-post .neon-video-stage{aspect-ratio:4/5!important}
      .video-post.neon-edge-post .neon-edge-follow,.video-post.neon-edge-post .indo-feed-follow{min-width:70px!important;padding:0 9px!important;font-size:9px!important}
    }
    @media (min-width:700px){.video-post.neon-edge-post{border-radius:18px!important}}
  `;

  document.head.appendChild(style);
}
