import { publishStory } from '../features/upload/story-publish.js';
import { icons } from '../data.js';

const DRAFT_FILE_KEY = '__indoStoryDraftFile';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[char]));
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

const FONT_OPTIONS = [
  { name: 'Sans', value: 'Arial, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'monospace' },
  { name: 'Cursive', value: 'cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Rounded', value: 'Trebuchet MS, sans-serif' }
];

function ensureStyles() {
  if (document.getElementById('indo-story-editor-v5')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-editor-v5';
  style.textContent = `
    .story-editor{padding:12px 12px 88px!important}
    .story-preview-wrap{position:relative;width:100%;max-width:420px;margin:0 auto 16px;display:flex;justify-content:center}
    .story-preview{position:relative;width:100%;max-width:390px;aspect-ratio:9/16;background:#000;border-radius:16px;overflow:hidden;border:1px solid #22232b;display:flex;align-items:center;justify-content:center;touch-action:none}
    .story-preview video{width:100%;height:100%;display:block;background:#000;object-position:center;object-fit:contain}
    .story-preview.crop-cover video{object-fit:cover}
    .story-preview.crop-square{aspect-ratio:1/1}.story-preview.crop-square video{object-fit:cover}
    .story-preview.crop-landscape{aspect-ratio:16/9}.story-preview.crop-landscape video{object-fit:cover}
    .story-element{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;cursor:grab;user-select:none;touch-action:none}
    .story-element:active{cursor:grabbing}
    .story-title-element{max-width:86%;padding:6px 12px;border-radius:8px;background:rgba(0,0,0,.34);color:#fff;font-size:22px;font-weight:900;text-align:center;white-space:pre-wrap;overflow:hidden;text-shadow:0 2px 8px rgba(0,0,0,.6);font-family:Arial,sans-serif}
    .story-title-input{position:absolute;z-index:12;min-width:72px;max-width:86%;padding:6px 12px;border:1px solid rgba(255,255,255,.45);border-radius:8px;outline:none;background:rgba(0,0,0,.48);color:#fff;font-size:22px;font-weight:900;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.6);font-family:Arial,sans-serif;transform:translate(-50%,-50%)}
    .story-font-picker{position:absolute;z-index:40;display:grid;gap:5px;width:150px;padding:8px;border:1px solid #30303a;border-radius:12px;background:rgba(12,12,18,.98);box-shadow:0 12px 34px rgba(0,0,0,.55)}
    .story-font-picker[hidden]{display:none}
    .story-font-picker button{height:34px;border:0;border-radius:8px;background:#20202a;color:#fff;text-align:left;padding:0 10px;cursor:pointer}
    .story-font-picker button.active{background:#7b3cff}
    .story-photo-element{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))}
    .story-emoji-element{font-size:58px;line-height:1;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))}
    .story-trash-zone{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:30;display:none;align-items:center;justify-content:center;gap:7px;min-width:150px;height:44px;padding:0 14px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(24,24,31,.94);color:#fff;font-size:13px;font-weight:800;box-shadow:0 10px 28px rgba(0,0,0,.55);pointer-events:none}
    .story-preview.is-dragging .story-trash-zone{display:flex}
    .story-preview.is-over-trash .story-trash-zone{background:#d83434;border-color:rgba(255,255,255,.45);transform:translateX(-50%) scale(1.04)}
    .story-add-button{position:absolute;right:12px;bottom:12px;z-index:20;width:48px;height:48px;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:rgba(20,20,27,.88);color:#fff;font-size:28px;font-weight:900;line-height:1;box-shadow:0 8px 24px rgba(0,0,0,.45);cursor:pointer}
    .story-add-panel{position:absolute;right:12px;bottom:68px;z-index:19;width:min(300px,calc(100% - 24px));padding:10px;border:0;border-radius:0;background:transparent;box-shadow:none;display:grid;gap:10px}
    .story-add-panel[hidden]{display:none}
    .story-add-panel label{font-size:12px;color:#aaa;display:grid;gap:6px}
    .story-add-panel select{height:40px;border:1px solid #2a2a32;border-radius:10px;background:#101016;color:#fff;padding:0 11px;outline:none}
    .story-add-panel .row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .story-add-panel button{height:40px;border:0;border-radius:10px;background:#24242d;color:#fff;font-weight:800;cursor:pointer}
    .story-add-panel .emoji-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px}
    .story-add-panel .emoji-grid button{height:34px;padding:0;font-size:20px;border:1px solid #292932;background:#17171f}
    .story-file-name{font-size:12px;color:#aaa;min-height:18px;margin:0 0 10px;display:none!important}
    .story-publish{width:100%;height:44px;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800}
    .story-publish:disabled{opacity:.55}
    .story-message{font-size:12px;color:#aaa;min-height:18px}
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

export function renderStoryCreate(app, draftFileOverride = null) {
  ensureStyles();
  const draftFile = draftFileOverride instanceof File ? draftFileOverride : (window[DRAFT_FILE_KEY] instanceof File ? window[DRAFT_FILE_KEY] : null);
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
        <div class="story-preview-wrap">
          <div id="story-preview" class="story-preview">
            <video id="story-preview-video" autoplay playsinline muted></video>
            <div id="story-trash-zone" class="story-trash-zone" aria-hidden="true">🗑️ Drag here to delete</div>
            <button id="story-add-button" class="story-add-button" type="button" aria-label="Add to story">+</button>
            <div id="story-add-panel" class="story-add-panel" hidden>
              <label>Crop<select id="story-crop"><option value="portrait">Portrait 9:16</option><option value="cover">Fill screen</option><option value="square">Square 1:1</option><option value="landscape">Landscape 16:9</option></select></label>
              <div class="row">
                <button id="story-sticker-select" type="button">Add photo</button>
                <button id="story-emoji-toggle" type="button">Add emoji</button>
              </div>
              <div id="story-emoji-picker" class="emoji-grid" hidden>
                <button type="button" data-emoji="❤️">❤️</button><button type="button" data-emoji="😂">😂</button><button type="button" data-emoji="😍">😍</button><button type="button" data-emoji="🔥">🔥</button><button type="button" data-emoji="👏">👏</button><button type="button" data-emoji="✨">✨</button><button type="button" data-emoji="😎">😎</button><button type="button" data-emoji="🥳">🥳</button>
              </div>
            </div>
            <div id="story-font-picker" class="story-font-picker" hidden></div>
          </div>
        </div>
        <div class="story-file-name" id="story-create-name">${draftFile ? escapeHtml(draftFile.name) : ''}</div>
        <button id="story-create-select" type="button" class="story-publish" hidden>Choose video</button>
        <button id="story-publish-button" type="button" class="story-publish" disabled>Publish story</button>
        <div id="story-create-message" class="story-message">Tap anywhere on the video to type a title.</div>
      </main>
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
  const trashZone = app.querySelector('#story-trash-zone');
  const addButton = app.querySelector('#story-add-button');
  const addPanel = app.querySelector('#story-add-panel');
  const cropInput = app.querySelector('#story-crop');
  const stickerButton = app.querySelector('#story-sticker-select');
  const emojiToggle = app.querySelector('#story-emoji-toggle');
  const emojiPicker = app.querySelector('#story-emoji-picker');
  const fontPicker = app.querySelector('#story-font-picker');
  const cancel = app.querySelector('#story-cancel-draft');

  let currentFile = draftFile;
  let objectUrl = '';
  let titleElement = null;
  let activeTitleInput = null;
  let currentTitleFont = FONT_OPTIONS[0].value;
  const photoElements = [];
  const emojiElements = [];

  const removeElement = (element) => {
    if (element === titleElement) {
      element.remove();
      titleElement = null;
      return;
    }
    const photoIndex = photoElements.findIndex((item) => item.element === element);
    if (photoIndex >= 0) {
      photoElements[photoIndex].element.remove();
      photoElements.splice(photoIndex, 1);
      return;
    }
    const emojiIndex = emojiElements.findIndex((item) => item.element === element);
    if (emojiIndex >= 0) {
      emojiElements[emojiIndex].element.remove();
      emojiElements.splice(emojiIndex, 1);
    }
  };

  const isOverTrash = (clientX, clientY) => {
    const rect = trashZone.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };

  const makeDraggable = (element, onMove) => {
    let dragging = false;
    const move = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const point = positionToPercent(event.clientX, event.clientY, preview);
      element.style.left = `${point.x}%`;
      element.style.top = `${point.y}%`;
      onMove(point);
      preview.classList.toggle('is-over-trash', isOverTrash(event.clientX, event.clientY));
    };
    const up = (event) => {
      if (!dragging) return;
      const deleteIt = isOverTrash(event.clientX, event.clientY);
      dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      preview.classList.remove('is-dragging', 'is-over-trash');
      if (deleteIt) {
        removeElement(element);
        message.textContent = 'Element removed.';
      }
    };
    element.addEventListener('pointerdown', (event) => {
      dragging = true;
      preview.classList.add('is-dragging');
      preview.classList.remove('is-over-trash');
      event.preventDefault();
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up, { once: true });
    });
  };

  const closeFontPicker = () => { fontPicker.hidden = true; };
  const applyTitleFont = (font) => {
    currentTitleFont = font;
    if (activeTitleInput) activeTitleInput.style.fontFamily = font;
    if (titleElement) titleElement.style.fontFamily = font;
    fontPicker.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.font === font));
  };
  const positionFloatingPanel = (panel, clientX, clientY) => {
    const rect = preview.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.width - 158, clientX - rect.left - 75));
    const y = Math.max(8, Math.min(rect.height - 120, clientY - rect.top - 56));
    panel.style.left = `${x}px`; panel.style.top = `${y}px`; panel.style.right = 'auto'; panel.style.bottom = 'auto';
  };
  const buildFontPicker = (clientX, clientY) => {
    const fonts = [
      ['Poppins','Poppins,sans-serif'],['Roboto','Roboto,sans-serif'],['Montserrat','Montserrat,sans-serif'],['Playfair Display','Playfair Display,serif'],['Lora','Lora,serif'],['Merriweather','Merriweather,serif'],['Oswald','Oswald,sans-serif'],['Bebas Neue','Bebas Neue,sans-serif'],['Pacifico','Pacifico,cursive'],['Lobster','Lobster,cursive'],['Comfortaa','Comfortaa,sans-serif'],['Raleway','Raleway,sans-serif'],['Abril Fatface','Abril Fatface,cursive'],['Dancing Script','Dancing Script,cursive'],['Bangers','Bangers,cursive'],['Permanent Marker','Permanent Marker,cursive'],['Anton','Anton,sans-serif'],['Satisfy','Satisfy,cursive'],['Caveat','Caveat,cursive'],['Quicksand','Quicksand,sans-serif']
    ];
    if (!document.getElementById('indo-story-fonts-v1')) {
      const link = document.createElement('link'); link.id='indo-story-fonts-v1'; link.rel='stylesheet';
      link.href='https://fonts.googleapis.com/css2?family=Anton&family=Abril+Fatface&family=Bangers&family=Bebas+Neue&family=Caveat:wght@400;600;700&family=Comfortaa:wght@400;600;700&family=Dancing+Script:wght@400;600;700&family=Lobster&family=Lora:wght@400;600;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700;800&family=Oswald:wght@400;500;600;700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&family=Quicksand:wght@400;600;700&family=Raleway:wght@400;600;700;800&family=Roboto:wght@400;500;700&family=Satisfy&display=swap';
      document.head.appendChild(link);
    }
    fontPicker.innerHTML = fonts.map(([name,value]) => `<button type="button" data-font="${escapeHtml(value)}" style="font-family:${value}">${escapeHtml(name)}</button>`).join('');
    fontPicker.querySelectorAll('button').forEach((button) => { button.classList.toggle('active', button.dataset.font===currentTitleFont); button.addEventListener('click',(event)=>{event.stopPropagation();applyTitleFont(button.dataset.font);closeFontPicker();}); });
    positionFloatingPanel(fontPicker,clientX,clientY); fontPicker.hidden=false;
    fontPicker.style.maxHeight='300px'; fontPicker.style.overflowY='auto'; fontPicker.style.overflowX='hidden';
  };
  const finishTitleInput = () => {
    if (!activeTitleInput) return;
    const value=activeTitleInput.value.trim(), left=activeTitleInput.style.left||'50%', top=activeTitleInput.style.top||'50%';
    activeTitleInput.remove(); const old=activeTitleInput; activeTitleInput=null; void old;
    if (!value) return;
    if (!titleElement) { titleElement=document.createElement('div'); titleElement.className='story-element story-title-element'; preview.appendChild(titleElement); makeDraggable(titleElement,(point)=>{titleElement.dataset.x=String(point.x);titleElement.dataset.y=String(point.y);}); }
    titleElement.textContent=value; titleElement.style.left=left; titleElement.style.top=top; titleElement.style.fontFamily=currentTitleFont; titleElement.dataset.font=currentTitleFont; titleElement.dataset.x=String(parseFloat(left)||50); titleElement.dataset.y=String(parseFloat(top)||50);
  };
  const startTitleInput = (clientX,clientY,existingValue='') => {
    closeFontPicker(); finishTitleInput(); const point=positionToPercent(clientX,clientY,preview); const field=document.createElement('input');
    field.type='text'; field.maxLength=80; field.value=existingValue; field.className='story-title-input'; field.style.left=`${point.x}%`; field.style.top=`${point.y}%`; field.style.fontFamily=titleElement?.style.fontFamily||currentTitleFont; preview.appendChild(field); activeTitleInput=field;
    requestAnimationFrame(()=>{field.focus();field.select();field.setSelectionRange(field.value.length,field.value.length);});
    field.addEventListener('input',()=>{message.textContent=field.value.trim()?'Tap the text to choose a font. Drag it to move.':'Type your story title.';});
    field.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();finishTitleInput();}if(event.key==='Escape'){event.preventDefault();field.remove();activeTitleInput=null;}});
    field.addEventListener('blur',()=>window.setTimeout(finishTitleInput,0),{once:true});
  };
  const updateTitleByClick=(event)=>{if(event.target.closest('.story-element,.story-add-button,.story-add-panel,.story-font-picker,.story-trash-zone'))return;startTitleInput(event.clientX,event.clientY);};
  preview.addEventListener('click',(event)=>{if(event.target.closest('.story-title-element')){const el=event.target.closest('.story-title-element');finishTitleInput();currentTitleFont=el.dataset.font||el.style.fontFamily||currentTitleFont;buildFontPicker(event.clientX,event.clientY);return;}updateTitleByClick(event);});
  const applyCrop=()=>{preview.classList.remove('crop-cover','crop-square','crop-landscape');if(cropInput.value==='cover')preview.classList.add('crop-cover');if(cropInput.value==='square')preview.classList.add('crop-square');if(cropInput.value==='landscape')preview.classList.add('crop-landscape');};
  const addPhoto=async(file)=>{if(!file)return;try{const dataUrl=await compressSticker(file);const image=document.createElement('img');image.src=dataUrl;image.alt='';image.className='story-element story-photo-element';image.style.left='50%';image.style.top='50%';const entry={element:image,dataUrl,x:50,y:50,scale:1};photoElements.push(entry);preview.appendChild(image);makeDraggable(image,(point)=>{entry.x=point.x;entry.y=point.y;});}catch{message.textContent='Could not add that photo.';}};
  addButton.addEventListener('click',(event)=>{event.stopPropagation();closeFontPicker();addPanel.hidden=!addPanel.hidden;if(addPanel.hidden)emojiPicker.hidden=true;});
  cropInput.addEventListener('change',applyCrop);
  stickerButton.addEventListener('click',(event)=>{event.stopPropagation();stickerInput.click();});
  stickerInput.addEventListener('change',async()=>{await addPhoto(stickerInput.files?.[0]);stickerInput.value='';});
  emojiToggle.addEventListener('click',(event)=>{event.stopPropagation();emojiPicker.hidden=!emojiPicker.hidden;});
  emojiPicker.addEventListener('click',(event)=>{const button=event.target.closest('[data-emoji]');if(!button)return;event.stopPropagation();const emoji=button.dataset.emoji||'';const node=document.createElement('div');node.className='story-element story-emoji-element';node.textContent=emoji;node.style.left='50%';node.style.top='50%';const entry={element:node,emoji,x:50,y:50};emojiElements.push(entry);preview.appendChild(node);makeDraggable(node,(point)=>{entry.x=point.x;entry.y=point.y;});emojiPicker.hidden=true;});
  preview.addEventListener('pointerdown',(event)=>{if(event.target.closest('.story-title-element,.story-photo-element,.story-emoji-element,.story-add-button,.story-add-panel,.story-font-picker,.story-trash-zone'))return;startTitleInput(event.clientX,event.clientY);});
  const setFile=(file)=>{if(!(file instanceof File)||!file.type.startsWith('video/')){message.textContent='Please select a video file.';return;}currentFile=file;window[DRAFT_FILE_KEY]=file;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);video.src=objectUrl;video.load();video.play().catch(()=>{});publish.disabled=false;message.textContent='Video ready. Tap the video to add a title.';};
  select.addEventListener('click',()=>input.click()); input.addEventListener('change',()=>setFile(input.files?.[0]));
  cancel.addEventListener('click',()=>{window[DRAFT_FILE_KEY]=null;if(objectUrl)URL.revokeObjectURL(objectUrl);window.__indoNavigate?.('home');});
  publish.addEventListener('click',async()=>{if(!currentFile)return;finishTitleInput();publish.disabled=true;addButton.disabled=true;message.textContent='Uploading story...';try{const elements=[...(titleElement?[{type:'title',text:titleElement.textContent||'',x:Number(titleElement.dataset.x||50),y:Number(titleElement.dataset.y||14),font:titleElement.dataset.font||currentTitleFont}]:[]),...photoElements.map(item=>({type:'photo',dataUrl:item.dataUrl,x:item.x,y:item.y,scale:item.scale})),...emojiElements.map(item=>({type:'emoji',emoji:item.emoji,x:item.x,y:item.y}))];await publishStory(currentFile,()=>({}),{title:titleElement?.textContent||'',titleFont:titleElement?.dataset.font||currentTitleFont,titleX:Number(titleElement?.dataset.x||50),titleY:Number(titleElement?.dataset.y||14),crop:cropInput.value,stickerDataUrl:photoElements[0]?.dataUrl||'',stickerX:photoElements[0]?.x??50,stickerY:photoElements[0]?.y??50,stickerScale:photoElements[0]?.scale??1,elements});window[DRAFT_FILE_KEY]=null;message.textContent='Story published successfully.';window.setTimeout(()=>window.__indoNavigate?.('home'),500);}catch(error){message.textContent=error?.message||'Story upload failed. Please try again.';publish.disabled=false;addButton.disabled=false;}});
  if(draftFile) setFile(draftFile); applyCrop();
}
