import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v4-one-screen";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html,body,#root{height:100%;overflow:hidden!important}
    .indo-reel-create-v4{position:fixed;inset:0;width:100%;height:100dvh;overflow:hidden;background:radial-gradient(circle at 50% -10%,rgba(164,44,255,.18),transparent 30%),#030308;color:#fff}
    .indo-reel-create-v4 *{box-sizing:border-box}
    .indo-reel-v4-head{height:50px;min-height:50px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:7px;padding:0 8px;background:rgba(4,4,10,.96);border-bottom:1px solid rgba(166,91,255,.18);z-index:20}
    .indo-reel-v4-head button{height:31px;min-width:31px;border:1px solid rgba(186,102,255,.25);border-radius:999px;background:rgba(122,40,255,.10);color:#fff;display:grid;place-items:center}
    .indo-reel-v4-title{margin:0;text-align:center;font-size:15px;font-weight:900}
    .indo-reel-v4-next{height:29px!important;min-width:74px!important;padding:0 11px!important;background:linear-gradient(100deg,#773cff,#ee27bf)!important;border-color:rgba(255,255,255,.16)!important;font-size:9px!important;font-weight:900!important}
    .indo-reel-v4-main{height:calc(100dvh - 50px);display:grid;grid-template-rows:minmax(0,1fr) 98px;gap:5px;padding:5px;overflow:hidden}
    .indo-reel-v4-stage-wrap{min-height:0;overflow:hidden;border:1px solid rgba(208,112,255,.34);border-radius:15px;padding:4px;background:linear-gradient(180deg,rgba(63,21,95,.24),rgba(7,7,13,.9));box-shadow:0 0 18px rgba(151,61,255,.08)}
    .indo-reel-v4-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:11px;background:#07070c;isolation:isolate}
    .indo-reel-v4-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}
    .indo-reel-v4-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.06),transparent 36%,transparent 60%,rgba(0,0,0,.28));z-index:2}
    .indo-reel-v4-empty{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;color:#8f8a9a;padding:16px;font-size:9px}
    .indo-reel-v4-empty strong{display:block;color:#fff;font-size:13px;margin-bottom:4px}
    .indo-reel-v4-sound{position:absolute;top:7px;left:50%;transform:translateX(-50%);z-index:8;height:27px;min-width:98px;padding:0 10px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(10,9,17,.72);color:#fff;backdrop-filter:blur(10px);font-size:8px;font-weight:850}
    .indo-reel-v4-edit{position:absolute;top:7px;right:7px;z-index:9;height:29px;min-width:68px;padding:0 10px;border:1px solid rgba(240,125,255,.75);border-radius:999px;background:rgba(22,10,34,.78);color:#fff;box-shadow:0 0 14px rgba(231,73,218,.22);font-size:9px;font-weight:900;backdrop-filter:blur(10px)}
    .indo-reel-v4-left,.indo-reel-v4-right{position:absolute;z-index:8;top:43px;display:flex;flex-direction:column;gap:4px}
    .indo-reel-v4-left{left:5px}.indo-reel-v4-right{right:5px}
    .indo-reel-v4-tool{width:39px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(9,9,15,.68);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;backdrop-filter:blur(10px);font-size:6px;font-weight:700}
    .indo-reel-v4-tool b{color:#f5a6ff;font-size:12px;line-height:1}
    .indo-reel-v4-speed{position:absolute;left:50%;bottom:56px;transform:translateX(-50%);z-index:8;display:flex;gap:1px;padding:2px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(12,11,18,.76);backdrop-filter:blur(10px)}
    .indo-reel-v4-speed button{border:0;border-radius:999px;background:transparent;color:#ddd9e3;padding:4px 7px;font-size:7px;font-weight:800}
    .indo-reel-v4-speed button.active{background:linear-gradient(135deg,#ff39bb,#713cff);color:#fff}
    .indo-reel-v4-gallery,.indo-reel-v4-preview{position:absolute;bottom:7px;z-index:8;width:44px;height:44px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:rgba(10,10,16,.76);color:#fff;display:grid;place-items:center;backdrop-filter:blur(10px);overflow:hidden}
    .indo-reel-v4-gallery{left:7px}.indo-reel-v4-preview{right:7px}
    .indo-reel-v4-record{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:9;width:56px;height:56px;border-radius:50%;border:5px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.10),0 0 18px rgba(244,43,189,.30)}
    .indo-reel-v4-record.recording{background:#ff263e}
    .indo-reel-v4-status{position:absolute;left:8px;right:8px;bottom:5px;z-index:11;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#c6c0ce;font-size:6px;text-align:center;pointer-events:none}
    .indo-reel-v4-bottom{height:98px;min-height:98px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(9,9,14,.97);overflow:hidden;box-shadow:0 7px 16px rgba(0,0,0,.24);display:grid;grid-template-rows:45px 31px 22px}
    .indo-reel-v4-caption{width:100%;height:45px;padding:8px 10px;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:#fff;outline:none;resize:none;font-size:9px}
    .indo-reel-v4-caption::placeholder{color:#777381}
    .indo-reel-v4-meta{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid rgba(255,255,255,.06)}
    .indo-reel-v4-meta button{border:0;border-right:1px solid rgba(255,255,255,.06);background:transparent;color:#d6d1dc;font-size:7px;font-weight:750}
    .indo-reel-v4-meta button:last-child{border-right:0}
    .indo-reel-v4-publish-row{display:flex;align-items:center;justify-content:flex-end;padding:0 6px}
    .indo-reel-v4-publish{height:19px;min-width:88px;padding:0 9px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:linear-gradient(100deg,#773cff,#ee27bf);color:#fff;font-size:7px;font-weight:900}
    .indo-reel-v4-hidden{display:none!important}

    .indo-reel-edit-modal{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;padding:7px;background:rgba(0,0,0,.78);backdrop-filter:blur(14px);overflow:hidden}
    .indo-reel-edit-card{width:min(100%,520px);height:min(96dvh,760px);display:grid;grid-template-rows:42px minmax(0,1fr) 50px 74px 36px;border:1px solid rgba(221,121,255,.4);border-radius:16px;background:linear-gradient(180deg,#0e0b15,#08080d);box-shadow:0 18px 60px rgba(0,0,0,.65);overflow:hidden}
    .indo-reel-edit-head{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:6px;padding:0 8px;border-bottom:1px solid rgba(255,255,255,.08)}
    .indo-reel-edit-head h3{margin:0;text-align:center;font-size:14px;font-weight:900}
    .indo-reel-edit-close,.indo-reel-edit-save{height:28px;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:#fff;font-size:8px;font-weight:900}
    .indo-reel-edit-close{width:30px;background:rgba(255,255,255,.05)}
    .indo-reel-edit-save{min-width:62px;padding:0 9px;background:linear-gradient(100deg,#743cff,#ec29be)}
    .indo-reel-edit-preview{min-height:0;padding:7px;position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.07)}
    .indo-reel-edit-preview video{width:100%;height:100%;object-fit:contain;background:#000;border-radius:10px;display:block}
    .indo-reel-edit-time{position:absolute;right:12px;bottom:12px;padding:4px 6px;border-radius:6px;background:rgba(0,0,0,.65);font-size:7px;color:#fff}
    .indo-reel-edit-timeline{padding:6px 9px;border-bottom:1px solid rgba(255,255,255,.07);display:grid;grid-template-rows:22px 16px;gap:4px;background:#0a0910}
    .indo-reel-edit-strip{position:relative;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:linear-gradient(90deg,rgba(135,64,255,.3),rgba(255,54,188,.18));}
    .indo-reel-edit-strip::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 24px,rgba(255,255,255,.08) 25px 26px)}
    .indo-reel-edit-handle{position:absolute;top:0;bottom:0;width:7px;background:#fff;border-radius:7px;box-shadow:0 0 10px rgba(255,255,255,.7)}
    .indo-reel-edit-handle.left{left:10%}.indo-reel-edit-handle.right{right:10%}
    .indo-reel-edit-range{width:100%;accent-color:#c348ff}
    .indo-reel-edit-tools{padding:6px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:31px 31px;gap:4px;background:#09090e}
    .indo-reel-edit-tool{border:1px solid rgba(255,255,255,.08);border-radius:8px;background:#12111a;color:#ddd8e4;font-size:7px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
    .indo-reel-edit-tool b{font-size:12px;color:#d08cff}
    .indo-reel-edit-tool.active{background:linear-gradient(135deg,rgba(134,59,255,.28),rgba(238,43,188,.20));border-color:rgba(218,112,255,.55);color:#fff}
    .indo-reel-edit-controls{padding:5px 8px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;background:#08080d;border-top:1px solid rgba(255,255,255,.06)}
    .indo-reel-edit-control{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:4px;color:#aaa3b4;font-size:6px}
    .indo-reel-edit-control input{width:100%;height:3px}
    .indo-reel-edit-footer{display:flex;align-items:center;justify-content:space-between;padding:0 9px;border-top:1px solid rgba(255,255,255,.08);background:#09080f}
    .indo-reel-edit-footer span{font-size:7px;color:#8f8998;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .indo-reel-edit-reset{height:24px;min-width:58px;border:1px solid rgba(255,255,255,.10);border-radius:999px;background:#15131b;color:#ddd7e3;font-size:7px;font-weight:800}
    @media(max-width:380px){.indo-reel-v4-main{grid-template-rows:minmax(0,1fr) 94px}.indo-reel-v4-bottom{height:94px;min-height:94px;grid-template-rows:42px 30px 22px}.indo-reel-v4-caption{height:42px}.indo-reel-edit-card{height:97dvh}.indo-reel-edit-tools{grid-template-rows:29px 29px}.indo-reel-edit-control{grid-template-columns:30px 1fr}}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-create-v4">
      <header class="indo-reel-v4-head">
        <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2 class="indo-reel-v4-title">Create Reel</h2>
        <button class="indo-reel-v4-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-v4-main">
        <section class="indo-reel-v4-stage-wrap"><div class="indo-reel-v4-stage" id="reel-stage">
          <div class="indo-reel-v4-empty" id="reel-empty"><div><strong>Camera ready</strong><span>Record a reel or choose one from Gallery.</span></div></div>
          <video id="reel-camera" playsinline muted class="indo-reel-v4-hidden"></video>
          <video id="reel-preview-video" playsinline controls class="indo-reel-v4-hidden"></video>
          <button class="indo-reel-v4-sound" id="reel-sound" type="button">♫ Add Sound</button>
          <button class="indo-reel-v4-edit" id="reel-edit" type="button">✎ Edit</button>
          <div class="indo-reel-v4-left"><button class="indo-reel-v4-tool" type="button" data-demo="Audio"><b>♫</b>Audio</button><button class="indo-reel-v4-tool" type="button" data-demo="Effects"><b>✦</b>Effects</button><button class="indo-reel-v4-tool" type="button" data-demo="Text"><b>Aa</b>Text</button><button class="indo-reel-v4-tool" type="button" data-demo="Stickers"><b>◈</b>Stickers</button></div>
          <div class="indo-reel-v4-right"><button class="indo-reel-v4-tool" type="button" data-demo="Flip"><b>↻</b>Flip</button><button class="indo-reel-v4-tool" type="button" data-demo="Grid"><b>▦</b>Grid</button><button class="indo-reel-v4-tool" type="button" data-demo="Ratio"><b>9:16</b>Ratio</button><button class="indo-reel-v4-tool" type="button" data-demo="Timer"><b>◷</b>Timer</button></div>
          <div class="indo-reel-v4-speed" id="reel-speed"><button type="button">0.3x</button><button class="active" type="button">1x</button><button type="button">2x</button><button type="button">3x</button></div>
          <input id="reel-gallery-input" class="indo-reel-v4-hidden" type="file" accept="video/*">
          <button class="indo-reel-v4-gallery" id="reel-gallery" type="button" aria-label="Gallery">▧</button><button class="indo-reel-v4-record" id="reel-record" type="button" aria-label="Record"></button><button class="indo-reel-v4-preview" id="reel-preview" type="button" aria-label="Preview">▶</button>
          <div class="indo-reel-v4-status" id="reel-status"></div>
        </div></section>
        <section class="indo-reel-v4-bottom"><textarea id="reel-caption" class="indo-reel-v4-caption" maxlength="500" placeholder="Write a caption..."></textarea><div class="indo-reel-v4-meta"><button type="button" id="reel-hashtags"># Hashtags</button><button type="button" id="reel-mention">@ Mention</button><button type="button" id="reel-location">⌖ Location</button></div><div class="indo-reel-v4-publish-row"><button class="indo-reel-v4-publish" id="reel-publish" type="button">Publish Reel →</button></div></section>
      </main>
    </div>`;

  const $ = (s) => app.querySelector(s);
  const camera = $("#reel-camera");
  const previewVideo = $("#reel-preview-video");
  const empty = $("#reel-empty");
  const record = $("#reel-record");
  const gallery = $("#reel-gallery");
  const galleryInput = $("#reel-gallery-input");
  const status = $("#reel-status");
  const publish = $("#reel-publish");
  let stream = null, recorder = null, recordedChunks = [], selectedFile = null, objectUrl = "", hashtags = [], mention = "", location = "";
  let editVideo = null, editModal = null;

  const stopCamera = () => { stream?.getTracks().forEach((track) => track.stop()); stream = null; camera.classList.add("indo-reel-v4-hidden"); };
  const showPreview = (url, autoplay = false) => { empty.classList.add("indo-reel-v4-hidden"); previewVideo.classList.remove("indo-reel-v4-hidden"); previewVideo.src = url; if (autoplay) previewVideo.play().catch(() => {}); };
  const startCamera = async () => {
    try { stopCamera(); stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true}); camera.srcObject = stream; camera.classList.remove("indo-reel-v4-hidden"); empty.classList.add("indo-reel-v4-hidden"); previewVideo.classList.add("indo-reel-v4-hidden"); await camera.play(); status.textContent = "Camera ready"; }
    catch { status.textContent = "Camera unavailable — use Gallery"; }
  };

  function openEditModal() {
    if (!selectedFile && !previewVideo.src && !stream) { status.textContent = "Record or choose a reel first"; return; }
    editModal?.remove();
    editModal = document.createElement("div");
    editModal.className = "indo-reel-edit-modal";
    editModal.innerHTML = `
      <section class="indo-reel-edit-card" role="dialog" aria-modal="true" aria-label="Edit video">
        <header class="indo-reel-edit-head"><button class="indo-reel-edit-close" type="button" aria-label="Close">×</button><h3>Edit Video</h3><button class="indo-reel-edit-save" type="button">Save</button></header>
        <div class="indo-reel-edit-preview"><video id="indo-edit-video" playsinline controls></video><span class="indo-reel-edit-time">00:05 / 00:30</span></div>
        <div class="indo-reel-edit-timeline"><div class="indo-reel-edit-strip"><i class="indo-reel-edit-handle left"></i><i class="indo-reel-edit-handle right"></i></div><input id="indo-edit-range" class="indo-reel-edit-range" type="range" min="0" max="100" value="100"></div>
        <div class="indo-reel-edit-tools"><button class="indo-reel-edit-tool active" data-edit="Trim"><b>✂</b>Trim</button><button class="indo-reel-edit-tool" data-edit="Crop"><b>□</b>Crop</button><button class="indo-reel-edit-tool" data-edit="Filters"><b>◉</b>Filters</button><button class="indo-reel-edit-tool" data-edit="Adjust"><b>☷</b>Adjust</button><button class="indo-reel-edit-tool" data-edit="Speed"><b>◔</b>Speed</button><button class="indo-reel-edit-tool" data-edit="Music"><b>♫</b>Music</button><button class="indo-reel-edit-tool" data-edit="Text"><b>Aa</b>Text</button><button class="indo-reel-edit-tool" data-edit="Sticker"><b>☺</b>Sticker</button><button class="indo-reel-edit-tool" data-edit="Overlay"><b>▣</b>Overlay</button><button class="indo-reel-edit-tool" data-edit="Cover"><b>▤</b>Cover</button></div>
        <div class="indo-reel-edit-controls"><label class="indo-reel-edit-control">Brightness<input data-adjust="brightness" type="range" min="60" max="140" value="100"></label><label class="indo-reel-edit-control">Contrast<input data-adjust="contrast" type="range" min="60" max="140" value="100"></label><label class="indo-reel-edit-control">Saturate<input data-adjust="saturate" type="range" min="60" max="140" value="100"></label></div>
        <footer class="indo-reel-edit-footer"><span id="indo-edit-status">Trim selected</span><button class="indo-reel-edit-reset" type="button">Reset</button></footer>
      </section>`;
    document.body.appendChild(editModal);
    editVideo = editModal.querySelector("#indo-edit-video");
    if (selectedFile && objectUrl) { editVideo.src = objectUrl; }
    else if (stream) { editVideo.srcObject = stream; }
    editVideo.play().catch(() => {});

    const applyFilters = () => {
      const b = Number(editModal.querySelector('[data-adjust="brightness"]').value) / 100;
      const c = Number(editModal.querySelector('[data-adjust="contrast"]').value) / 100;
      const s = Number(editModal.querySelector('[data-adjust="saturate"]').value) / 100;
      editVideo.style.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
    };
    editModal.querySelectorAll("[data-adjust]").forEach((input) => input.addEventListener("input", applyFilters));
    editModal.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => {
      editModal.querySelectorAll("[data-edit]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const name = button.dataset.edit;
      editModal.querySelector("#indo-edit-status").textContent = `${name} selected`;
      if (name === "Speed") editVideo.playbackRate = editVideo.playbackRate === 1 ? 1.25 : 1;
      if (name === "Filters") editVideo.style.filter = "saturate(1.35) contrast(1.08)";
      if (name === "Crop") editVideo.style.objectFit = editVideo.style.objectFit === "cover" ? "contain" : "cover";
      if (name === "Music" || name === "Text" || name === "Sticker" || name === "Overlay" || name === "Cover") status.textContent = `${name} tool selected`;
    }));
    editModal.querySelector("#indo-edit-range").addEventListener("input", (e) => {
      editModal.querySelector("#indo-edit-status").textContent = `Trim ${e.target.value}%`;
    });
    editModal.querySelector(".indo-reel-edit-close").addEventListener("click", closeEditModal);
    editModal.querySelector(".indo-reel-edit-reset").addEventListener("click", () => { editVideo.style.filter = "none"; editVideo.style.objectFit = "contain"; editVideo.playbackRate = 1; editModal.querySelectorAll("[data-adjust]").forEach((input) => input.value = 100); editModal.querySelector("#indo-edit-status").textContent = "Edits reset"; });
    editModal.querySelector(".indo-reel-edit-save").addEventListener("click", () => { status.textContent = "Edits saved"; closeEditModal(); });
  }

  function closeEditModal() { editModal?.remove(); editModal = null; editVideo = null; }

  gallery.addEventListener("click", () => galleryInput.click());
  galleryInput.addEventListener("change", () => { const file = galleryInput.files?.[0]; if (!file) return; stopCamera(); selectedFile = file; if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = URL.createObjectURL(file); showPreview(objectUrl,true); status.textContent = "Reel selected"; });
  record.addEventListener("click", async () => {
    if (recorder?.state === "recording") { recorder.stop(); record.classList.remove("recording"); record.disabled = true; status.textContent = "Finishing..."; return; }
    if (!stream) { await startCamera(); if (!stream) return; }
    recordedChunks = [];
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? {mimeType:"video/webm;codecs=vp9,opus"} : undefined;
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
    recorder.onstop = () => { const blob = new Blob(recordedChunks,{type:recorder.mimeType || "video/webm"}); selectedFile = new File([blob],`indo-reel-${Date.now()}.webm`,{type:blob.type}); if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = URL.createObjectURL(selectedFile); stopCamera(); showPreview(objectUrl,false); record.disabled = false; status.textContent = "Reel ready — add caption"; };
    recorder.start(250); record.classList.add("recording"); status.textContent = "Recording... tap again to stop";
  });

  $("#reel-edit").addEventListener("click", openEditModal);
  $("#reel-preview").addEventListener("click", () => { if (previewVideo.src) previewVideo.play().catch(() => {}); else status.textContent = "Record or choose a reel first"; });
  $("#reel-next").addEventListener("click", () => publish.click());
  $("#reel-sound").addEventListener("click", () => { status.textContent = "Sound picker ready"; });
  app.querySelectorAll("[data-demo]").forEach((button) => button.addEventListener("click", () => { status.textContent = `${button.dataset.demo} selected`; }));
  app.querySelectorAll("#reel-speed button").forEach((button) => button.addEventListener("click", () => { app.querySelectorAll("#reel-speed button").forEach((b) => b.classList.remove("active")); button.classList.add("active"); if (previewVideo.src) previewVideo.playbackRate = Number(button.textContent.replace("x", "")); status.textContent = `Speed ${button.textContent}`; }));
  $("#reel-hashtags").addEventListener("click", () => { const raw = window.prompt("Hashtags: separate with commas", hashtags.join(", ")); if (raw === null) return; hashtags = raw.split(",").map((x) => x.trim().replace(/^#/, "")).filter(Boolean).slice(0,20); status.textContent = hashtags.length ? hashtags.map((x) => `#${x}`).join(" ") : "Hashtags cleared"; });
  $("#reel-mention").addEventListener("click", () => { const raw = window.prompt("Mention user ID", mention); if (raw === null) return; mention = raw.trim().replace(/^@/,"").slice(0,80); status.textContent = mention ? `@${mention}` : "Mention cleared"; });
  $("#reel-location").addEventListener("click", () => { const raw = window.prompt("Location", location); if (raw === null) return; location = raw.trim().slice(0,120); status.textContent = location || "Location cleared"; });
  app.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); closeEditModal(); stopCamera(); window.__indoNavigate?.(button.dataset.screen); }));

  async function publishReel() {
    if (!selectedFile || !selectedFile.type.startsWith("video/")) { status.textContent = "Record or choose a reel video first"; return; }
    const caption = $("#reel-caption").value.trim();
    publish.disabled = true; $("#reel-next").disabled = true; status.textContent = "Publishing reel...";
    try {
      await uploadReel(selectedFile,{title:caption.slice(0,100)||"Reel",caption,description:caption,tags:hashtags,location,mention,onProgress:(_,text)=>{status.textContent=text;}});
      status.textContent = "Reel published — opening Reels";
      setTimeout(() => window.__indoNavigate?.("reels"), 500);
    } catch(error) { status.textContent = error?.message || "Could not publish reel"; publish.disabled = false; $("#reel-next").disabled = false; }
  }
  publish.addEventListener("click", publishReel);
  startCamera();
}
