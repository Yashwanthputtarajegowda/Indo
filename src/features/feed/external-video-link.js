import { auth } from "../auth/firebase-client.js";

const STYLE_ID = "indo-external-video-link-v1";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .indo-external-link-card{--accent:#36d6ff;position:relative;width:100%;min-height:146px;margin:0 0 13px;padding:18px 48px 18px 18px;border-radius:18px;background:linear-gradient(115deg,rgba(7,33,48,.9),rgba(7,7,18,.97) 62%);border:1px solid rgba(54,214,255,.24);display:grid;grid-template-columns:118px 1fr;gap:16px;align-items:center;text-align:left;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 16px 40px rgba(0,0,0,.24);cursor:pointer;color:#fff}
    .indo-external-link-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--accent);box-shadow:0 0 18px var(--accent)}
    .indo-external-link-art{height:112px;border-radius:26px;display:grid;place-items:center;position:relative;font-size:48px;background:radial-gradient(circle,rgba(54,214,255,.26),transparent 67%);text-shadow:0 0 18px var(--accent);filter:drop-shadow(0 0 14px rgba(54,214,255,.25))}
    .indo-external-link-copy{min-width:0}.indo-external-link-copy h3{margin:0 0 6px;font-size:20px;font-weight:850}.indo-external-link-copy p{margin:0;color:#b7b5c2;font-size:12px;line-height:1.45;max-width:250px}.indo-external-link-tag{display:inline-block;margin-top:10px;padding:5px 8px;border-radius:9px;background:rgba(54,214,255,.11);color:#67ddff;font-size:9px;font-weight:800}.indo-external-link-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(54,214,255,.16);border:1px solid rgba(103,221,255,.72);color:#fff;font-size:29px;box-shadow:0 0 22px rgba(54,214,255,.22)}
    .indo-external-link-dialog{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}
    .indo-external-link-panel{width:min(520px,100%);padding:18px;border:1px solid rgba(103,221,255,.3);border-radius:18px;background:#090910;box-shadow:0 20px 60px rgba(0,0,0,.45)}
    .indo-external-link-panel h3{margin:0 0 6px;font-size:20px}.indo-external-link-panel p{margin:0 0 14px;color:#9996a6;font-size:12px}
    .indo-external-link-panel input,.indo-external-link-panel select{width:100%;height:44px;margin:0 0 10px;padding:0 12px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:#11111a;color:#fff;outline:none}.indo-external-link-panel input:focus,.indo-external-link-panel select:focus{border-color:#67ddff}
    .indo-external-link-actions{display:flex;justify-content:flex-end;gap:8px}.indo-external-link-actions button{height:40px;padding:0 14px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:#171720;color:#fff;font-weight:800}.indo-external-link-actions .primary{background:linear-gradient(100deg,#16aee0,#7a3cff);border-color:rgba(255,255,255,.16)}
    .indo-external-link-status{min-height:18px;color:#a6a3b1;font-size:10px;margin:2px 0 10px}.indo-external-link-status.error{color:#ff8ca1}
    @media(max-width:380px){.indo-external-link-card{grid-template-columns:86px 1fr;min-height:126px;padding:13px 43px 13px 12px;gap:11px;border-radius:15px}.indo-external-link-art{height:92px;font-size:40px}.indo-external-link-copy h3{font-size:17px}.indo-external-link-copy p{font-size:10px}.indo-external-link-arrow{width:40px;height:40px;right:9px;font-size:24px}}
  `;
  document.head.appendChild(style);
}

function safeText(value, max = 500) { return String(value || "").trim().slice(0, max); }

async function saveExternalVideo({ url, title, caption, mediaType }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken();
  const apiBase = String(window.INDO_API_BASE || "").replace(/\/$/, "");
  const response = await fetch(`${apiBase}/api/media/external-videos`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ url, title, caption, mediaType }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Could not add video link.");
  return data.video;
}

function openDialog(onDone) {
  const existing = document.querySelector(".indo-external-link-dialog");
  existing?.remove();
  const wrap = document.createElement("div");
  wrap.className = "indo-external-link-dialog";
  wrap.innerHTML = `<div class="indo-external-link-panel"><h3>Add Video Link</h3><p>The video stays on its original host. Indo only saves the link and streams it in the app.</p><input id="indo-ext-url" type="url" placeholder="https://example.com/video.mp4" autocomplete="off"><input id="indo-ext-title" type="text" placeholder="Video title"><select id="indo-ext-type"><option value="video">Video</option><option value="reel">Reel</option></select><div id="indo-ext-status" class="indo-external-link-status"></div><div class="indo-external-link-actions"><button type="button" id="indo-ext-cancel">Cancel</button><button type="button" id="indo-ext-save" class="primary">Add Video</button></div></div>`;
  document.body.appendChild(wrap);
  const urlInput = wrap.querySelector("#indo-ext-url");
  const titleInput = wrap.querySelector("#indo-ext-title");
  const typeInput = wrap.querySelector("#indo-ext-type");
  const status = wrap.querySelector("#indo-ext-status");
  const close = () => wrap.remove();
  wrap.querySelector("#indo-ext-cancel").addEventListener("click", close);
  wrap.addEventListener("click", (event) => { if (event.target === wrap) close(); });
  wrap.querySelector("#indo-ext-save").addEventListener("click", async () => {
    const url = safeText(urlInput.value, 2000);
    const title = safeText(titleInput.value, 120);
    if (!/^https:\/\//i.test(url)) { status.textContent = "Use a valid HTTPS direct video URL."; status.classList.add("error"); return; }
    status.classList.remove("error"); status.textContent = "Saving link...";
    const button = wrap.querySelector("#indo-ext-save"); button.disabled = true;
    try {
      const video = await saveExternalVideo({ url, title: title || "Video", caption: title, mediaType: typeInput.value });
      status.textContent = "Video link added.";
      onDone?.(video);
      setTimeout(close, 350);
    } catch (error) {
      status.textContent = error?.message || "Could not add video link.";
      status.classList.add("error");
    } finally { button.disabled = false; }
  });
  urlInput.focus();
}

export function installExternalVideoLinkCreate(app) {
  if (!app || app.dataset.externalLinkReady === "1") return;
  installStyles();
  const target = app.querySelector("[data-upload-video]")?.closest("main") || app.querySelector("main");
  if (!target || target.querySelector("[data-external-video-link]")) return;
  const card = document.createElement("button");
  card.type = "button";
  card.className = "indo-external-link-card";
  card.dataset.externalVideoLink = "1";
  card.setAttribute("aria-label", "Add Video Link");
  card.innerHTML = `<div class="indo-external-link-art">🔗</div><div class="indo-external-link-copy"><h3>Add Video Link</h3><p>Paste a direct video URL. Indo streams it without uploading the video to Indo storage.</p><span class="indo-external-link-tag">⚡ Stream from source</span></div><span class="indo-external-link-arrow">→</span>`;
  const upload = target.querySelector("[data-upload-video]");
  upload?.insertAdjacentElement("afterend", card);
  card.addEventListener("click", () => openDialog());
  app.dataset.externalLinkReady = "1";
}
