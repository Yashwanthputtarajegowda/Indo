const LAST_STORY_KEY = "indo:last-story";
const STORY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function esc(value = "") {
  return String(value).replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

function normalizeStory(story) {
  if (!story || typeof story !== "object") return null;
  const secureUrl = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || "").trim();
  if (!secureUrl) return null;
  const createdAt = Number(story.createdAt || story.timestamp || 0);
  const expiresAt = Number(story.expiresAt || 0);
  if (createdAt && Date.now() - createdAt > STORY_MAX_AGE_MS) return null;
  if (expiresAt && expiresAt <= Date.now()) return null;
  return {
    ...story,
    secureUrl,
    ownerUid: String(story.ownerUid || story.uid || story.userId || story.creatorUid || "").trim(),
    username: String(story.username || story.userName || story.handle || story.name || "Indo User").replace(/^@/, ""),
  };
}

function readCachedOwnStory(uid) {
  try {
    const story = normalizeStory(JSON.parse(localStorage.getItem(LAST_STORY_KEY) || "null"));
    return story && String(story.ownerUid) === String(uid || "") ? story : null;
  } catch {
    return null;
  }
}

function storyTime(story) {
  const value = Number(story.createdAt || story.timestamp || 0);
  if (!value) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : "1d ago";
}

function ensureHomeStoryStyles() {
  const id = "indo-home-story-cards-v4";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .indo-story-row{display:flex;gap:10px;align-items:stretch;overflow-x:auto;overflow-y:hidden;padding:10px 8px 12px;margin:0;border-bottom:1px solid #17171c;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    .indo-story-row::-webkit-scrollbar{display:none}
    .indo-story-card{position:relative;display:flex;flex:0 0 118px;min-width:118px;width:118px;height:146px;flex-direction:column;overflow:hidden;padding:0;text-align:left;border:1px solid #262632;border-radius:14px;background:#111117;color:#f4f4f7;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.16)}
    .indo-story-card-own{border-color:#6f34d7;background:linear-gradient(145deg,#4a23a8 0%,#cf2f9f 100%)}
    .indo-story-card-media{position:relative;height:80px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#1a1a23}
    .indo-story-avatar{width:50px;height:50px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#7637ff,#f044ae);color:#fff;font-size:20px;font-weight:900}
    .indo-story-own-bg{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#7736ff,#dd2da8)}
    .indo-story-plus{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.78);background:rgba(255,255,255,.08);font-size:26px;font-weight:300;color:#fff}
    .indo-story-online{position:absolute;right:7px;top:7px;width:10px;height:10px;border-radius:50%;background:#2ee66b;border:2px solid #111117}
    .indo-story-card-body{display:flex;min-width:0;flex:1;flex-direction:column;justify-content:center;gap:4px;padding:8px 9px 10px}
    .indo-story-card-body strong{font-size:12px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-story-card-body span{font-size:9px;line-height:1.25;color:#b6b6c1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-story-card-own .indo-story-card-body span{color:#f0e4ff}
    .indo-story-card::after{content:'';position:absolute;left:9px;right:9px;bottom:6px;height:2px;border-radius:99px;background:linear-gradient(90deg,#8439ff,#ee3cab)}
    .indo-story-viewer{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}
    .indo-story-card-viewer{position:relative;width:min(100%,420px);height:min(90vh,760px);background:#000;border-radius:16px;overflow:hidden}
    .indo-story-card-viewer video{width:100%;height:100%;object-fit:contain;background:#000}
    .indo-story-close,.indo-story-share,.indo-story-more{position:absolute;top:10px;z-index:3;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:grid;place-items:center}
    .indo-story-close{left:12px;font-size:24px}.indo-story-share{right:52px}.indo-story-more{right:12px}
    .indo-story-title{position:absolute;left:54px;right:90px;top:17px;z-index:2;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-story-menu{position:absolute;right:12px;top:52px;z-index:4;display:none;min-width:150px;padding:6px;border-radius:10px;background:#18181f;border:1px solid #2b2b33;box-shadow:0 12px 30px rgba(0,0,0,.55)}
    .indo-story-menu.open{display:block}.indo-story-menu button{display:block;width:100%;padding:10px 12px;border:0;background:none;color:#fff;text-align:left;font-weight:700}.indo-story-menu .delete{color:#ff6b6b}
  `;
  document.head.appendChild(style);
}

function storyCard(story, own = false) {
  const username = story.username || "Indo User";
  const initial = username.charAt(0).toUpperCase() || "I";
  const id = String(story.id || story.publicId || story.secureUrl || "");
  return `<button class="indo-story-card${own ? " indo-story-card-own" : ""}" type="button" data-story-id="${esc(id)}" data-story-owner="${esc(story.ownerUid)}" data-story-url="${esc(story.secureUrl)}" data-story-name="${esc(username)}"><div class="indo-story-card-media">${own ? '<div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div>' : `<div class="indo-story-avatar">${esc(initial)}</div>`}${!own && story.isOnline ? '<span class="indo-story-online" aria-label="Online"></span>' : ""}</div><div class="indo-story-card-body"><strong>${own ? "Your Story" : `@${esc(username)}`}</strong><span>${own ? "Share a moment" : esc(storyTime(story))}</span></div></button>`;
}

function renderTopbarFallback() {
  return `<header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button class="create-button" data-screen="create" aria-label="Create">+</button><button class="search-button" data-screen="search" aria-label="Search">⌕</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">♧</button></div></header>`;
}

async function openStoryPicker(event) {
  event.preventDefault();
  event.stopPropagation();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";
  input.style.position = "fixed";
  input.style.left = "-9999px";
  input.style.width = "1px";
  input.style.height = "1px";
  document.body.appendChild(input);
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file || !file.type.startsWith("video/")) return;
    window.__indoStoryDraftFile = file;
    await window.__indoNavigate?.("story-create");
  }, { once: true });
  input.click();
}

async function deleteStory(storyId, overlay) {
  const { auth } = await import("../features/auth/firebase-client.js");
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const token = await user.getIdToken(true);
  const response = await fetch(`${window.INDO_API_BASE || ""}/api/stories/${encodeURIComponent(storyId)}/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not delete story.");
  localStorage.removeItem(LAST_STORY_KEY);
  overlay.remove();
}

function openStoryViewer(story) {
  document.querySelector(".indo-story-viewer")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "indo-story-viewer";
  const owner = String(story.ownerUid || "");
  const currentUid = String(window.__indoCurrentUid || "");
  const isOwn = Boolean(owner && currentUid && owner === currentUid);
  const id = String(story.id || story.publicId || "");
  const username = String(story.username || story.name || "user").replace(/^@/, "");
  overlay.innerHTML = `<div class="indo-story-card-viewer"><button class="indo-story-close" type="button" aria-label="Close">×</button><button class="indo-story-share" type="button" aria-label="Share">↗</button>${isOwn ? '<button class="indo-story-more" type="button" aria-label="More">⋯</button><div class="indo-story-menu"><button class="delete" type="button">Delete story</button></div>' : ""}<div class="indo-story-title">@${esc(username)}</div><video src="${esc(story.secureUrl)}" autoplay playsinline controls></video></div>`;
  const close = () => { overlay.querySelector("video")?.pause(); overlay.remove(); };
  overlay.querySelector(".indo-story-close")?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
  overlay.querySelector(".indo-story-share")?.addEventListener("click", async () => {
    const url = `${window.location.origin}${window.location.pathname}?story=${encodeURIComponent(id)}`;
    try {
      if (navigator.share) await navigator.share({ title: "Indo story", text: "Watch this story on Indo", url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt("Copy story link:", url);
    } catch (error) {
      if (error?.name !== "AbortError") console.warn("Story sharing failed:", error);
    }
  });
  if (isOwn) {
    const more = overlay.querySelector(".indo-story-more");
    const menu = overlay.querySelector(".indo-story-menu");
    more?.addEventListener("click", (event) => { event.stopPropagation(); menu?.classList.toggle("open"); });
    overlay.querySelector(".delete")?.addEventListener("click", async () => {
      const button = overlay.querySelector(".delete");
      button.disabled = true;
      button.textContent = "Deleting...";
      try { await deleteStory(id, overlay); }
      catch (error) { button.disabled = false; button.textContent = error?.message || "Delete story"; }
    });
  }
  document.body.appendChild(overlay);
  overlay.querySelector("video")?.play().catch(() => {});
}

async function loadStories(app) {
  const row = app?.querySelector("[data-stories]");
  if (!row) return;
  try {
    const [{ loadStories: fetchStories }, { auth }] = await Promise.all([
      import("../features/stories/stories.js?v=20260822-story-v2"),
      import("../features/auth/firebase-client.js?v=20260822-auth-stable-v2"),
    ]);
    window.__indoCurrentUid = auth.currentUser?.uid || "";
    const stories = (await fetchStories()).map(normalizeStory).filter(Boolean);
    const own = stories.find((item) => item.ownerUid === window.__indoCurrentUid) || readCachedOwnStory(window.__indoCurrentUid);
    const seenOwners = new Set();
    const others = stories.filter((item) => item.ownerUid && item.ownerUid !== window.__indoCurrentUid && !seenOwners.has(item.ownerUid) && seenOwners.add(item.ownerUid));
    const cards = [];
    if (own) cards.push(storyCard(own, true));
    else cards.push(`<button class="indo-story-card indo-story-card-own" type="button" data-story-add><div class="indo-story-card-media"><div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div></div><div class="indo-story-card-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`);
    for (const story of others) cards.push(storyCard(story));
    row.innerHTML = cards.join("");
    row.querySelector("[data-story-add]")?.addEventListener("click", openStoryPicker);
    row.querySelectorAll("[data-story-id]").forEach((item) => item.addEventListener("click", () => openStoryViewer({ id: item.dataset.storyId, ownerUid: item.dataset.storyOwner, secureUrl: item.dataset.storyUrl, username: item.dataset.storyName })));
  } catch (error) {
    console.warn("Stories unavailable:", error);
    row.innerHTML = `<button class="indo-story-card indo-story-card-own" type="button" data-story-add><div class="indo-story-card-media"><div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div></div><div class="indo-story-card-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`;
    row.querySelector("[data-story-add]")?.addEventListener("click", openStoryPicker);
  }
}

async function loadFeed(app) {
  const feed = app.querySelector("[data-home-feed]");
  const status = app.querySelector("[data-feed-status]");
  if (!feed || !status) return;
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import("../features/feed/home-feed.js?v=20260822-safe-v4");
    const videos = await loadHomeVideos(10);
    if (!videos.length) {
      status.textContent = "No videos yet. Upload your first video.";
      return;
    }
    status.remove();
    feed.innerHTML = videos.map(renderVideoCard).join("");
    bindVideoCards(feed);
  } catch (error) {
    console.error("Home feed failed:", error);
    status.textContent = "Could not load videos right now.";
  }
}

async function loadNotifications(app) {
  try {
    const button = app.querySelector(".notification-button");
    if (!button) return;
    const { loadNotifications: fetchNotifications } = await import("../features/notifications/notifications.js?v=20260822-notifications-v2");
    const items = await fetchNotifications();
    const unread = items.filter((item) => !item.read).length;
    if (!unread) return;
    const badge = document.createElement("span");
    badge.className = "notification-badge";
    badge.textContent = unread > 99 ? "99+" : String(unread);
    button.style.position = "relative";
    button.appendChild(badge);
  } catch (error) {
    console.warn("Notifications unavailable:", error);
  }
}

export function renderHome(app) {
  ensureHomeStoryStyles();
  const fallbackTopbar = `<header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button class="create-button" data-screen="create" aria-label="Create">+</button><button class="search-button" data-screen="search" aria-label="Search">⌕</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">♧</button></div></header>`;
  app.innerHTML = `<div class="app-shell">${fallbackTopbar}<div class="indo-story-row" data-stories></div><main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main></div>`;
  window.setTimeout(() => {
    void loadStories(app);
    void loadFeed(app);
    void loadNotifications(app);
  }, 0);
}
