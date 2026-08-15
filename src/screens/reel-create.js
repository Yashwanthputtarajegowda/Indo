import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v5-unified-popup";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html,body,#root{height:100%;overflow:hidden!important}
    .indo-reel-v5{position:fixed;inset:0;width:100%;height:100dvh;overflow:hidden;background:radial-gradient(circle at 50% -10%,rgba(164,44,255,.18),transparent 30%),#030308;color:#fff}
    .indo-reel-v5 *{box-sizing:border-box}
    .indo-reel-v5-head{height:50px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:7px;padding:0 8px;background:rgba(4,4,10,.96);border-bottom:1px solid rgba(166,91,255,.18)}
    .indo-reel-v5-head button{height:31px;min-width:31px;border:1px solid rgba(186,102,255,.25);border-radius:999px;background:rgba(122,40,255,.1);color:#fff;display:grid;place-items:center}
    .indo-reel-v5-title{margin:0;text-align:center;font-size:15px;font-weight:900}
    .indo-reel-v5-next{height:29px!important;min-width:74px!important;padding:0 11px!important;background:linear-gradient(100deg,#773cff,#ee27bf)!important;border-color:rgba(255,255,255,.16)!important;font-size:9px!important;font-weight:900!important}
    .indo-reel-v5-main{height:calc(100dvh - 50px);padding:5px;overflow:hidden}
    .indo-reel-v5-stage-wrap{width:100%;height:100%;overflow:hidden;border:1px solid rgba(208,112,255,.34);border-radius:15px;padding:4px;background:linear-gradient(180deg,rgba(63,21,95,.24),rgba(7,7,13,.9));box-shadow:0 0 18px rgba(151,61,255,.08)}
    .indo-reel-v5-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:11px;background:#07070c;isolation:isolate}
    .indo-reel-v5-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}
    .indo-reel-v5-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.06),transparent 36%,transparent 60%,rgba(0,0,0,.28));z-index:2}
    .indo-reel-v5-empty{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;color:#8f8a9a;padding:16px;font-size:9px}
    .indo-reel-v5-empty strong{display:block;color:#fff;font-size:13px;margin-bottom:4px}
    .indo-reel-v5-sound,.indo-reel-v5-edit{position:absolute;top:7px;z-index:8;height:27px;padding:0 10px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(10,9,17,.76);color:#fff;backdrop-filter:blur(10px);font-size:8px;font-weight:850}
    .indo-reel-v5-sound{left:50%;transform:translateX(-50%);min-width:98px}
    .indo-reel-v5-edit{right:7px;min-width:68px;border-color:rgba(240,125,255,.75);box-shadow:0 0 14px rgba(231,73,218,.22)}
    .indo-reel-v5-left,.indo-reel-v5-right{position:absolute;z-index:8;top:43px;display:flex;flex-direction:column;gap:4px}
    .indo-reel-v5-left{left:5px}.indo-reel-v5-right{right:5px}
    .indo-reel-v5-tool{width:39px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(9,9,15,.68);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;backdrop-filter:blur(10px);font-size:6px;font-weight:700}
    .indo-reel-v5-tool b{color:#f5a6ff;font-size:12px;line-height:1}
    .indo-reel-v5-speed{position:absolute;left:50%;bottom:56px;transform:translateX(-50%);z-index:8;display:flex;gap:1px;padding:2px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(12,11,18,.76)}
    .indo-reel-v5-speed button{border:0;border-radius:999px;background:transparent;color:#ddd9e3;padding:4px 7px;font-size:7px;font-weight:800}
    .indo-reel-v5-speed button.active{background:linear-gradient(135deg,#ff39bb,#713cff);color:#fff}
    .indo-reel-v5-gallery,.indo-reel-v5-preview{position:absolute;bottom:7px;z-index:8;width:44px;height:44px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:rgba(10,10,16,.76);color:#fff;display:grid;place-items:center}
    .indo-reel-v5-gallery{left:7px}.indo-reel-v5-preview{right:7px}
    .indo-reel-v5-record{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:9;width:56px;height:56px;border-radius:50%;border:5px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.1),0 0 18px rgba(244,43,189,.3)}
    .indo-reel-v5-record.recording{background:#ff263e}
    .indo-reel-v5-status{position:absolute;left:8px;right:8px;bottom:5px;z-index:11;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#c6c0ce;font-size:6px;text-align:center}
    .indo-reel-v5-hidden{display:none!important}

    .indo-reel-popup{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;padding:6px;background:rgba(0,0,0,.78);backdrop-filter:blur(14px);overflow:hidden}
    .indo-reel-popup-card{width:min(100%,520px);height:min(96dvh,760px);display:grid;grid-template-rows:40px minmax(0,1fr) 50px 52px 36px;border:1px solid rgba(221,121,255,.42);border-radius:16px;background:linear-gradient(180deg,#0e0b15,#08080d);box-shadow:0 18px 60px rgba(0,0,0,.65);overflow:hidden}
    .indo-reel-popup-head{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:6px;padding:0 8px;border-bottom:1px solid rgba(255,255,255,.08)}
    .indo-reel-popup-head h3{margin:0;text-align:center;font-size:13px;font-weight:900}
    .indo-reel-popup-close,.indo-reel-popup-save{height:26px;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:#fff;font-size:8px;font-weight:900}
    .indo-reel-popup-close{width:28px;background:rgba(255,255,255,.05)}
    .indo-reel-popup-save{min-width:60px;padding:0 8px;background:linear-gradient(100deg,#743cff,#ec29be)}
    .indo-reel-popup-preview{min-height:0;padding:6px;position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.07)}
    .indo-reel-popup-preview video{width:100%;height:100%;object-fit:contain;background:#000;border-radius:10px;display:block}
    .indo-reel-popup-time{position:absolute;right:11px;bottom:10px;padding:4px 6px;border-radius:6px;background:rgba(0,0,0,.65);font-size:7px}
    .indo-reel-popup-timeline{padding:5px 8px;display:grid;grid-template-rows:19px 13px;gap:3px;background:#0a0910;border-bottom:1px solid rgba(255,255,255,.07)}
    .indo-reel-popup-strip{position:relative;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:linear-gradient(90deg,rgba(135,64,255,.3),rgba(255,54,188,.18))}
    .indo-reel-popup-strip:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 24px,rgba(255,255,255,.08) 25px 26px)}
    .indo-reel-popup-handle{position:absolute;top:0;bottom:0;width:7px;background:#fff;border-radius:7px;box-shadow:0 0 10px rgba(255,255,255,.7)}
    .indo-reel-popup-handle.left{left:10%}.indo-reel-popup-handle.right{right:10%}
    .indo-reel-popup-range{width:100%;accent-color:#c348ff}
    .indo-reel-popup-tools{padding:5px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:26px 26px;gap:4px;background:#09090e}
    .indo-reel-popup-tool{border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#12111a;color:#ddd8e4;font-size:7px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
    .indo-reel-popup-tool b{font-size:11px;color:#d08cff}
    .indo-reel-popup-tool.active{background:linear-gradient(135deg,rgba(134,59,255,.28),rgba(238,43,188,.2));border-color:rgba(218,112,255,.55);color:#fff}
    .indo-reel-popup-details{padding:5px 7px;display:grid;grid-template-columns:1.3fr .9fr .9fr .9fr;gap:4px;background:#08080d;border-top:1px solid rgba(255,255,255,.06)}
    .indo-reel-popup-caption{width:100%;height:34px;padding:6px 7px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:#111019;color:#fff;outline:none;resize:none;font-size:7px}
    .indo-reel-popup-caption::placeholder{color:#777381}
    .indo-reel-popup-meta{height:34px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:#111019;color:#d6d1dc;font-size:6px;font-weight:750}
    .indo-reel-popup-footer{display:grid;grid-template-columns:1fr 1.7fr;gap:6px;align-items:center;padding:0 8px;border-top:1px solid rgba(255,255,255,.08);background:#09080f}
    .indo-reel-popup-reset{height:23px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:#15131b;color:#ddd7e3;font-size:7px;font-weight:800}
    .indo-reel-popup-publish{height:27px;border:0;border-radius:999px;background:linear-gradient(100deg,#743cff,#ec29be);color:#fff;font-size:8px;font-weight:900}
    @media(max-width:380px){.indo-reel-popup-card{height:97dvh;grid-template-rows:38px minmax(0,1fr) 47px 50px 34px}.indo-reel-popup-tools{grid-template-rows:24px 24px}.indo-reel-popup-caption,.indo-reel-popup-meta{height:31px;font-size:6px}}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-v5">
      <header class="indo-reel-v5-head">
        <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2 class="indo-reel-v5-title">Create Reel</h2>
        <button class="indo-reel-v5-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-v5-main">
        <section class="indo-reel-v5-stage-wrap"><div class="indo-reel-v5-stage" id="reel-stage">
          <div class="indo-reel-v5-empty" id="reel-empty"><div><strong>Camera ready</strong><span>Record a reel or choose one from Gallery.</span></div></div>
          <video id="reel-camera" playsinline muted class="indo-reel-v5-hidden"></video>
          <video id="reel-preview-video" playsinline controls class="indo-reel-v5-hidden"></video>
          <button class="indo-reel-v5-sound" id="reel-sound" type="button">♫ Add Sound</button>
          <button class="indo-reel-v5-edit" id="reel-edit" type="button">✎ Edit</button>
          <div class="indo-reel-v5-left"><button class="indo-reel-v5-tool" type="button" data-demo="Audio"><b>♫</b>Audio</button><button class="indo-reel-v5-tool" type="button" data-demo="Effects"><b>✦</b>Effects</button><button class="indo-reel-v5-tool" type="button" data-demo="Text"><b>Aa</b>Text</button><button class="indo-reel-v5-tool" type="button" data-demo="Stickers"><b>◈</b>Stickers</button></div>
          <div class="indo-reel-v5-right"><button class="indo-reel-v5-tool" type="button" data-demo="Flip"><b>↻</b>Flip</button><button class="indo-reel-v5-tool" type="button" data-demo="Grid"><b>▦</b>Grid</button><button class="indo-reel-v5-tool" type="button" data-demo="Ratio"><b>9:16</b>Ratio</button><button class="indo-reel-v5-tool" type="button" data-demo="Timer"><b>◷</b>Timer</button></div>
          <div class="indo-reel-v5-speed" id="reel-speed"><button type="button">0.3x</button><button class="active" type="button">1x</button><button type="button">2x</button><button type="button">3x</button></div>
          <input id="reel-gallery-input" class="indo-reel-v5-hidden" type="file" accept="video/*">
          <button class="indo-reel-v5-gallery" id="reel-gallery" type="button" aria-label="Gallery">▧</button>
          <button class="indo-reel-v5-record" id="reel-record" type="button" aria-label="Record"></button>
          <button class="indo-reel-v5-preview" id="reel-preview" type="button" aria-label="Preview">▶</button>
          <div class="indo-reel-v5-status" id="reel-status"></div>
        </div></section>
      </main>
    </div>`;

  const $ = (selector) => app.querySelector(selector);
  const camera = $("#reel-camera");
  const previewVideo = $("#reel-preview-video");
  const empty = $("#reel-empty");
  const record = $("#reel-record");
  const galleryInput = $("#reel-gallery-input");
  const status = $("#reel-status");
  let stream = null;
  let recorder = null;
  let recordedChunks = [];
  let selectedFile = null;
  let objectUrl = "";
  let hashtags = [];
  let mention = "";
  let location = "";
  let activeTool = "Trim";

  function stopCamera(){stream?.getTracks().forEach((track)=>track.stop());stream=null;camera.classList.add("indo-reel-v5-hidden");}
  function showPreview(url,autoplay=false){empty.classList.add("indo-reel-v5-hidden");previewVideo.classList.remove("indo-reel-v5-hidden");previewVideo.src=url;if(autoplay)previewVideo.play().catch(()=>{});}
  async function startCamera(){try{stopCamera();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});camera.srcObject=stream;camera.classList.remove("indo-reel-v5-hidden");empty.classList.add("indo-reel-v5-hidden");previewVideo.classList.add("indo-reel-v5-hidden");await camera.play();status.textContent="Camera ready";}catch{status.textContent="Camera unavailable — use Gallery";}}
  function chooseGallery(file){if(!file)return;stopCamera();selectedFile=file;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);showPreview(objectUrl,true);status.textContent="Reel selected";}
  async function toggleRecording(){if(recorder?.state==="recording"){recorder.stop();record.classList.remove("recording");record.disabled=true;status.textContent="Finishing...";return;}if(!stream){await startCamera();if(!stream)return;}recordedChunks=[];const options=MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?{mimeType:"video/webm;codecs=vp9,opus"}:undefined;recorder=new MediaRecorder(stream,options);recorder.ondataavailable=(e)=>{if(e.data?.size)recordedChunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(recordedChunks,{type:recorder.mimeType||"video/webm"});selectedFile=new File([blob],`indo-reel-${Date.now()}.webm`,{type:blob.type});if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(selectedFile);stopCamera();showPreview(objectUrl,false);record.disabled=false;status.textContent="Reel ready";};recorder.start(250);record.classList.add("recording");status.textContent="Recording... tap again to stop";}

  function openEditor(){
    if(!selectedFile&&!previewVideo.src&&!stream){status.textContent="Record or choose a reel first";return;}
    const modal=document.createElement("div");modal.className="indo-reel-popup";
    modal.innerHTML=`<section class="indo-reel-popup-card" role="dialog" aria-modal="true"><header class="indo-reel-popup-head"><button class="indo-reel-popup-close" id="popup-close" type="button">×</button><h3>Edit Reel</h3><button class="indo-reel-popup-save" id="popup-save" type="button">Save</button></header><div class="indo-reel-popup-preview"><video id="popup-video" playsinline controls src="${previewVideo.src||objectUrl||""}"></video><span class="indo-reel-popup-time">Preview</span></div><div class="indo-reel-popup-timeline"><div class="indo-reel-popup-strip"><span class="indo-reel-popup-handle left"></span><span class="indo-reel-popup-handle right"></span></div><input class="indo-reel-popup-range" id="popup-range" type="range" min="0" max="100" value="100"></div><div class="indo-reel-popup-tools">${[["Trim","✂"],["Crop","⌗"],["Filters","◉"],["Adjust","☼"],["Speed","⌁"],["Music","♫"],["Text","Aa"],["Sticker","☺"],["Overlay","▧"],["Cover","▣"]].map(([n,i])=>`<button class="indo-reel-popup-tool${n===activeTool?" active":""}" type="button" data-edit-tool="${n}"><b>${i}</b>${n}</button>`).join("")}</div><div class="indo-reel-popup-details"><textarea id="popup-caption" class="indo-reel-popup-caption" maxlength="500" placeholder="Write a caption..."></textarea><button class="indo-reel-popup-meta" id="popup-hashtags" type="button"># Tags</button><button class="indo-reel-popup-meta" id="popup-mention" type="button">@ Mention</button><button class="indo-reel-popup-meta" id="popup-location" type="button">⌖ Location</button></div><footer class="indo-reel-popup-footer"><button class="indo-reel-popup-reset" id="popup-reset" type="button">Reset</button><button class="indo-reel-popup-publish" id="popup-publish" type="button">Publish Reel →</button></footer></section>`;
    document.body.appendChild(modal);
    const popupVideo=modal.querySelector("#popup-video");
    const close=()=>modal.remove();
    modal.querySelector("#popup-close").addEventListener("click",close);
    modal.addEventListener("click",(e)=>{if(e.target===modal)close()});
    popupVideo.play().catch(()=>{});
    modal.querySelectorAll("[data-edit-tool]").forEach((button)=>button.addEventListener("click",()=>{activeTool=button.dataset.editTool;modal.querySelectorAll("[data-edit-tool]").forEach(b=>b.classList.toggle("active",b===button));popupVideo.style.filter=activeTool==="Filters"?"saturate(1.25) contrast(1.08)":"none";}));
    modal.querySelector("#popup-range").addEventListener("input",(e)=>{if(popupVideo.duration)popupVideo.currentTime=(Number(e.target.value)/100)*popupVideo.duration;});
    modal.querySelector("#popup-hashtags").addEventListener("click",()=>{const raw=window.prompt("Hashtags: separate with commas",hashtags.join(", "));if(raw===null)return;hashtags=raw.split(",").map(x=>x.trim().replace(/^#/u,"")).filter(Boolean).slice(0,20);modal.querySelector("#popup-hashtags").textContent=hashtags.length?`# ${hashtags.length} tags`:"# Tags";});
    modal.querySelector("#popup-mention").addEventListener("click",()=>{const raw=window.prompt("Mention user ID",mention);if(raw===null)return;mention=raw.trim().replace(/^@/u,"").slice(0,80);modal.querySelector("#popup-mention").textContent=mention?`@ ${mention}`:"@ Mention";});
    modal.querySelector("#popup-location").addEventListener("click",()=>{const raw=window.prompt("Location",location);if(raw===null)return;location=raw.trim().slice(0,120);modal.querySelector("#popup-location").textContent=location?`⌖ ${location}`:"⌖ Location";});
    modal.querySelector("#popup-reset").addEventListener("click",()=>{activeTool="Trim";modal.querySelectorAll("[data-edit-tool]").forEach(b=>b.classList.toggle("active",b.dataset.editTool==="Trim"));popupVideo.style.filter="none";modal.querySelector("#popup-range").value="100";});
    const save=()=>{modal.remove();status.textContent="Changes saved";};
    modal.querySelector("#popup-save").addEventListener("click",save);
    modal.querySelector("#popup-publish").addEventListener("click",async()=>{if(!selectedFile||!selectedFile.type.startsWith("video/")){status.textContent="Record or choose a reel first";return;}const caption=modal.querySelector("#popup-caption").value.trim();const button=modal.querySelector("#popup-publish");button.disabled=true;button.textContent="Publishing...";try{await uploadReel(selectedFile,{title:caption.slice(0,100)||"Reel",caption,description:caption,tags:hashtags,location,mention,onProgress:(_,text)=>{button.textContent=text||"Publishing...";}});modal.remove();status.textContent="Reel published successfully";setTimeout(()=>window.__indoNavigate?.("reels"),500);}catch(error){button.disabled=false;button.textContent="Publish Reel →";status.textContent=error?.message||"Could not publish reel";}});
  }

  $("#reel-gallery").addEventListener("click",()=>galleryInput.click());
  galleryInput.addEventListener("change",()=>chooseGallery(galleryInput.files?.[0]));
  record.addEventListener("click",toggleRecording);
  $("#reel-preview").addEventListener("click",()=>{if(previewVideo.src)previewVideo.play().catch(()=>{});else status.textContent="Record or choose a reel first";});
  $("#reel-edit").addEventListener("click",openEditor);
  $("#reel-next").addEventListener("click",openEditor);
  $("#reel-sound").addEventListener("click",()=>{status.textContent="Sound picker ready";});
  app.querySelectorAll("[data-demo]").forEach((b)=>b.addEventListener("click",()=>{status.textContent=`${b.dataset.demo} selected`;}));
  app.querySelectorAll("#reel-speed button").forEach((b)=>b.addEventListener("click",()=>{app.querySelectorAll("#reel-speed button").forEach(x=>x.classList.remove("active"));b.classList.add("active");status.textContent=`Speed ${b.textContent}`;}));
  app.querySelectorAll("[data-screen]").forEach((button)=>button.addEventListener("click",(e)=>{e.preventDefault();e.stopPropagation();stopCamera();window.__indoNavigate?.(button.dataset.screen);}));
  startCamera();
}
