const appIcons = {
  home: '⌂', search: '⌕', reel: '▶', create: '+', profile: '●', heart: '♡', bell: '♧'
};

const LAST_STORY_KEY = 'indo:last-story';

function renderNav() {
  return `<nav class="bottom-nav"><button data-screen="home" class="active">${appIcons.home}<span>Home</span></button><button data-screen="search">${appIcons.search}<span>Search</span></button><button data-screen="reels">${appIcons.reel}<span>Reels</span></button><button data-screen="create">${appIcons.create}<span>Create</span></button><button data-screen="profile">${appIcons.profile}<span>Profile</span></button></nav>`;
}

function ensureStoryStyles() {
  if (document.getElementById('indo-story-inline-v7')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-inline-v7';
  style.textContent = `
    .stories-v2{display:flex!important;align-items:flex-start!important;gap:14px!important;padding:10px 10px 12px!important;overflow-x:auto!important;border-bottom:1px solid #17171c!important;scrollbar-width:none!important;min-height:86px!important}
    .stories-v2::-webkit-scrollbar{display:none!important}
    .story-v2{position:relative!important;display:flex!important;flex:0 0 66px!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;width:66px!important;min-width:66px!important;height:72px!important;padding:0!important;margin:0!important;gap:6px!important;color:#d8d8df!important;text-align:center!important;border:0!important;background:none!important;cursor:pointer!important}
    .story-v2-avatar{position:relative!important;display:grid!important;place-items:center!important;width:56px!important;height:56px!important;border-radius:50%!important;background:linear-gradient(135deg,#743cff,#f83ab8)!important;color:#fff!important;font-size:15px!important;font-weight:800!important;margin:0 auto!important;overflow:visible!important}
    .story-v2-name{display:block!important;width:100%!important;margin:0!important;padding:0!important;color:#d8d8df!important;font-size:10px!important;font-weight:600!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .story-v2-add{position:absolute!important;right:-2px!important;bottom:-2px!important;width:20px!important;height:20px!important;border-radius:50%!important;border:2px solid #09090e!important;background:#7b3cff!important;color:#fff!important;font-size:13px!important;font-weight:900!important;padding:0!important;display:grid!important;place-items:center!important;z-index:3!important;cursor:pointer!important}
    .story-viewer-v2{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}
    .story-viewer-v2-card{position:relative;width:min(100%,420px);height:min(90vh,760px);display:flex;align-items:center;justify-content:center;background:#000;border-radius:16px;overflow:hidden}
    .story-viewer-v2-card video{width:100%;height:100%;object-fit:contain;display:block;background:#000}
    .story-viewer-v2-close,.story-viewer-v2-menu{position:absolute;top:10px;z-index:4;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;cursor:pointer}
    .story-viewer-v2-close{left:12px;font-size:24px}
    .story-viewer-v2-menu{right:12px;font-size:24px;line-height:26px}
    .story-viewer-v2-title{position:absolute;left:54px;top:16px;z-index:3;color:#fff;font-size:13px;font-weight:800;max-width:calc(100% - 110px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .story-viewer-v2-actions{position:absolute;right:12px;top:52px;z-index:5;display:none;min-width:150px;padding:6px;border-radius:10px;background:#18181f;border:1px solid #2b2b33;box-shadow:0 10px 30px rgba(0,0,0,.45)}
    .story-viewer-v2-actions.open{display:block}
    .story-viewer-v2-actions button{display:block;width:100%;padding:10px 12px;border:0;background:none;color:#fff;text-align:left;font-size:13px;font-weight:700;border-radius:8px;cursor:pointer}
    .story-viewer-v2-actions button:hover{background:#262630}
    .story-viewer-v2-actions .story-delete{color:#ff6b6b}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[char]));
}

function normalizeStory(story) {
  if (!story || typeof story !== 'object') return null;
  const url = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '').trim();
  if (!url) return null;
  return { ...story, secureUrl: url };
}

function getCachedOwnStory(currentUid) {
  try {
    const story = normalizeStory(JSON.parse(localStorage.getItem(LAST_STORY_KEY) || 'null'));
    if (!story) return null;
    const ownerUid = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '').trim();
    const expiresAt = Number(story.expiresAt || 0);
    if (ownerUid !== String(currentUid || '').trim()) return null;
    if (expiresAt && expiresAt <= Date.now()) {
      localStorage.removeItem(LAST_STORY_KEY);
      return null;
    }
    return story;
  } catch {
    return null;
  }
}

function storyItem(story, isOwn = false) {
  const username = String(story.username || story.userName || story.handle || story.displayName || 'User').replace(/^@/, '');
  const initial = username.charAt(0).toUpperCase() || 'U';
  const storyUrl = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '');
  const storyId = String(story.id || story.publicId || '');
  const ownerUid = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '');
  return `<div class="story-v2" data-story-open data-story-id="${escapeHtml(storyId)}" data-story-owner="${escapeHtml(ownerUid)}" data-story-url="${escapeHtml(storyUrl)}" data-story-name="${escapeHtml(username)}"><span class="story-v2-avatar">${initial}${isOwn ? '<button class="story-v2-add" type="button" data-story-add aria-label="Add another story">+</button>' : ''}</span><span class="story-v2-name">@${escapeHtml(username)}</span></div>`;
}

function addStoryItem() {
  return `<button class="story-v2" type="button" data-story-add aria-label="Add your story"><span class="story-v2-avatar">+</span><span class="story-v2-name">Your story</span></button>`;
}

async function deleteOwnStory(storyId, overlay) {
  const id = String(storyId || '').trim();
  if (!id) throw new Error('Story ID is missing.');
  const userModule = await import('../features/auth/firebase-client.js');
  const user = userModule.auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories/${encodeURIComponent(id)}/delete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not delete story.');
  localStorage.removeItem(LAST_STORY_KEY);
  overlay.remove();
  const root = document.getElementById('root');
  if (root) await loadStories(root);
}

function openStoryViewer(story, isOwn = false) {
  const normalized = normalizeStory(story);
  if (!normalized?.secureUrl) return;
  document.querySelector('.story-viewer-v2')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'story-viewer-v2';
  const storyId = String(normalized.id || normalized.publicId || '');
  const safeName = escapeHtml(String(normalized.username || normalized.name || 'user').replace(/^@/, ''));
  overlay.innerHTML = `<div class="story-viewer-v2-card"><button class="story-viewer-v2-close" type="button" aria-label="Close">×</button>${isOwn ? '<button class="story-viewer-v2-menu" type="button" aria-label="More">⋯</button><div class="story-viewer-v2-actions"><button class="story-delete" type="button">Delete story</button></div>' : ''}<div class="story-viewer-v2-title">@${safeName}</div><video src="${escapeHtml(normalized.secureUrl)}" autoplay playsinline></video></div>`;
  const close = () => overlay.remove();
  overlay.querySelector('.story-viewer-v2-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  const video = overlay.querySelector('video');
  video?.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); }, { once: true });
  if (isOwn) {
    const menuButton = overlay.querySelector('.story-viewer-v2-menu');
    const actions = overlay.querySelector('.story-viewer-v2-actions');
    const deleteButton = overlay.querySelector('.story-delete');
    menuButton.addEventListener('click', (event) => { event.stopPropagation(); actions.classList.toggle('open'); });
    deleteButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      deleteButton.disabled = true;
      deleteButton.textContent = 'Deleting...';
      try {
        await deleteOwnStory(storyId, overlay);
      } catch (error) {
        deleteButton.disabled = false;
        deleteButton.textContent = error?.message || 'Delete story';
      }
    });
    document.addEventListener('click', (event) => {
      if (overlay.contains(event.target) && !actions.contains(event.target) && event.target !== menuButton) actions.classList.remove('open');
    }, { once: false });
  }
  document.body.appendChild(overlay);
}

async function openStoryCreateFromPicker(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file || !file.type.startsWith('video/')) return;
    window.__indoStoryDraftFile = file;
    try { await window.__indoNavigate?.('story-create'); }
    catch (error) { console.error('Story create navigation failed:', error); }
  }, { once: true });
  input.click();
}

function bindStoryInteractions(app) {
  app.querySelectorAll('[data-story-add]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      try { await openStoryCreateFromPicker(event); } catch (error) { console.error('Story create navigation failed:', error); }
    });
  });
  app.querySelectorAll('[data-story-open]').forEach((item) => {
    item.addEventListener('click', () => {
      const ownerUid = String(item.dataset.storyOwner || '');
      import('../features/auth/firebase-client.js').then(({ auth }) => {
        const isOwn = Boolean(auth.currentUser?.uid && ownerUid === auth.currentUser.uid);
        openStoryViewer({ id: item.dataset.storyId, secureUrl: item.dataset.storyUrl, username: item.dataset.storyName, ownerUid }, isOwn);
      });
    });
  });
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-36');
    const videos = await loadHomeVideos();
    if (!videos.length) { status.textContent = 'No videos yet. Upload your first video.'; return; }
    status.remove(); feed.innerHTML = videos.map(renderVideoCard).join(''); bindVideoCards(feed);
  } catch (error) { console.error('Home feed failed:', error); status.textContent = 'Could not load videos right now.'; }
}

async function loadStories(app) {
  const row = app.querySelector('[data-stories-v2]');
  let currentUid = '';
  try {
    const [{ loadStories }, { auth }] = await Promise.all([
      import('../features/stories/stories.js?v=20260813-36'),
      import('../features/auth/firebase-client.js')
    ]);
    currentUid = auth.currentUser?.uid || '';
    const stories = (await loadStories()).map(normalizeStory).filter(Boolean);
    const cachedOwn = getCachedOwnStory(currentUid);
    const merged = [...(cachedOwn ? [cachedOwn] : []), ...stories];
    const ownStories = [];
    const otherStories = [];
    const seen = new Set();
    for (const story of merged) {
      const ownerUid = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '').trim();
      const storyId = String(story.id || story.publicId || story.secureUrl || '');
      if (seen.has(storyId)) continue;
      seen.add(storyId);
      if (ownerUid && ownerUid === currentUid) ownStories.push(story);
      else if (ownerUid) otherStories.push(story);
    }
    row.innerHTML = ownStories.length
      ? storyItem(ownStories[0], true) + otherStories.map((story) => storyItem(story, false)).join('')
      : addStoryItem() + otherStories.map((story) => storyItem(story, false)).join('');
    bindStoryInteractions(app);
  } catch (error) {
    const cachedOwn = getCachedOwnStory(currentUid);
    row.innerHTML = cachedOwn ? storyItem(cachedOwn, true) : addStoryItem();
    bindStoryInteractions(app);
    console.warn('Stories unavailable:', error);
  }
}

async function loadNotifications(app) {
  try {
    const button = app.querySelector('[data-screen="notifications"]'); if (!button) return;
    const { loadNotifications } = await import('../features/notifications/notifications.js?v=20260813-36');
    const items = await loadNotifications(); const unread = items.filter((item) => !item.read).length;
    button.querySelector('.notification-badge')?.remove(); if (unread <= 0) return;
    const badge = document.createElement('span'); badge.className = 'notification-badge'; badge.textContent = unread > 99 ? '99+' : String(unread); button.style.position = 'relative'; button.appendChild(badge);
  } catch (error) { console.warn('Notifications unavailable:', error); }
}

export function renderHome(app) {
  ensureStoryStyles();
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button data-screen="activity" aria-label="Activity">${appIcons.heart}</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">${appIcons.bell}</button></div></header><div class="stories-v2" data-stories-v2></div><main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>${renderNav()}</div>`;
  loadStories(app); loadFeed(app); loadNotifications(app);
}
