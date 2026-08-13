const installed = Symbol.for('indo.profileNavFrameFix');

function apply() {
  if (!document.getElementById('indo-profile-nav-frame-fix')) {
    const style = document.createElement('style');
    style.id = 'indo-profile-nav-frame-fix';
    style.textContent = `
      html body .app-shell .profile-direct-nav {
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        transform: none !important;
        margin: 0 !important;
      }
      html body .app-shell.profile-direct-shell {
        position: relative !important;
        width: 100% !important;
        max-width: 520px !important;
        min-height: 100vh !important;
        margin: 0 auto !important;
      }
    `;
    document.head.appendChild(style);
  }
  document.querySelectorAll('.profile-direct-nav').forEach((nav) => {
    const shell = nav.closest('.app-shell');
    if (shell) shell.classList.add('profile-direct-shell');
    nav.style.setProperty('position', 'absolute', 'important');
    nav.style.setProperty('left', '0', 'important');
    nav.style.setProperty('right', '0', 'important');
    nav.style.setProperty('bottom', '0', 'important');
    nav.style.setProperty('width', '100%', 'important');
    nav.style.setProperty('transform', 'none', 'important');
  });
}

function install() {
  if (globalThis[installed]) return;
  globalThis[installed] = true;
  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
}

install();
export { install };
