import { publishStory } from '../features/upload/story-publish.js';
import { nav } from '../components/nav.js';
import { icons } from '../data.js';

const DRAFT_FILE_KEY = '__indoStoryDraftFile';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[char]));
}

function compressSticker(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = String(reader.result || ''); };
    reader.onerror = reject;
    image.onload = () => {
      const max = 360;
      const scale = Math.min(1, max / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
      canvas.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ensureStyles() {
  if (document.getElementById('indo-story-editor-v2')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-editor-v2';
  style.textContent = `
    .story-editor{padding:12px 12px 88px!important}
    .story-preview-wrap{position:relative;width:100%;max-width:420px;margin:0 auto 14px;display:flex;justify-content:center}
    .story-preview{position:relative;width:100%;max-width:390px;aspect-ratio:9/16;background:#000;border-radius:16px;overflow:hidden;border:1px solid #22232b;display:flex;align-items:center;justify-content:center;touch-action:none}
    .story-preview video{width:100%;height:100%;display:block;background:#000;object-position:center;object-fit:contain}
    .story-preview.crop-cover video{object-fit:cover}
    .story-preview.crop-square{aspect-ratio:1/1}.story-preview.crop-square video{object-fit:cover}
    .story-preview.crop-landscape{aspect-ratio:16/9}.story-preview.crop-landscape video{object-fit:cover}
    .story-element{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;cursor:grab;user-select:none;touch-action:none}
    .story-element:active{cursor:grabbing}
    .story-title-element{max-width:86%;padding:6px 12px;border-radius:8px;background:rgba(0,0,0,.34);color:#fff;font-size:22px;font-weight:900;text-align:center;white-space:pre-wrap;overflow:hidden;text-shadow:0 2px 8px rgba(0,0,0,.6)}
    .story-photo-element{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))}
    .story-emoji-element{font-size:58px;line-height:1;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))}
    .story-tools{display:grid;gap:10px;max-width:420px;margin:0 auto}
    .story-tools label{font-size:12px;color:#aaa;display:grid;gap:6px}
    .story-tools input,.story-tools select{height:42px;border:1px solid #2a2a32;border-radius:10px;background:#101016;color:#fff;padding:0 11px;outline:none}
    .story-tools .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .story-tools .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .story-publish{height:44px;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800}
    .story-publish.secondary{background:#24242d}
    .story-publish:disabled{opacity:.55}
    .story-file-name{font-size:12px;color:#aaa;min-height:18px}
    .story-message{font-size:12px;color:#aaa;min-height:18px}
    .story-emoji-picker{display:flex;gap:6px;flex-wrap:wrap;padding:8px;border:1px solid #292932;border-radius:10px;background:#101016}
    .story-emoji-picker button{width:42px;height:42px;border:1px solid #292932;border-radius:10px;background:#17171f;font-size:23px;cursor:pointer}
  `;
  document.head.appendChild(style);
}

function positionToPercent(clientX, clientY, preview) {
  const rect = preview.getBoundingClientRect();
  return {
    x: Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)),
    y: Math.max(4, Math.min(96, ((clientY - rect.top) / rect.height) * 100))
  };
}

export function renderStoryCreate(app) {
  ensureStyles();
  const draftFile = window[DRAFT_FILE_KEY] instanceof File ? window[DRAFT_FILE_KEY] : null;
  app.innerHTML = `
    <div class="app-shell">
      <header class="page-head">
        <button data-screen="home" aria-label="Back">${icons.back}</button>
        <h2>Add to your story</h2>
        <button id="story-cancel-draft" type="button" aria-label="Cancel">×</button>
      </header>
      <main class="story-editor">
        <input id="story-create-file" type="file" accept="video/*" hidden>
        <input id="story-sticker-file" type="file" accept="image/*" hidden>
        <div class="story-preview-wrap"><div id="story-preview" class="story-preview"><video id="story-preview-video" autoplay playsinline muted></video></div></div>
        <div class="story-tools">
          <div id="story-create-name" class="story-file-name">${draftFile ? escapeHtml(draftFile.name) : 'Choose a video to start.'}</div>
          <label>Story title<input id="story-title" maxlength="80" placeholder="Add a title"></label>
          <div class="row3">
            <label>Crop<select id="story-crop"><option value="portrait">Portrait 9:16</option><option value="cover">Fill screen</option><option value="square">Square 1:1</option><option value="landscape">Landscape 16:9</option></select></label>
            <button id="story-sticker-select" type="button" class="story-publish secondary">Add photo</button>
            <button id="story-emoji-toggle" type="button" class="story-publish secondary">Add emoji</button>
          </div>
          <div id="story-emoji-picker" class="story-emoji-picker" hidden>
            <button type="button" data-emoji="❤️">❤️</button><button type="button" data-emoji="😂">😂</button><button type="button" data-emoji="😍">😍</button><button type="button" data-emoji="🔥">🔥</button><button type="button" data-emoji="👏">👏</button><button type="button" data-emoji="✨">✨</button><button type="button" data-emoji="😎">😎</button><button type="button" data-emoji="🥳">🥳</button>
          </div>
          <button id="story-create-select" type="button" class="story-publish">Choose video</button>
          <button id="story-publish-button" type="button" class="story-publish" disabled>Publish story</button>
          <div id="story-create-message" class="story-message">Drag the title, photo, or emoji anywhere on the video.</div>
        </div>
      </main>
      ${nav('home')}
    </div>
  `;

  const input = app.querySelector('#story-create-file');
  const stickerInput = app.querySelector('#story-sticker-file');
  const select = app.querySelector('#story-create-select');
  const publish = app.querySelector('#story-publish-button');
  const name = app.querySelector('#story-create-name');
  const message = app.querySelector('#story-create-message');
  const video = app.querySelector('#story-preview-video');
  const preview = app.querySelector('#story-preview');
  const titleInput = app.querySelector('#story-title');
  const cropInput = app.querySelector('#story-crop');
  const stickerButton = app.querySelector('#story-sticker-select');
  const emojiToggle = app.querySelector('#story-emoji-toggle');
  const emojiPicker = app.querySelector('#story-emoji-picker');
  const cancel = app.querySelector('#story-cancel-draft');

  let currentFile = draftFile;
  let objectUrl = '';
  let titleElement = null;
  const photoElements = [];
  const emojiElements = [];

  const makeDraggable = (element, onMove) => {
    let dragging = false;
    const move = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const point = positionToPercent(event.clientX, event.clientY, preview);
      onMove(point);
      element.style.left = `${point.x}%`;
      element.style.top = `${point.y}%`;
    };
    const up = () => {
      dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    element.addEventListener('pointerdown', (event) => {
      dragging = true;
      element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up, { once: true });
    });
  };

  const createTitleElement = () => {
    const text = titleInput.value.trim();
    if (!text) {
      titleElement?.remove();
      titleElement = null;
      return;
    }
    if (!titleElement) {
      titleElement = document.createElement('div');
      titleElement.className = 'story-element story-title-element';
      titleElement.style.left = '50%';
      titleElement.style.top = '14%';
      preview.appendChild(titleElement);
      makeDraggable(titleElement, (point) => {
        titleElement.dataset.x = String(point.x);
        titleElement.dataset.y = String(point.y);
      });
    }
    titleElement.textContent = text;
  };

  titleInput.addEventListener('input', createTitleElement);

  cropInput.addEventListener('change', () => {
    preview.classList.remove('crop-cover', 'crop-square', 'crop-landscape');
    if (cropInput.value === 'cover') preview.classList.add('crop-cover');
    if (cropInput.value === 'square') preview.classList.add('crop-square');
    if (cropInput.value === 'landscape') preview.classList.add('crop-landscape');
  });

  const addPhoto = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await compressSticker(file);
      const image = document.createElement('img');
      image.src = dataUrl;
      image.alt = '';
      image.className = 'story-element story-photo-element';
      image.style.left = '50%';
      image.style.top = '50%';
      image.dataset.x = '50';
      image.dataset.y = '50';
      image.dataset.scale = '1';
      preview.appendChild(image);
      const entry = { element: image, dataUrl, x: 50, y: 50, scale: 1 };
      photoElements.push(entry);
      makeDraggable(image, (point) => { entry.x = point.x; entry.y = point.y; });
    } catch {
      message.textContent = 'Could not add that photo.';
    }
  };

  stickerButton.addEventListener('click', () => stickerInput.click());
  stickerInput.addEventListener('change', async () => {
    await addPhoto(stickerInput.files?.[0]);
    stickerInput.value = '';
  });

  emojiToggle.addEventListener('click', () => { emojiPicker.hidden = !emojiPicker.hidden; });
  emojiPicker.addEventListener('click', (event) => {
    const button = event.target.closest('[data-emoji]');
    if (!button) return;
    const emoji = button.dataset.emoji || '';
    const node = document.createElement('div');
    node.className = 'story-element story-emoji-element';
    node.textContent = emoji;
    node.style.left = '50%';
    node.style.top = '50%';
    preview.appendChild(node);
    const entry = { element: node, emoji, x: 50, y: 50 };
    emojiElements.push(entry);
    makeDraggable(node, (point) => { entry.x = point.x; entry.y = point.y; });
    emojiPicker.hidden = true;
  });

  const setFile = (file) => {
    if (!(file instanceof File) || !file.type.startsWith('video/')) return;
    currentFile = file;
    window[DRAFT_FILE_KEY] = file;
    name.textContent = `${file.name} • ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.load();
    video.play().catch(() => {});
    publish.disabled = false;
    message.textContent = 'Drag the title, photo, or emoji anywhere on the video.';
  };

  select.addEventListener('click', () => input.click());
  input.addEventListener('change', () => setFile(input.files?.[0]));

  cancel.addEventListener('click', () => {
    window[DRAFT_FILE_KEY] = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    window.__indoNavigate?.('home');
  });

  publish.addEventListener('click', async () => {
    if (!currentFile) return;
    publish.disabled = true;
    select.disabled = true;
    stickerButton.disabled = true;
    emojiToggle.disabled = true;
    message.textContent = 'Uploading story...';
    try {
      const titleX = Number(titleElement?.dataset.x || 50);
      const titleY = Number(titleElement?.dataset.y || 14);
      const elements = [
        ...(titleElement ? [{ type: 'title', text: titleInput.value.trim(), x: titleX, y: titleY }] : []),
        ...photoElements.map((item) => ({ type: 'photo', dataUrl: item.dataUrl, x: item.x, y: item.y, scale: item.scale })),
        ...emojiElements.map((item) => ({ type: 'emoji', emoji: item.emoji, x: item.x, y: item.y }))
      ];
      await publishStory(currentFile, () => {}, {
        title: titleInput.value.trim(),
        crop: cropInput.value,
        stickerDataUrl: photoElements[0]?.dataUrl || '',
        stickerX: photoElements[0]?.x ?? 50,
        stickerY: photoElements[0]?.y ?? 50,
        stickerScale: photoElements[0]?.scale ?? 1,
        elements
      });
      window[DRAFT_FILE_KEY] = null;
      message.textContent = 'Story published successfully.';
      window.setTimeout(() => window.__indoNavigate?.('home'), 500);
    } catch (error) {
      message.textContent = error?.message || 'Story upload failed. Please try again.';
      publish.disabled = false;
      select.disabled = false;
      stickerButton.disabled = false;
      emojiToggle.disabled = false;
    }
  });

  if (draftFile) setFile(draftFile);
  createTitleElement();
  cropInput.dispatchEvent(new Event('change'));
}
