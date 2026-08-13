const KEY = Symbol.for('indo.profileVideoActionsLayout');

function styleOnce() {
  if (document.getElementById('indo-profile-video-actions-layout')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-video-actions-layout';
  style.textContent = `
    html body .profile-video-viewer {
      display:grid!important;
      place-items:center!important;
      padding:0!important;
      background:#000!important;
    }
    html body .profile-video-viewer-card {
      width:min(100%,520px)!important;
      height:100vh!important;
      max-height:100vh!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      overflow:hidden!important;
      background:#000!important;
    }
    html body .profile-video-viewer-card video {
      width:100%!important;
      height:calc(100vh - 76px)!important;
      max-height:calc(100vh - 76px)!important;
      flex:0 1 auto!important;
      min-height:0!important;
      object-fit:contain!important;
      background:#000!important;
      display:block!important;
    }
    html body .profile-video-viewer-actions {
      position:static!important;
      width:100%!important;
      height:76px!important;
      min-height:76px!important;
      flex:0 0 76px!important;
      box-sizing:border-box!important;
      padding:8px 14px calc(8px + env(safe-area-inset-bottom))!important;
      display:flex!important;
      align-items:center!important;
      justify-content:space-evenly!important;
      gap:10px!important;
      background:#09090c!important;
      border-top:1px solid #1b1b22!important;
    }
    html body .profile-video-viewer-actions button {
      flex:1 1 0!important;
      min-width:0!important;
      max-width:120px!important;
      height:54px!important;
      border-radius:12px!important;
      background:#121219!important;
      color:#fff!important;
      text-shadow:none!important;
      font-size:24px!important;
      gap:6px!important;
    }
    html body .profile-video-viewer-actions button span {
      font-size:11px!important;
      font-weight:800!important;
    }
    html body .profile-video-viewer-actions button.active {
      background:#21101a!important;
      color:#ff4f8a!important;
    }
  `;
  document.head.appendChild(style);
}

function apply() {
  styleOnce();
  document.querySelectorAll('.profile-video-viewer-card').forEach((card) => {
    const actions = card.querySelector('.profile-video-viewer-actions');
    if (!actions) return;
    actions.setAttribute('aria-label','Video actions');
    const buttons = actions.querySelectorAll('button');
    const labels = ['Like','Share','Save'];
    buttons.forEach((button, index) => {
      const span = button.querySelector('span');
      if (span && labels[index]) span.textContent = labels[index];
    });
  });
}

function install() {
  if (globalThis[KEY]) return;
  globalThis[KEY] = true;
  apply();
  new MutationObserver(apply).observe(document.body, {childList:true, subtree:true});
}

install();
export { install };
