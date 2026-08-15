import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v6-separate-tools";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html,body,#root{height:100%;overflow:hidden!important}
    .indo-reel-v6{position:fixed;inset:0;width:100%;height:100dvh;overflow:hidden;background:radial-gradient(circle at 50% -10%,rgba(164,44,255,.18),transparent 30%),#030308;color:#fff}
    .indo-reel-v6 *{box-sizing:border-box}
    .indo-reel-v6-head{height:50px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:7px;padding:0 8px;background:rgba(4,4,10,.96);border-bottom:1px solid rgba(166,91,255,.18)}
    .indo-reel-v6-head button{height:31px;min-width:31px;border:1px solid rgba(186,102,255,.25);border-radius:999px;background:rgba(122,40,255,.1);color:#fff;display:grid;place-items:center}
    .indo-reel-v6-title{margin:0;text-align:center;font-size:15px;font-weight:900}
    .indo-reel-v6-next{height:29px!important;min-width:74px!important;padding:0 11px!important;background:linear-gradient(100deg,#773cff,#ee27bf)!important;border-color:rgba(255,255,255,.16)!important;font-size:9px!important;font-weight:900!important}
    .indo-reel-v6-main{height:calc(100dvh - 50px);padding:5px;overflow:hidden}
    .indo-reel-v6-stage-wrap{width:100%;height:100%;overflow:hidden;border:1px solid rgba(208,112,255,.34);border-radius:15px;padding:4px;background:linear-gradient(180deg,rgba(63,21,95,.24),rgba(7,7,13,.9));box-shadow:0 0 18px rgba(151,61,255,.08)}
    .indo-reel-v6-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:11px;background:#07070c;isolation:isolate}
    .indo-reel-v6-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}
    .indo-reel-v6-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.06),transparent 36%,transparent 60%,rgba(0,0,0,.28));z-index:2}
    .indo-reel-v6-empty{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;color:#8f8a9a;padding:16px;font-size:9px}
    .indo-reel-v6-empty strong{display:block;color:#fff;font-size:13px;margin-bottom:4px}
    .indo-reel-v6-sound{position:absolute;top:7px;left:50%;transform:translateX(-50%);z-index:8;height:27px;min-width:98px;padding:0 10px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(10,9,17,.76);color:#fff;backdrop-filter:blur(10px);font-size:8px;font-weight:850}
    .indo-reel-v6-tool-col{position:absolute;z-index:8;top:43px;display:flex;flex-direction:column;gap:4px}
    .indo-reel-v6-left{left:5px}.indo-reel-v6-right{right:5px}
    .indo-reel-v6-tool{width:43px;height:38px;border:1px solid rgba(255,255,255,.12);border-radius:11px;background:rgba(9,9,15,.72);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;backdrop-filter:blur(10px);font-size:6px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.18)}
    .indo-reel-v6-tool b{color:#f5a6ff;font-size:13px;line-height:1}
    .indo-reel-v6-tool.active{border-color:rgba(225,118,255,.85);background:linear-gradient(135deg,rgba(122,45,255,.28),rgba(237,43,191,.2));box-shadow:0 0 14px rgba(220,80,245,.22)}
    .indo-reel-v6-speed{position:absolute;left:50%;bottom:57px;transform:translateX(-50%);z-index:8;display:flex;gap:1px;padding:2px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(12,11,18,.78);backdrop-filter:blur(10px)}
    .indo-reel-v6-speed button{border:0;border-radius:999px;background:transparent;color:#ddd9e3;padding:4px 7px;font-size:7px;font-weight:800}
    .indo-reel-v6-speed button.active{background:linear-gradient(135deg,#ff39bb,#713cff);color:#fff}
    .indo-reel-v6-gallery,.indo-reel-v6-preview{position:absolute;bottom:7px;z-index:8;width:46px;height:46px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:rgba(10,10,16,.78);color:#fff;display:grid;place-items:center;backdrop-filter:blur(10px)}
    .indo-reel-v6-gallery{left:7px}.indo-reel-v6-preview{right:7px}
    .indo-reel-v6-record{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:9;width:58px;height:58px;border-radius:50%;border:5px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.1),0 0 20px rgba(244,43,189,.3)}
    .indo-reel-v6-record.recording{background:#ff263e}
    .indo-reel-v6-status{position:absolute;left:70px;right:70px;bottom:8px;z-index:11;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#d2cada;font-size:7px;text-align:center;pointer-events:none}
    .indo-reel-v6-hidden{display:none!important}
    @media(max-width:380px){.indo-reel-v6-tool{width:40px;height:36px;font-size:6px}.indo-reel-v6-tool b{font-size:12px}.indo-reel-v6-speed button{padding:4px 6px}.indo-reel-v6-record{width:54px;height:54px}}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-v6">
      <header class="indo-reel-v6-head">
        <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2 class="indo-reel-v6-title">Create Reel</h2>
        <button class="indo-reel-v6-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-v6-main">
        <section class="indo-reel-v6-stage-wrap">
          <div class="indo-reel-v6-stage" id="reel-stage">
            <div class="indo-reel-v6-empty" id="reel-empty"><div><strong>Camera ready</strong><span>Record a reel or choose one from Gallery.</span></div></div>
            <video id="reel-camera" playsinline muted class="indo-reel-v6-hidden"></video>
            <video id="reel-preview-video" playsinline controls class="indo-reel-v6-hidden"></video>

            <button class="indo-reel-v6-sound" id="reel-sound" type="button">♫ Add Sound</button>

            <div class="indo-reel-v6-tool-col indo-reel-v6-left">
              <button class="indo-reel-v6-tool" type="button" data-tool="Audio"><b>♫</b>Audio</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Effects"><b>✦</b>Effects</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Text"><b>Aa</b>Text</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Stickers"><b>◈</b>Stickers</button>
            </div>

            <div class="indo-reel-v6-tool-col indo-reel-v6-right">
              <button class="indo-reel-v6-tool" type="button" data-tool="Flip"><b>↻</b>Flip</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Grid"><b>▦</b>Grid</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Ratio"><b>9:16</b>Ratio</button>
              <button class="indo-reel-v6-tool" type="button" data-tool="Timer"><b>◷</b>Timer</button>
            </div>

            <div class="indo-reel-v6-speed" id="reel-speed">
              <button type="button">0.3x</button>
              <button class="active" type="button">1x</button>
              <button type="button">2x</button>
              <button type="button">3x</button>
            </div>

            <input id="reel-gallery-input" class="indo-reel-v6-hidden" type="file" accept="video/*">
            <button class="indo-reel-v6-gallery" id="reel-gallery" type="button" aria-label="Gallery">▧</button>
            <button class="indo-reel-v6-record" id="reel-record" type="button" aria-label="Record"></button>
            <button class="indo-reel-v6-preview" id="reel-preview" type="button" aria-label="Preview">▶</button>
            <div class="indo-reel-v6-status" id="reel-status"></div>
          </div>
        </section>
      </main>
    </div>`;

  const $ = (selector) => app.querySelector(selector);
  const camera = $("#reel-camera");
  const previewVideo = $("#reel-preview-video");
  const empty = $("#reel-empty");
  const record = $("#reel-record");
  const gallery = $("#reel-gallery");
  const galleryInput = $("#reel-gallery-input");
  const status = $("#reel-status");
  let stream = null;
  let recorder = null;
  let recordedChunks = [];
  let selectedFile = null;
  let objectUrl = "";

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    camera.classList.add("indo-reel-v6-hidden");
  };

  const showPreview = (url, autoplay = false) => {
    empty.classList.add("indo-reel-v6-hidden");
    previewVideo.classList.remove("indo-reel-v6-hidden");
    previewVideo.src = url;
    if (autoplay) previewVideo.play().catch(() => {});
  };

  const startCamera = async () => {
    try {
      stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      camera.srcObject = stream;
      camera.classList.remove("indo-reel-v6-hidden");
      empty.classList.add("indo-reel-v6-hidden");
      previewVideo.classList.add("indo-reel-v6-hidden");
      await camera.play();
      status.textContent = "Camera ready";
    } catch {
      status.textContent = "Camera unavailable — use Gallery";
    }
  };

  gallery.addEventListener("click", () => galleryInput.click());
  galleryInput.addEventListener("change", () => {
    const file = galleryInput.files?.[0];
    if (!file) return;
    stopCamera();
    selectedFile = file;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    showPreview(objectUrl, true);
    status.textContent = "Reel selected";
  });

  record.addEventListener("click", async () => {
    if (recorder?.state === "recording") {
      recorder.stop();
      record.classList.remove("recording");
      record.disabled = true;
      status.textContent = "Finishing recording...";
      return;
    }
    if (!stream) {
      await startCamera();
      if (!stream) return;
    }
    recordedChunks = [];
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? { mimeType: "video/webm;codecs=vp9,opus" } : undefined;
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: recorder.mimeType || "video/webm" });
      selectedFile = new File([blob], `indo-reel-${Date.now()}.webm`, { type: blob.type });
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(selectedFile);
      stopCamera();
      showPreview(objectUrl, false);
      record.disabled = false;
      status.textContent = "Reel ready";
    };
    recorder.start(250);
    record.classList.add("recording");
    status.textContent = "Recording... tap again to stop";
  });

  app.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      app.querySelectorAll("[data-tool]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const tool = button.dataset.tool;
      status.textContent = `${tool} selected`;
    });
  });

  $("#reel-speed").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      $("#reel-speed").querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      status.textContent = `Speed ${button.textContent}`;
    });
  });

  $("#reel-sound").addEventListener("click", () => { status.textContent = "Sound picker ready"; });

  $("#reel-preview").addEventListener("click", () => {
    if (previewVideo.src) previewVideo.play().catch(() => {});
    else status.textContent = "Record or choose a reel first";
  });

  $("#reel-next").addEventListener("click", async () => {
    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      status.textContent = "Record or choose a reel video first";
      return;
    }
    const title = window.prompt("Reel caption", "") ?? "";
    const tagsRaw = window.prompt("Hashtags (comma separated)", "") ?? "";
    const mention = window.prompt("Mention user ID", "") ?? "";
    const location = window.prompt("Location", "") ?? "";
    status.textContent = "Publishing reel...";
    const next = $("#reel-next");
    next.disabled = true;
    try {
      await uploadReel(selectedFile, {
        title: title.trim().slice(0, 100) || "Reel",
        caption: title.trim().slice(0, 500),
        description: title.trim().slice(0, 500),
        tags: tagsRaw.split(",").map((x) => x.trim().replace(/^#/, "")).filter(Boolean).slice(0, 20),
        mention: mention.trim().replace(/^@/, "").slice(0, 80),
        location: location.trim().slice(0, 120),
        onProgress: (_, text) => { status.textContent = text; },
      });
      status.textContent = "Reel published";
      setTimeout(() => window.__indoNavigate?.("reels"), 500);
    } catch (error) {
      status.textContent = error?.message || "Could not publish reel";
      next.disabled = false;
    }
  });

  app.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      stopCamera();
      window.__indoNavigate?.(button.dataset.screen);
    });
  });

  startCamera();
}
