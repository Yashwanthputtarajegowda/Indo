const STYLE_ID = "indo-brand-topbar-v1";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-brand-topbar{position:sticky;top:0;z-index:20;width:100%;height:58px;min-height:58px;box-sizing:border-box;padding:0 12px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(115deg,#09080e 0%,#100a17 55%,#07070c 100%);border-bottom:1px solid rgba(143,66,255,.18);box-shadow:0 7px 22px rgba(0,0,0,.32);backdrop-filter:blur(14px);overflow:hidden}
    .indo-brand-topbar:before{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,#8f36ff 38%,#ff2eaa 62%,transparent);opacity:.72;pointer-events:none}
    .indo-brand-home{min-width:0;height:100%;display:flex;align-items:center;gap:8px;padding:0;border:0;background:transparent;color:#fff;cursor:pointer;text-align:left}
    .indo-brand-mark{width:29px;height:31px;display:grid;place-items:center;flex:0 0 29px;color:#ff3cac;filter:drop-shadow(0 0 7px rgba(255,47,173,.28));transform:rotate(-4deg)}
    .indo-brand-mark svg{width:28px;height:30px;display:block}
    .indo-brand-word{display:block;color:#f8f7fb;font-family:Impact,"Arial Black",Arial,sans-serif;font-size:23px;font-weight:950;font-style:italic;line-height:.95;letter-spacing:-1px;transform:skew(-6deg)}
    .indo-brand-right{display:flex;align-items:center;gap:8px;flex:0 0 auto}
    .indo-brand-right button{width:31px;height:31px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#f0edf7;font-size:20px;cursor:pointer}
    .indo-brand-right button:hover{color:#ff56c2;background:rgba(255,55,190,.07)}
    @media(max-width:380px){.indo-brand-topbar{height:55px;min-height:55px;padding-left:11px;padding-right:9px}.indo-brand-mark{width:27px;height:29px;flex-basis:27px}.indo-brand-mark svg{width:26px;height:28px}.indo-brand-word{font-size:21px}.indo-brand-right button{width:29px;height:29px}}
  `;
  document.head.appendChild(style);
}

export function renderIndoBrandTopbar({
  rightHtml = "",
  rightLabel = "",
} = {}) {
  installStyles();
  return `<header class="indo-brand-topbar"><button class="indo-brand-home" type="button" data-screen="home" aria-label="Indo Home"><span class="indo-brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M19.7 2 7.3 17.1h7.2L11.8 30 25 13.2h-7.1L19.7 2Z" fill="currentColor"/></svg></span><span class="indo-brand-word">INDO</span></button><div class="indo-brand-right" aria-label="${rightLabel}">${rightHtml}</div></header>`;
}
