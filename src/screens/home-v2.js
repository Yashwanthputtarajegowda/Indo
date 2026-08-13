const appIcons = {
  home: '⌂', search: '⌕', reel: '▶', create: '+', profile: '●', heart: '♡', bell: '♧'
};

function renderNav() {
  return `<nav class="bottom-nav"><button data-screen="home" class="active">${appIcons.home}<span>Home</span></button><button data-screen="search">${appIcons.search}<span>Search</span></button><button data-screen="reels">${appIcons.reel}<span>Reels</span></button><button data-screen="create">${appIcons.create}<span>Create</span></button><button data-screen="profile">${appIcons.profile}<span>Profile</span></button></nav>`;
}

function ensureStoryStyles() {
  if (document.getElementById('indo-story-inline-v5')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-inline-v5';
  style.textContent = `
    .stories-v2{display:flex!important;align-items:flex-start!important;gap:14px!important;padding:10px 10px 12px!important;overflow-x:auto!important;border-bottom:1px solid #17171c!important;scrollbar-width:none!important;min-height:86px!important}
    .stories-v2::-webkit-scrollbar{display:none!important}
    .story-v2{position:relative!important;display:flex!important;flex:0 0 66px!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;width:66px!important;min-width:66px!important;height:72px!important;padding:0!important;margin:0!important;gap:6px!important;color:#d8d8df!important;text-align:center!important;border:0!important;background:none!important;cursor:pointer!important}
    .story-v2-avatar{position:relative!important;display:grid!important;place-items:center!important;width:56px!important;height:56px!important;border-radius:50%!important;background:linear-gradient(135deg,#743cff,#f83ab8)!important;color:#fff!important;font-size:15px!important;font-weight:800!important;margin:0 auto!important;overflow:visible!important}
    .story-v2-name{display:block!important;width:100%!important;margin:0!important;padding:0!important;color:#d8d8df!important;font-size:10px!important;font-weight:600!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .story-v2-add{position:absolute!important;right:-2px!important;bottom:-2px!important;width:20px!important;height:20px!important;border-radius:50%!important;border:2px solid #09090e!important;background:#7b3cff!important;color:#fff!important;font-size:13px!important;font-weight:900!important;padding:0!important;display:grid!important;place-items:center!important;z-index:3!important;cursor:pointer!important}
    .story-viewer-v2{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.96);display:grid;place-items:center;padding:18px}
    .story-viewer-v2-card{position:relative;width:min(100%,420px);height:min(90vh,760px);display:flex;align-items:center;justify-content:center;background:#000;border-radius:16px;overflow:hidden}
    .story-viewer-v2-card video{width:100%;height:100%;object-fit:contain;display:block}
    .story-viewer-v2-close{position:absolute;right:12px;top:10px;z-index:2;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;font-size:24px;cursor:pointer}
    .story-viewer-v2-title{position:absolute;left:14px;top:12px;z-index:2;color:#fff;font-size:13px;font-weight:800}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[char]));
}

function storyItem(story, isOwn = false) {
  const username = String(story.username || story.userName || story.handle || story.displayName || 'User').replace(/^@/, '');
  const initial = username.charAt(0).toUpperCase() || 'U';
  const storyUrl = String(story.secureUrl || story.videoUrl || story.url || '');
  return `<div class="story-v2" data-story-open data-story-url="${escapeHtml(storyUrl)}" data-story-name="${escapeHtml(username)}"><span class="story-v2-avatar">${initial}${isOwn ? '<button class="story-v2-add" type="button" data-story-add aria-label="Add another story">+</button>' : ''}</span><span class="story-v2-name">@${escapeHtml(username)}</span></div>`;
}

function addStoryItem() {
  return `<button class="story-v2" type="button" data-story-add aria-label="Add your story"><span class="story-v2-avatar">+</span><span class="story-v2-name">Your story</span></button>`;
}

function openStoryViewer(url, name) {
  if (!url) return;
  document.querySelector('.story-viewer-v2')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'story-viewer-v2';
  overlay.innerHTML = `<div class="story-viewer-v2-card"><button class="story-viewer-v2-close" type="button" aria-label="Close">×</button><div class="story-viewer-v2-title">@${escapeHtml(name || 'user')}</div><video src="${escapeHtml(url)}" autoplay playsinline controls></video></div>`;
  const close = () => overlay.remove();
  overlay.querySelector('.story-viewer-v2-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.body.appendChild(overlay);
}

async function openStoryCreate() {
  const navigate = window.__indoNavigate;
  if (typeof navigate === 'function') {
    await navigate('story-create');
    return;
  }
  const { state } = await import('../state.js');
  const { render } = await import('../router.js?v=20260813-32');
  state.screen = 'story-create';
  await render(document.getElementById('root'));
}

function bindStoryInteractions(app) {
  app.querySelectorAll('[data-story-add]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try { await openStoryCreate(); } catch (error) { console.error('Story create navigation failed:', error); }
    });
  });
  app.querySelectorAll('[data-story-open]').forEach((item) => {
    item.addEventListener('click', () => openStoryViewer(item.dataset.storyUrl || '', item.dataset.storyName || 'user'));
  });
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-32');
    const videos = await loadHomeVideos();
    if (!videos.length) { status.textContent = 'No videos yet. Upload your first video.'; return; }
    status.remove(); feed.innerHTML = videos.map(renderVideoCard).join(''); bindVideoCards(feed);
  } catch (error) { console.error('Home feed failed:', error); status.textContent = 'Could not load videos right now.'; }
}

async function loadStories(app) {
  const row = app.querySelector('[data-stories-v2]');
  try {
    const [{ loadStories }, { auth }] = await Promise.all([
      import('../features/stories/stories.js?v=20260813-32'),
      import('../features/auth/firebase-client.js')
    ]);
    const stories = await loadStories();
    const currentUid = auth.currentUser?.uid || '';
    const ownStories = stories.filter((story) => String(story.ownerUid || '') === currentUid);
    const otherStories = stories.filter((story) => String(story.ownerUid || '') !== currentUid);
    row.innerHTML = ownStories.length ? storyItem(ownStories[0], true) + otherStories.map((s) => storyItem(s, false)).join('') : addStoryItem() + otherStories.map((s) => storyItem(s, false)).join('');
    bindStoryInteractions(app);
  } catch (error) { console.warn('Stories unavailable:', error); row.innerHTML = addStoryItem(); bindStoryInteractions(app); }
}

async function loadNotifications(app) {
  try {
    const button = app.querySelector('[data-screen="notifications"]'); if (!button) return;
    const { loadNotifications } = await import('../features/notifications/notifications.js?v=20260813-32');
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
