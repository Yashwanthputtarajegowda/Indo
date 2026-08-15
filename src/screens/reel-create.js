import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v3-one-screen";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html,body,#root{height:100%;overflow:hidden!important}
    .indo-reel-create-v3{position:fixed;inset:0;width:100%;height:100dvh;overflow:hidden;background:radial-gradient(circle at 50% -10%,rgba(164,44,255,.18),transparent 30%),#030308;color:#fff}
    .indo-reel-create-v3 *{box-sizing:border-box}
    .indo-reel-v3-head{height:52px;min-height:52px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:7px;padding:0 8px;background:rgba(4,4,10,.95);border-bottom:1px solid rgba(166,91,255,.18);z-index:20}
    .indo-reel-v3-head button{height:32px;min-width:32px;border:1px solid rgba(186,102,255,.25);border-radius:999px;background:rgba(122,40,255,.10);color:#fff;display:grid;place-items:center}
    .indo-reel-v3-title{margin:0;text-align:center;font-size:16px;font-weight:900}
    .indo-reel-v3-next{height:30px!important;min-width:76px!important;padding:0 12px!important;background:linear-gradient(100deg,#773cff,#ee27bf)!important;border-color:rgba(255,255,255,.16)!important;font-size:10px!important;font-weight:900!important}
    .indo-reel-v3-main{height:calc(100dvh - 52px);display:grid;grid-template-rows:minmax(0,1fr) 104px;gap:6px;padding:6px;overflow:hidden}
    .indo-reel-v3-stage-wrap{min-height:0;overflow:hidden;border:1px solid rgba(208,112,255,.34);border-radius:16px;padding:5px;background:linear-gradient(180deg,rgba(63,21,95,.24),rgba(7,7,13,.9));box-shadow:0 0 20px rgba(151,61,255,.08)}
    .indo-reel-v3-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:12px;background:#07070c;isolation:isolate}
    .indo-reel-v3-stage video,.indo-reel-v3-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#000}
    .indo-reel-v3-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08),transparent 36%,transparent 60%,rgba(0,0,0,.30));z-index:2}
    .indo-reel-v3-empty{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;color:#8f8a9a;padding:18px;font-size:10px}
    .indo-reel-v3-empty strong{display:block;color:#fff;font-size:14px;margin-bottom:4px}
    .indo-reel-v3-sound{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:8;height:28px;min-width:102px;padding:0 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(10,9,17,.72);color:#fff;backdrop-filter:blur(10px);font-size:9px;font-weight:850}
    .indo-reel-v3-left,.indo-reel-v3-right{position:absolute;z-index:8;top:44px;display:flex;flex-direction:column;gap:5px}
    .indo-reel-v3-left{left:6px}.indo-reel-v3-right{right:6px}
    .indo-reel-v3-tool{width:40px;height:36px;border:1px solid rgba(255,255,255,.12);border-radius:11px;background:rgba(9,9,15,.68);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;backdrop-filter:blur(10px);font-size:7px;font-weight:700}
    .indo-reel-v3-tool b{color:#f5a6ff;font-size:13px;line-height:1}
    .indo-reel-v3-speed{position:absolute;left:50%;bottom:61px;transform:translateX(-50%);z-index:8;display:flex;gap:1px;padding:2px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(12,11,18,.76);backdrop-filter:blur(10px)}
    .indo-reel-v3-speed button{border:0;border-radius:999px;background:transparent;color:#ddd9e3;padding:5px 8px;font-size:8px;font-weight:800}
    .indo-reel-v3-speed button.active{background:linear-gradient(135deg,#ff39bb,#713cff);color:#fff}
    .indo-reel-v3-gallery,.indo-reel-v3-preview{position:absolute;bottom:8px;z-index:8;width:46px;height:46px;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(10,10,16,.76);color:#fff;display:grid;place-items:center;backdrop-filter:blur(10px);overflow:hidden}
    .indo-reel-v3-gallery{left:8px}.indo-reel-v3-preview{right:8px}
    .indo-reel-v3-record{position:absolute;left:50%;bottom:3px;transform:translateX(-50%);z-index:9;width:58px;height:58px;border-radius:50%;border:5px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.10),0 0 20px rgba(244,43,189,.30)}
    .indo-reel-v3-record.recording{background:#ff263e}
    .indo-reel-v3-status{position:absolute;left:8px;right:8px;bottom:6px;z-index:11;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#c6c0ce;font-size:7px;pointer-events:none;text-align:center}
    .indo-reel-v3-bottom{height:104px;min-height:104px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(9,9,14,.97);overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.24);display:grid;grid-template-rows:48px 34px 22px}
    .indo-reel-v3-caption{width:100%;height:48px;padding:9px 11px;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:#fff;outline:none;resize:none;font-size:10px}
    .indo-reel-v3-caption::placeholder{color:#777381}
    .indo-reel-v3-meta{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid rgba(255,255,255,.06)}
    .indo-reel-v3-meta button{border:0;border-right:1px solid rgba(255,255,255,.06);background:transparent;color:#d6d1dc;font-size:8px;font-weight:750}
    .indo-reel-v3-meta button:last-child{border-right:0}
    .indo-reel-v3-publish-row{display:flex;align-items:center;justify-content:flex-end;padding:0 7px}
    .indo-reel-v3-publish{height:20px;min-width:92px;padding:0 10px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:linear-gradient(100deg,#773cff,#ee27bf);color:#fff;font-size:8px;font-weight:900}
    .indo-reel-v3-hidden{display:none!important}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-create-v3">
      <header class="indo-reel-v3-head">
        <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2 class="indo-reel-v3-title">Create Reel</h2>
        <button class="indo-reel-v3-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-v3-main">
        <section class="indo-reel-v3-stage-wrap">
          <div class="indo-reel-v3-stage">
            <div class="indo-reel-v3-empty" id="reel-empty"><div><strong>Camera ready</strong><span>Record a reel or choose one from Gallery.</span></div></div>
            <video id="reel-camera" playsinline muted class="indo-reel-v3-hidden"></video>
            <video id="reel-preview-video" playsinline controls class="indo-reel-v3-hidden"></video>
            <button class="indo-reel-v3-sound" id="reel-sound" type="button">♫ Add Sound</button>
            <div class="indo-reel-v3-left">
              <button class="indo-reel-v3-tool" type="button" data-demo="Audio"><b>♫</b>Audio</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Effects"><b>✦</b>Effects</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Text"><b>Aa</b>Text</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Stickers"><b>◈</b>Stickers</button>
            </div>
            <div class="indo-reel-v3-right">
              <button class="indo-reel-v3-tool" type="button" data-demo="Flip"><b>↻</b>Flip</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Grid"><b>▦</b>Grid</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Ratio"><b>9:16</b>Ratio</button>
              <button class="indo-reel-v3-tool" type="button" data-demo="Timer"><b>◷</b>Timer</button>
            </div>
            <div class="indo-reel-v3-speed" id="reel-speed"><button type="button">0.3x</button><button class="active" type="button">1x</button><button type="button">2x</button><button type="button">3x</button></div>
            <input id="reel-gallery-input" class="indo-reel-v3-hidden" type="file" accept="video/*">
            <button class="indo-reel-v3-gallery" id="reel-gallery" type="button" aria-label="Gallery">▧</button>
            <button class="indo-reel-v3-record" id="reel-record" type="button" aria-label="Record"></button>
            <button class="indo-reel-v3-preview" id="reel-preview" type="button" aria-label="Preview">▶</button>
            <div class="indo-reel-v3-status" id="reel-status"></div>
          </div>
        </section>
        <section class="indo-reel-v3-bottom">
          <textarea id="reel-caption" class="indo-reel-v3-caption" maxlength="500" placeholder="Write a caption..."></textarea>
          <div class="indo-reel-v3-meta"><button type="button" id="reel-hashtags"># Hashtags</button><button type="button" id="reel-mention">@ Mention</button><button type="button" id="reel-location">⌖ Location</button></div>
          <div class="indo-reel-v3-publish-row"><button class="indo-reel-v3-publish" id="reel-publish" type="button">Publish Reel →</button></div>
        </section>
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
  let stream = null;
  let recorder = null;
  let recordedChunks = [];
  let selectedFile = null;
  let objectUrl = "";
  let hashtags = [];
  let mention = "";
  let location = "";

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    camera.classList.add("indo-reel-v3-hidden");
  };

  const showPreview = (url, autoplay = false) => {
    empty.classList.add("indo-reel-v3-hidden");
    previewVideo.classList.remove("indo-reel-v3-hidden");
    previewVideo.src = url;
    if (autoplay) previewVideo.play().catch(() => {});
  };

  const startCamera = async () => {
    try {
      stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      camera.srcObject = stream;
      camera.classList.remove("indo-reel-v3-hidden");
      empty.classList.add("indo-reel-v3-hidden");
      previewVideo.classList.add("indo-reel-v3-hidden");
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
      status.textContent = "Finishing...";
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
      status.textContent = "Reel ready — add caption";
    };
    recorder.start(250);
    record.classList.add("recording");
    status.textContent = "Recording... tap again to stop";
  });

  $("#reel-preview").addEventListener("click", () => {
    if (previewVideo.src) previewVideo.play().catch(() => {});
    else status.textContent = "Record or choose a reel first";
  });
  $("#reel-next").addEventListener("click", () => publish.click());
  $("#reel-sound").addEventListener("click", () => { status.textContent = "Sound picker ready"; });
  app.querySelectorAll("[data-demo]").forEach((button) => button.addEventListener("click", () => { status.textContent = `${button.dataset.demo} selected`; }));
  app.querySelectorAll("#reel-speed button").forEach((button) => button.addEventListener("click", () => {
    app.querySelectorAll("#reel-speed button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    status.textContent = `Speed ${button.textContent}`;
  }));
  $("#reel-hashtags").addEventListener("click", () => {
    const raw = window.prompt("Hashtags: separate with commas", hashtags.join(", "));
    if (raw === null) return;
    hashtags = raw.split(",").map((x) => x.trim().replace(/^#/, "")).filter(Boolean).slice(0, 20);
    status.textContent = hashtags.length ? hashtags.map((x) => `#${x}`).join(" ") : "Hashtags cleared";
  });
  $("#reel-mention").addEventListener("click", () => {
    const raw = window.prompt("Mention user ID", mention);
    if (raw === null) return;
    mention = raw.trim().replace(/^@/, "").slice(0, 80);
    status.textContent = mention ? `@${mention}` : "Mention cleared";
  });
  $("#reel-location").addEventListener("click", () => {
    const raw = window.prompt("Location", location);
    if (raw === null) return;
    location = raw.trim().slice(0, 120);
    status.textContent = location || "Location cleared";
  });

  app.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    stopCamera();
    window.__indoNavigate?.(button.dataset.screen);
  }));

  publish.addEventListener("click", async () => {
    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      status.textContent = "Record or choose a reel video first";
      return;
    }
    const caption = $("#reel-caption").value.trim();
    publish.disabled = true;
    $("#reel-next").disabled = true;
    status.textContent = "Publishing reel...";
    try {
      await uploadReel(selectedFile, {
        title: caption.slice(0, 100) || "Reel",
        caption,
        description: caption,
        tags: hashtags,
        location,
        mention,
        onProgress: (_, text) => { status.textContent = text; },
      });
      status.textContent = "Reel published — opening Reels";
      setTimeout(() => window.__indoNavigate?.("reels"), 500);
    } catch (error) {
      status.textContent = error?.message || "Could not publish reel";
      publish.disabled = false;
      $("#reel-next").disabled = false;
    }
  });

  startCamera();
}
