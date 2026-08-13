// Indo production runtime configuration.
// Public Railway backend URL for production.
window.INDO_API_BASE = window.INDO_API_BASE || 'https://indo-backend-production-41b1.up.railway.app';

(function () {
  if (window.__indoStoryRuntimeV4) return;
  window.__indoStoryRuntimeV4 = true;

  let publishing = false;

  function collectStoryEditor(preview) {
    const title = preview.querySelector('.story-title-element');
    const photos = [...preview.querySelectorAll('.story-photo-element')];
    const emojis = [...preview.querySelectorAll('.story-emoji-element')];
    const crop = preview.querySelector('#story-crop')?.value || 'portrait';
    return {
      title: title?.textContent?.trim() || '',
      titleFont: title?.dataset?.font || title?.style?.fontFamily || 'Arial, sans-serif',
      titleX: Number(title?.dataset?.x || 50),
      titleY: Number(title?.dataset?.y || 14),
      crop,
      stickerDataUrl: photos[0]?.src || '',
      stickerX: Number(photos[0]?.dataset?.x || 50),
      stickerY: Number(photos[0]?.dataset?.y || 50),
      stickerScale: Number(photos[0]?.dataset?.gestureScale || 1),
      elements: [
        ...(title ? [{ type: 'title', text: title.textContent || '', x: Number(title.dataset?.x || 50), y: Number(title.dataset?.y || 14), font: title.dataset?.font || title.style?.fontFamily || 'Arial, sans-serif' }] : []),
        ...photos.map((node) => ({ type: 'photo', dataUrl: node.src || '', x: Number(node.dataset?.x || 50), y: Number(node.dataset?.y || 50), scale: Number(node.dataset?.gestureScale || 1) })),
        ...emojis.map((node) => ({ type: 'emoji', emoji: node.textContent || '', x: Number(node.dataset?.x || 50), y: Number(node.dataset?.y || 50) }))
      ]
    };
  }

  async function directPublish(preview, publish, message) {
    if (publishing) return;
    const file = window.__indoStoryDraftFile;
    if (!(file instanceof File) || !file.type.startsWith('video/')) {
      message.textContent = 'Video is not ready. Please select the video again.';
      return;
    }
    publishing = true;
    publish.disabled = true;
    publish.textContent = 'Posting...';
    message.textContent = 'Uploading story...';
    try {
      const { publishStory } = await import('../src/features/upload/story-publish.js?v=20260813-62');
      await publishStory(file, () => {}, collectStoryEditor(preview));
      window.__indoStoryDraftFile = null;
      message.textContent = 'Story published successfully.';
      window.setTimeout(() => window.__indoNavigate?.('home'), 350);
    } catch (error) {
      console.error('Direct Story publish failed:', error);
      message.textContent = error?.message || 'Story upload failed. Please try again.';
      publish.disabled = false;
      publish.textContent = 'Done';
      publishing = false;
    }
  }

  function apply() {
    const preview = document.getElementById('story-preview');
    const publish = document.getElementById('story-publish-button');
    const add = document.getElementById('story-add-button');
    if (!preview || !publish || !add) return false;

    preview.style.position = 'relative';
    if (publish.parentElement !== preview) preview.appendChild(publish);

    publish.textContent = publishing ? 'Posting...' : 'Done';
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
    publish.style.setProperty('display', 'block', 'important');
    publish.style.setProperty('visibility', 'visible', 'important');
    publish.style.setProperty('opacity', '1', 'important');

    add.style.setProperty('position', 'absolute', 'important');
    add.style.setProperty('right', '14px', 'important');
    add.style.setProperty('bottom', '62px', 'important');
    add.style.setProperty('z-index', '101', 'important');

    const panel = document.getElementById('story-add-panel');
    if (panel) panel.style.bottom = '118px';
    document.getElementById('story-create-select')?.style.setProperty('display', 'none', 'important');
    document.getElementById('indo-story-share-button')?.remove();

    let hit = document.getElementById('indo-story-done-hit');
    if (!hit || hit.parentElement !== preview) {
      hit?.remove();
      hit = document.createElement('button');
      hit.id = 'indo-story-done-hit';
      hit.type = 'button';
      hit.setAttribute('aria-label', 'Done');
      hit.style.cssText = 'position:absolute;right:0;bottom:0;width:20%;height:44px;z-index:150;cursor:pointer;background:transparent;border:0;padding:0;margin:0;touch-action:manipulation;';
      hit.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const currentPreview = document.getElementById('story-preview');
        const currentPublish = document.getElementById('story-publish-button');
        const currentMessage = document.getElementById('story-create-message');
        if (currentPreview && currentPublish && currentMessage) void directPublish(currentPreview, currentPublish, currentMessage);
      });
      hit.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      preview.appendChild(hit);
    }

    return true;
  }

  function start() {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (apply() || attempts >= 100) window.clearInterval(timer);
    }, 100);
    apply();
  }

  start();
  window.addEventListener('hashchange', start);
  document.addEventListener('click', () => {
    if (document.getElementById('story-preview')) window.setTimeout(apply, 0);
  }, true);
})();