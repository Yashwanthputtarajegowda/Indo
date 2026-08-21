import { icons } from "../data.js";
import { nav } from "../components/nav.js";
import { uploadVideo } from "../features/feed/create-video.js?v=20260821-upload-v7";

const STYLE_ID = "indo-upload-video-v224";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    .indo-upload-shell{min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(125,35,255,.2),transparent 30%),#030308;color:#fff;padding-bottom:92px;overflow-x:hidden}
    .indo-upload-head{height:58px;display:grid;grid-template-columns:44px 1fr 44px;align-items:center;padding:0 12px;border-bottom:1px solid rgba(145,88,255,.16);background:rgba(4,4,9,.94);position:sticky;top:0;z-index:20;backdrop-filter:blur(18px)}
    .indo-upload-head button{width:38px;height:38px;border:1px solid rgba(164,80,255,.22);border-radius:50%;background:rgba(122,39,255,.1);color:#fff;display:grid;place-items:center;cursor:pointer;touch-action:manipulation}
    .indo-upload-head h2{margin:0;text-align:center;font-size:17px;font-weight:850}
    .indo-upload-main{padding:15px 12px 28px;position:relative;z-index:2}
    .indo-upload-label{font-size:11px;color:#aaa8b8;margin:2px 0 8px}
    .indo-video-preview{height:190px;border-radius:15px;border:1px solid #392257;background:linear-gradient(145deg,#171126,#080811);display:grid;place-items:center;overflow:hidden;position:relative;box-shadow:0 12px 30px rgba(0,0,0,.25);cursor:pointer;touch-action:manipulation}
    .indo-video-preview video{width:100%;height:100%;object-fit:cover;display:block}
    .indo-preview-placeholder{display:grid;place-items:center;gap:7px;color:#a9a5b6}
    .indo-preview-placeholder b{font-size:34px;color:#a238ff;text-shadow:0 0 20px #8e2cff}
    .indo-thumb-row{display:flex;gap:8px;margin:8px 0 16px}
    .indo-thumb{height:55px;flex:1;border-radius:9px;border:1px solid #35234e;background:#0d0d17;color:#b4afc0;display:grid;place-items:center;font-size:10px;cursor:pointer;touch-action:manipulation}
    .indo-thumb.active{border:2px solid #a72cff;color:#fff}
    .indo-upload-section-title{font-size:11px;color:#aaa8b8;margin:12px 0 7px}
    .indo-upload-field{margin-bottom:9px}
    .indo-upload-field label{display:block;font-size:10px;color:#b6b2c0;margin-bottom:5px}
    .indo-upload-field input,.indo-upload-field textarea{width:100%;border:1px solid #2d2441;border-radius:10px;background:#0d0d17;color:#fff;outline:none;padding:11px;font-size:11px;box-sizing:border-box}
    .indo-upload-field textarea{min-height:92px;resize:none}
    .indo-upload-field input:focus,.indo-upload-field textarea:focus{border-color:#a43cff;box-shadow:0 0 14px rgba(135,45,255,.12)}
    .indo-upload-row{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 4px;border:0;border-bottom:1px solid #1d1928;background:transparent;color:#fff;font-size:11px;text-align:left;cursor:pointer;touch-action:manipulation}
    .indo-upload-row .label{display:flex;align-items:center;gap:7px;min-width:0}
    .indo-upload-row .value{color:#a9a5b5;display:flex;align-items:center;gap:6px;white-space:nowrap}
    .indo-toggle{width:37px;height:21px;border-radius:20px;background:#33313a;padding:2px;display:flex;justify-content:flex-start;box-sizing:border-box}
    .indo-toggle.on{background:#7d35ff;justify-content:flex-end}
    .indo-toggle i{width:17px;height:17px;border-radius:50%;background:#fff}
    .indo-upload-message{min-height:20px;text-align:center;color:#aaa7b6;font-size:10px;margin:8px 0}
    .indo-upload-message.success{color:#4ee39b}
    .indo-upload-message.error{color:#ff728c}
    .indo-upload-progress{height:4px;border-radius:10px;background:#211a2e;overflow:hidden}
    .indo-upload-progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,#8035ff,#ff22c4);transition:width .2s}
    .indo-upload-primary{position:relative;z-index:30;width:100%;height:48px;margin-top:16px;border:0;border-radius:11px;background:linear-gradient(100deg,#8035ff,#df22c9);color:#fff;font-size:13px;font-weight:850;box-shadow:0 10px 24px rgba(164,38,238,.25);cursor:pointer;touch-action:manipulation;pointer-events:auto;-webkit-tap-highlight-color:transparent}
    .indo-upload-primary:disabled{opacity:.65;cursor:wait}
    .indo-upload-primary:not(:disabled):active{transform:scale(.99)}
    @media(max-width:380px){.indo-video-preview{height:165px}.indo-upload-main{padding:12px 9px 24px}}
  `;
  document.head.appendChild(s);
}

export function renderUploadVideo(app) {
  installStyles();

  app.innerHTML = `<div class="app-shell indo-upload-shell">
    <header class="indo-upload-head">
      <button type="button" data-screen="create" aria-label="Back">${icons.back}</button>
      <h2>Upload Video</h2>
      <span></span>
    </header>
    <main class="indo-upload-main">
      <div class="indo-upload-label">Video Preview</div>
      <div class="indo-video-preview" id="upload-preview"><div class="indo-preview-placeholder"><b>▶</b><span>Select a video to preview</span></div></div>
      <div class="indo-upload-label" style="margin-top:12px">Thumbnail</div>
      <div class="indo-thumb-row">
        <button class="indo-thumb active" type="button">Auto</button>
        <button class="indo-thumb" type="button">Frame 1</button>
        <button class="indo-thumb" type="button">Frame 2</button>
        <button class="indo-thumb" id="choose-video" type="button">＋</button>
      </div>
      <section>
        <div class="indo-upload-section-title">Add Details</div>
        <div class="indo-upload-field"><label for="upload-title">Title *</label><input id="upload-title" maxlength="100" placeholder="Add an attractive title"></div>
        <div class="indo-upload-field"><label for="upload-more">More</label><textarea id="upload-more" maxlength="500" placeholder="Enter details here... (optional)"></textarea></div>
      </section>
      <section id="upload-options">
        <button class="indo-upload-row" type="button" data-option="privacy"><span class="label">◉ <span>Privacy</span></span><span class="value"><span id="privacy-value" data-value="public">Public</span> ›</span></button>
        <button class="indo-upload-row" type="button" data-option="comments"><span class="label">◉ <span>Allow Comments</span></span><span class="value"><span class="indo-toggle on" id="comments-toggle"><i></i></span></span></button>
        <button class="indo-upload-row" type="button" data-option="duet"><span class="label">◌ <span>Allow Duet</span></span><span class="value"><span class="indo-toggle on" id="duet-toggle"><i></i></span></span></button>
        <button class="indo-upload-row" type="button" data-option="category"><span class="label">▣ <span>Category</span></span><span class="value"><span id="category-value" data-value="">Select Category</span> ›</span></button>
      </section>
      <input id="upload-file" type="file" accept="video/*" hidden>
      <div id="upload-message" class="indo-upload-message"></div>
      <div class="indo-upload-progress"><span id="upload-progress-bar"></span></div>
      <button id="create-video-submit" class="indo-upload-primary" type="button">Create Video</button>
    </main>
    ${nav("create")}
  </div>`;

  const file = app.querySelector("#upload-file");
  const choose = app.querySelector("#choose-video");
  const preview = app.querySelector("#upload-preview");
  const message = app.querySelector("#upload-message");
  const bar = app.querySelector("#upload-progress-bar");
  const submit = app.querySelector("#create-video-submit");
  const titleInput = app.querySelector("#upload-title");
  const moreInput = app.querySelector("#upload-more");

  let selectedObjectUrl = "";
  let submitting = false;
  const values = { privacy: "public", allowComments: true, allowDuet: true, category: "" };

  const setMessage = (text, type = "") => {
    message.textContent = String(text || "");
    message.className = `indo-upload-message${type ? ` ${type}` : ""}`;
  };

  const chooseFile = () => {
    if (submitting) return;
    file?.click();
  };

  const renderSelectedFile = () => {
    const f = file.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      file.value = "";
      setMessage("Please select a video file.", "error");
      return;
    }
    if (selectedObjectUrl) URL.revokeObjectURL(selectedObjectUrl);
    selectedObjectUrl = URL.createObjectURL(f);
    preview.innerHTML = `<video src="${selectedObjectUrl}" controls playsinline preload="metadata"></video>`;
    setMessage(`${f.name} • ${(f.size / (1024 * 1024)).toFixed(1)} MB`);
  };

  app.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.__indoNavigate?.(button.dataset.screen);
    });
  });

  choose?.addEventListener("click", chooseFile);
  preview?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLVideoElement) return;
    chooseFile();
  });
  file?.addEventListener("change", renderSelectedFile);

  app.querySelectorAll("[data-option]").forEach((row) => {
    row.addEventListener("click", () => {
      const option = row.dataset.option;
      if (option === "privacy") {
        const answer = window.prompt("Privacy: enter public, followers, or private.", values.privacy) || values.privacy;
        const normalized = answer.trim().toLowerCase();
        if (["public", "followers", "private"].includes(normalized)) values.privacy = normalized;
      } else if (option === "comments") {
        values.allowComments = !values.allowComments;
        app.querySelector("#comments-toggle")?.classList.toggle("on", values.allowComments);
      } else if (option === "duet") {
        values.allowDuet = !values.allowDuet;
        app.querySelector("#duet-toggle")?.classList.toggle("on", values.allowDuet);
      } else if (option === "category") {
        values.category = (window.prompt("Category", values.category) || "").trim().slice(0, 60);
      }
      const privacy = app.querySelector("#privacy-value");
      const category = app.querySelector("#category-value");
      if (privacy) { privacy.dataset.value = values.privacy; privacy.textContent = values.privacy === "followers" ? "Followers" : values.privacy === "private" ? "Private" : "Public"; }
      if (category) { category.dataset.value = values.category; category.textContent = values.category || "Select Category"; }
    });
  });

  const submitUpload = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (submitting) return;

    const f = file.files?.[0];
    if (!f) {
      setMessage("Select a video first.", "error");
      chooseFile();
      return;
    }

    const title = titleInput.value.trim();
    const more = moreInput.value.trim();
    if (!title) {
      setMessage("Add a title first.", "error");
      titleInput.focus();
      return;
    }

    submitting = true;
    submit.disabled = true;
    submit.textContent = "Uploading…";
    bar.style.width = "2%";
    setMessage("Preparing your video…");

    try {
      await uploadVideo(f, {
        title,
        caption: more,
        description: more,
        privacy: values.privacy,
        allowComments: values.allowComments,
        allowDuet: values.allowDuet,
        category: values.category,
        onProgress: (percent, text) => {
          bar.style.width = `${Math.max(2, Math.min(100, Number(percent) || 0))}%`;
          setMessage(text || "Uploading…");
        },
      });
      bar.style.width = "100%";
      setMessage("Your video is published!", "success");
      window.setTimeout(() => window.__indoNavigate?.("video"), 500);
    } catch (error) {
      console.error("Indo video upload failed:", error);
      submit.disabled = false;
      submit.textContent = "Create Video";
      submitting = false;
      bar.style.width = "0%";
      setMessage(error?.message || "Upload failed. Please try again.", "error");
    }
  };

  submit.addEventListener("click", submitUpload);
  submit.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") submitUpload(event);
  }, { passive: false });
}
