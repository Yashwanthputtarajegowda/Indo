// Indo production runtime configuration.
// Public Railway backend URL for production.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

// Stable Story editor layout/interaction fix.
(function () {
  if (window.__indoStoryLayoutFixV2) return;
  window.__indoStoryLayoutFixV2 = true;

  const apply = function () {
    const preview = document.getElementById('story-preview');
    const publish = document.getElementById('story-publish-button');
    const add = document.getElementById('story-add-button');
    if (!preview || !publish || !add) return false;

    if (publish.parentElement !== preview) preview.appendChild(publish);

    preview.style.position = 'relative';
    publish.textContent = 'Done';
    publish.style.setProperty('position', 'absolute', 'important');
    publish.style.setProperty('right', '0', 'important');
    publish.style.setProperty('left', 'auto', 'important');
    publish.style.setProperty('bottom', '0', 'important');
    publish.style.setProperty('width', '20%', 'important');
    publish.style.setProperty('height', '44px', 'important');
    publish.style.setProperty('margin', '0', 'important');
    publish.style.setProperty('z-index', '100', 'important');
    publish.style.setProperty('border-radius', '10px', 'important');
    publish.style.setProperty('background', '#7b3cff', 'important');
    publish.style.setProperty('color', '#fff', 'important');
    publish.style.setProperty('font-weight', '800', 'important');
    publish.style.setProperty('cursor', 'pointer', 'important');
    publish.style.setProperty('display', 'block', 'important');
    publish.style.setProperty('visibility', 'visible', 'important');
    publish.style.setProperty('opacity', '1', 'important');
    publish.disabled = false;
    publish.removeAttribute('disabled');

    add.style.setProperty('position', 'absolute', 'important');
    add.style.setProperty('right', '14px', 'important');
    add.style.setProperty('bottom', '62px', 'important');
    add.style.setProperty('z-index', '101', 'important');

    const panel = document.getElementById('story-add-panel');
    if (panel) panel.style.bottom = '118px';
    document.getElementById('story-create-select')?.style.setProperty('display', 'none', 'important');
    document.getElementById('indo-story-share-button')?.remove();

    // Transparent hit area guarantees a single tap reaches the real publish handler,
    // even if the native button was disabled by an earlier render.
    let hit = document.getElementById('indo-story-done-hit');
    if (!hit) {
      hit = document.createElement('div');
      hit.id = 'indo-story-done-hit';
      hit.setAttribute('aria-label', 'Done');
      hit.style.cssText = 'position:absolute;right:0;bottom:0;width:20%;height:44px;z-index:150;cursor:pointer;background:transparent;touch-action:manipulation;';
      hit.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        publish.disabled = false;
        publish.removeAttribute('disabled');
        window.setTimeout(function () {
          try { publish.click(); } catch (error) { console.error('Story Done publish click failed:', error); }
        }, 0);
      }, true);
      preview.appendChild(hit);
    }
    return true;
  };

  const start = function () {
    let attempts = 0;
    const timer = window.setInterval(function () {
      attempts += 1;
      if (apply() || attempts >= 80) window.clearInterval(timer);
    }, 100);
    apply();
  };

  start();
  window.addEventListener('hashchange', start);
  document.addEventListener('click', function () {
    if (document.getElementById('story-preview')) window.setTimeout(apply, 0);
  }, true);
})();