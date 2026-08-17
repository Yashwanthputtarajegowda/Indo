import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";

const STYLE_ID = "indo-video-community-v9";
const API_BASE = () => window.INDO_API_BASE || "";
const PAGE_SIZE = 12;

function esc(value = "") {
  return String(value).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;" }[c]));
}
function age(value) {
  const t = Number(value || 0);
  if (!t) return "Latest";
  const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}
function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.indo-community-video-shell{min-height:100vh;background:#030308;color:#fff;padding-bottom:78px}.indo-community-video-main{max-width:820px;margin:auto;padding:12px 10px 28px}.indo-community-video-search{height:46px;display:flex;align-items:center;gap:9px;padding:0 13px;margin-bottom:15px;border:1px solid #2b2634;border-radius:13px;background:#111118;box-sizing:border-box}.indo-community-video-search svg{width:19px;height:19px;fill:none;stroke:#dedbe5;stroke-width:1.8}.indo-community-video-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;font-size:13px}.indo-community-video-head{margin:4px 2px 10px}.indo-community-video-head h2{margin:0;font-size:17px;font-weight:900}.indo-community-video-head small{color:#8c8794;font-size:8px}.indo-community-video-status,.indo-community-video-more{padding:20px;text-align:center;color:#85808e;font-size:11px}.indo-community-video-list{display:grid;gap:14px}.indo-community-video-card{overflow:hidden;border:1px solid #26242d;border-radius:14px;background:#09090e;cursor:pointer}.indo-community-video-thumb-wrap{position:relative;width:100%;aspect-ratio:16/9;background:#101018;overflow:hidden}.indo-community-video-thumb{width:100%;height:100%;display:block;object-fit:cover}.indo-community-video-fallback{width:100%;height:100%;display:grid;place-items:center;background:#101018;color:#b85fff;font-size:42px}.indo-community-video-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:58px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:rgba(0,0,0,.58);color:#fff;display:grid;place-items:center;font-size:24px}.indo-community-video-body{padding:10px 11px 12px}.indo-community-video-title{margin:0;color:#f5f3fa;font-size:14px;font-weight:900;line-height:1.3}.indo-community-video-meta{display:flex;gap:7px;margin-top:6px;color:#888392;font-size:9px}.indo-community-video-badge{padding:4px 6px;font-size:8px;font-weight:800;border-radius:999px;background:rgba(183,91,255,.16);color:#d3a1ff;white-space:nowrap}`;
  document.head.appendChild(s);
}
function normalize(item) {
  if (!item?.id) return null;
  const videoUrl = String(item.streamUrl || item.videoUrl || item.secureUrl || item.url || "").trim();
  if (!videoUrl) return null;
  return { ...item, id: String(item.id), videoUrl, secureUrl: videoUrl, streamUrl: videoUrl, thumbnailUrl: String(item.thumbnailUrl || item.thumbUrl || "").trim() };
}
function card(item) {
  const thumb = item.thumbnailUrl;
  const img = thumb
    ? `<img class="indo-community-video-thumb" src="${esc(thumb)}" alt="" loading="lazy" decoding="async">`
    : `<div class="indo-community-video-fallback">▶</div>`;
  return `<article class="indo-community-video-card" data-watch-video-id="${esc(item.id)}"><div class="indo-community-video-thumb-wrap">${img}<span class="indo-community-video-play">▶</span></div><div class="indo-community-video-body"><div style="display:flex;justify-content:space-between;gap:8px"><h3 class="indo-community-video-title">${esc(item.title || "Indo video")}</h3><span class="indo-community-video-badge">COMMUNITY</span></div><div class="indo-community-video-meta"><span>@${esc(String(item.creatorName || item.username || "user").replace(/^@/, ""))}</span><span>·</span><span>${esc(age(item.createdAt))}</span></div></div></article>`;
}
export async function renderVideo(app) {
  installStyles();
  const top = renderIndoBrandTopbar({ rightHtml: '<button type="button" data-screen="create" aria-label="Create">＋</button>', rightLabel: "Create" });
  app.innerHTML = `<div class="app-shell indo-community-video-shell">${top}<main class="indo-community-video-main"><label class="indo-community-video-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><input id="community-video-search" type="search" placeholder="Search Indo videos..." autocomplete="off"></label><div class="indo-community-video-head"><h2>Latest Community Videos</h2><small>Real Indo uploads · tap a thumbnail to watch</small></div><div id="community-video-status" class="indo-community-video-status">Loading community videos…</div><div id="community-video-list" class="indo-community-video-list"></div><div id="community-video-more" class="indo-community-video-more"></div></main></div>`;
  const input = app.querySelector("#community-video-search");
  const status = app.querySelector("#community-video-status");
  const list = app.querySelector("#community-video-list");
  const more = app.querySelector("#community-video-more");
  let all = [];
  let visible = 0;
  let stopped = false;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const filtered = q ? all.filter((v) => `${v.title || ""} ${v.description || ""} ${v.creatorName || ""} ${v.username || ""}`.toLowerCase().includes(q)) : all;
    visible = Math.min(visible || PAGE_SIZE, filtered.length);
    list.innerHTML = filtered.slice(0, visible).map(card).join("");
    more.textContent = visible < filtered.length ? "Scroll for more" : (filtered.length ? "All available videos loaded" : "No community videos found.");
    status.textContent = filtered.length ? "" : (q ? "No matching videos." : "No community videos available yet.");
    status.style.display = filtered.length ? "none" : "block";
  };

  try {
    const response = await fetch(`${API_BASE()}/api/media/videos?type=video&limit=50`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not load community videos.");
    const seen = new Set();
    all = (Array.isArray(data.videos) ? data.videos : []).map(normalize).filter((v) => v && !seen.has(v.id) && seen.add(v.id));
    all.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    visible = PAGE_SIZE;
    render();
  } catch (error) {
    status.textContent = error.message || "Could not load community videos.";
    more.textContent = "";
  }

  const sentinel = document.createElement("div");
  sentinel.style.height = "1px";
  more.after(sentinel);
  const io = new IntersectionObserver((entries) => {
    if (stopped || !entries.some((e) => e.isIntersecting)) return;
    const q = input.value.trim().toLowerCase();
    const filteredLength = q ? all.filter((v) => `${v.title || ""} ${v.description || ""} ${v.creatorName || ""} ${v.username || ""}`.toLowerCase().includes(q)).length : all.length;
    if (visible < filteredLength) { visible = Math.min(visible + PAGE_SIZE, filteredLength); render(); }
  }, { rootMargin: "1000px 0px" });
  io.observe(sentinel);

  input.addEventListener("input", render);
  list.addEventListener("click", (event) => {
    const el = event.target.closest("[data-watch-video-id]");
    if (!el) return;
    const item = all.find((v) => v.id === String(el.dataset.watchVideoId));
    if (!item) return;
    sessionStorage.setItem("indo:watch-video-current", JSON.stringify(item));
    window.__indoNavigate?.("watch-video");
  });

  const observer = new MutationObserver(() => {
    if (!document.body.contains(app)) { stopped = true; io.disconnect(); observer.disconnect(); }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
