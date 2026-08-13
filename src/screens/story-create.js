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
    .story-preview{position:relative;width:100%;max-width:390px;aspect-ratio:9/16;background:#000;border-radius:16px;overflow:hidden;border:1px solid #22232b;display:flex;align-items:center;justify-content:center}
    .story-preview video{width:100%;height:100%;display:block;background:#000;object-position:center;object-fit:contain}
    .story-preview.crop-cover video{object-fit:cover}
    .story-preview.crop-square{aspect-ratio:1/1}.story-preview.crop-square video{object-fit:cover}
    .story-preview.crop-landscape{aspect-ratio:16/9}.story-preview.crop-landscape video{object-fit:cover}
    .story-title-overlay{position:absolute;left:50%;top:14%;transform:translateX(-50%);max-width:86%;padding:6px 12px;border-radius:8px;background:rgba(0,0,0,.34);color:#fff;font-size:22px;font-weight:900;text-align:center;white-space:pre-wrap;overflow:hidden;text-shadow:0 2px 8px rgba(0,0,0,.6);pointer-events:none}
    .story-sticker-overlay{position:absolute;left:50%;top:50%;width:88px;height:88px;transform:translate(-50%,-50%);object-fit:contain;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45));pointer-events:none}
    .story-tools{display:grid;gap:10px;max-width:420px;margin:0 auto}
    .story-tools label{font-size:12px;color:#aaa;display:grid;gap:6px}
    .story-tools input,.story-tools select{height:42px;border:1px solid #2a2a32;border-radius:10px;background:#101016;color:#fff;padding:0 11px;outline:none}
    .story-tools .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .story-publish{height:44px;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800}
    .story-publish:disabled{opacity:.55}
    .story-file-name{font-size:12px;color:#aaa;min-height:18px}
    .story-message{font-size:12px;color:#aaa;min-height:18px}
  `;
  document.head.appendChild(style);
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
        <div class="story-preview-wrap"><div id="story-preview" class="story-preview"><video id="story-preview-video" playsinline muted autoplay></video><div id="story-title-overlay" class="story-title-overlay" hidden></div><img id="story-sticker-overlay" class="story-sticker-overlay" alt="" hidden></div></div>
        <div class="story-tools">
          <div id="story-create-name" class="story-file-name">${draftFile ? escapeHtml(draftFile.name) : 'Choose a video to start.'}</div>
          <label>Story title<input id="story-title" maxlength="80" placeholder="Add a title"></label>
          <div class="row">
            <label>Crop<select id="story-crop"><option value="portrait">Portrait 9:16</option><option value="cover">Fill screen</option><option value="square">Square 1:1</option><option value="landscape">Landscape 16:9</option></select></label>
            <label>Photo overlay<button id="story-sticker-select" type="button" class="story-publish" style="height:42px;background:#24242d;">Add photo</button></label>
          </div>
          <button id="story-create-select" type="button" class="story-publish">Choose video</button>
          <button id="story-publish-button" type="button" class="story-publish" disabled>Publish story</button>
          <div id="story-create-message" class="story-message"></div>
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
  const titleOverlay = app.querySelector('#story-title-overlay');
  const cropInput = app.querySelector('#story-crop');
  const stickerButton = app.querySelector('#story-sticker-select');
  const stickerOverlay = app.querySelector('#story-sticker-overlay');
  const cancel = app.querySelector('#story-cancel-draft');

  let currentFile = draftFile;
  let stickerDataUrl = '';
  let objectUrl = '';

  const updatePreview = () => {
    titleOverlay.textContent = titleInput.value.trim();
    titleOverlay.hidden = !titleInput.value.trim();
    preview.classList.remove('crop-cover', 'crop-square', 'crop-landscape');
    if (cropInput.value === 'cover') preview.classList.add('crop-cover');
    if (cropInput.value === 'square') preview.classList.add('crop-square');
    if (cropInput.value === 'landscape') preview.classList.add('crop-landscape');
  };

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
    message.textContent = '';
  };

  select.addEventListener('click', () => input.click());
  input.addEventListener('change', () => setFile(input.files?.[0]));
  titleInput.addEventListener('input', updatePreview);
  cropInput.addEventListener('change', updatePreview);
  stickerButton.addEventListener('click', () => stickerInput.click());
  stickerInput.addEventListener('change', async () => {
    const file = stickerInput.files?.[0];
    if (!file) return;
    try {
      stickerDataUrl = await compressSticker(file);
      stickerOverlay.src = stickerDataUrl;
      stickerOverlay.hidden = !stickerDataUrl;
    } catch {
      message.textContent = 'Could not add that photo.';
    }
  });

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
    message.textContent = 'Uploading story...';
    try {
      await publishStory(currentFile, () => {}, {
        title: titleInput.value.trim(),
        crop: cropInput.value,
        stickerDataUrl,
        stickerX: 50,
        stickerY: 50,
        stickerScale: 1
      });
      window[DRAFT_FILE_KEY] = null;
      message.textContent = 'Story published successfully.';
      window.setTimeout(() => window.__indoNavigate?.('home'), 500);
    } catch (error) {
      message.textContent = error?.message || 'Story upload failed. Please try again.';
      publish.disabled = false;
      select.disabled = false;
      stickerButton.disabled = false;
    }
  });

  if (draftFile) setFile(draftFile);
  updatePreview();
}
