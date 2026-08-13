// Indo production runtime configuration.
// Public Railway backend URL for production.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

// Stable Story editor layout/interaction fix.
(function () {
  if (window.__indoStoryLayoutFixV3) return;
  window.__indoStoryLayoutFixV3 = true;

  const apply = function () {
    const preview = document.getElementById('story-preview');
    const publish = document.getElementById('story-publish-button');
    const add = document.getElementById('story-add-button');
    if (!preview || !publish || !add) return false;

    // Keep the action controls inside the video preview itself.
    if (publish.parentElement !== preview) preview.appendChild(publish);

    preview.style.position = 'relative';
    publish.textContent = 'Done';
    publish.style.setProperty('position', 'absolute', 'important');
    publish.style.setProperty('right', '0', 'important');
    publish.style.setProperty('left', 'auto', 'important');
    publish.style.setProperty('bottom', '12px', 'important');
    publish.style.setProperty('width', '20%', 'important');
    publish.style.setProperty('height', '44px', 'important');
    publish.style.setProperty('margin', '0', 'important');
    publish.style.setProperty('z-index', '100', 'important');
    publish.style.setProperty('border-radius', '10px', 'important');
    publish.style.setProperty('background', '#7b3cff', 'important');
    publish.style.setProperty('color', '#fff', 'important');
    publish.style.setProperty('font-weight', '800', 'important');
    publish.style.setProperty('cursor', 'pointer', 'important');
    publish.style.setProperty('pointer-events', 'auto', 'important');

    // + stays directly above Done.
    add.style.setProperty('position', 'absolute', 'important');
    add.style.setProperty('right', '14px', 'important');
    add.style.setProperty('bottom', '68px', 'important');
    add.style.setProperty('z-index', '101', 'important');
    add.style.setProperty('pointer-events', 'auto', 'important');

    // Never let Done act like a video/title click.
    if (publish.dataset.indoDoneGuard !== '1') {
      publish.dataset.indoDoneGuard = '1';
      ['pointerdown', 'pointerup'].forEach(function (name) {
        publish.addEventListener(name, function (event) {
          event.stopPropagation();
        }, true);
      });
    }
    return true;
  };

  // Hard-route a real Done click to the story editor's own click listener.
  // This avoids other document-level gesture handlers swallowing the action.
  document.addEventListener('click', function (event) {
    const target = event.target instanceof Element ? event.target.closest('#story-publish-button') : null;
    if (!target) return;
    if (target.dataset.indoSyntheticClick === '1') {
      target.dataset.indoSyntheticClick = '0';
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    target.dataset.indoSyntheticClick = '1';
    target.click();
  }, true);

  const start = function () {
    let attempts = 0;
    const timer = window.setInterval(function () {
      attempts += 1;
      if (apply() || attempts >= 60) window.clearInterval(timer);
    }, 100);
    apply();
  };

  start();
  window.addEventListener('hashchange', start);
  document.addEventListener('click', function () {
    if (document.getElementById('story-preview')) window.setTimeout(apply, 0);
  }, true);
})();
