const LAST_STORY_KEY = 'indo:last-story';

function esc(value = '') {
  return String(value).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[c]));
}

function normalizeStory(story) {
  if (!story || typeof story !== 'object') return null;
  const secureUrl = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '').trim();
  return secureUrl ? { ...story, secureUrl } : null;
}

function readCachedOwnStory(uid) {
  try {
    const story = normalizeStory(JSON.parse(localStorage.getItem(LAST_STORY_KEY) || 'null'));
    if (!story) return null;
    const ownerUid = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '').trim();
    const expiresAt = Number(story.expiresAt || 0);
    if (ownerUid !== String(uid || '').trim()) return null;
    if (expiresAt && expiresAt <= Date.now()) {
      localStorage.removeItem(LAST_STORY_KEY);
      return null;
    }
    return story;
  } catch {
    return null;
  }
}

function renderNav() {
  return `
    <nav class="bottom-nav">
      <button type="button" data-screen="home" class="active">⌂<span>Home</span></button>
      <button type="button" data-message-section aria-label="Message">⌕<span>Message</span></button>
      <button type="button" data-screen="reels">▶<span>Reels</span></button>
      <button type="button" data-video-section aria-label="Video">▣<span>Video</span></button>
      <button type="button" data-screen="profile">●<span>Profile</span></button>
    </nav>`;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="brand"><span>♥</span>Indo</div>
      <div class="top-actions">
        <button class="notification-button" data-screen="notifications" aria-label="Notifications">♧</button>
        <button class="search-button" data-screen="search" aria-label="Search">⌕</button>
      </div>
    </header>`;
}

function ensureStoryStyles() {
  if (document.getElementById('indo-home-v8-style')) return;
  const style = document.createElement('style');
  style.id = 'indo-home-v8-style';
  style.textContent = `
    .indo-story-row{display:flex;align-items:flex-start;gap:14px;padding:10px;overflow-x:auto;border-bottom:1px solid #17171c;scrollbar-width:none;min-height:86px}
    .indo-story-row::-webkit-scrollbar{display:none}
    .indo-story-item{position:relative;display:flex;flex:0 0 66px;flex-direction:column;align-items:center;width:66px;gap:6px;border:0;background:none;color:#d8d8df;cursor:pointer;padding:0}
    .indo-story-avatar{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#743cff,#f83ab8);color:#fff;font-weight:800}
    .indo-story-name{display:block;width:100%;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
    .indo-story-add{position:absolute;right:-2px;bottom:-2px;width:20px;height:20px;border-radius:50%;border:2px solid #09090e;background:#7b3cff;color:#fff;font-weight:900}
    .indo-story-viewer{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}
    .indo-story-card{position:relative;width:min(100%,420px);height:min(90vh,760px);background:#000;border-radius:16px;overflow:hidden}
    .indo-story-card video{width:100%;height:100%;object-fit:contain;background:#000}
    .indo-story-close,.indo-story-share,.indo-story-more{position:absolute;top:10px;z-index:3;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff}
    .indo-story-close{left:12px;font-size:24px}.indo-story-share{right:52px}.indo-story-more{right:12px}
    .indo-story-title{position:absolute;left:54px;right:90px;top:17px;z-index:2;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .indo-story-menu{position:absolute;right:12px;top:52px;z-index:4;display:none;min-width:150px;padding:6px;border-radius:10px;background:#18181f;border:1px solid #2b2b33}
    .indo-story-menu.open{display:block}.indo-story-menu button{display:block;width:100%;padding:10px 12px;border:0;background:none;color:#fff;text-align:left;font-weight:700}.indo-story-menu .delete{color:#ff6b6b}
  `;
  document.head.appendChild(style);
}

function getApiBase() { return window.INDO_API_BASE || ''; }

async function openStoryViewer(story, isOwn = false) {
  document.querySelector('.indo-story-viewer')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'indo-story-viewer';
  const id = String(story.id || story.publicId || '');
  const username = String(story.username || story.name || 'user').replace(/^@/, '');
  overlay.innerHTML = `<div class="indo-story-card">
    <button class="indo-story-close" type="button">×</button>
    <button class="indo-story-share" type="button">↗</button>
    ${isOwn ? '<button class="indo-story-more" type="button">⋯</button><div class="indo-story-menu"><button class="delete" type="button">Delete story</button></div>' : ''}
    <div class="indo-story-title">@${esc(username)}</div>
    <video src="${esc(story.secureUrl)}" autoplay playsinline></video>
  </div>`;
  const close = () => overlay.remove();
  overlay.querySelector('.indo-story-close')?.addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  overlay.querySelector('.indo-story-share')?.addEventListener('click', async () => {
    const url = `${window.location.origin}${window.location.pathname}?story=${encodeURIComponent(id)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Indo story', text: 'Watch this story on Indo', url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt('Copy story link:', url);
    } catch (error) { if (error?.name !== 'AbortError') console.warn('Story sharing failed:', error); }
  });
  if (isOwn) {
    const more = overlay.querySelector('.indo-story-more');
    const menu = overlay.querySelector('.indo-story-menu');
    more?.addEventListener('click', (event) => { event.stopPropagation(); menu?.classList.toggle('open'); });
    overlay.querySelector('.delete')?.addEventListener('click', async () => {
      const user = (await import('../features/auth/firebase-client.js')).auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch(`${getApiBase()}/api/stories/${encodeURIComponent(id)}/delete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { menu.textContent = data.error || 'Could not delete story.'; return; }
      localStorage.removeItem(LAST_STORY_KEY);
      close();
      loadStories(document.getElementById('root')).catch(() => {});
    });
  }
  document.body.appendChild(overlay);
  overlay.querySelector('video')?.play().catch(() => {});
}

function storyItem(story, own = false) {
  const username = String(story.username || story.userName || story.handle || story.name || 'User').replace(/^@/, '');
  const ownerUid = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '');
  const id = String(story.id || story.publicId || story.secureUrl || '');
  return `<button class="indo-story-item" type="button" data-story-id="${esc(id)}" data-story-owner="${esc(ownerUid)}" data-story-url="${esc(story.secureUrl)}" data-story-name="${esc(username)}"><span class="indo-story-avatar">${esc(username.charAt(0).toUpperCase() || 'U')}${own ? '<button class="indo-story-add" type="button" data-story-add aria-label="Add another story">+</button>' : ''}</span><span class="indo-story-name">@${esc(username)}</span></button>`;
}

async function openStoryPicker(event) {
  event.preventDefault();
  event.stopPropagation();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.style.position = 'fixed'; input.style.left = '-9999px'; input.style.width = '1px'; input.style.height = '1px';
  document.body.appendChild(input);
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file || !file.type.startsWith('video/')) return;
    window.__indoStoryDraftFile = file;
    await window.__indoNavigate?.('story-create');
  }, { once: true });
  input.click();
}

function bindStories(app) {
  app.querySelectorAll('[data-story-add]').forEach((button) => button.addEventListener('click', openStoryPicker));
  app.querySelectorAll('[data-story-id]').forEach((item) => item.addEventListener('click', async (event) => {
    if (event.target instanceof Element && event.target.closest('[data-story-add]')) return;
    const story = { id: item.dataset.storyId, ownerUid: item.dataset.storyOwner, secureUrl: item.dataset.storyUrl, username: item.dataset.storyName };
    const { auth } = await import('../features/auth/firebase-client.js');
    await openStoryViewer(story, Boolean(auth.currentUser?.uid && auth.currentUser.uid === story.ownerUid));
  }));
}

async function loadStories(app) {
  const row = app?.querySelector('[data-stories]');
  if (!row) return;
  try {
    const [{ loadStories: fetchStories }, { auth }] = await Promise.all([
      import('../features/stories/stories.js?v=20260813-120'),
      import('../features/auth/firebase-client.js'),
    ]);
    const currentUid = auth.currentUser?.uid || '';
    const stories = (await fetchStories()).map(normalizeStory).filter(Boolean);
    const own = stories.find((item) => String(item.ownerUid || item.uid || item.userId || item.creatorUid || '') === currentUid) || readCachedOwnStory(currentUid);
    const others = stories.filter((item) => String(item.ownerUid || item.uid || item.userId || item.creatorUid || '') !== currentUid);
    row.innerHTML = (own ? storyItem(own, true) : `<button class="indo-story-item" type="button" data-story-add><span class="indo-story-avatar">+</span><span class="indo-story-name">Your story</span></button>`) + others.map((item) => storyItem(item, false)).join('');
    bindStories(app);
  } catch (error) {
    console.warn('Stories unavailable:', error);
    const cached = readCachedOwnStory('');
    row.innerHTML = cached ? storyItem(cached, true) : `<button class="indo-story-item" type="button" data-story-add><span class="indo-story-avatar">+</span><span class="indo-story-name">Your story</span></button>`;
    bindStories(app);
  }
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-120');
    const videos = await loadHomeVideos();
    if (!videos.length) { status.textContent = 'No videos yet. Upload your first video.'; return; }
    status.remove();
    feed.innerHTML = videos.map(renderVideoCard).join('');
    bindVideoCards(feed);
  } catch (error) {
    console.error('Home feed failed:', error);
    status.textContent = 'Could not load videos right now.';
  }
}

async function loadNotifications(app) {
  try {
    const button = app.querySelector('.notification-button');
    if (!button) return;
    const { loadNotifications: fetchNotifications } = await import('../features/notifications/notifications.js?v=20260813-120');
    const items = await fetchNotifications();
    const unread = items.filter((item) => !item.read).length;
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.textContent = unread > 99 ? '99+' : String(unread);
    button.style.position = 'relative';
    button.appendChild(badge);
  } catch (error) {
    console.warn('Notifications unavailable:', error);
  }
}

export function renderHome(app) {
  ensureStoryStyles();
  app.innerHTML = `<div class="app-shell">${renderTopbar()}<div class="indo-story-row" data-stories></div><main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>${renderNav()}</div>`;
  loadStories(app);
  loadFeed(app);
  loadNotifications(app);
}
