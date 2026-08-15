import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v2-one-screen";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html,body,#root{height:100%;overflow:hidden!important}
    .indo-reel-create-v2{position:fixed;inset:0;width:100%;height:100dvh;overflow:hidden;background:radial-gradient(circle at 50% -10%,rgba(164,44,255,.20),transparent 32%),#030308;color:#fff;box-sizing:border-box}
    .indo-reel-create-v2 *{box-sizing:border-box}
    .indo-reel-v2-head{height:56px;min-height:56px;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:8px;padding:0 10px;background:rgba(4,4,10,.94);border-bottom:1px solid rgba(166,91,255,.18);backdrop-filter:blur(16px);position:relative;z-index:20}
    .indo-reel-v2-back{width:36px;height:36px;border-radius:50%;border:1px solid rgba(186,102,255,.25);background:rgba(122,40,255,.10);color:#fff;display:grid;place-items:center}
    .indo-reel-v2-title{margin:0;text-align:center;font-size:17px;font-weight:900;letter-spacing:.1px}
    .indo-reel-v2-next{height:34px;min-width:90px;padding:0 15px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:linear-gradient(100deg,#773cff,#ee27bf);color:#fff;font-size:11px;font-weight:900;box-shadow:0 0 16px rgba(193,58,243,.24)}
    .indo-reel-v2-main{height:calc(100dvh - 56px);display:grid;grid-template-rows:minmax(0,1fr) auto;gap:8px;padding:8px;overflow:hidden}
    .indo-reel-v2-stage-wrap{min-height:0;position:relative;border:1px solid rgba(208,112,255,.34);border-radius:18px;padding:6px;background:linear-gradient(180deg,rgba(63,21,95,.28),rgba(7,7,13,.9));box-shadow:0 0 24px rgba(151,61,255,.10)}
    .indo-reel-v2-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:14px;background:#07070c;isolation:isolate}
    .indo-reel-v2-stage video,.indo-reel-v2-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}
    .indo-reel-v2-stage::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.12),transparent 35%,transparent 58%,rgba(0,0,0,.34));z-index:2}
    .indo-reel-v2-empty{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;color:#8f8a9a;padding:24px;font-size:11px}
    .indo-reel-v2-empty strong{display:block;color:#fff;font-size:15px;margin-bottom:4px}
    .indo-reel-v2-sound{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;height:31px;min-width:118px;padding:0 13px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(10,9,17,.72);color:#fff;backdrop-filter:blur(12px);font-size:10px;font-weight:850}
    .indo-reel-v2-left-tools,.indo-reel-v2-right-tools{position:absolute;z-index:8;top:50px;display:flex;flex-direction:column;gap:6px}
    .indo-reel-v2-left-tools{left:8px}.indo-reel-v2-right-tools{right:8px}
    .indo-reel-v2-tool{width:46px;height:42px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:rgba(9,9,15,.70);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;backdrop-filter:blur(12px);font-size:8px;font-weight:700}
    .indo-reel-v2-tool b{color:#f5a6ff;font-size:15px;line-height:1}
    .indo-reel-v2-speed{position:absolute;left:50%;bottom:72px;transform:translateX(-50%);z-index:8;display:flex;gap:2px;padding:3px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(12,11,18,.76);backdrop-filter:blur(12px)}
    .indo-reel-v2-speed button{border:0;border-radius:999px;background:transparent;color:#ddd9e3;padding:7px 10px;font-size:9px;font-weight:800}
    .indo-reel-v2-speed button.active{background:linear-gradient(135deg,#ff39bb,#713cff);color:#fff}
    .indo-reel-v2-gallery,.indo-reel-v2-preview{position:absolute;bottom:12px;z-index:8;width:52px;height:52px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(10,10,16,.76);color:#fff;display:grid;place-items:center;backdrop-filter:blur(12px);overflow:hidden}
    .indo-reel-v2-gallery{left:12px}.indo-reel-v2-preview{right:12px}
    .indo-reel-v2-gallery img{width:100%;height:100%;object-fit:cover}
    .indo-reel-v2-record{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:9;width:66px;height:66px;border-radius:50%;border:6px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.10),0 0 24px rgba(244,43,189,.34)}
    .indo-reel-v2-record.recording{background:#ff263e;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 0 28px rgba(255,40,60,.36)}
    .indo-reel-v2-bottom{height:126px;min-height:126px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(9,9,14,.96);overflow:hidden;box-shadow:0 10px 22px rgba(0,0,0,.24)}
    .indo-reel-v2-caption{width:100%;height:58px;padding:12px 13px;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:#fff;outline:none;resize:none;font-size:12px}
    .indo-reel-v2-caption::placeholder{color:#777381}
    .indo-reel-v2-meta{height:41px;display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid rgba(255,255,255,.06)}
    .indo-reel-v2-meta button{border:0;border-right:1px solid rgba(255,255,255,.06);background:transparent;color:#d6d1dc;font-size:9px;font-weight:750}.indo-reel-v2-meta button:last-child{border-right:0}
    .indo-reel-v2-status{position:absolute;left:14px;right:14px;bottom:11px;z-index:11;max-width:calc(100% - 28px);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#c6c0ce;font-size:8px;pointer-events:none}
    .indo-reel-v2-hidden{display:none!important}
    @media(max-width:380px){.indo-reel-v2-main{padding:6px;gap:6px}.indo-reel-v2-bottom{height:118px;min-height:118px}.indo-reel-v2-caption{height:54px;font-size:11px}.indo-reel-v2-meta{height:39px}.indo-reel-v2-tool{width:42px;height:39px;font-size:7px}.indo-reel-v2-tool b{font-size:14px}.indo-reel-v2-record{width:60px;height:60px}.indo-reel-v2-gallery,.indo-reel-v2-preview{width:48px;height:48px}.indo-reel-v2-speed button{padding:6px 8px;font-size:8px}}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-create-v2">
      <header class="indo-reel-v2-head">
        <button class="indo-reel-v2-back" type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2 class="indo-reel-v2-title">Create Reel</h2>
        <button class="indo-reel-v2-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-v2-main">
        <section class="indo-reel-v2-stage-wrap">
          <div class="indo-reel-v2-stage" id="reel-stage">
            <div class="indo-reel-v2-empty" id="reel-empty"><div><strong>Camera ready</strong><span>Record a reel or choose one from Gallery.</span></div></div>
            <video id="reel-camera" playsinline muted class="indo-reel-v2-hidden"></video>
            <video id="reel-preview-video" playsinline controls class="indo-reel-v2-hidden"></video>
            <img id="reel-preview-image" alt="Selected reel preview" class="indo-reel-v2-hidden">
            <button class="indo-reel-v2-sound" type="button" id="reel-sound">♫ Add Sound</button>
            <div class="indo-reel-v2-left-tools">
              <button class="indo-reel-v2-tool" type="button" data-demo="Audio"><b>♫</b>Audio</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Effects"><b>✦</b>Effects</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Text"><b>Aa</b>Text</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Stickers"><b>◈</b>Stickers</button>
            </div>
            <div class="indo-reel-v2-right-tools">
              <button class="indo-reel-v2-tool" type="button" data-demo="Flip"><b>↻</b>Flip</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Grid"><b>▦</b>Grid</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Ratio"><b>9:16</b>Ratio</button>
              <button class="indo-reel-v2-tool" type="button" data-demo="Timer"><b>◷</b>Timer</button>
            </div>
            <div class="indo-reel-v2-speed" id="reel-speed"><button type="button">0.3x</button><button type="button" class="active">1x</button><button type="button">2x</button><button type="button">3x</button></div>
            <input id="reel-gallery-input" class="indo-reel-v2-hidden" type="file" accept="video/*">
            <button class="indo-reel-v2-gallery" type="button" id="reel-gallery" aria-label="Gallery">▧</button>
            <button class="indo-reel-v2-record" type="button" id="reel-record" aria-label="Record"></button>
            <button class="indo-reel-v2-preview" type="button" id="reel-preview" aria-label="Preview">▶</button>
            <div class="indo-reel-v2-status" id="reel-status"></div>
          </div>
        </section>
        <section class="indo-reel-v2-bottom">
          <textarea id="reel-caption" class="indo-reel-v2-caption" maxlength="500" placeholder="Write a caption..."></textarea>
          <div class="indo-reel-v2-meta"><button type="button" id="reel-hashtags"># Hashtags</button><button type="button" id="reel-mention">@ Mention</button><button type="button" id="reel-location">⌖ Location</button></div>
          <div style="height:27px;display:flex;align-items:center;justify-content:flex-end;padding:0 9px"><button class="indo-reel-v2-next" id="reel-publish" type="button" style="height:28px;min-width:100px;font-size:9px">Publish Reel →</button></div>
        </section>
      </main>
    </div>`;

  const $ = (selector) => app.querySelector(selector);
  const camera = $("#reel-camera");
  const previewVideo = $("#reel-preview-video");
  const previewImage = $("#reel-preview-image");
  const empty = $("#reel-empty");
  const record = $("#reel-record");
  const gallery = $("#reel-gallery");
  const galleryInput = $("#reel-gallery-input");
  const status = $("#reel-status");
  const publish = $("#reel-publish");
  let stream = null;
  let recorder = null;
  let recordedChunks = [];
  let selectedFile = null;
  let objectUrl = "";
  let hashtags = [];
  let mention = "";
  let location = "";

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    camera.classList.add("indo-reel-v2-hidden");
  }

  function showPreview(url, autoplay = false) {
    empty.classList.add("indo-reel-v2-hidden");
    previewImage.classList.add("indo-reel-v2-hidden");
    previewVideo.classList.remove("indo-reel-v2-hidden");
    previewVideo.src = url;
    previewVideo.controls = true;
    if (autoplay) previewVideo.play().catch(() => {});
  }

  async function startCamera() {
    try {
      stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});
      camera.srcObject = stream;
      camera.classList.remove("indo-reel-v2-hidden");
      empty.classList.add("indo-reel-v2-hidden");
      previewVideo.classList.add("indo-reel-v2-hidden");
      previewImage.classList.add("indo-reel-v2-hidden");
      await camera.play();
      status.textContent = "Camera ready";
    } catch {
      status.textContent = "Camera unavailable — use Gallery";
    }
  }

  function chooseGallery(file) {
    if (!file) return;
    stopCamera();
    selectedFile = file;
    objectUrl && URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    showPreview(objectUrl, true);
    status.textContent = "Reel selected";
  }

  async function toggleRecording() {
    if (recorder?.state === "recording") {
      recorder.stop();
      record.classList.remove("recording");
      record.disabled = true;
      status.textContent = "Finishing...";
      return;
    }
    if (!stream) {
      await startCamera();
      if (!stream) return;
    }
    recordedChunks = [];
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? {mimeType:"video/webm;codecs=vp9,opus"} : undefined;
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks,{type:recorder.mimeType||"video/webm"});
      selectedFile = new File([blob],`indo-reel-${Date.now()}.webm`,{type:blob.type});
      objectUrl && URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(selectedFile);
      stopCamera();
      showPreview(objectUrl,false);
      record.disabled = false;
      status.textContent = "Reel ready — add caption";
    };
    recorder.start(250);
    record.classList.add("recording");
    status.textContent = "Recording... tap again to stop";
  }

  app.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click",(event)=>{
    event.preventDefault();event.stopPropagation();stopCamera();window.__indoNavigate?.(button.dataset.screen);
  }));

  gallery.addEventListener("click",()=>galleryInput.click());
  galleryInput.addEventListener("change",()=>chooseGallery(galleryInput.files?.[0]));
  record.addEventListener("click",toggleRecording);

  $("#reel-preview").addEventListener("click",()=>{ if(previewVideo.src) previewVideo.play().catch(()=>{}); else status.textContent="Record or choose a reel first"; });
  $("#reel-next").addEventListener("click",()=>publish.click());
  $("#reel-sound").addEventListener("click",()=>{status.textContent="Sound picker ready";});

  app.querySelectorAll("[data-demo]").forEach((button)=>button.addEventListener("click",()=>{status.textContent=`${button.dataset.demo} selected`;}));
  app.querySelectorAll("#reel-speed button").forEach((button)=>button.addEventListener("click",()=>{
    app.querySelectorAll("#reel-speed button").forEach((item)=>item.classList.remove("active"));
    button.classList.add("active");
    status.textContent=`Speed ${button.textContent}`;
  }));

  $("#reel-hashtags").addEventListener("click",()=>{
    const raw=window.prompt("Hashtags: separate with commas",hashtags.join(", "));if(raw===null)return;
    hashtags=raw.split(",").map((x)=>x.trim().replace(/^#/ ,"")).filter(Boolean).slice(0,20);
    status.textContent=hashtags.length?hashtags.map((x)=>`#${x}`).join(" "):"Hashtags cleared";
  });
  $("#reel-mention").addEventListener("click",()=>{
    const raw=window.prompt("Mention user ID",mention);if(raw===null)return;
    mention=raw.trim().replace(/^@/,"").slice(0,80);status.textContent=mention?`@${mention}`:"Mention cleared";
  });
  $("#reel-location").addEventListener("click",()=>{
    const raw=window.prompt("Location",location);if(raw===null)return;
    location=raw.trim().slice(0,120);status.textContent=location||"Location cleared";
  });

  async function publishReel() {
    if(!selectedFile||!selectedFile.type.startsWith("video/")){status.textContent="Record or choose a reel video first";return;}
    const caption=$("#reel-caption").value.trim();
    publish.disabled=true;$("#reel-next").disabled=true;status.textContent="Publishing reel...";
    try {
      await uploadReel(selectedFile,{title:caption.slice(0,100)||"Reel",caption,description:caption,tags:hashtags,location,mention,onProgress:(_,text)=>{status.textContent=text;}});
      status.textContent="Reel published — opening Reels";
      setTimeout(()=>window.__indoNavigate?.("reels"),500);
    } catch(error) {
      status.textContent=error?.message||"Could not publish reel";
      publish.disabled=false;$("#reel-next").disabled=false;
    }
  }

  publish.addEventListener("click",publishReel);
  startCamera();
}
