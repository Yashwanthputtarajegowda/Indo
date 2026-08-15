import { publishStory } from "../features/upload/story-publish.js";
import { icons } from "../data.js";

const DRAFT_FILE_KEY = "__indoStoryDraftFile";
const DRAFT_KEY = "indo:story-option1-draft";
const FONTS = [
  ["Poppins", "Poppins,sans-serif"],
  ["Montserrat", "Montserrat,sans-serif"],
  ["Bebas", "Impact,sans-serif"],
  ["Playfair", "Georgia,serif"],
  ["Pacifico", "Pacifico,cursive"],
  ["Mono", "monospace"],
];
const COLORS = ["#fff", "#ff4bb8", "#ffcf4a", "#70e7ff", "#9b6cff", "#111"];
const EMOJIS = [
  "❤️",
  "🔥",
  "✨",
  "😍",
  "😂",
  "👏",
  "😎",
  "🥳",
  "💜",
  "⭐",
  "⚡",
  "🚀",
];
const FILTERS = [
  ["Original", "none"],
  ["Glow", "saturate(1.18) brightness(1.05) contrast(1.08)"],
  ["Dream", "saturate(1.1) brightness(1.08)"],
  ["Cyber", "contrast(1.25) saturate(1.4) hue-rotate(24deg)"],
  ["Mono", "grayscale(1) contrast(1.18)"],
  ["Warm", "sepia(.18) saturate(1.28)"],
  ["Night", "brightness(.72) contrast(1.28) saturate(1.18)"],
];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>\"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[c],
  );
const fmt = (s) => {
  s = Math.max(0, Number(s) || 0);
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
};
const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") || {};
  } catch {
    return {};
  }
};
const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
};
const saveDraft = (s) => {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title: s.title,
        titleFont: s.titleFont,
        titleColor: s.titleColor,
        titleSize: s.titleSize,
        titleX: s.titleX,
        titleY: s.titleY,
        crop: s.crop,
        filter: s.filter,
        speed: s.speed,
        stickerDataUrl: s.stickerDataUrl,
        stickerX: s.stickerX,
        stickerY: s.stickerY,
        stickerScale: s.stickerScale,
        emoji: s.emoji,
        updatedAt: Date.now(),
      }),
    );
  } catch {}
};
function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const img = new Image(),
      r = new FileReader();
    r.onerror = reject;
    r.onload = () => (img.src = String(r.result || ""));
    img.onerror = reject;
    img.onload = () => {
      const max = 420,
        scale = Math.min(
          1,
          max / Math.max(img.naturalWidth || 1, img.naturalHeight || 1),
        ),
        c = document.createElement("canvas");
      c.width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
      c.height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    r.readAsDataURL(file);
  });
}
function installStyles() {
  const id = "indo-story-option1-v3";
  if (document.getElementById(id)) return;
  const st = document.createElement("style");
  st.id = id;
  st.textContent = `
.indo-o1{position:relative;min-height:calc(100vh - 62px);background:#050507;color:#fff;overflow:hidden;display:flex;flex-direction:column}.indo-o1:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% -8%,rgba(138,76,255,.18),transparent 36%),radial-gradient(circle at 100% 45%,rgba(255,67,181,.1),transparent 34%);pointer-events:none}
.o1-top{position:relative;z-index:20;height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:linear-gradient(180deg,rgba(5,5,8,.9),rgba(5,5,8,.25));backdrop-filter:blur(14px)}.o1-top button{width:34px;height:34px;border:1px solid #282838;border-radius:10px;background:#111119;color:#fff}.o1-name{font-size:12px;font-weight:900;letter-spacing:.7px}.o1-save{font-size:9px!important;color:#c7adff}
.o1-stage{position:relative;z-index:5;flex:1;min-height:0;display:flex;justify-content:center;align-items:center;padding:5px 8px}.o1-card{position:relative;width:min(100%,520px);height:calc(100vh - 215px);max-height:680px;aspect-ratio:9/16;background:#000;border:1px solid rgba(255,255,255,.09);border-radius:22px;overflow:hidden;box-shadow:0 22px 80px rgba(0,0,0,.68),0 0 40px rgba(126,71,255,.11);touch-action:none}.o1-card.square{aspect-ratio:1/1;height:auto;width:min(100%,520px)}.o1-card.wide{aspect-ratio:16/9;height:auto;width:min(100%,720px)}.o1-card.contain video{object-fit:contain}.o1-card video{width:100%;height:100%;object-fit:cover;display:block;background:#000;pointer-events:none}.o1-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.46),transparent 20%,transparent 68%,rgba(0,0,0,.72));pointer-events:none}.o1-badge{position:absolute;left:12px;top:12px;z-index:7;padding:6px 9px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(4,4,8,.5);backdrop-filter:blur(10px);font-size:8px;letter-spacing:1px}.o1-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff45ba;box-shadow:0 0 10px #ff45ba;margin-right:5px}.o1-corner{position:absolute;right:12px;top:12px;z-index:8;display:flex;gap:6px}.o1-corner button{width:32px;height:32px;border:1px solid rgba(255,255,255,.15);border-radius:50%;background:rgba(4,4,8,.5);color:#fff}.o1-empty{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:radial-gradient(circle,rgba(29,20,51,.7),rgba(0,0,0,.95))}.o1-empty.hidden{display:none}.o1-empty strong{font-size:18px}.o1-empty span{max-width:250px;text-align:center;color:#878793;font-size:10px;line-height:1.4}.o1-empty button{height:40px;padding:0 14px;border:0;border-radius:10px;background:linear-gradient(135deg,#9655ff,#e845ad);color:#fff;font-size:9px;font-weight:900}.o1-play{position:absolute;left:50%;top:50%;z-index:9;transform:translate(-50%,-50%);width:74px;height:74px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(8,8,12,.35);backdrop-filter:blur(14px);color:#fff;font-size:26px}.o1-play.hidden{display:none}.o1-title{position:absolute;left:50%;top:30%;z-index:8;max-width:84%;padding:9px 13px;border-radius:13px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.2);backdrop-filter:blur(7px);transform:translate(-50%,-50%);font-size:27px;font-weight:900;line-height:1.05;text-align:center;white-space:pre-wrap;text-shadow:0 4px 15px rgba(0,0,0,.75);display:none;user-select:none;cursor:grab;touch-action:none}.o1-sticker{position:absolute;left:50%;top:56%;z-index:8;width:94px;height:94px;object-fit:contain;transform:translate(-50%,-50%);filter:drop-shadow(0 7px 17px rgba(0,0,0,.65));display:none;cursor:grab;touch-action:none}.o1-emoji{position:absolute;left:50%;top:56%;z-index:9;transform:translate(-50%,-50%);font-size:62px;display:none;cursor:grab;touch-action:none}.o1-info{position:absolute;left:12px;right:12px;bottom:12px;z-index:10}.o1-scrub{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(0,0,0,.45);backdrop-filter:blur(10px)}.o1-scrub span{font-size:8px}.o1-range{flex:1;accent-color:#a15aff}.o1-hint{text-align:center;font-size:9px;margin-top:7px;color:#cfcfd6;text-shadow:0 2px 8px #000}
.o1-bottom{position:relative;z-index:30;padding:8px 8px 10px;background:linear-gradient(180deg,rgba(5,5,8,.05),rgba(5,5,8,.98) 32%);backdrop-filter:blur(15px)}.o1-quick{width:min(100%,520px);margin:auto;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.o1-quick button{height:56px;border:1px solid #242435;border-radius:14px;background:rgba(16,16,22,.82);color:#9f9faa;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:8px;font-weight:800}.o1-quick button b{font-size:18px}.o1-quick button:hover{color:#fff;border-color:#874cff}.o1-editbar{width:min(100%,520px);margin:6px auto 0;display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:6px}.o1-editbar button{height:40px;border:1px solid #29293a;border-radius:11px;background:#14141b;color:#ddd;font-size:8px;font-weight:900}.o1-editbar .main{background:linear-gradient(135deg,#9354ff,#e846ae);border-color:transparent;color:#fff}
.o1-sheet{position:fixed;left:50%;bottom:0;z-index:70;width:min(100%,560px);max-height:78vh;transform:translate(-50%,105%);transition:transform .28s ease;border:1px solid #2a2a3a;border-bottom:0;border-radius:22px 22px 0 0;background:rgba(10,10,15,.98);box-shadow:0 -25px 80px rgba(0,0,0,.58);backdrop-filter:blur(20px);overflow:auto}.o1-sheet.open{transform:translate(-50%,0)}.o1-sheet-head{position:sticky;top:0;z-index:5;padding:9px 12px;border-bottom:1px solid #242433;background:rgba(10,10,15,.95)}.o1-handle{width:42px;height:4px;border-radius:99px;background:#4b4b58;margin:0 auto 7px}.o1-headrow{display:flex;align-items:center;justify-content:space-between}.o1-headrow strong{font-size:12px}.o1-headrow button{width:30px;height:30px;border:1px solid #29293a;border-radius:9px;background:#14141b;color:#fff}.o1-panel{padding:12px;display:none}.o1-panel.open{display:block}.o1-sec{margin-bottom:13px}.o1-label{display:flex;justify-content:space-between;margin-bottom:6px;color:#858592;font-size:8px}.o1-input{width:100%;height:40px;box-sizing:border-box;border:1px solid #29293b;border-radius:10px;background:#0e0e14;color:#fff;padding:0 10px;outline:none}.o1-fonts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.o1-font{height:35px;border:1px solid #29293a;border-radius:9px;background:#14141c;color:#fff;font-size:8px}.o1-font.active{border-color:#9e59ff;background:#291b52}.o1-colors{display:flex;gap:7px;flex-wrap:wrap}.o1-color{width:25px;height:25px;border-radius:50%;border:2px solid transparent}.o1-color.active{border-color:#fff;box-shadow:0 0 0 2px #8757ff}.o1-row{display:flex;gap:6px;overflow:auto;scrollbar-width:none}.o1-chip{flex:0 0 auto;height:31px;padding:0 10px;border:1px solid #29293b;border-radius:999px;background:#15151e;color:#bdbdc7;font-size:8px;font-weight:800}.o1-chip.active{border-color:#9f5aff;color:#fff;background:rgba(139,78,255,.18)}.o1-slider{width:100%;accent-color:#9c59ff}.o1-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.o1-small{height:37px;border:1px solid #29293a;border-radius:10px;background:#15151e;color:#ddd;font-size:8px;font-weight:800}.o1-small.active{border-color:#9d5bff;background:#291b51;color:#fff}.o1-audio{display:flex;align-items:center;gap:7px}.o1-file{height:36px;padding:0 10px;display:inline-flex;align-items:center;border:1px solid #2a2a3a;border-radius:9px;background:#15151e;color:#ddd;font-size:8px;font-weight:800}.o1-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#83838f;font-size:8px}.o1-note{font-size:9px;color:#797986;line-height:1.45}.o1-actions{position:sticky;bottom:0;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:linear-gradient(180deg,rgba(10,10,15,0),rgba(10,10,15,.99) 35%)}.o1-actions button{height:41px;border:1px solid #2b2b3b;border-radius:11px;background:#15151e;color:#ddd;font-size:9px;font-weight:900}.o1-actions .publish{background:linear-gradient(135deg,#9654ff,#e847ae);border-color:transparent;color:#fff}@media(max-width:480px){.o1-card{height:calc(100vh - 224px);border-radius:18px}.o1-play{width:66px;height:66px}.o1-title{font-size:23px}.o1-quick button{height:52px}}
`;
  document.head.appendChild(st);
}

export function renderStoryCreate(app, draftFileOverride = null) {
  installStyles();
  const initialFile =
    draftFileOverride instanceof File
      ? draftFileOverride
      : window[DRAFT_FILE_KEY] instanceof File
        ? window[DRAFT_FILE_KEY]
        : null;
  const d = readDraft();
  app.innerHTML = `<div class="app-shell indo-o1"><header class="o1-top"><button data-screen="create" aria-label="Back">${icons.back}</button><div class="o1-name">FULLSCREEN STORY</div><button id="o1-save" class="o1-save" type="button">Save</button></header><main class="o1-stage"><section id="o1-card" class="o1-card"><div id="o1-empty" class="o1-empty ${initialFile ? "hidden" : ""}"><strong>Full-screen first.</strong><span>Watch your video without distractions, then swipe up or tap Edit when you want tools.</span><button id="o1-choose" type="button">Choose Video</button></div><span class="o1-badge"><span class="o1-dot"></span>INDO STORY</span><div class="o1-corner"><button id="o1-mute" type="button">🔊</button><button id="o1-fullscreen" type="button">⛶</button></div><video id="o1-video" autoplay playsinline muted></video><div class="o1-vignette"></div><div id="o1-title" class="o1-title"></div><img id="o1-sticker" class="o1-sticker" alt=""><div id="o1-emoji" class="o1-emoji"></div><button id="o1-play" class="o1-play" type="button">▶</button><div class="o1-info"><div class="o1-scrub"><span id="o1-current">00:00</span><input id="o1-seek" class="o1-range" type="range" min="0" max="0" step="0.1" value="0"><span id="o1-total">00:00</span></div><div class="o1-hint"><b>Swipe up</b> to edit</div></div></section></main><footer class="o1-bottom"><div class="o1-quick"><button data-tool="text" type="button"><b>T</b>Text</button><button data-tool="style" type="button"><b>Aa</b>Style</button><button data-tool="sticker" type="button"><b>☺</b>Sticker</button><button data-tool="effect" type="button"><b>✦</b>Effect</button><button data-tool="music" type="button"><b>♫</b>Music</button></div><div class="o1-editbar"><button id="o1-fit" type="button">Fit</button><button id="o1-edit" class="main" type="button">Edit Story</button><button id="o1-publish-bottom" type="button">Publish</button></div></footer><section id="o1-sheet" class="o1-sheet"><div class="o1-sheet-head"><div class="o1-handle"></div><div class="o1-headrow"><strong id="o1-sheet-title">Edit Story</strong><button id="o1-close" type="button">×</button></div></div><div id="o1-panel" class="o1-panel open"></div><div class="o1-actions"><button id="o1-draft" type="button">Save Draft</button><button id="o1-publish" class="publish" type="button">Publish Story</button></div></section><input id="o1-video-input" type="file" accept="video/*" hidden><input id="o1-sticker-input" type="file" accept="image/*" hidden><input id="o1-audio-input" type="file" accept="audio/*" hidden><audio id="o1-audio" preload="metadata"></audio></div>`;

  const state = {
    file: initialFile,
    objectUrl: "",
    audioUrl: "",
    title: String(d.title || ""),
    titleFont: String(d.titleFont || FONTS[0][1]),
    titleColor: String(d.titleColor || "#fff"),
    titleSize: Number(d.titleSize || 27),
    titleX: Number(d.titleX ?? 50),
    titleY: Number(d.titleY ?? 30),
    crop: String(d.crop || "portrait"),
    filter: String(d.filter || "none"),
    speed: Number(d.speed || 1),
    stickerDataUrl: String(d.stickerDataUrl || ""),
    stickerX: Number(d.stickerX ?? 50),
    stickerY: Number(d.stickerY ?? 56),
    stickerScale: Number(d.stickerScale || 1),
    emoji: String(d.emoji || ""),
  };
  const card = app.querySelector("#o1-card"),
    video = app.querySelector("#o1-video"),
    title = app.querySelector("#o1-title"),
    sticker = app.querySelector("#o1-sticker"),
    emoji = app.querySelector("#o1-emoji"),
    seek = app.querySelector("#o1-seek"),
    play = app.querySelector("#o1-play"),
    sheet = app.querySelector("#o1-sheet"),
    panel = app.querySelector("#o1-panel"),
    audio = app.querySelector("#o1-audio"),
    msg = app.querySelector(".o1-hint"),
    publishButton = app.querySelector("#o1-publish");
  const videoInput = app.querySelector("#o1-video-input");
  const setMsg = (t) => {
    msg.innerHTML = esc(t);
  };
  const preview = () => {
    card.classList.toggle("square", state.crop === "square");
    card.classList.toggle("wide", state.crop === "wide");
    card.classList.toggle("contain", state.crop === "contain");
    video.style.filter = state.filter;
    video.playbackRate = state.speed;
    title.textContent = state.title;
    title.style.display = state.title ? "block" : "none";
    title.style.left = `${state.titleX}%`;
    title.style.top = `${state.titleY}%`;
    title.style.fontFamily = state.titleFont;
    title.style.color = state.titleColor;
    title.style.fontSize = `${state.titleSize}px`;
    sticker.style.display = state.stickerDataUrl ? "block" : "none";
    sticker.src = state.stickerDataUrl || "";
    sticker.style.left = `${state.stickerX}%`;
    sticker.style.top = `${state.stickerY}%`;
    sticker.style.transform = `translate(-50%,-50%) scale(${state.stickerScale})`;
    emoji.style.display = state.emoji ? "block" : "none";
    emoji.textContent = state.emoji;
    video.playbackRate = state.speed;
  };
  const timeline = () => {
    const dur = Number(video.duration) || 0,
      now = Number(video.currentTime) || 0;
    app.querySelector("#o1-current").textContent = fmt(now);
    app.querySelector("#o1-total").textContent = fmt(dur);
    seek.max = String(Math.max(0.1, dur));
    seek.value = String(Math.min(now, dur));
  };
  const openSheet = (tool) => {
    sheet.classList.add("open");
    app.querySelector("#o1-sheet-title").textContent =
      tool === "text"
        ? "Text Studio"
        : tool === "style"
          ? "Style"
          : tool === "sticker"
            ? "Sticker"
            : tool === "effect"
              ? "Effect"
              : "Music";
    buildPanel(tool);
  };
  const closeSheet = () => sheet.classList.remove("open");
  const buildPanel = (tool) => {
    if (tool === "text") {
      panel.innerHTML = `<div class="o1-sec"><div class="o1-label"><span>Story text</span><span>80 max</span></div><input id="o1-text" class="o1-input" maxlength="80" value="${esc(state.title)}" placeholder="Write your story"></div><div class="o1-sec"><div class="o1-label"><span>Font</span></div><div class="o1-fonts">${FONTS.map(([n, f]) => `<button class="o1-font ${state.titleFont === f ? "active" : ""}" data-font="${esc(f)}" style="font-family:${esc(f)}" type="button">${esc(n)}</button>`).join("")}</div></div><div class="o1-sec"><div class="o1-label"><span>Color</span></div><div class="o1-colors">${COLORS.map((c) => `<button class="o1-color ${state.titleColor === c ? "active" : ""}" data-color="${c}" style="background:${c}" type="button"></button>`).join("")}</div></div><div class="o1-sec"><div class="o1-label"><span>Size</span><b>${state.titleSize}px</b></div><input id="o1-size" class="o1-slider" type="range" min="16" max="48" value="${state.titleSize}"></div>`;
      panel.querySelector("#o1-text").addEventListener("input", (e) => {
        state.title = e.target.value;
        preview();
        saveDraft(state);
      });
      panel.querySelector("#o1-size").addEventListener("input", (e) => {
        state.titleSize = Number(e.target.value);
        preview();
        buildPanel("text");
      });
      panel.querySelectorAll("[data-font]").forEach((b) =>
        b.addEventListener("click", () => {
          state.titleFont = b.dataset.font;
          preview();
          buildPanel("text");
          saveDraft(state);
        }),
      );
      panel.querySelectorAll("[data-color]").forEach((b) =>
        b.addEventListener("click", () => {
          state.titleColor = b.dataset.color;
          preview();
          buildPanel("text");
          saveDraft(state);
        }),
      );
      return;
    }
    if (tool === "style") {
      panel.innerHTML = `<div class="o1-sec"><div class="o1-label"><span>Canvas</span></div><div class="o1-grid"><button class="o1-small ${state.crop === "portrait" ? "active" : ""}" data-crop="portrait" type="button">9:16</button><button class="o1-small ${state.crop === "square" ? "active" : ""}" data-crop="square" type="button">1:1</button><button class="o1-small ${state.crop === "wide" ? "active" : ""}" data-crop="wide" type="button">16:9</button></div></div><div class="o1-sec"><div class="o1-label"><span>Speed</span><b>${state.speed}x</b></div><div class="o1-row">${["0.5", "1", "1.5", "2"].map((v) => `<button class="o1-chip ${String(state.speed) === v ? "active" : ""}" data-speed="${v}" type="button">${v}x</button>`).join("")}</div></div><div class="o1-sec"><div class="o1-label"><span>Fit</span></div><div class="o1-grid"><button class="o1-small" id="o1-fill" type="button">Fill</button><button class="o1-small ${state.crop === "contain" ? "active" : ""}" id="o1-contain" type="button">Fit</button><button class="o1-small" id="o1-reset-style" type="button">Reset</button></div></div>`;
      panel.querySelectorAll("[data-crop]").forEach((b) =>
        b.addEventListener("click", () => {
          state.crop = b.dataset.crop;
          preview();
          buildPanel("style");
          saveDraft(state);
        }),
      );
      panel.querySelectorAll("[data-speed]").forEach((b) =>
        b.addEventListener("click", () => {
          state.speed = Number(b.dataset.speed);
          preview();
          buildPanel("style");
          saveDraft(state);
        }),
      );
      panel.querySelector("#o1-fill").addEventListener("click", () => {
        if (state.crop === "contain") state.crop = "portrait";
        preview();
        buildPanel("style");
      });
      panel.querySelector("#o1-contain").addEventListener("click", () => {
        state.crop = "contain";
        preview();
        buildPanel("style");
        saveDraft(state);
      });
      panel.querySelector("#o1-reset-style").addEventListener("click", () => {
        state.crop = "portrait";
        state.speed = 1;
        preview();
        buildPanel("style");
        saveDraft(state);
      });
      return;
    }
    if (tool === "sticker") {
      panel.innerHTML = `<div class="o1-sec"><div class="o1-label"><span>Emoji</span></div><div class="o1-row">${EMOJIS.map((v) => `<button class="o1-chip" data-emoji="${v}" type="button">${v}</button>`).join("")}</div></div><div class="o1-sec"><button id="o1-photo" class="o1-small" type="button">Upload Photo Sticker</button></div><div class="o1-sec"><div class="o1-label"><span>Sticker size</span><b>${state.stickerScale.toFixed(1)}x</b></div><input id="o1-sticker-scale" class="o1-slider" type="range" min=".6" max="2.2" step=".1" value="${state.stickerScale}"></div><p class="o1-note">Drag text, emoji or photo directly on the fullscreen preview.</p>`;
      panel.querySelectorAll("[data-emoji]").forEach((b) =>
        b.addEventListener("click", () => {
          state.emoji = b.dataset.emoji;
          preview();
          saveDraft(state);
        }),
      );
      panel
        .querySelector("#o1-photo")
        .addEventListener("click", () =>
          app.querySelector("#o1-sticker-input").click(),
        );
      panel
        .querySelector("#o1-sticker-scale")
        .addEventListener("input", (e) => {
          state.stickerScale = Number(e.target.value);
          preview();
          buildPanel("sticker");
          saveDraft(state);
        });
      return;
    }
    if (tool === "effect") {
      panel.innerHTML = `<div class="o1-sec"><div class="o1-label"><span>Live effects</span></div><div class="o1-row">${FILTERS.map(([n, f]) => `<button class="o1-chip ${state.filter === f ? "active" : ""}" data-filter="${esc(f)}" type="button">${esc(n)}</button>`).join("")}</div></div><div class="o1-grid"><button class="o1-small" id="o1-enhance" type="button">Enhance</button><button class="o1-small" id="o1-glow" type="button">Glow</button><button class="o1-small" id="o1-clean" type="button">Clean</button></div>`;
      panel.querySelectorAll("[data-filter]").forEach((b) =>
        b.addEventListener("click", () => {
          state.filter = b.dataset.filter;
          preview();
          buildPanel("effect");
          saveDraft(state);
        }),
      );
      ["o1-enhance", "o1-glow", "o1-clean"].forEach((id) =>
        panel
          .querySelector(`#${id}`)
          .addEventListener("click", () => setMsg("Preview effect applied.")),
      );
      return;
    }
    panel.innerHTML = `<div class="o1-sec"><div class="o1-label"><span>Music & audio</span><span>Preview</span></div><div class="o1-audio"><label class="o1-file" for="o1-audio-input">Choose Audio</label><span id="o1-audio-name" class="o1-name">No audio selected</span></div></div><div class="o1-sec"><div class="o1-label"><span>Volume</span><span>75%</span></div><input id="o1-audio-volume" class="o1-slider" type="range" min="0" max="1" step=".05" value=".75"></div><p class="o1-note">Audio preview only; the existing secure story publishing API is unchanged.</p>`;
    panel
      .querySelector("#o1-audio-volume")
      .addEventListener(
        "input",
        (e) => (audio.volume = Number(e.target.value)),
      );
  };
  const loadVideo = (file) => {
    if (!(file instanceof File) || !file.type.startsWith("video/")) {
      setMsg("Please choose a video.");
      return;
    }
    state.file = file;
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = URL.createObjectURL(file);
    video.src = state.objectUrl;
    video.load();
    video.play().catch(() => {});
    app.querySelector("#o1-empty").classList.add("hidden");
    preview();
  };
  const drag = (el, move) => {
    let down = false;
    const mv = (e) => {
      if (!down) return;
      e.preventDefault();
      const r = card.getBoundingClientRect(),
        x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100)),
        y = Math.max(6, Math.min(94, ((e.clientY - r.top) / r.height) * 100));
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      move(x, y);
    };
    const up = () => {
      down = false;
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      saveDraft(state);
    };
    el.addEventListener("pointerdown", (e) => {
      if (sheet.classList.contains("open")) return;
      down = true;
      e.preventDefault();
      window.addEventListener("pointermove", mv, { passive: false });
      window.addEventListener("pointerup", up, { once: true });
    });
  };
  async function publishNow() {
    if (!(state.file instanceof File)) {
      videoInput.click();
      return;
    }
    publishButton.disabled = true;
    app.querySelector("#o1-publish-bottom").disabled = true;
    setMsg("Uploading story...");
    try {
      await publishStory(state.file, (p, t) => setMsg(`${t} ${p}%`), {
        title: state.title,
        titleFont: state.titleFont,
        titleX: state.titleX,
        titleY: state.titleY,
        crop: state.crop,
        stickerDataUrl: state.stickerDataUrl,
        stickerX: state.stickerX,
        stickerY: state.stickerY,
        stickerScale: state.stickerScale,
      });
      clearDraft();
      window[DRAFT_FILE_KEY] = null;
      setMsg("Story published successfully.");
      setTimeout(() => window.__indoNavigate?.("home"), 650);
    } catch (err) {
      setMsg(err?.message || "Story upload failed.");
      publishButton.disabled = false;
      app.querySelector("#o1-publish-bottom").disabled = false;
    }
  }
  app.querySelector("#o1-publish-bottom").addEventListener("click", publishNow);
  publishButton.addEventListener("click", publishNow);
  app.querySelector("#o1-draft").addEventListener("click", () => {
    saveDraft(state);
    setMsg("Draft saved.");
  });
  app.querySelector("#o1-save").addEventListener("click", () => {
    saveDraft(state);
    setMsg("Draft saved.");
  });
  app.querySelector("#o1-close").addEventListener("click", closeSheet);
  app
    .querySelector("#o1-edit")
    .addEventListener("click", () => openSheet("text"));
  app
    .querySelectorAll("[data-tool]")
    .forEach((b) =>
      b.addEventListener("click", () => openSheet(b.dataset.tool)),
    );
  app
    .querySelector("#o1-choose")
    .addEventListener("click", () => videoInput.click());
  app.querySelector("#o1-mute").addEventListener("click", () => {
    video.muted = !video.muted;
    app.querySelector("#o1-mute").textContent = video.muted ? "🔇" : "🔊";
  });
  app.querySelector("#o1-play").addEventListener("click", () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  app.querySelector("#o1-fit").addEventListener("click", () => {
    state.crop = "contain";
    preview();
  });
  app.querySelector("#o1-fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else card.requestFullscreen?.().catch(() => {});
  });
  videoInput.addEventListener("change", () => {
    const f = videoInput.files?.[0];
    if (f) loadVideo(f);
    videoInput.value = "";
  });
  app
    .querySelector("#o1-sticker-input")
    .addEventListener("change", async () => {
      const f = app.querySelector("#o1-sticker-input").files?.[0];
      if (!f) return;
      try {
        state.stickerDataUrl = await compressImage(f);
        preview();
        saveDraft(state);
        openSheet("sticker");
      } catch {
        setMsg("Could not load photo.");
      }
      app.querySelector("#o1-sticker-input").value = "";
    });
  app.querySelector("#o1-audio-input").addEventListener("change", () => {
    const f = app.querySelector("#o1-audio-input").files?.[0];
    if (!f) return;
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(f);
    audio.src = state.audioUrl;
    audio.volume = 0.75;
    audio.play().catch(() => {});
    openSheet("music");
    const n = app.querySelector("#o1-audio-name");
    if (n) n.textContent = f.name;
  });
  seek.addEventListener("input", () => {
    video.currentTime = Number(seek.value) || 0;
    timeline();
  });
  video.addEventListener("loadedmetadata", timeline);
  video.addEventListener("timeupdate", timeline);
  video.addEventListener("play", () => play.classList.add("hidden"));
  video.addEventListener("pause", () => play.classList.remove("hidden"));
  drag(title, (x, y) => {
    state.titleX = x;
    state.titleY = y;
  });
  drag(sticker, (x, y) => {
    state.stickerX = x;
    state.stickerY = y;
  });
  drag(emoji, (x, y) => {
    state.stickerX = x;
    state.stickerY = y;
  });
  let startY = null;
  card.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches?.[0]?.clientY ?? null;
    },
    { passive: true },
  );
  card.addEventListener(
    "touchend",
    (e) => {
      if (startY == null) return;
      const end = e.changedTouches?.[0]?.clientY ?? startY;
      if (startY - end > 45) openSheet("text");
      startY = null;
    },
    { passive: true },
  );
  card.addEventListener("click", (e) => {
    if (e.target.closest("button,input")) return;
    if (sheet.classList.contains("open")) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  buildPanel("text");
  preview();
  if (state.file) loadVideo(state.file);
  else setMsg("Full-screen first. Choose a video to start.");
  window.addEventListener(
    "beforeunload",
    () => {
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    },
    { once: true },
  );
}
