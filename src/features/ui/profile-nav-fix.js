const STYLE_ID = 'indo-profile-nav-fix-v1';

function apply() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .profile-direct-nav {
        position: fixed !important;
        left: 50% !important;
        right: auto !important;
        top: auto !important;
        bottom: 0 !important;
        transform: translateX(-50%) !important;
        width: min(520px, 100vw) !important;
        max-width: 520px !important;
        height: 70px !important;
        min-height: 70px !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-around !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        z-index: 2147483000 !important;
        box-sizing: border-box !important;
      }
      .profile-direct-nav button {
        flex: 1 1 20% !important;
        width: 20% !important;
        max-width: 20% !important;
        min-width: 0 !important;
        height: 70px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      @media (max-width: 520px) {
        .profile-direct-nav { width: 100vw !important; }
      }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.profile-direct-nav').forEach((nav) => {
    nav.style.setProperty('position', 'fixed', 'important');
    nav.style.setProperty('left', '50%', 'important');
    nav.style.setProperty('right', 'auto', 'important');
    nav.style.setProperty('top', 'auto', 'important');
    nav.style.setProperty('bottom', '0', 'important');
    nav.style.setProperty('transform', 'translateX(-50%)', 'important');
    nav.style.setProperty('width', 'min(520px, 100vw)', 'important');
    nav.style.setProperty('height', '70px', 'important');
    nav.style.setProperty('visibility', 'visible', 'important');
    nav.style.setProperty('opacity', '1', 'important');
    nav.style.setProperty('z-index', '2147483000', 'important');
  });
}

apply();
if (!globalThis.__indoProfileNavFixBound) {
  globalThis.__indoProfileNavFixBound = true;
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('scroll', apply, { passive: true });
}

export { apply };
