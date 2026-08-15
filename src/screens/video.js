import { auth } from "../features/auth/firebase-client.js";
import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";
import { rankMedia, recordMediaInteraction, recordSearchQuery } from "../features/feed/recommendation.js?v=223";

const STYLE_ID = "indo-video-section-v223";
const FOLLOWED_TTL_MS = 24 * 60 * 60 * 1000;
const SEEN_STORAGE_KEY = "indo:followed-video-seen:v5";
const WATCH_KEY = "indo:watch-video-current";
const API_BASE = () => window.INDO_API_BASE || "";
function esc(v = "") {
  return String(v).replace(
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
}
function count(v) {
  const n = Number(v || 0);
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.max(0, n));
}
function age(t) {
  const m = Math.floor(Math.max(0, Date.now() - Number(t || Date.now())) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function duration(s) {
  const n = Number(s || 0);
  return n ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}` : "";
}
function src(raw) {
  const u = String(raw || "");
  if (!u.includes("res.cloudinary.com") || !u.includes("/video/upload/")) return u;
  const m = "/video/upload/",
    i = u.indexOf(m);
  if (i < 0) return u;
  const p = u.slice(0, i + m.length),
    r = u.slice(i + m.length);
  return r.startsWith("f_mp4,vc_h264,ac_aac/") ? u : `${p}f_mp4,vc_h264,ac_aac/${r}`;
}
function seen() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveSeen(v) {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(v));
  } catch {}
}
function markSeen(id) {
  if (!id) return;
  const m = seen();
  m[String(id)] = Date.now();
  saveSeen(m);
}
function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `.indo-video-shell{min-height:100vh;background:#030308;color:#fff;padding-bottom:78px;overflow-x:hidden}.indo-video-main{padding:10px 8px 24px;max-width:760px;margin:0 auto}.indo-video-search{width:100%;height:44px;border:1px solid #2b2634;border-radius:13px;background:#111118;display:flex;align-items:center;gap:9px;padding:0 13px;margin:0 0 16px;box-sizing:border-box}.indo-video-search svg{width:19px;height:19px;stroke:#dedbe5;fill:none;stroke-width:1.8}.indo-video-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#fff;font-size:12px}.indo-video-search input::placeholder{color:#777381}.indo-video-head{display:flex;align-items:end;justify-content:space-between;margin:0 2px 10px}.indo-video-head h2{margin:0;font-size:16px;font-weight:900}.indo-video-head small{display:block;margin-top:3px;color:#888392;font-size:8px}.indo-video-follow-row{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:0 2px 14px;margin-bottom:15px;border-bottom:1px solid #191820}.indo-video-follow-row::-webkit-scrollbar{display:none}.indo-video-mini{min-width:112px;width:112px;flex:0 0 112px;padding:0;border:0;background:transparent;color:#fff;text-align:left;scroll-snap-align:start;cursor:pointer}.indo-video-mini-media{position:relative;aspect-ratio:3/4;border:1px solid #2a2530;border-radius:11px;overflow:hidden;background:#0d0d13}.indo-video-mini.is-new .indo-video-mini-media{border-color:#d636ff;box-shadow:0 0 0 1px #d636ff,0 0 15px rgba(234,47,192,.25)}.indo-video-mini-media video{width:100%;height:100%;object-fit:cover}.indo-video-mini-duration{position:absolute;right:5px;bottom:5px;padding:3px 4px;background:rgba(0,0,0,.68);border-radius:5px;font-size:7px;font-weight:800}.indo-video-mini-name{display:block;margin-top:6px;font-size:8px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-video-mini-time{display:block;margin-top:2px;color:#777381;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-video-empty{width:100%;padding:18px;text-align:center;border:1px dashed #292532;border-radius:11px;color:#777381;font-size:9px}.indo-video-card{border-radius:13px;overflow:hidden;background:#09090e;border:1px solid #25242d;box-shadow:0 9px 25px rgba(0,0,0,.24);margin-bottom:13px}.indo-video-poster{position:relative;width:100%;aspect-ratio:16/9;border:0;padding:0;background:#111;display:block;cursor:pointer}.indo-video-poster:focus-visible,.indo-video-mini:focus-visible{outline:2px solid #c63dff;outline-offset:2px}.indo-video-poster video{width:100%;height:100%;object-fit:cover}.indo-video-duration{position:absolute;right:8px;bottom:8px;padding:4px 6px;border-radius:6px;background:rgba(0,0,0,.72);font-size:8px;font-weight:800}.indo-video-title-block{padding:9px 10px 10px}.indo-video-title{margin:0;font-size:14px;font-weight:900;line-height:1.25}.indo-video-meta{display:flex;align-items:center;gap:6px;margin-top:5px;color:#8a8593;font-size:8px}.indo-video-user{color:#d4d0da;font-weight:800}.indo-video-menu{margin-left:auto;border:0;background:transparent;color:#cfcad7;font-size:18px}.indo-video-no-results{padding:30px 14px;text-align:center;color:#85808e;font-size:11px;border:1px dashed #2a2733;border-radius:13px}`;
  document.head.appendChild(s);
}
async function loadVideos() {
  const r = await fetch(`${API_BASE()}/api/media/videos?type=video&limit=50`);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Could not load videos.");
  return Array.isArray(d.videos) ? d.videos : [];
}
async function loadFollowing() {
  try {
    const uid = String(auth.currentUser?.uid || "");
    if (!uid) return [];
    const token = await auth.currentUser.getIdToken();
    const r = await fetch(`${API_BASE()}/api/social/following/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json().catch(() => ({}));
    return r.ok && Array.isArray(d.items) ? d.items : [];
  } catch {
    return [];
  }
}
function followedWindow(videos, following) {
  const keys = new Set(
    following.flatMap((f) => [String(f.uid || ""), String(f.userId || "").replace(/^@/, ""), String(f.username || "").replace(/^@/, ""), String(f.creatorUid || "")].filter(Boolean)),
  );
  const cutoff = Date.now() - FOLLOWED_TTL_MS;
  const m = seen();
  return videos
    .filter(
      (v) =>
        Number(v.createdAt || 0) >= cutoff &&
        [v.ownerUid, v.uid, v.creatorUid, String(v.userId || "").replace(/^@/, ""), String(v.creator || "").replace(/^@/, "")].filter(Boolean).some((k) => keys.has(String(k))),
    )
    .sort((a, b) => {
      const as = !!m[String(a.id)],
        bs = !!m[String(b.id)];
      if (as !== bs) return as ? 1 : -1;
      return Number(b.createdAt || 0) - Number(a.createdAt || 0);
    });
}
function matches(v, q) {
  q = String(q || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return [v.title, v.caption, v.description, v.creator, v.creatorName, v.userId, v.username, v.category, v.tags]
    .flatMap((x) => (Array.isArray(x) ? x : [x]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}
function mini(v) {
  const creator = String(v.creator || v.userId || "user").replace(/^@/, "");
  return `<button class="indo-video-mini ${seen()[String(v.id)] ? "" : "is-new"}" type="button" data-open="${esc(v.id)}" aria-label="Open video watch page"><div class="indo-video-mini-media"><video muted playsinline preload="metadata" src="${esc(src(v.secureUrl || v.videoUrl || v.url || ""))}"></video>${duration(v.duration) ? `<span class="indo-video-mini-duration">${esc(duration(v.duration))}</span>` : ""}</div><b class="indo-video-mini-name">@${esc(creator)}</b><small class="indo-video-mini-time">${esc(age(v.createdAt))}</small></button>`;
}
function poster(v) {
  const creator = String(v.creator || v.userId || "user").replace(/^@/, "");
  return `<article class="indo-video-card"><button class="indo-video-poster" type="button" data-open="${esc(v.id)}" aria-label="Watch ${esc(v.title || "video")}"><video muted playsinline preload="metadata" src="${esc(src(v.secureUrl || v.videoUrl || v.url || ""))}"></video>${duration(v.duration) ? `<span class="indo-video-duration">${esc(duration(v.duration))}</span>` : ""}</button><div class="indo-video-title-block"><h3 class="indo-video-title">${esc(v.title || "Untitled video")}</h3><div class="indo-video-meta"><span class="indo-video-user">@${esc(creator)}</span><span>·</span><span>${esc(age(v.createdAt))}</span><span>·</span><span>${count(v.views)} views</span><button class="indo-video-menu" type="button" aria-label="More video options">⋮</button></div></div></article>`;
}
async function openWatch(v) {
  if (!v || !v.id) return;
  markSeen(v.id);
  try {
    recordMediaInteraction(v, "view");
  } catch {}
  try {
    sessionStorage.setItem(WATCH_KEY, JSON.stringify(v));
  } catch {}
  const navigate = window.__indoNavigate;
  if (typeof navigate === "function") {
    setTimeout(() => {
      try {
        navigate("watch-video");
      } catch (error) {
        console.error("Watch navigation failed:", error);
      }
    }, 0);
    return;
  }
  try {
    const { state } = await import("../state.js");
    state.screen = "watch-video";
    const mod = await import("../router.js?v=223");
    await mod.render(document.getElementById("root"));
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch (error) {
    console.error("Watch page fallback failed:", error);
  }
}
export async function renderVideo(app) {
  installStyles();
  const top = renderIndoBrandTopbar({
    rightHtml: '<button type="button" data-screen="create" aria-label="Create">＋</button>',
    rightLabel: "Create",
  });
  app.innerHTML = `<div class="app-shell indo-video-shell">${top}<main class="indo-video-main"><label class="indo-video-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><input id="video-search" type="search" placeholder="Search videos, users, topics..." autocomplete="off"></label><section><div class="indo-video-head"><div><h2>From people you follow</h2><small>Latest videos · 24 hours</small></div></div><div class="indo-video-follow-row" id="followed-row"><div class="indo-video-empty">Loading...</div></div></section><section><div class="indo-video-head"><div><h2>Recent uploads</h2><small>Personalized for you · videos only</small></div></div><div id="recent-list"><div class="indo-video-no-results">Loading videos...</div></div></section></main></div>`;
  const input = app.querySelector("#video-search"),
    followed = app.querySelector("#followed-row"),
    recent = app.querySelector("#recent-list");
  try {
    const [videos, following] = await Promise.all([loadVideos(), loadFollowing()]);
    const open = (event) => {
      const button = event.target.closest("[data-open]");
      if (!button || !app.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      const v = videos.find((x) => String(x.id) === String(button.dataset.open));
      if (v) openWatch(v);
    };
    app.addEventListener("click", open);
    const draw = (q = "") => {
      if (q) recordSearchQuery(q);
      const f = followedWindow(videos, following).filter((v) => matches(v, q));
      followed.innerHTML = q
        ? '<div class="indo-video-empty">Search results are videos only.</div>'
        : f.length
          ? f.map(mini).join("")
          : '<div class="indo-video-empty">No fresh videos from people you follow.</div>';
      const base = videos.filter((v) => matches(v, q));
      const fids = new Set(f.map((v) => String(v.id)));
      const ranked = rankMedia(
        base.filter((v) => !fids.has(String(v.id))),
        { type: "video", query: q, limit: 50, freshness: 1.2 },
      );
      recent.innerHTML = ranked.length ? ranked.map(poster).join("") : '<div class="indo-video-no-results">No matching video uploads found.</div>';
    };
    draw("");
    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => draw(input.value.trim()), 250);
    });
  } catch (e) {
    followed.innerHTML = '<div class="indo-video-empty">Could not load followed videos.</div>';
    recent.innerHTML = `<div class="indo-video-no-results">${esc(e?.message || "Could not load videos.")}</div>`;
  }
}
