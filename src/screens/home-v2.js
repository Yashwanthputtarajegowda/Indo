const STORY_CACHE_KEY = "indo:last-story";
const STORY_MAX_AGE = 24 * 60 * 60 * 1000;

function esc(value = "") {
  return String(value).replace(/[&<>\"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;",
  }[c]));
}

function normalizeStory(story) {
  if (!story || typeof story !== "object") return null;
  const url = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || "").trim();
  if (!url) return null;
  const createdAt = Number(story.createdAt || story.timestamp || 0);
  const expiresAt = Number(story.expiresAt || 0);
  if (createdAt && Date.now() - createdAt > STORY_MAX_AGE) return null;
  if (expiresAt && expiresAt <= Date.now()) return null;
  return {
    ...story,
    secureUrl: url,
    ownerUid: String(story.ownerUid || story.uid || story.userId || story.creatorUid || "").trim(),
    username: String(story.username || story.userName || story.handle || story.name || "Indo User").replace(/^@/, ""),
  };
}

function readOwnStory(uid) {
  try {
    const story = normalizeStory(JSON.parse(localStorage.getItem(STORY_CACHE_KEY) || "null"));
    return story && String(story.ownerUid) === String(uid || "") ? story : null;
  } catch { return null; }
}

function storyCard(story, own = false) {
  const username = story?.username || "Indo User";
  const id = String(story?.id || story?.publicId || story?.secureUrl || "");
  const initial = username.charAt(0).toUpperCase() || "I";
  return `<button class="indo-story-card${own ? " indo-story-card-own" : ""}" type="button" data-story-id="${esc(id)}" data-story-owner="${esc(story?.ownerUid || "")}" data-story-url="${esc(story?.secureUrl || "")}" data-story-name="${esc(username)}"><div class="indo-story-card-media">${own ? '<div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div>' : `<div class="indo-story-avatar">${esc(initial)}</div>`}</div><div class="indo-story-card-body"><strong>${own ? "Your Story" : `@${esc(username)}`}</strong><span>${own ? "Share a moment" : "Tap to view"}</span></div></button>`;
}

function installStyles() {
  const id = "indo-home-safe-v1";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .indo-safe-story-row{display:flex;gap:8px;overflow-x:auto;padding:8px;border-bottom:1px solid #17171c;scrollbar-width:none}
    .indo-safe-story-row::-webkit-scrollbar{display:none}
    .indo-safe-story-card,.indo-safe-story-add{flex:0 0 100px;width:100px;height:122px;border:1px solid #292936;border-radius:12px;background:#111117;color:#fff;padding:0;overflow:hidden;text-align:left}
    .indo-safe-story-own{border-color:#743cff;background:linear-gradient(145deg,#4a23a8,#cf2f9f)}
    .indo-safe-story-media{height:66px;display:grid;place-items:center;background:#1a1a23}
    .indo-safe-story-avatar{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#7637ff,#f044ae);font-weight:900}
    .indo-safe-story-body{padding:7px 8px;display:flex;flex-direction:column;gap:3px}
    .indo-safe-story-body strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-safe-story-body span{font-size:8px;color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-story-viewer-safe{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}
    .indo-story-viewer-safe video{width:min(100%,430px);height:min(90vh,760px);object-fit:contain;background:#000;border-radius:14px}
    .indo-story-viewer-safe button{position:absolute;top:15px;left:15px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:22px}
  `;
  document.head.appendChild(style);
}

function bindStoryCards(app) {
  app.querySelectorAll("[data-story-id]").forEach((button) => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      const url = String(button.dataset.storyUrl || "");
      if (!url) return;
      const viewer = document.createElement("div");
      viewer.className = "indo-story-viewer-safe";
      viewer.innerHTML = `<button type="button" aria-label="Close">×</button><video src="${esc(url)}" controls autoplay playsinline preload="metadata"></video>`;
      viewer.querySelector("button")?.addEventListener("click", () => viewer.remove());
      viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.remove(); });
      document.body.appendChild(viewer);
      viewer.querySelector("video")?.play().catch(() => {});
    });
  });
}

async function loadStories(app) {
  const row = app.querySelector("[data-stories]");
  if (!row) return;
  try {
    const [{ loadStories }, { auth }] = await Promise.all([
      import("../features/stories/stories.js?v=20260822-safe-v1"),
      import("../features/auth/firebase-client.js"),
    ]);
    const currentUid = auth.currentUser?.uid || "";
    const stories = (await loadStories()).map(normalizeStory).filter(Boolean);
    const own = stories.find((item) => String(item.ownerUid) === String(currentUid)) || readOwnStory(currentUid);
    const others = [];
    const owners = new Set();
    for (const story of stories) {
      if (!story.ownerUid || story.ownerUid === currentUid || owners.has(story.ownerUid)) continue;
      owners.add(story.ownerUid);
      others.push(story);
    }
    const cards = own ? [storyCard(own, true)] : [`<button class="indo-safe-story-card indo-safe-story-own" type="button" data-story-add><div class="indo-safe-story-media">+</div><div class="indo-safe-story-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`];
    for (const story of others) cards.push(storyCard(story));
    row.innerHTML = cards.join("").replace(/indo-story-card/g, "indo-safe-story-card").replace(/indo-story-card-own/g, "indo-safe-story-own").replace(/indo-story-card-media/g, "indo-safe-story-media").replace(/indo-story-own-bg/g, "indo-safe-story-media").replace(/indo-story-plus/g, "indo-safe-story-plus").replace(/indo-story-avatar/g, "indo-safe-story-avatar").replace(/indo-story-card-body/g, "indo-safe-story-body");
    row.querySelector("[data-story-add]")?.addEventListener("click", async (event) => {
      event.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        window.__indoStoryDraftFile = file;
        await window.__indoNavigate?.("story-create");
      };
      input.click();
    });
    bindStoryCards(app);
  } catch (error) {
    console.warn("Stories unavailable:", error);
    row.innerHTML = `<button class="indo-safe-story-card indo-safe-story-own" type="button" data-story-add><div class="indo-safe-story-media">+</div><div class="indo-safe-story-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`;
  }
}

async function loadFeed(app) {
  const feed = app.querySelector("[data-home-feed]");
  const status = app.querySelector("[data-feed-status]");
  if (!feed || !status) return;
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import("../features/feed/home-feed.js?v=20260822-safe-v2");
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

export function renderHome(app) {
  installStyles();
  const fallbackTopbar = `<header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button class="create-button" data-screen="create" aria-label="Create">+</button><button class="search-button" data-screen="search" aria-label="Search">⌕</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">♧</button></div></header>`;
  app.innerHTML = `<div class="app-shell">${fallbackTopbar}<div class="indo-safe-story-row" data-stories></div><main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main></div>`;

  // First paint is synchronous. Network/media work starts only after the DOM is visible.
  window.setTimeout(() => {
    void loadStories(app);
    void loadFeed(app);
  }, 0);
}
