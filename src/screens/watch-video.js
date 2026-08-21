import { auth } from "../features/auth/firebase-client.js";
import { emitInterest } from "../features/feed/interest-engine.js";
import { renderWatchVideo as renderStyledWatchVideo } from "./watch-video-v225.js";

const STYLE_ID = "indo-watch-live-actions-v227";
const API_BASE = () => window.INDO_API_BASE || "";
const cloneAndReplace = (node) => { if (!node) return null; const clone = node.cloneNode(true); node.replaceWith(clone); return clone; };
function esc(value = "") { return String(value).replace(/[&<>\"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '\"':"&quot;", "'":"&#039;" })[c]); }
function currentVideo() { try { return JSON.parse(sessionStorage.getItem("indo:watch-video-current") || "null"); } catch { return null; } }
function classify(raw) {
  try {
    const u = new URL(String(raw || "").trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be" || host === "youtube.com" || host.endsWith("youtube.com")) return { type: "youtube", id: youtubeId(u) };
    if (host === "t.me" || host === "telegram.me") return { type: "telegram", url: u.toString() };
    return { type: "direct", url: u.toString() };
  } catch { return { type: "direct", url: String(raw || "").trim() }; }
}
function youtubeId(u) {
  if (u.searchParams.get("v")) return u.searchParams.get("v");
  if (u.hostname === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || "";
  const parts = u.pathname.split("/").filter(Boolean);
  for (const kind of ["embed", "shorts", "live"]) { const i = parts.indexOf(kind); if (i >= 0) return parts[i + 1] || ""; }
  return "";
}
function telegramEmbedUrl(raw) {
  try { const u = new URL(raw); const p = u.pathname.split("/").filter(Boolean); return p.length >= 2 ? `https://t.me/${p[0]}/${p[1]}?embed=1` : u.toString(); } catch { return raw; }
}
function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.indo-watch-external-wrap{position:relative;width:100%;height:100%;background:#000}.indo-watch-external-frame{width:100%;height:100%;border:0;display:block;background:#000}.indo-watch-external-label{position:absolute;left:8px;bottom:8px;z-index:3;padding:4px 7px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:8px}`;
  document.head.appendChild(s);
}
function replaceExternalPlayer(app, video) {
  const raw = String(video?.sourceUrl || video?.external?.sourceUrl || "").trim();
  const kind = classify(raw);
  if (!raw || kind.type === "direct") return;
  const player = app.querySelector("#watch-video");
  const wrap = player?.closest(".indo-watch-player");
  if (!wrap) return;
  const holder = document.createElement("div");
  holder.className = "indo-watch-external-wrap";
  if (kind.type === "youtube" && kind.id) {
    holder.innerHTML = `<iframe class="indo-watch-external-frame" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(kind.id)}?playsinline=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><span class="indo-watch-external-label">YouTube</span>`;
  } else if (kind.type === "telegram") {
    holder.innerHTML = `<iframe class="indo-watch-external-frame" src="${esc(telegramEmbedUrl(raw))}" title="Telegram video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><span class="indo-watch-external-label">Telegram</span>`;
  } else return;
  player.replaceWith(holder);
}
async function token() { const user = auth.currentUser; if (!user) throw new Error("Please login first."); return user.getIdToken(true); }
async function request(path, { method = "GET", body, authRequired = true } = {}) { const headers = {}; if (body !== undefined) headers["Content-Type"] = "application/json"; if (authRequired) headers.Authorization = `Bearer ${await token()}`; const r = await fetch(`${API_BASE()}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Request failed."); return d; }
function showStatus(app, text) { let el = app.querySelector(".indo-watch-live-status"); if (!el) { el = document.createElement("div"); el.className = "indo-watch-live-status"; app.querySelector(".indo-watch-actions")?.after(el); } el.textContent = text || ""; clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ""; }, 2200); }
function installReliableBack(app) {
  const button = app.querySelector("[data-back]");
  if (!button || button.dataset.indoReliableBack === "1") return;
  const replacement = button.cloneNode(true);
  replacement.dataset.indoReliableBack = "1";
  replacement.type = "button";
  replacement.setAttribute("aria-label", "Back to videos");
  replacement.style.touchAction = "manipulation";
  replacement.style.pointerEvents = "auto";
  const goBack = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    const navigate = window.__indoNavigate;
    if (typeof navigate === "function") {
      Promise.resolve(navigate("video")).catch(() => { try { window.history.back(); } catch {} });
      return;
    }
    try { window.history.back(); } catch {}
  };
  replacement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") goBack(event);
  }, { passive: false });
  replacement.addEventListener("click", goBack);
  button.replaceWith(replacement);
}
async function wireActions(app, video) {
  installReliableBack(app);
  const original = [...app.querySelectorAll(".indo-watch-actions button[data-action]")]; const buttons = {}; for (const b of original) { const clone = cloneAndReplace(b); buttons[clone.dataset.action] = clone; }
  const likeBtn = buttons.like, commentBtn = buttons.comment, shareBtn = buttons.share, saveBtn = buttons.save, viewsBtn = buttons.views;
  try { const e = await request(`/api/media/${encodeURIComponent(video.id)}/engagement`); likeBtn?.classList.toggle("active-like", !!e.liked); saveBtn?.classList.toggle("active-save", !!e.saved); const span = likeBtn?.querySelector("span"); if (span) span.textContent = String(e.likes ?? 0); } catch {}
  likeBtn?.addEventListener("click", async () => { try { const next = !likeBtn.classList.contains("active-like"); const d = await request(`/api/media/${encodeURIComponent(video.id)}/like`, { method: "POST", body: { like: next } }); likeBtn.classList.toggle("active-like", next); const span = likeBtn.querySelector("span"); if (span) span.textContent = String(d.likes ?? 0); emitInterest(video, next ? "like" : "skip"); showStatus(app, next ? "Liked" : "Unliked"); } catch (e) { showStatus(app, e.message || "Like failed"); } });
  saveBtn?.addEventListener("click", async () => { try { const next = !saveBtn.classList.contains("active-save"); await request(`/api/media/${encodeURIComponent(video.id)}/save`, { method: "POST", body: { save: next } }); saveBtn.classList.toggle("active-save", next); showStatus(app, next ? "Saved" : "Removed from saved"); } catch (e) { showStatus(app, e.message || "Save failed"); } });
  commentBtn?.addEventListener("click", () => app.querySelector("#comment-input")?.focus());
  shareBtn?.addEventListener("click", async () => { try { if (navigator.share) await navigator.share({ title: video.title || "Indo video", url: location.href }); else await navigator.clipboard?.writeText(location.href); emitInterest(video, "share"); showStatus(app, "Link shared"); } catch {} });
  viewsBtn?.addEventListener("click", () => app.querySelector(".indo-watch-player")?.scrollIntoView({ behavior: "smooth", block: "center" }));
}
export async function renderWatchVideo(app) {
  installStyles();
  const raw = currentVideo();
  if (!raw) return;
  // Let the base renderer paint the video immediately; secondary API/UI work continues asynchronously.
  const baseRender = renderStyledWatchVideo(app);
  baseRender.then(() => {
    replaceExternalPlayer(app, raw);
    return wireActions(app, raw);
  }).catch((error) => console.warn("Watch secondary setup failed:", error));
}
