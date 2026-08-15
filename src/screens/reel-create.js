import { icons } from "../data.js";
import { uploadReel } from "../features/feed/create-video.js";

const STYLE_ID = "indo-reel-create-v1";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-reel-create{min-height:100vh;background:#030308;color:#fff;padding-bottom:24px;overflow-x:hidden}
    .indo-reel-head{height:58px;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:8px;padding:0 10px;background:rgba(4,4,9,.94);border-bottom:1px solid rgba(145,88,255,.2);position:sticky;top:0;z-index:20;backdrop-filter:blur(18px)}
    .indo-reel-head button{width:36px;height:36px;border-radius:50%;border:1px solid rgba(170,92,255,.24);background:rgba(112,42,255,.1);color:#fff;display:grid;place-items:center;font-size:19px}
    .indo-reel-head h2{margin:0;text-align:center;font-size:18px;font-weight:900}
    .indo-reel-next{height:34px;padding:0 16px!important;min-width:94px;border-radius:999px!important;background:linear-gradient(100deg,#7e3cff,#f12fc7)!important;border-color:rgba(255,255,255,.18)!important;font-size:11px!important;font-weight:900!important;box-shadow:0 0 16px rgba(193,58,243,.24)}
    .indo-reel-main{padding:10px}
    .indo-reel-stage-wrap{position:relative;border:1px solid rgba(200,108,255,.4);border-radius:20px;padding:8px;background:linear-gradient(180deg,rgba(60,20,94,.25),rgba(8,8,14,.88));box-shadow:0 0 26px rgba(154,64,255,.1)}
    .indo-reel-stage{position:relative;aspect-ratio:9/16;max-height:72vh;overflow:hidden;border-radius:15px;background:#08080d}
    .indo-reel-stage video,.indo-reel-stage img{width:100%;height:100%;display:block;object-fit:cover}
    .indo-reel-stage::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08),transparent 28%,transparent 62%,rgba(0,0,0,.34))}
    .indo-reel-add-sound{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:5;height:34px;padding:0 16px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(16,12,24,.82);color:#fff;font-size:11px;font-weight:850;backdrop-filter:blur(14px)}
    .indo-reel-tools{position:absolute;left:10px;top:54px;z-index:5;display:flex;flex-direction:column;gap:8px}
    .indo-reel-tool{width:52px;height:48px;border:1px solid rgba(255,255,255,.12);border-radius:15px;background:rgba(9,9,15,.72);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:9px;backdrop-filter:blur(12px)}
    .indo-reel-tool b{font-size:17px;color:#f7a5ff}
    .indo-reel-right-tools{position:absolute;right:10px;top:54px;z-index:5;display:flex;flex-direction:column;gap:8px}
    .indo-reel-speed{position:absolute;left:50%;bottom:86px;transform:translateX(-50%);z-index:5;display:flex;gap:3px;padding:3px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(14,12,20,.78);backdrop-filter:blur(12px)}
    .indo-reel-speed button{border:0;border-radius:999px;background:transparent;color:#ddd;padding:8px 12px;font-size:10px;font-weight:800}
    .indo-reel-speed button.active{background:linear-gradient(135deg,#ff37bd,#713cff);color:#fff}
    .indo-reel-record{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:5;width:78px;height:78px;border-radius:50%;border:7px solid #fff;background:linear-gradient(135deg,#ff0ea9,#a73cff);box-shadow:0 0 0 2px rgba(255,255,255,.12),0 0 24px rgba(244,43,189,.34)}
    .indo-reel-record.recording{background:#ff263e;box-shadow:0 0 0 2px rgba(255,255,255,.16),0 0 28px rgba(255,40,60,.36)}
    .indo-reel-gallery,.indo-reel-preview{position:absolute;bottom:24px;z-index:5;width:58px;height:58px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(10,10,16,.76);color:#fff;display:grid;place-items:center;backdrop-filter:blur(12px);overflow:hidden}
    .indo-reel-gallery{left:16px}.indo-reel-preview{right:16px}
    .indo-reel-gallery img{width:100%;height:100%;object-fit:cover}
    .indo-reel-empty{display:grid;place-items:center;gap:8px;height:100%;color:#87838f;font-size:11px;text-align:center;padding:20px}
    .indo-reel-form{margin-top:12px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#0b0b11;overflow:hidden}
    .indo-reel-caption{width:100%;min-height:82px;box-sizing:border-box;padding:13px;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:#fff;outline:none;resize:none;font-size:13px}
    .indo-reel-meta{display:grid;grid-template-columns:repeat(3,1fr)}
    .indo-reel-meta button{height:46px;border:0;border-right:1px solid rgba(255,255,255,.06);background:transparent;color:#d7d3dd;font-size:10px;font-weight:750}
    .indo-reel-meta button:last-child{border-right:0}
    .indo-reel-meta button:hover{background:rgba(143,71,255,.08);color:#fff}
    .indo-reel-status{text-align:center;min-height:18px;color:#9995a4;font-size:10px;padding:8px}
    .indo-reel-upload{width:100%;height:46px;border:0;border-radius:12px;background:linear-gradient(100deg,#743cff,#df24c9);color:#fff;font-size:13px;font-weight:900;box-shadow:0 10px 24px rgba(165,39,235,.22)}
    .indo-reel-upload:disabled{opacity:.58}
    .indo-reel-hidden{display:none!important}
    @media(max-width:520px){.indo-reel-stage{max-height:none}.indo-reel-tools,.indo-reel-right-tools{transform:scale(.92);transform-origin:top}.indo-reel-record{width:70px;height:70px}.indo-reel-next{min-width:84px;padding:0 13px!important}}
  `;
  document.head.appendChild(style);
}

export function renderReelCreate(app) {
  installStyles();
  app.innerHTML = `
    <div class="app-shell indo-reel-create">
      <header class="indo-reel-head">
        <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
        <h2>Create Reel</h2>
        <button class="indo-reel-next" id="reel-next" type="button">Next →</button>
      </header>
      <main class="indo-reel-main">
        <section class="indo-reel-stage-wrap">
          <div class="indo-reel-stage" id="reel-stage">
            <div class="indo-reel-empty" id="reel-empty"><strong>Camera ready</strong><span>Record a vertical reel or choose a video from Gallery.</span></div>
            <video id="reel-camera" playsinline muted class="indo-reel-hidden"></video>
            <video id="reel-preview-video" playsinline controls class="indo-reel-hidden"></video>
            <img id="reel-preview-image" alt="Selected reel preview" class="indo-reel-hidden">
            <button class="indo-reel-add-sound" type="button" id="reel-sound">♫ Add Sound</button>
            <div class="indo-reel-tools">
              <button class="indo-reel-tool" type="button" data-demo="Audio"><b>♫</b>Audio</button>
              <button class="indo-reel-tool" type="button" data-demo="Effects"><b>✦</b>Effects</button>
              <button class="indo-reel-tool" type="button" data-demo="Text"><b>Aa</b>Text</button>
              <button class="indo-reel-tool" type="button" data-demo="Stickers"><b>◈</b>Stickers</button>
              <button class="indo-reel-tool" type="button" data-demo="Timer"><b>◷</b>Timer</button>
            </div>
            <div class="indo-reel-right-tools">
              <button class="indo-reel-tool" type="button" data-demo="Flip"><b>↻</b>Flip</button>
              <button class="indo-reel-tool" type="button" data-demo="Grid"><b>▦</b>Grid</button>
              <button class="indo-reel-tool" type="button" data-demo="Ratio"><b>9:16</b>Ratio</button>
            </div>
            <div class="indo-reel-speed" id="reel-speed">
              <button type="button">0.3x</button><button type="button" class="active">1x</button><button type="button">2x</button><button type="button">3x</button>
            </div>
            <input id="reel-gallery-input" class="indo-reel-hidden" type="file" accept="video/*,image/*">
            <button class="indo-reel-gallery" type="button" id="reel-gallery" aria-label="Gallery">▧</button>
            <button class="indo-reel-record" type="button" id="reel-record" aria-label="Record"></button>
            <button class="indo-reel-preview" type="button" id="reel-preview" aria-label="Preview">◉</button>
          </div>
        </section>
        <section class="indo-reel-form">
          <textarea id="reel-caption" class="indo-reel-caption" maxlength="500" placeholder="Add a caption..."></textarea>
          <div class="indo-reel-meta">
            <button type="button" id="reel-hashtags"># Hashtags</button>
            <button type="button" id="reel-mention">@ Mention</button>
            <button type="button" id="reel-location">⌖ Location</button>
          </div>
        </section>
        <div class="indo-reel-status" id="reel-status"></div>
        <button class="indo-reel-upload" id="reel-publish" type="button">Publish Reel</button>
      </main>
    </div>
  `;

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
    camera.classList.add("indo-reel-hidden");
  }

  function showVideo(url, autoplay = false) {
    empty.classList.add("indo-reel-hidden");
    previewImage.classList.add("indo-reel-hidden");
    previewVideo.classList.remove("indo-reel-hidden");
    previewVideo.src = url;
    previewVideo.controls = true;
    if (autoplay) previewVideo.play().catch(() => {});
  }

  async function startCamera() {
    try {
      stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      camera.srcObject = stream;
      camera.classList.remove("indo-reel-hidden");
      empty.classList.add("indo-reel-hidden");
      previewVideo.classList.add("indo-reel-hidden");
      previewImage.classList.add("indo-reel-hidden");
      await camera.play();
      status.textContent = "Camera ready — tap the record button.";
    } catch (error) {
      status.textContent = "Camera unavailable. Use Gallery to choose a reel video.";
    }
  }

  function chooseGallery(file) {
    if (!file) return;
    stopCamera();
    selectedFile = file;
    objectUrl && URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    if (file.type.startsWith("video/")) {
      showVideo(objectUrl, true);
    } else {
      previewVideo.classList.add("indo-reel-hidden");
      previewImage.classList.remove("indo-reel-hidden");
      previewImage.src = objectUrl;
      empty.classList.add("indo-reel-hidden");
    }
    status.textContent = `${file.name} selected`;
  }

  async function toggleRecording() {
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
    const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? { mimeType: "video/webm;codecs=vp9,opus" }
      : undefined;
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (event) => {
      if (event.data?.size) recordedChunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: recorder.mimeType || "video/webm" });
      selectedFile = new File([blob], `indo-reel-${Date.now()}.webm`, { type: blob.type });
      objectUrl && URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(selectedFile);
      stopCamera();
      showVideo(objectUrl, false);
      record.disabled = false;
      status.textContent = "Recorded reel ready. Add caption, then publish.";
    };
    recorder.start(250);
    record.classList.add("recording");
    status.textContent = "Recording reel... tap again to stop.";
  }

  app.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      stopCamera();
      window.__indoNavigate?.(button.dataset.screen);
    });
  });

  gallery.addEventListener("click", () => galleryInput.click());
  galleryInput.addEventListener("change", () => chooseGallery(galleryInput.files?.[0]));
  record.addEventListener("click", toggleRecording);
  $("#reel-preview").addEventListener("click", () => {
    if (previewVideo.src) {
      previewVideo.classList.remove("indo-reel-hidden");
      previewVideo.play().catch(() => {});
    } else {
      status.textContent = "Record or choose a video first.";
    }
  });
  $("#reel-next").addEventListener("click", () => publish.click());
  $("#reel-sound").addEventListener("click", () => { status.textContent = "Sound picker ready for the next step."; });
  app.querySelectorAll("[data-demo]").forEach((button) => button.addEventListener("click", () => { status.textContent = `${button.dataset.demo} tool selected.`; }));
  app.querySelectorAll("#reel-speed button").forEach((button) => button.addEventListener("click", () => {
    app.querySelectorAll("#reel-speed button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    status.textContent = `Recording speed: ${button.textContent}`;
  }));
  $("#reel-hashtags").addEventListener("click", () => {
    const raw = window.prompt("Hashtags: separate with commas", hashtags.join(", "));
    if (raw === null) return;
    hashtags = raw.split(",").map((x) => x.trim().replace(/^#/, "")).filter(Boolean).slice(0, 20);
    status.textContent = hashtags.length ? hashtags.map((x) => `#${x}`).join(" ") : "Hashtags cleared.";
  });
  $("#reel-mention").addEventListener("click", () => {
    const raw = window.prompt("Mention user ID", mention);
    if (raw === null) return;
    mention = raw.trim().replace(/^@/, "").slice(0, 80);
    status.textContent = mention ? `Mention: @${mention}` : "Mention cleared.";
  });
  $("#reel-location").addEventListener("click", () => {
    const raw = window.prompt("Location", location);
    if (raw === null) return;
    location = raw.trim().slice(0, 120);
    status.textContent = location ? `Location: ${location}` : "Location cleared.";
  });

  publish.addEventListener("click", async () => {
    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      status.textContent = "Record a reel or choose a video file first.";
      return;
    }
    const caption = $("#reel-caption").value.trim();
    publish.disabled = true;
    $("#reel-next").disabled = true;
    status.textContent = "Publishing your reel...";
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
      status.textContent = "Reel published successfully. Showing it on Home and Reels.";
      setTimeout(() => window.__indoNavigate?.("reels"), 700);
    } catch (error) {
      status.textContent = error?.message || "Could not publish reel.";
      publish.disabled = false;
      $("#reel-next").disabled = false;
    }
  });

  startCamera();
}
