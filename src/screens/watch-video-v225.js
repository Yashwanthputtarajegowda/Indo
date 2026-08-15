import { renderWatchVideo as renderBaseWatchVideo } from "./watch-video-v224.js";

const STYLE_ID = "indo-watch-actions-reference-v225";

function installReferenceActionStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-watch-actions{
      margin:0 10px!important;
      display:grid!important;
      grid-template-columns:repeat(5,1fr)!important;
      border:1px solid #24242c!important;
      border-radius:6px!important;
      background:#07070c!important;
      overflow:hidden!important;
    }
    .indo-watch-actions button{
      height:39px!important;
      border:0!important;
      border-right:1px solid #24242c!important;
      background:transparent!important;
      color:#f2eff6!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      gap:2px!important;
      padding:0!important;
      font-size:7px!important;
      line-height:1!important;
      cursor:pointer!important;
    }
    .indo-watch-actions button:last-child{border-right:0!important}
    .indo-watch-actions button:disabled{opacity:.45!important}
    .indo-watch-actions b{
      width:16px!important;
      height:16px!important;
      display:grid!important;
      place-items:center!important;
      font-size:15px!important;
      line-height:1!important;
      font-weight:400!important;
    }
    .indo-watch-actions b svg{
      width:15px!important;
      height:15px!important;
      display:block!important;
      fill:none!important;
      stroke:currentColor!important;
      stroke-width:1.6!important;
      stroke-linecap:round!important;
      stroke-linejoin:round!important;
    }
    .indo-watch-actions span{
      font-size:7px!important;
      line-height:1!important;
      color:#d9d5de!important;
      min-height:7px!important;
    }
    .indo-watch-actions button.active-like{color:#ff4abf!important}
    .indo-watch-actions button.active-save{color:#b071ff!important}
  `;
  document.head.appendChild(style);
}

function setReferenceIcons(actions) {
  const icons = {
    like: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.6-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/></svg>',
    comment:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-4.1-1l-4.2 1.5 1.4-4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/></svg>',
    share:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5 3.8 10.2l6.1 2.2 2.2 6.1L20.5 3.5Z"/><path d="m9.9 12.4 5.2-4.2"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z"/></svg>',
    views:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  };
  actions.querySelectorAll("button[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const icon = button.querySelector("b");
    if (icon && icons[action]) icon.innerHTML = icons[action];
    const value = button.querySelector("span");
    if (!value) return;
    if (action === "share" || action === "save") {
      const numeric = Number(value.textContent.trim());
      value.textContent = Number.isFinite(numeric) ? String(numeric) : "0";
    }
  });
}

export async function renderWatchVideo(app) {
  installReferenceActionStyle();
  await renderBaseWatchVideo(app);
  const actions = app.querySelector(".indo-watch-actions");
  if (actions) setReferenceIcons(actions);
}
