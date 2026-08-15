import { auth } from "../auth/firebase-client.js";

const STYLE_ID = "indo-home-feed-design-v2";
const OWNER_FOLLOW_KEY = Symbol.for("indo.homeOwnerFollowVisibility");

function removeOwnAccountFollowButtons(root = document) {
  const currentUid = String(auth.currentUser?.uid || "").trim();
  if (!currentUid) return;

  root
    .querySelectorAll?.(".video-post[data-owner-uid]")
    .forEach((card) => {
      const ownerUid = String(card.dataset.ownerUid || "").trim();
      if (!ownerUid || ownerUid !== currentUid) return;

      card.querySelectorAll(
        ".neon-edge-follow, .indo-feed-follow, [data-post-follow]",
      ).forEach((button) => button.remove());
    });
}

function installOwnFollowVisibility() {
  if (globalThis[OWNER_FOLLOW_KEY]) return;
  globalThis[OWNER_FOLLOW_KEY] = true;

  removeOwnAccountFollowButtons(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        removeOwnAccountFollowButtons(node);
      }
    }
  });

  observer.observe(document.getElementById("root") || document.body, {
    childList: true,
    subtree: true,
  });
}

export function installHomeFeedDesign() {
  if (!document.getElementById(STYLE_ID)) {
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

      .brand{font-size:14px!important;letter-spacing:-.8px!important;font-style:italic!important;font-weight:900!important}
      .brand span{color:var(--indo-pink)!important;font-size:8px!important;margin-right:2px!important}
      .top-actions{gap:9px!important;font-size:14px!important}
      .top-actions button{width:24px!important;height:24px!important;display:grid!important;place-items:center!important;border-radius:50%!important;color:#dad5df!important}
      .top-actions .create-button{background:linear-gradient(135deg,var(--indo-pink),#a93cff)!important;color:#fff!important;font-size:16px!important;box-shadow:0 0 10px rgba(255,57,183,.3)!important}
      .notification-badge{top:-4px!important;right:-4px!important;min-width:11px!important;height:11px!important;line-height:11px!important;font-size:6px!important;border-width:1px!important}

      .stories{gap:7px!important;padding:7px 7px 8px!important;min-height:68px!important;background:#050507!important;border-bottom:0!important}
      .story{height:54px!important;min-width:54px!important;width:54px!important;padding:0!important;gap:0!important;flex-direction:column!important;justify-content:center!important}
      .story span{font-size:6px!important;line-height:1!important;margin-top:3px!important;max-width:52px!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .story-avatar{width:34px!important;height:34px!important;min-width:34px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 0 10px rgba(255,57,183,.18)!important}

      .feed{padding:8px 7px 14px!important}

      /* Option 1 — Floating Glass Capsule video section only. */
      .video-post.neon-edge-post{
        position:relative!important;
        margin:0 0 14px!important;
        overflow:hidden!important;
        border:1px solid rgba(255,255,255,.14)!important;
        border-radius:16px!important;
        background:linear-gradient(180deg,#09090e 0%,#050507 100%)!important;
        box-shadow:0 0 0 1px rgba(255,255,255,.035),0 12px 30px rgba(0,0,0,.34)!important;
      }

      .video-post.neon-edge-post .neon-edge-head{
        position:relative!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        min-height:48px!important;
        height:48px!important;
        padding:0 9px!important;
        background:rgba(12,12,18,.96)!important;
        border-bottom:1px solid rgba(255,255,255,.08)!important;
      }

      .video-post.neon-edge-post .neon-edge-creator{flex:1 1 auto!important;min-width:0!important;display:flex!important;align-items:center!important;gap:8px!important;color:#fff!important;background:transparent!important}
      .video-post.neon-edge-post .neon-edge-avatar{width:30px!important;height:30px!important;min-width:30px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.28)!important;background:#1a1a21!important;box-shadow:0 0 10px rgba(255,255,255,.08)!important;font-size:10px!important;overflow:hidden!important}
      .video-post.neon-edge-post .neon-edge-avatar img{width:100%!important;height:100%!important;object-fit:cover!important}
      .video-post.neon-edge-post .neon-edge-name{min-width:0!important;font-size:11px!important;font-weight:800!important;line-height:1!important;color:#f7f7fa!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}

      .video-post.neon-edge-post .neon-edge-follow{
        flex:0 0 auto!important;
        height:28px!important;
        min-width:76px!important;
        padding:0 12px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid rgba(255,255,255,.22)!important;
        border-radius:999px!important;
        background:rgba(255,255,255,.07)!important;
        color:#fff!important;
        font:800 10px/1 system-ui,sans-serif!important;
        cursor:pointer!important;
        white-space:nowrap!important;
      }

      .video-post.neon-edge-post .neon-edge-follow:hover{background:rgba(255,255,255,.12)!important;border-color:rgba(255,255,255,.42)!important}
      .video-post.neon-edge-post .neon-edge-more{flex:0 0 auto!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;display:grid!important;place-items:center!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:50%!important;background:#141419!important;color:#f4f4f7!important;font-size:15px!important}

      .video-post.neon-edge-post .neon-video-stage{position:relative!important;overflow:hidden!important;aspect-ratio:4/5!important;min-height:0!important;max-height:none!important;background:#000!important;border:0!important}
      .video-post.neon-edge-post .neon-video-stage::before{content:""!important;position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.28) 100%)!important}
      .video-post.neon-edge-post .neon-video-stage .post-video{position:relative!important;z-index:0!important;display:block!important;width:100%!important;height:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important;background:#000!important;border-radius:0!important}

      .video-post.neon-edge-post .neon-edge-actions{
        position:relative!important;
        z-index:3!important;
        width:calc(100% - 14px)!important;
        margin:7px auto!important;
        min-height:44px!important;
        height:44px!important;
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        background:rgba(16,16,22,.96)!important;
        border:1px solid rgba(255,255,255,.12)!important;
        border-radius:999px!important;
        box-shadow:0 8px 18px rgba(0,0,0,.24)!important;
        overflow:hidden!important;
      }

      .video-post.neon-edge-post .neon-edge-actions button{height:44px!important;min-width:0!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;border:0!important;border-right:1px solid rgba(255,255,255,.06)!important;background:transparent!important;color:#e3e3e7!important;font:700 9px/1 system-ui,sans-serif!important}
      .video-post.neon-edge-post .neon-edge-actions button:last-child{border-right:0!important}
      .video-post.neon-edge-post .neon-edge-actions button svg{width:15px!important;height:15px!important;flex:0 0 15px!important}
      .video-post.neon-edge-post .neon-edge-actions button small{font-size:8px!important;font-weight:800!important;color:inherit!important}
      .video-post.neon-edge-post .neon-edge-actions button:hover{background:rgba(255,255,255,.035)!important;color:#fff!important}
      .video-post.neon-edge-post .neon-edge-actions .like-action.is-active{color:#ff4fbf!important;text-shadow:0 0 8px rgba(255,79,191,.38)!important}
      .video-post.neon-edge-post .neon-edge-actions .save-action.is-active{color:#b37aff!important;text-shadow:0 0 8px rgba(179,122,255,.28)!important}

      .video-post.neon-edge-post .neon-edge-copy{padding:0 10px 10px!important;background:#08080d!important;border-top:0!important}
      .video-post.neon-edge-post .neon-edge-title-row{display:flex!important;align-items:center!important;gap:8px!important}
      .video-post.neon-edge-post .neon-edge-title{margin:0!important;min-width:0!important;color:#d9d9de!important;font-size:9px!important;line-height:1.35!important;font-weight:600!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .video-post.neon-edge-post .neon-edge-title-more{flex:0 0 auto!important;font-size:9px!important;color:#b7b7bd!important;font-weight:800!important}

      /* Existing bottom navigation and its selected state stay intact. */
      .bottom-nav,.indo-global-bottom-nav{height:50px!important;background:rgba(8,8,12,.98)!important;border-top:1px solid rgba(255,255,255,.10)!important;box-shadow:0 -4px 18px rgba(0,0,0,.18)!important}
      .bottom-nav button,.indo-global-bottom-nav button{min-width:40px!important;font-size:17px!important;gap:2px!important}
      .bottom-nav button span,.indo-global-bottom-nav button span{font-size:6px!important}

      @media (max-width:520px){
        .video-post.neon-edge-post .neon-edge-follow{min-width:72px!important;padding:0 10px!important;font-size:9px!important}
      }

      @media (min-width:700px){
        .feed{padding-left:10px!important;padding-right:10px!important}
      }
    `;

    document.head.appendChild(style);
  }

  installOwnFollowVisibility();
}
