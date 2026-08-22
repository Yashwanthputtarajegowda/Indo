import { auth } from "../auth/firebase-client.js";

const STYLE_ID = "indo-home-feed-design-v4";
const OWNER_FOLLOW_KEY = Symbol.for("indo.homeOwnerFollowVisibility.v4");

function removeOwnAccountFollowButtons(root = document) {
  const currentUid = String(auth.currentUser?.uid || "").trim();
  if (!currentUid) return;
  root.querySelectorAll?.(".video-post[data-owner-uid]").forEach((card) => {
    const ownerUid = String(card.dataset.ownerUid || "").trim();
    if (!ownerUid || ownerUid !== currentUid) return;
    card.querySelectorAll(
      ".neon-edge-follow, .indo-feed-follow, [data-post-follow], [data-follow-target]",
    ).forEach((button) => button.remove());
  });
}

function installOwnFollowVisibility() {
  if (globalThis[OWNER_FOLLOW_KEY]) return;
  globalThis[OWNER_FOLLOW_KEY] = true;
  const run = () => removeOwnAccountFollowButtons(document);
  run();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) removeOwnAccountFollowButtons(node);
      }
    }
    run();
  });
  observer.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
  const authReadyInterval = window.setInterval(() => {
    if (auth.currentUser) {
      run();
      window.clearInterval(authReadyInterval);
    }
  }, 250);
  window.setTimeout(() => window.clearInterval(authReadyInterval), 10000);
}

export function installHomeFeedDesign() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root{--indo-glass-bg:rgba(11,11,16,.96);--indo-glass-line:rgba(255,255,255,.16);--indo-pink:#ff4fbf;--indo-purple:#a778ff}

      #root .app-shell .feed .video-post.neon-edge-post{position:relative!important;width:100%!important;margin:0 0 18px!important;overflow:hidden!important;border:1px solid var(--indo-glass-line)!important;border-radius:18px!important;background:#07070b!important;box-shadow:0 0 0 1px rgba(255,255,255,.035),0 16px 42px rgba(0,0,0,.42)!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-head{position:relative!important;z-index:5!important;display:flex!important;align-items:center!important;gap:8px!important;min-height:50px!important;height:50px!important;padding:0 10px!important;background:rgba(9,9,13,.97)!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:none!important;backdrop-filter:blur(14px)!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-head::before{display:none!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-creator{flex:1 1 auto!important;min-width:0!important;display:flex!important;align-items:center!important;gap:8px!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;color:#f6f6f8!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-avatar{width:30px!important;height:30px!important;min-width:30px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.24)!important;background:#18181f!important;box-shadow:0 0 12px rgba(255,255,255,.06)!important;overflow:hidden!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-avatar img{width:100%!important;height:100%!important;object-fit:cover!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-name{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#f6f6f8!important;font-size:11px!important;font-weight:800!important;line-height:1!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-follow{display:none!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-more{flex:0 0 auto!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;display:grid!important;place-items:center!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:50%!important;background:#141419!important;color:#f4f4f7!important;font-size:15px!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-video-stage{position:relative!important;overflow:hidden!important;width:100%!important;aspect-ratio:4/5!important;min-height:0!important;max-height:none!important;background:#000!important;border:0!important;isolation:isolate!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-video-stage .post-video{position:relative!important;z-index:0!important;display:block!important;width:100%!important;height:100%!important;min-height:100%!important;max-height:none!important;margin:0!important;border:0!important;border-radius:0!important;object-fit:cover!important;object-position:center!important;background:#000!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions{position:relative!important;z-index:6!important;width:calc(100% - 18px)!important;height:44px!important;min-height:44px!important;margin:-1px auto 8px!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;align-items:stretch!important;padding:0!important;background:var(--indo-glass-bg)!important;border:1px solid var(--indo-glass-line)!important;border-radius:999px!important;box-shadow:0 8px 22px rgba(0,0,0,.36)!important;overflow:hidden!important;backdrop-filter:blur(16px)!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions button{width:100%!important;min-width:0!important;height:44px!important;min-height:44px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;border:0!important;border-right:1px solid rgba(255,255,255,.06)!important;background:transparent!important;color:#e5e5e9!important;font:700 9px/1 system-ui,sans-serif!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions button:last-child{border-right:0!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions button svg{width:15px!important;height:15px!important;min-width:15px!important;flex:0 0 15px!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions button small{margin:0!important;padding:0!important;font-size:8px!important;font-weight:800!important;color:inherit!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions .like-action.is-active{color:var(--indo-pink)!important;text-shadow:0 0 8px rgba(255,79,191,.3)!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-actions .save-action.is-active{color:var(--indo-purple)!important;text-shadow:0 0 8px rgba(167,120,255,.24)!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-copy{width:100%!important;min-width:0!important;box-sizing:border-box!important;padding:0 10px 10px!important;background:#07070b!important;border:0!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-title-row{display:flex!important;align-items:center!important;gap:8px!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-title{min-width:0!important;margin:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#d9d9de!important;font-size:9px!important;line-height:1.35!important;font-weight:600!important}
      #root .app-shell .feed .video-post.neon-edge-post .neon-edge-title-more{flex:0 0 auto!important;color:#b8b8bf!important;font-size:9px!important;font-weight:800!important}

      /* Restore the polished owner menu instead of browser-default buttons. */
      #root .app-shell .feed .video-post .indo-safe-menu{position:absolute!important;right:8px!important;top:44px!important;z-index:9999!important;min-width:188px!important;padding:6px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:12px!important;background:#15151d!important;box-shadow:0 16px 42px rgba(0,0,0,.65)!important;backdrop-filter:blur(12px)!important}
      #root .app-shell .feed .video-post .indo-safe-menu button{display:block!important;width:100%!important;min-height:40px!important;margin:0!important;padding:10px 12px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#f5f5f7!important;text-align:left!important;font:700 13px/1.2 system-ui,sans-serif!important;cursor:pointer!important;touch-action:manipulation!important;box-sizing:border-box!important}
      #root .app-shell .feed .video-post .indo-safe-menu button:hover{background:#24242d!important}
      #root .app-shell .feed .video-post .indo-safe-menu button[data-safe-delete]{color:#ff6b75!important}
      #root .app-shell .feed .video-post .indo-safe-menu button[data-safe-share]{color:#f5f5f7!important}
      #root .app-shell .feed .video-post .indo-safe-menu button[data-safe-cancel]{color:#aeb0bb!important}
      #root .app-shell .feed .video-post .indo-safe-menu button:disabled{opacity:.6!important;cursor:wait!important}

      @media(max-width:520px){#root .app-shell .feed .video-post.neon-edge-post .neon-video-stage{aspect-ratio:4/5!important}}
    `;
    document.head.appendChild(style);
  }
  installOwnFollowVisibility();
}
