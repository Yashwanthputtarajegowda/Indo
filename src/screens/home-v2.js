const LAST_STORY_KEY = "indo:last-story";
const STORY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function esc(value = "") {
  return String(value).replace(
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
function normalizeStory(story) {
  if (!story || typeof story !== "object") return null;
  const secureUrl = String(
    story.secureUrl || story.videoUrl || story.url || story.mediaUrl || "",
  ).trim();
  if (!secureUrl) return null;
  const createdAt = Number(story.createdAt || story.timestamp || 0);
  const expiresAt = Number(story.expiresAt || 0);
  if (createdAt && Date.now() - createdAt > STORY_MAX_AGE_MS) return null;
  if (expiresAt && expiresAt <= Date.now()) return null;
  return {
    ...story,
    secureUrl,
    ownerUid: String(
      story.ownerUid || story.uid || story.userId || story.creatorUid || "",
    ).trim(),
    username: String(
      story.username ||
        story.userName ||
        story.handle ||
        story.name ||
        "Indo User",
    ).replace(/^@/, ""),
  };
}
function readCachedOwnStory(uid) {
  try {
    const story = normalizeStory(
      JSON.parse(localStorage.getItem(LAST_STORY_KEY) || "null"),
    );
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
function storyCard(story, own = false) {
  const username = story.username || "Indo User";
  const initial = username.charAt(0).toUpperCase() || "I";
  const id = String(story.id || story.publicId || story.secureUrl || "");
  return `<button class="indo-story-card${own ? " indo-story-card-own" : ""}" type="button" data-story-id="${esc(id)}" data-story-owner="${esc(story.ownerUid)}" data-story-url="${esc(story.secureUrl)}" data-story-name="${esc(username)}"><div class="indo-story-card-media">${own ? '<div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div>' : `<div class="indo-story-avatar">${esc(initial)}</div>`}${!own && story.isOnline ? '<span class="indo-story-online" aria-label="Online"></span>' : ""}</div><div class="indo-story-card-body"><strong>${own ? "Your Story" : `@${esc(username)}`}</strong><span>${own ? "Share a moment" : esc(storyTime(story))}</span></div></button>`;
}
function renderTopbarFallback() {
  return `<header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button class="create-button" data-screen="create" aria-label="Create">+</button><button class="search-button" data-screen="search" aria-label="Search">⌕</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">♧</button></div></header>`;
}
function ensureHomeStoryStyles() {
  const id = "indo-home-story-cards-v3";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `.indo-story-row{display:flex;gap:8px;align-items:stretch;overflow-x:auto;overflow-y:hidden;padding:8px 8px 10px;margin:0;border-bottom:1px solid #17171c;scrollbar-width:none;-webkit-overflow-scrolling:touch}.indo-story-row::-webkit-scrollbar{display:none}.indo-story-card{position:relative;display:flex;flex:0 0 100px;min-width:100px;width:100px;height:128px;flex-direction:column;overflow:hidden;padding:0;text-align:left;border:1px solid #262632;border-radius:12px;background:#111117;color:#f4f4f7;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.14)}.indo-story-card-own{border-color:#6f34d7;background:linear-gradient(145deg,#4a23a8 0%,#cf2f9f 100%)}.indo-story-card-media{position:relative;height:68px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#1a1a23}.indo-story-avatar{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7637ff,#f044ae);color:#fff;font-size:17px;font-weight:900}.indo-story-own-bg{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#7736ff,#dd2da8)}.indo-story-plus{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.78);background:rgba(255,255,255,.08);font-size:22px;font-weight:300;color:#fff}.indo-story-online{position:absolute;right:6px;top:6px;width:9px;height:9px;border-radius:50%;background:#2ee66b;border:2px solid #111117}.indo-story-card-body{display:flex;min-width:0;flex:1;flex-direction:column;justify-content:center;gap:3px;padding:7px 8px 9px}.indo-story-card-body strong{font-size:11px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-story-card-body span{font-size:8px;line-height:1.2;color:#b6b6c1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-story-card-own .indo-story-card-body span{color:#f0e4ff}.indo-story-card::after{content:'';position:absolute;left:8px;right:8px;bottom:5px;height:2px;border-radius:99px;background:linear-gradient(90deg,#8439ff,#ee3cab)}.indo-story-viewer{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}.indo-story-card-viewer{position:relative;width:min(100%,420px);height:min(90vh,760px);background:#000;border-radius:16px;overflow:hidden}.indo-story-card-viewer video{width:100%;height:100%;object-fit:contain;background:#000}.indo-story-close,.indo-story-share,.indo-story-more{position:absolute;top:10px;z-index:3;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff}.indo-story-close{left:12px;font-size:24px}.indo-story-share{right:52px}.indo-story-more{right:12px}.indo-story-title{position:absolute;left:54px;right:90px;top:17px;z-index:2;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-story-menu{position:absolute;right:12px;top:52px;z-index:4;display:none;min-width:150px;padding:6px;border-radius:10px;background:#18181f;border:1px solid #2b2b33}.indo-story-menu.open{display:block}.indo-story-menu button{display:block;width:100%;padding:10px 12px;border:0;background:none;color:#fff;text-align:left;font-weight:700}.indo-story-menu .delete{color:#ff6b6b}@media(min-width:700px){.indo-story-card{flex-basis:112px;min-width:112px;width:112px;height:136px}.indo-story-card-media{height:72px}}`;
  document.head.appendChild(style);
}
function getApiBase() {
  return window.INDO_API_BASE || "";
}
async function openStoryViewer(story, isOwn = false) {
  document.querySelector(".indo-story-viewer")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "indo-story-viewer";
  const id = String(story.id || story.publicId || "");
  const username = String(story.username || story.name || "user").replace(
    /^@/,
    "",
  );
  overlay.innerHTML = `<div class="indo-story-card-viewer"><button class="indo-story-close" type="button">×</button><button class="indo-story-share" type="button">↗</button>${isOwn ? '<button class="indo-story-more" type="button">⋯</button><div class="indo-story-menu"><button class="delete" type="button">Delete story</button></div>' : ""}<div class="indo-story-title">@${esc(username)}</div><video src="${esc(story.secureUrl)}" autoplay playsinline></video></div>`;
  const close = () => overlay.remove();
  overlay.querySelector(".indo-story-close")?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay
    .querySelector(".indo-story-share")
    ?.addEventListener("click", async () => {
      const url = `${window.location.origin}${window.location.pathname}?story=${encodeURIComponent(id)}`;
      try {
        if (navigator.share)
          await navigator.share({
            title: "Indo story",
            text: "Watch this story on Indo",
            url,
          });
        else if (navigator.clipboard?.writeText)
          await navigator.clipboard.writeText(url);
        else window.prompt("Copy story link:", url);
      } catch (error) {
        if (error?.name !== "AbortError")
          console.warn("Story sharing failed:", error);
      }
    });
  if (isOwn) {
    const more = overlay.querySelector(".indo-story-more");
    const menu = overlay.querySelector(".indo-story-menu");
    more?.addEventListener("click", (event) => {
      event.stopPropagation();
      menu?.classList.toggle("open");
    });
    overlay.querySelector(".delete")?.addEventListener("click", async () => {
      const user = (await import("../features/auth/firebase-client.js")).auth
        .currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch(
        `${getApiBase()}/api/stories/${encodeURIComponent(id)}/delete`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        menu.textContent = data.error || "Could not delete story.";
        return;
      }
      localStorage.removeItem(LAST_STORY_KEY);
      close();
      loadStories(document.getElementById("root")).catch(() => {});
    });
  }
  document.body.appendChild(overlay);
  overlay
    .querySelector("video")
    ?.play()
    .catch(() => {});
}
function bindStories(app) {
  app.querySelectorAll("[data-story-id]").forEach((item) =>
    item.addEventListener("click", async () => {
      const story = {
        id: item.dataset.storyId,
        ownerUid: item.dataset.storyOwner,
        secureUrl: item.dataset.storyUrl,
        username: item.dataset.storyName,
      };
      const { auth } = await import("../features/auth/firebase-client.js");
      await openStoryViewer(
        story,
        Boolean(
          auth.currentUser?.uid && auth.currentUser.uid === story.ownerUid,
        ),
      );
    }),
  );
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
  input.addEventListener(
    "change",
    async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file || !file.type.startsWith("video/")) return;
      window.__indoStoryDraftFile = file;
      await window.__indoNavigate?.("story-create");
    },
    { once: true },
  );
  input.click();
}
async function loadStories(app) {
  const row = app?.querySelector("[data-stories]");
  if (!row) return;
  try {
    const [{ loadStories: fetchStories }, { auth }] = await Promise.all([
      import("../features/stories/stories.js?v=20260814-128"),
      import("../features/auth/firebase-client.js"),
    ]);
    const currentUid = auth.currentUser?.uid || "";
    const stories = (await fetchStories()).map(normalizeStory).filter(Boolean);
    const own =
      stories.find((item) => item.ownerUid === currentUid) ||
      readCachedOwnStory(currentUid);
    const seenOwners = new Set();
    const others = stories.filter(
      (item) =>
        item.ownerUid &&
        item.ownerUid !== currentUid &&
        !seenOwners.has(item.ownerUid) &&
        seenOwners.add(item.ownerUid),
    );
    const cards = [];
    if (own) cards.push(storyCard(own, true));
    else
      cards.push(
        `<button class="indo-story-card indo-story-card-own" type="button" data-story-add><div class="indo-story-card-media"><div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div></div><div class="indo-story-card-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`,
      );
    for (const story of others) cards.push(storyCard(story));
    row.innerHTML = cards.join("");
    row
      .querySelector("[data-story-add]")
      ?.addEventListener("click", openStoryPicker);
    bindStories(app);
  } catch (error) {
    console.warn("Stories unavailable:", error);
    row.innerHTML = `<button class="indo-story-card indo-story-card-own" type="button" data-story-add><div class="indo-story-card-media"><div class="indo-story-own-bg"><span class="indo-story-plus">+</span></div></div><div class="indo-story-card-body"><strong>Your Story</strong><span>Share a moment</span></div></button>`;
    row
      .querySelector("[data-story-add]")
      ?.addEventListener("click", openStoryPicker);
  }
}
async function loadFeed(app) {
  const feed = app.querySelector("[data-home-feed]");
  const status = app.querySelector("[data-feed-status]");
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } =
      await import("../features/feed/home-feed.js?v=20260814-128");
    const videos = await loadHomeVideos();
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
    const { loadNotifications: fetchNotifications } =
      await import("../features/notifications/notifications.js?v=20260814-128");
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
  const topbar = app.querySelector(".topbar")
    ? app.querySelector(".topbar").outerHTML
    : renderTopbarFallback();
  app.innerHTML = `<div class="app-shell">${topbar}<div class="indo-story-row" data-stories></div><main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main></div>`;
  loadStories(app);
  loadFeed(app);
  loadNotifications(app);
}
