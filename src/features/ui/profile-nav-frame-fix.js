const installed = Symbol.for('indo.profileNavFrameFix');

function apply() {
  if (!document.getElementById('indo-profile-nav-frame-fix')) {
    const style = document.createElement('style');
    style.id = 'indo-profile-nav-frame-fix';
    style.textContent = `
      html body .app-shell .profile-direct-nav {
        position: fixed !important;
        left: 50% !important;
        right: auto !important;
        top: auto !important;
        bottom: 0 !important;
        width: min(520px, 100vw) !important;
        min-width: 0 !important;
        max-width: 520px !important;
        height: 70px !important;
        min-height: 70px !important;
        transform: translateX(-50%) !important;
        margin: 0 !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        z-index: 2147483000 !important;
      }
      html body .app-shell.profile-direct-shell {
        position: relative !important;
        width: 100% !important;
        max-width: 520px !important;
        min-height: 100vh !important;
        margin: 0 auto !important;
        padding-bottom: 78px !important;
      }
    `;
    document.head.appendChild(style);
  }
  document.querySelectorAll('.profile-direct-nav').forEach((nav) => {
    const shell = nav.closest('.app-shell');
    if (shell) shell.classList.add('profile-direct-shell');
    nav.style.setProperty('position', 'fixed', 'important');
    nav.style.setProperty('left', '50%', 'important');
    nav.style.setProperty('right', 'auto', 'important');
    nav.style.setProperty('top', 'auto', 'important');
    nav.style.setProperty('bottom', '0', 'important');
    nav.style.setProperty('width', 'min(520px, 100vw)', 'important');
    nav.style.setProperty('height', '70px', 'important');
    nav.style.setProperty('transform', 'translateX(-50%)', 'important');
    nav.style.setProperty('visibility', 'visible', 'important');
    nav.style.setProperty('opacity', '1', 'important');
    nav.style.setProperty('z-index', '2147483000', 'important');
  });
}

function install() {
  if (globalThis[installed]) return;
  globalThis[installed] = true;
  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('scroll', apply, { passive: true });
}

install();
export { install };
