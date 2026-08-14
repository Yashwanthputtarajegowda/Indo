import { publishStory } from '../features/upload/story-publish.js';
import { icons } from '../data.js';

const DRAFT_FILE_KEY = '__indoStoryDraftFile';
const DRAFT_KEY = 'indo:story-editor-draft:v6';
const FONT_OPTIONS = [
  ['Poppins', 'Poppins, sans-serif'],
  ['Montserrat', 'Montserrat, sans-serif'],
  ['Bebas Neue', 'Impact, sans-serif'],
  ['Playfair', 'Georgia, serif'],
  ['Mono', 'monospace'],
  ['Script', 'cursive']
];
const EMOJIS = ['❤️', '🔥', '✨', '😍', '😂', '👏', '😎', '🥳', '💜', '⭐', '⚡', '🚀'];
const FILTERS = [
  ['Original', 'none'],
  ['Neon', 'saturate(1.5) contrast(1.12) hue-rotate(8deg)'],
  ['Dream', 'saturate(1.15) brightness(1.08) blur(.1px)'],
  ['Cyber', 'contrast(1.25) saturate(1.35) hue-rotate(26deg)'],
  ['Mono', 'grayscale(1) contrast(1.15)'],
  ['Warm', 'sepia(.22) saturate(1.3)'],
  ['Night', 'brightness(.72) contrast(1.28) saturate(1.22)']
];

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;'
  }[char]));
}

function compressSticker(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = String(reader.result || ''); };
    reader.onerror = reject;
    image.onerror = reject;
    image.onload = () => {
      const max = 420;
      const scale = Math.min(1, max / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
      canvas.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    reader.readAsDataURL(file);
  });
}

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || {}; } catch { return {}; }
}

function saveDraft(state) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      title: state.title,
      titleFont: state.titleFont,
      titleColor: state.titleColor,
      titleSize: state.titleSize,
      titleX: state.titleX,
      titleY: state.titleY,
      crop: state.crop,
      filter: state.filter,
      speed: state.speed,
      stickerDataUrl: state.stickerDataUrl || '',
      stickerX: state.stickerX,
      stickerY: state.stickerY,
      stickerScale: state.stickerScale,
      updatedAt: Date.now()
    }));
  } catch {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

function ensureStyles() {
  const id = 'indo-story-editor-v6';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .indo-story-lab{position:relative;min-height:calc(100vh - 64px);padding:10px 10px 94px;background:radial-gradient(circle at 50% -5%,rgba(122,72,255,.24),transparent 34%),#050509;color:#fff;overflow:hidden}
    .indo-story-lab::before{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),transparent 82%);pointer-events:none}
    .story-lab-header{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto 10px;max-width:980px}
    .story-lab-title{display:flex;flex-direction:column;min-width:0}.story-lab-title strong{font-size:16px;letter-spacing:.8px}.story-lab-title span{font-size:9px;color:#8f8fa2;letter-spacing:1.4px;text-transform:uppercase;margin-top:2px}
    .story-lab-top-actions{display:flex;gap:6px}.story-lab-top-actions button{width:34px;height:34px;border:1px solid #252535;border-radius:10px;background:#11111a;color:#ddd;cursor:pointer}.story-lab-top-actions button:hover{border-color:#7a48ff;color:#fff}
    .story-lab-workspace{position:relative;z-index:2;display:grid;grid-template-columns:52px minmax(0,1fr) 150px;gap:10px;align-items:start;max-width:980px;margin:0 auto}
    .story-rail{display:flex;flex-direction:column;gap:7px;padding-top:10px}.story-rail button{width:52px;height:52px;border:1px solid #222231;border-radius:15px;background:rgba(15,15,23,.92);color:#9d9daf;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:18px;cursor:pointer}.story-rail button span{font-size:8px;text-transform:uppercase;letter-spacing:.5px}.story-rail button.active,.story-rail button:hover{color:#fff;border-color:#874cff;background:linear-gradient(145deg,rgba(118,61,255,.22),rgba(255,46,176,.11));box-shadow:0 0 16px rgba(118,61,255,.14)}
    .story-canvas-shell{position:relative;display:flex;justify-content:center;min-width:0}.story-preview{position:relative;width:min(100%,420px);aspect-ratio:9/16;background:#000;border:1px solid #303046;border-radius:22px;overflow:hidden;box-shadow:0 22px 70px rgba(0,0,0,.6),0 0 30px rgba(122,72,255,.12);touch-action:none}
    .story-preview video{width:100%;height:100%;display:block;background:#000;object-fit:cover;object-position:center;filter:none;pointer-events:none}.story-preview.is-contain video{object-fit:contain}
    .story-preview .story-vignette{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.45),transparent 24%,transparent 70%,rgba(0,0,0,.58))}
    .story-top-badge{position:absolute;left:12px;top:12px;z-index:12;padding:6px 9px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(5,5,10,.56);backdrop-filter:blur(10px);font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#fff}
    .story-live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff3daf;box-shadow:0 0 10px #ff3daf;margin-right:5px}
    .story-preview-control{position:absolute;right:12px;top:12px;z-index:13;width:34px;height:34px;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(5,5,10,.6);color:#fff;cursor:pointer}
    .story-overlay-title{position:absolute;left:50%;top:22%;z-index:10;transform:translate(-50%,-50%);max-width:82%;min-width:34px;padding:8px 13px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(0,0,0,.28);backdrop-filter:blur(8px);color:#fff;text-align:center;font-size:23px;font-weight:900;line-height:1.08;white-space:pre-wrap;text-shadow:0 3px 12px rgba(0,0,0,.75);cursor:grab;user-select:none;display:none;touch-action:none}
    .story-overlay-sticker{position:absolute;left:50%;top:56%;z-index:10;width:86px;height:86px;object-fit:contain;transform:translate(-50%,-50%);filter:drop-shadow(0 5px 16px rgba(0,0,0,.65));cursor:grab;display:none;touch-action:none}
    .story-overlay-emoji{position:absolute;left:50%;top:56%;z-index:11;transform:translate(-50%,-50%);font-size:58px;line-height:1;filter:drop-shadow(0 5px 16px rgba(0,0,0,.65));cursor:grab;display:none;touch-action:none}
    .story-bottom-status{position:absolute;left:14px;right:14px;bottom:14px;z-index:12;display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.46);backdrop-filter:blur(10px);font-size:9px;color:#eee}
    .story-bottom-status .grow{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .story-side{display:grid;gap:8px}.story-side-card{padding:11px;border:1px solid #242438;border-radius:15px;background:rgba(11,11,17,.92);box-shadow:0 12px 30px rgba(0,0,0,.25)}.story-side-card h4{font-size:10px;margin:0 0 9px;text-transform:uppercase;letter-spacing:1px;color:#8f8fa2}.story-side-card p{font-size:9px;color:#8d8d9e;line-height:1.45;margin:0}
    .story-metric{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:9px;color:#b8b8c4;margin-top:7px}.story-metric b{color:#fff;font-size:10px}
    .story-publish-btn{width:100%;height:43px;border:0;border-radius:12px;background:linear-gradient(135deg,#7a43ff,#df3db2);color:#fff;font-weight:900;cursor:pointer;box-shadow:0 10px 26px rgba(130,65,255,.3)}.story-publish-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
    .story-message{min-height:18px;margin:7px 0 0;color:#9f9faf;font-size:10px;line-height:1.4}
    .story-tool-panel{position:relative;z-index:4;width:min(100%,760px);margin:10px auto 0;padding:10px;border:1px solid #242438;border-radius:17px;background:rgba(11,11,17,.95);box-shadow:0 15px 42px rgba(0,0,0,.38);display:none}.story-tool-panel.open{display:block}
    .story-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.story-panel-head strong{font-size:12px}.story-panel-head span{font-size:9px;color:#858596}
    .story-chip-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}.story-chip-row::-webkit-scrollbar{display:none}.story-chip{flex:0 0 auto;height:31px;padding:0 10px;border:1px solid #29293a;border-radius:999px;background:#15151f;color:#bbb;cursor:pointer;font-size:9px;font-weight:700}.story-chip.active{color:#fff;border-color:#8649ff;background:rgba(123,60,255,.22)}
    .story-field{display:grid;gap:6px;margin-top:8px}.story-field label{font-size:9px;color:#88889a;text-transform:uppercase;letter-spacing:.8px}.story-field input[type="text"],.story-field select{height:38px;padding:0 10px;border:1px solid #28283a;border-radius:10px;background:#0c0c12;color:#fff;outline:none}.story-field input[type="range"]{width:100%;accent-color:#8a4bff}
    .story-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.story-mini-button{height:38px;border:1px solid #28283a;border-radius:10px;background:#14141d;color:#d9d9e2;font-size:9px;font-weight:800;cursor:pointer}.story-mini-button.active{border-color:#ff43bb;color:#fff;background:rgba(255,55,189,.11)}
    .story-fonts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.story-font-button{height:36px;border:1px solid #29293a;border-radius:9px;background:#14141d;color:#fff;font-size:9px;cursor:pointer}.story-font-button.active{border-color:#7c48ff;background:#281951}
    .story-color-row{display:flex;gap:7px;align-items:center}.story-color{width:25px;height:25px;border-radius:50%;border:2px solid transparent;cursor:pointer}.story-color.active{border-color:#fff;box-shadow:0 0 0 2px #7f4bff}
    .story-sticker-preview{width:56px;height:56px;border-radius:10px;border:1px dashed #33334a;object-fit:contain;background:#0a0a0f;display:none}
    .story-empty{padding:12px;border:1px dashed #2b2b40;border-radius:11px;color:#777789;font-size:9px;text-align:center}
    .story-timeline{position:relative;z-index:4;width:min(100%,760px);margin:10px auto 0;padding:10px;border:1px solid #242438;border-radius:15px;background:rgba(11,11,17,.95)}
    .story-timeline-head{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#aaa}.story-timeline-head b{color:#fff}.story-range{position:relative;margin:10px 0 2px}.story-range input{width:100%;display:block}.story-dual-track{position:absolute;left:7px;right:7px;top:5px;height:7px;border-radius:999px;background:linear-gradient(90deg,#743dff,#ff42b7);opacity:.75;pointer-events:none}.story-range input[type="range"]{position:relative;z-index:2;appearance:none;background:transparent}.story-range input[type="range"]::-webkit-slider-runnable-track{height:7px;background:transparent}.story-range input[type="range"]::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #7844ff;box-shadow:0 0 12px rgba(255,255,255,.35);margin-top:-4px}.story-timecodes{display:flex;justify-content:space-between;font-size:9px;color:#8c8c9d}
    .story-play-row{display:flex;align-items:center;gap:8px;margin-top:8px}.story-play{width:38px;height:38px;border-radius:50%;border:1px solid #303047;background:#161620;color:#fff;cursor:pointer}.story-speed{display:flex;gap:5px}.story-speed button{height:28px;padding:0 9px;border:1px solid #28283b;border-radius:8px;background:#14141d;color:#aaa;font-size:9px;cursor:pointer}.story-speed button.active{border-color:#8148ff;color:#fff;background:#27194e}
    .story-audio-row{display:flex;align-items:center;gap:8px}.story-audio-row input{flex:1}.story-file-input-label{height:36px;display:flex;align-items:center;justify-content:center;padding:0 10px;border-radius:10px;border:1px solid #29293c;background:#15151f;color:#ddd;font-size:9px;font-weight:800;cursor:pointer}
    .story-share-row{display:flex;gap:6px;margin-top:8px}.story-share-row button{flex:1;height:36px;border:1px solid #2a2a3c;border-radius:9px;background:#15151e;color:#ddd;font-size:9px;font-weight:800;cursor:pointer}.story-share-row button:hover{border-color:#8148ff;color:#fff}
    @media(max-width:760px){.indo-story-lab{padding-left:8px;padding-right:8px}.story-lab-workspace{grid-template-columns:42px minmax(0,1fr);gap:7px}.story-rail button{width:42px;height:48px}.story-side{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}.story-side-card.publish-card{grid-column:1/-1}.story-preview{width:min(100%,390px)}.story-tool-panel,.story-timeline{width:100%}}
    @media(max-width:480px){.story-lab-title strong{font-size:14px}.story-lab-title span{font-size:8px}.story-lab-top-actions button{width:31px;height:31px}.story-side{grid-template-columns:1fr}.story-side-card{padding:10px}.story-mini-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.story-fonts{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);
}

function percentPoint(clientX, clientY, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.max(6, Math.min(94, ((clientX - rect.left) / rect.width) * 100)),
    y: Math.max(6, Math.min(94, ((clientY - rect.top) / rect.height) * 100))
  };
}

export function renderStoryCreate(app, draftFileOverride = null) {
  ensureStyles();
  const draftFile = draftFileOverride instanceof File
    ? draftFileOverride
    : (window[DRAFT_FILE_KEY] instanceof File ? window[DRAFT_FILE_KEY] : null);
  const oldDraft = readDraft();

  app.innerHTML = `
    <div class="app-shell">
      <header class="page-head" style="position:sticky;top:0;z-index:50;background:rgba(5,5,9,.92);backdrop-filter:blur(16px)">
        <button data-screen="home" aria-label="Back">${icons.back}</button>
        <h2>Story Lab</h2>
        <button id="story-cancel-draft" type="button" aria-label="Cancel">×</button>
      </header>
      <main class="indo-story-lab">
        <div class="story-lab-header">
          <div class="story-lab-title"><strong>CREATE STORY</strong><span>Next-gen editor • fast • immersive</span></div>
          <div class="story-lab-top-actions">
            <button id="story-reset" type="button" title="Reset">↺</button>
            <button id="story-preview-toggle" type="button" title="Preview">◉</button>
          </div>
        </div>

        <div class="story-lab-workspace">
          <nav class="story-rail" aria-label="Story tools">
            <button type="button" class="story-tool active" data-tool="text">Aa<span>Text</span></button>
            <button type="button" class="story-tool" data-tool="stickers">✦<span>Sticker</span></button>
            <button type="button" class="story-tool" data-tool="effects">◈<span>Effects</span></button>
            <button type="button" class="story-tool" data-tool="audio">♫<span>Audio</span></button>
            <button type="button" class="story-tool" data-tool="trim">⌁<span>Trim</span></button>
            <button type="button" class="story-tool" data-tool="canvas">▣<span>Canvas</span></button>
          </nav>

          <section class="story-canvas-shell">
            <div id="story-preview" class="story-preview">
              <span class="story-top-badge"><span class="story-live-dot"></span>STORY PREVIEW</span>
              <button id="story-mute-toggle" class="story-preview-control" type="button" aria-label="Mute or unmute">⌕</button>
              <video id="story-preview-video" autoplay playsinline muted></video>
              <div class="story-vignette"></div>
              <div id="story-overlay-title" class="story-overlay-title"></div>
              <img id="story-overlay-sticker" class="story-overlay-sticker" alt="" />
              <div id="story-overlay-emoji" class="story-overlay-emoji"></div>
              <div class="story-bottom-status"><span>AI EDITOR</span><span class="grow" id="story-status-text">Select a video to begin.</span><b id="story-current-time">00:00</b></div>
            </div>
          </section>

          <aside class="story-side">
            <section class="story-side-card">
              <h4>Project</h4>
              <div class="story-metric"><span>Format</span><b id="story-format-label">9:16</b></div>
              <div class="story-metric"><span>Length</span><b id="story-duration-label">00:00</b></div>
              <div class="story-metric"><span>Playback</span><b id="story-speed-label">1x</b></div>
            </section>
            <section class="story-side-card">
              <h4>Quality</h4>
              <div class="story-metric"><span>Cloud upload</span><b>ON</b></div>
              <div class="story-metric"><span>Watermark</span><b>NONE</b></div>
              <div class="story-metric"><span>Mobile ready</span><b>YES</b></div>
            </section>
            <section class="story-side-card publish-card">
              <button id="story-publish-button" class="story-publish-btn" type="button" disabled>Publish Story</button>
              <div id="story-create-message" class="story-message">Choose a video first.</div>
            </section>
          </aside>
        </div>

        <section id="story-tool-panel" class="story-tool-panel open"></section>

        <section class="story-timeline">
          <div class="story-timeline-head"><span>Smart timeline</span><b id="story-timeline-duration">00:00</b></div>
          <div class="story-range">
            <div class="story-dual-track"></div>
            <input id="story-trim-start" type="range" min="0" max="100" step="0.1" value="0" aria-label="Trim start">
          </div>
          <div class="story-timecodes"><span id="story-trim-start-label">00:00</span><span id="story-trim-end-label">00:00</span></div>
          <div class="story-play-row">
            <button id="story-play" class="story-play" type="button" aria-label="Play">▶</button>
            <div class="story-speed">
              <button data-speed="0.5" type="button">0.5x</button><button class="active" data-speed="1" type="button">1x</button><button data-speed="1.5" type="button">1.5x</button><button data-speed="2" type="button">2x</button>
            </div>
          </div>
        </section>

        <div class="story-share-row"><button id="story-save-draft" type="button">Save Draft</button><button id="story-choose-video" type="button">Choose Another Video</button><button id="story-delete-draft" type="button">Clear</button></div>

        <input id="story-create-file" type="file" accept="video/*" hidden>
        <input id="story-sticker-file" type="file" accept="image/*" hidden>
        <input id="story-audio-file" type="file" accept="audio/*" hidden>
        <audio id="story-audio-preview" preload="metadata"></audio>
      </main>
    </div>
  `;

  const input = app.querySelector('#story-create-file');
  const stickerInput = app.querySelector('#story-sticker-file');
  const audioInput = app.querySelector('#story-audio-file');
  const video = app.querySelector('#story-preview-video');
  const preview = app.querySelector('#story-preview');
  const publish = app.querySelector('#story-publish-button');
  const message = app.querySelector('#story-create-message');
  const statusText = app.querySelector('#story-status-text');
  const currentTime = app.querySelector('#story-current-time');
  const durationLabel = app.querySelector('#story-duration-label');
  const timelineDuration = app.querySelector('#story-timeline-duration');
  const trimStart = app.querySelector('#story-trim-start');
  const trimStartLabel = app.querySelector('#story-trim-start-label');
  const trimEndLabel = app.querySelector('#story-trim-end-label');
  const playButton = app.querySelector('#story-play');
  const toolPanel = app.querySelector('#story-tool-panel');
  const overlayTitle = app.querySelector('#story-overlay-title');
  const overlaySticker = app.querySelector('#story-overlay-sticker');
  const overlayEmoji = app.querySelector('#story-overlay-emoji');
  const speedLabel = app.querySelector('#story-speed-label');
  const formatLabel = app.querySelector('#story-format-label');
  const audioPreview = app.querySelector('#story-audio-preview');

  const state = {
    file: draftFile,
    title: String(oldDraft.title || ''),
    titleFont: String(oldDraft.titleFont || FONT_OPTIONS[0][1]),
    titleColor: String(oldDraft.titleColor || '#ffffff'),
    titleSize: Number(oldDraft.titleSize || 23),
    titleX: Number(oldDraft.titleX ?? 50),
    titleY: Number(oldDraft.titleY ?? 22),
    crop: String(oldDraft.crop || 'portrait'),
    filter: String(oldDraft.filter || 'none'),
    speed: Number(oldDraft.speed || 1),
    stickerDataUrl: String(oldDraft.stickerDataUrl || ''),
    stickerX: Number(oldDraft.stickerX ?? 50),
    stickerY: Number(oldDraft.stickerY ?? 56),
    stickerScale: Number(oldDraft.stickerScale || 1),
    emoji: String(oldDraft.emoji || ''),
    audioUrl: '',
    objectUrl: '',
    audioObjectUrl: '',
    trimStart: 0,
    tool: 'text'
  };

  function formatTime(seconds) {
    const value = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(value / 60).toString().padStart(2, '0');
    const s = Math.floor(value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function renderPreview() {
    preview.classList.toggle('is-contain', state.crop === 'portrait');
    preview.classList.toggle('crop-square', state.crop === 'square');
    preview.classList.toggle('crop-landscape', state.crop === 'landscape');
    preview.classList.toggle('crop-cover', state.crop === 'cover');
    if (state.crop === 'square') preview.style.aspectRatio = '1 / 1';
    else if (state.crop === 'landscape') preview.style.aspectRatio = '16 / 9';
    else preview.style.aspectRatio = '9 / 16';
    formatLabel.textContent = state.crop === 'landscape' ? '16:9' : state.crop === 'square' ? '1:1' : '9:16';
    video.style.filter = state.filter;
    video.playbackRate = state.speed;
    speedLabel.textContent = `${state.speed}x`;
    trimStart.value = '0';
    overlayTitle.style.display = state.title ? 'block' : 'none';
    overlayTitle.textContent = state.title;
    overlayTitle.style.left = `${state.titleX}%`;
    overlayTitle.style.top = `${state.titleY}%`;
    overlayTitle.style.fontFamily = state.titleFont;
    overlayTitle.style.color = state.titleColor;
    overlayTitle.style.fontSize = `${state.titleSize}px`;
    overlaySticker.style.display = state.stickerDataUrl ? 'block' : 'none';
    overlaySticker.src = state.stickerDataUrl || '';
    overlaySticker.style.left = `${state.stickerX}%`;
    overlaySticker.style.top = `${state.stickerY}%`;
    overlaySticker.style.transform = `translate(-50%,-50%) scale(${state.stickerScale})`;
    overlayEmoji.style.display = state.emoji ? 'block' : 'none';
    overlayEmoji.textContent = state.emoji;
  }

  function setMessage(text) {
    message.textContent = text;
    statusText.textContent = text;
  }

  function enableEditor() {
    publish.disabled = !(state.file instanceof File);
    if (state.file instanceof File) setMessage('Ready. Edit your story, then publish.');
    else setMessage('Choose a video first.');
  }

  function loadVideo(file) {
    if (!(file instanceof File) || !file.type.startsWith('video/')) return;
    state.file = file;
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = URL.createObjectURL(file);
    video.src = state.objectUrl;
    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
    nameLabel.textContent = file.name;
    enableEditor();
  }

  function loadAudio(file) {
    if (!(file instanceof File) || !file.type.startsWith('audio/')) return;
    if (state.audioObjectUrl) URL.revokeObjectURL(state.audioObjectUrl);
    state.audioObjectUrl = URL.createObjectURL(file);
    audioPreview.src = state.audioObjectUrl;
    audioPreview.volume = 0.75;
    setMessage(`Audio preview loaded: ${file.name}`);
  }

  function buildToolPanel(tool) {
    state.tool = tool;
    app.querySelectorAll('.story-tool').forEach((button) => button.classList.toggle('active', button.dataset.tool === tool));
    if (tool === 'text') {
      toolPanel.innerHTML = `
        <div class="story-panel-head"><strong>Text Studio</strong><span>Type • style • position</span></div>
        <div class="story-field"><label>Story title</label><input id="story-title-input" type="text" maxlength="80" value="${esc(state.title)}" placeholder="Write something..."></div>
        <div class="story-field"><label>Font</label><div class="story-fonts">${FONT_OPTIONS.map(([name, font]) => `<button type="button" class="story-font-button ${font === state.titleFont ? 'active' : ''}" data-font="${esc(font)}" style="font-family:${esc(font)}">${esc(name)}</button>`).join('')}</div></div>
        <div class="story-field"><label>Color</label><div class="story-color-row"><button class="story-color active" type="button" data-color="#ffffff" style="background:#fff"></button><button class="story-color" type="button" data-color="#ff4fbd" style="background:#ff4fbd"></button><button class="story-color" type="button" data-color="#9d74ff" style="background:#9d74ff"></button><button class="story-color" type="button" data-color="#00e5ff" style="background:#00e5ff"></button><button class="story-color" type="button" data-color="#ffe66d" style="background:#ffe66d"></button></div></div>
        <div class="story-field"><label>Size <b>${state.titleSize}px</b></label><input id="story-title-size" type="range" min="14" max="48" value="${state.titleSize}"></div>
      `;
      toolPanel.querySelector('#story-title-input').addEventListener('input', (event) => { state.title = event.target.value; renderPreview(); saveDraft(state); });
      toolPanel.querySelector('#story-title-size').addEventListener('input', (event) => { state.titleSize = Number(event.target.value); renderPreview(); buildToolPanel('text'); });
      toolPanel.querySelectorAll('[data-font]').forEach((button) => button.addEventListener('click', () => { state.titleFont = button.dataset.font; renderPreview(); buildToolPanel('text'); saveDraft(state); }));
      toolPanel.querySelectorAll('[data-color]').forEach((button) => button.addEventListener('click', () => { state.titleColor = button.dataset.color; renderPreview(); buildToolPanel('text'); saveDraft(state); }));
      return;
    }
    if (tool === 'stickers') {
      toolPanel.innerHTML = `
        <div class="story-panel-head"><strong>Stickers & Emoji</strong><span>Drag anything inside the preview</span></div>
        <div class="story-chip-row"><button class="story-chip active" id="story-upload-sticker" type="button">+ Upload Photo</button>${EMOJIS.map((emoji) => `<button class="story-chip" type="button" data-emoji-pick="${emoji}">${emoji}</button>`).join('')}</div>
        <div class="story-field"><label>Sticker scale</label><input id="story-sticker-scale" type="range" min="0.6" max="2.2" step="0.1" value="${state.stickerScale}"></div>
      `;
      toolPanel.querySelector('#story-upload-sticker').addEventListener('click', () => stickerInput.click());
      toolPanel.querySelectorAll('[data-emoji-pick]').forEach((button) => button.addEventListener('click', () => { state.emoji = button.dataset.emojiPick; renderPreview(); saveDraft(state); }));
      toolPanel.querySelector('#story-sticker-scale').addEventListener('input', (event) => { state.stickerScale = Number(event.target.value); renderPreview(); saveDraft(state); });
      return;
    }
    if (tool === 'effects') {
      toolPanel.innerHTML = `<div class="story-panel-head"><strong>AI Effects</strong><span>Preview filters</span></div><div class="story-chip-row">${FILTERS.map(([name, filter]) => `<button type="button" class="story-chip ${filter === state.filter ? 'active' : ''}" data-filter="${esc(filter)}">${esc(name)}</button>`).join('')}</div><div class="story-mini-grid"><button class="story-mini-button" id="story-effect-sharpen" type="button">Enhance</button><button class="story-mini-button" id="story-effect-glow" type="button">Glow</button><button class="story-mini-button" id="story-effect-clean" type="button">Clean</button></div>`;
      toolPanel.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; renderPreview(); buildToolPanel('effects'); saveDraft(state); }));
      ['story-effect-sharpen','story-effect-glow','story-effect-clean'].forEach((id) => toolPanel.querySelector(`#${id}`)?.addEventListener('click', () => setMessage('Effect preview applied.')));
      return;
    }
    if (tool === 'audio') {
      toolPanel.innerHTML = `<div class="story-panel-head"><strong>Music & Sound</strong><span>Local preview audio</span></div><div class="story-audio-row"><label class="story-file-input-label" for="story-audio-file">Choose Audio</label><span id="story-audio-name" class="grow">No audio selected</span></div><div class="story-field"><label>Volume</label><input id="story-audio-volume" type="range" min="0" max="1" step="0.05" value="0.75"></div><div class="story-chip-row"><button class="story-chip" type="button" data-tone="neon">Neon</button><button class="story-chip" type="button" data-tone="cinematic">Cinematic</button><button class="story-chip" type="button" data-tone="dream">Dream</button></div>`;
      toolPanel.querySelector('#story-audio-volume').addEventListener('input', (event) => { audioPreview.volume = Number(event.target.value); });
      toolPanel.querySelectorAll('[data-tone]').forEach((button) => button.addEventListener('click', () => setMessage(`${button.dataset.tone} sound preset selected for preview.`)));
      return;
    }
    if (tool === 'trim') {
      const duration = Number(video.duration) || 0;
      toolPanel.innerHTML = `<div class="story-panel-head"><strong>Trim & Speed</strong><span>Set the preview range</span></div><div class="story-field"><label>Start <b>${formatTime(state.trimStart)}</b></label><input id="story-trim-control" type="range" min="0" max="${Math.max(0.1, duration)}" step="0.1" value="${state.trimStart}"></div><div class="story-mini-grid"><button class="story-mini-button" data-trim="start">Start here</button><button class="story-mini-button" data-trim="end">End here</button><button class="story-mini-button" data-trim="reset">Reset</button></div>`;
      toolPanel.querySelector('#story-trim-control')?.addEventListener('input', (event) => { state.trimStart = Number(event.target.value); video.currentTime = state.trimStart; updateTimeline(); });
      toolPanel.querySelectorAll('[data-trim]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.trim === 'reset') state.trimStart = 0; else if (button.dataset.trim === 'start') state.trimStart = video.currentTime; else state.trimStart = Math.max(0, (video.duration || 0) - 3); video.currentTime = state.trimStart; updateTimeline(); buildToolPanel('trim'); saveDraft(state); }));
      return;
    }
    toolPanel.innerHTML = `
      <div class="story-panel-head"><strong>Canvas & Layout</strong><span>Story formats</span></div>
      <div class="story-mini-grid"><button type="button" class="story-mini-button ${state.crop === 'portrait' ? 'active' : ''}" data-crop="portrait">9:16 Portrait</button><button type="button" class="story-mini-button ${state.crop === 'square' ? 'active' : ''}" data-crop="square">1:1 Square</button><button type="button" class="story-mini-button ${state.crop === 'landscape' ? 'active' : ''}" data-crop="landscape">16:9 Wide</button></div>
      <div class="story-field"><label>Video fit</label><div class="story-mini-grid"><button type="button" class="story-mini-button ${state.crop === 'cover' ? 'active' : ''}" id="story-fit-cover">Fill Screen</button><button type="button" class="story-mini-button" id="story-fit-contain">Show Full Frame</button><button type="button" class="story-mini-button" id="story-fit-center">Center</button></div></div>
    `;
    toolPanel.querySelectorAll('[data-crop]').forEach((button) => button.addEventListener('click', () => { state.crop = button.dataset.crop; renderPreview(); buildToolPanel('canvas'); saveDraft(state); }));
    toolPanel.querySelector('#story-fit-cover')?.addEventListener('click', () => { state.crop = 'cover'; renderPreview(); buildToolPanel('canvas'); saveDraft(state); });
    toolPanel.querySelector('#story-fit-contain')?.addEventListener('click', () => { state.crop = 'portrait'; renderPreview(); buildToolPanel('canvas'); saveDraft(state); });
    toolPanel.querySelector('#story-fit-center')?.addEventListener('click', () => { video.style.objectPosition = 'center'; setMessage('Video centered.'); });
  }

  function updateTimeline() {
    const duration = Number(video.duration) || 0;
    durationLabel.textContent = formatTime(duration);
    timelineDuration.textContent = formatTime(duration);
    const now = Number(video.currentTime) || 0;
    currentTime.textContent = formatTime(now);
    trimStartLabel.textContent = formatTime(state.trimStart);
    trimEndLabel.textContent = formatTime(duration);
    trimStart.max = String(Math.max(0.1, duration));
    trimStart.value = String(Math.min(state.trimStart, duration || 0));
  }

  let playing = true;
  function setPlaying(next) {
    playing = next;
    if (playing) { video.play().catch(() => {}); playButton.textContent = '❚❚'; }
    else { video.pause(); playButton.textContent = '▶'; }
  }

  function makeDraggable(element, onMove, onEnd) {
    let dragging = false;
    const move = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const point = percentPoint(event.clientX, event.clientY, preview);
      element.style.left = `${point.x}%`;
      element.style.top = `${point.y}%`;
      onMove(point);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      onEnd?.();
    };
    element.addEventListener('pointerdown', (event) => {
      dragging = true;
      event.preventDefault();
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up, { once: true });
    });
  }

  const nameLabel = document.createElement('span');
  nameLabel.textContent = state.file?.name || 'No video selected';
  nameLabel.className = 'story-empty';

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) loadVideo(file);
  });
  app.querySelector('#story-choose-video').addEventListener('click', () => input.click());
  app.querySelector('#story-delete-draft').addEventListener('click', () => { clearDraft(); state.title='';state.stickerDataUrl='';state.emoji='';renderPreview();setMessage('Local draft cleared.');buildToolPanel(state.tool); });
  app.querySelector('#story-save-draft').addEventListener('click', () => { saveDraft(state); setMessage('Draft saved on this device.'); });
  app.querySelector('#story-reset').addEventListener('click', () => { state.title='';state.titleFont=FONT_OPTIONS[0][1];state.titleColor='#fff';state.titleSize=23;state.filter='none';state.crop='portrait';state.speed=1;state.stickerDataUrl='';state.emoji='';state.titleX=50;state.titleY=22;state.stickerX=50;state.stickerY=56;state.stickerScale=1;renderPreview();buildToolPanel('text');saveDraft(state);setMessage('Editor reset.'); });
  app.querySelector('#story-preview-toggle').addEventListener('click', () => { setPlaying(!playing); });
  app.querySelector('#story-mute-toggle').addEventListener('click', () => { video.muted = !video.muted; setMessage(video.muted ? 'Video muted.' : 'Video sound on.'); });

  app.querySelectorAll('.story-tool').forEach((button) => button.addEventListener('click', () => buildToolPanel(button.dataset.tool)));
  playButton.addEventListener('click', () => setPlaying(!playing));
  trimStart.addEventListener('input', () => { state.trimStart = Number(trimStart.value); video.currentTime = state.trimStart; updateTimeline(); saveDraft(state); });
  app.querySelectorAll('[data-speed]').forEach((button) => button.addEventListener('click', () => { state.speed = Number(button.dataset.speed); video.playbackRate = state.speed; app.querySelectorAll('[data-speed]').forEach((item) => item.classList.toggle('active', item === button)); renderPreview(); saveDraft(state); }));

  stickerInput.addEventListener('change', async () => {
    const file = stickerInput.files?.[0];
    if (!file) return;
    try { state.stickerDataUrl = await compressSticker(file); renderPreview(); saveDraft(state); setMessage('Sticker added. Drag it on the preview.'); } catch { setMessage('Could not load sticker.'); }
    stickerInput.value = '';
    buildToolPanel('stickers');
  });

  audioInput.addEventListener('change', () => {
    const file = audioInput.files?.[0];
    if (!file) return;
    if (state.audioObjectUrl) URL.revokeObjectURL(state.audioObjectUrl);
    state.audioObjectUrl = URL.createObjectURL(file);
    audioPreview.src = state.audioObjectUrl;
    audioPreview.volume = .75;
    audioPreview.play().catch(() => {});
    setMessage(`Audio preview playing: ${file.name}`);
    buildToolPanel('audio');
  });

  video.addEventListener('loadedmetadata', () => { updateTimeline(); if (state.trimStart > video.duration) state.trimStart = 0; buildToolPanel(state.tool); });
  video.addEventListener('timeupdate', () => { updateTimeline(); const duration = Number(video.duration)||0; if (duration && video.currentTime >= duration - 0.05) { video.currentTime = state.trimStart; video.play().catch(()=>{}); } });
  video.addEventListener('play', () => { playing=true; playButton.textContent='❚❚'; });
  video.addEventListener('pause', () => { playing=false; playButton.textContent='▶'; });

  makeDraggable(overlayTitle, (point) => { state.titleX=point.x;state.titleY=point.y; }, () => saveDraft(state));
  makeDraggable(overlaySticker, (point) => { state.stickerX=point.x;state.stickerY=point.y; }, () => saveDraft(state));
  makeDraggable(overlayEmoji, (point) => { state.stickerX=point.x;state.stickerY=point.y; }, () => saveDraft(state));

  publish.addEventListener('click', async () => {
    if (!(state.file instanceof File)) { setMessage('Choose a video first.'); return; }
    publish.disabled = true;
    setMessage('Preparing secure story upload...');
    try {
      await publishStory(state.file, (percent, text) => { setMessage(`${text} ${percent}%`); }, {
        title: state.title,
        titleFont: state.titleFont,
        titleX: state.titleX,
        titleY: state.titleY,
        crop: state.crop,
        stickerDataUrl: state.stickerDataUrl,
        stickerX: state.stickerX,
        stickerY: state.stickerY,
        stickerScale: state.stickerScale
      });
      clearDraft();
      try { sessionStorage.setItem('indo:story-published','1'); } catch {}
      setMessage('Story published successfully.');
      window.setTimeout(() => window.__indoNavigate?.('home'), 650);
    } catch (error) {
      publish.disabled = false;
      setMessage(error?.message || 'Story upload failed. Please try again.');
    }
  });

  app.querySelector('#story-cancel-draft').addEventListener('click', () => { if (state.objectUrl) URL.revokeObjectURL(state.objectUrl); if (state.audioObjectUrl) URL.revokeObjectURL(state.audioObjectUrl); window.__indoNavigate?.('home'); });

  window.addEventListener('beforeunload', () => { if (state.objectUrl) URL.revokeObjectURL(state.objectUrl); if (state.audioObjectUrl) URL.revokeObjectURL(state.audioObjectUrl); }, { once: true });

  buildToolPanel(state.tool);
  renderPreview();
  if (state.file instanceof File) loadVideo(state.file);
  else input.click();
  enableEditor();
}
