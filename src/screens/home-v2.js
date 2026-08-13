const appIcons = {
  home: '⌂',
  search: '⌕',
  reel: '▶',
  create: '+',
  profile: '●',
  heart: '♡',
  bell: '♧'
};

function renderNav() {
  return `<nav class="bottom-nav">
    <button data-screen="home" class="active">${appIcons.home}<span>Home</span></button>
    <button data-screen="search">${appIcons.search}<span>Search</span></button>
    <button data-screen="reels">${appIcons.reel}<span>Reels</span></button>
    <button data-screen="create">${appIcons.create}<span>Create</span></button>
    <button data-screen="profile">${appIcons.profile}<span>Profile</span></button>
  </nav>`;
}

function ensureStoryStyles() {
  if (document.getElementById('indo-story-inline-v2')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-inline-v2';
  style.textContent = `
    .stories-v2{display:flex!important;align-items:center!important;gap:8px!important;padding:8px 10px!important;overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap!important;border-bottom:1px solid #17171c!important;scrollbar-width:none!important}
    .stories-v2::-webkit-scrollbar{display:none!important}
    .story-v2{display:flex!important;flex:0 0 auto!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;min-width:0!important;height:44px!important;padding:0!important;margin:0!important;gap:8px!important;color:#d8d8df!important;text-align:left!important;border:0!important;background:none!important;white-space:nowrap!important}
    .story-v2-avatar{display:grid!important;place-items:center!important;width:40px!important;height:40px!important;min-width:40px!important;flex:0 0 40px!important;border-radius:50%!important;background:linear-gradient(135deg,#743cff,#f83ab8)!important;color:#fff!important;font-size:13px!important;font-weight:800!important;margin:0!important}
    .story-v2-name{display:inline-block!important;width:auto!important;min-width:0!important;margin:0!important;padding:0!important;color:#d8d8df!important;font-size:12px!important;font-weight:600!important;line-height:1!important;white-space:nowrap!important}
  `;
  document.head.appendChild(style);
}

function storyItem(story) {
  const username = String(story.username || story.userName || story.handle || story.displayName || 'User').replace(/^@/, '');
  const initial = username.charAt(0).toUpperCase() || 'U';
  return `<button class="story-v2" type="button" data-story-id="${String(story.id || '')}" aria-label="@${username}"><span class="story-v2-avatar">${initial}</span><span class="story-v2-name">@${username}</span></button>`;
}

function addStoryItem() {
  return `<button class="story-v2" type="button" aria-label="Your story"><span class="story-v2-avatar">+</span><span class="story-v2-name">Your story</span></button>`;
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-20');
    const videos = await loadHomeVideos();
    if (!videos.length) {
      status.textContent = 'No videos yet. Upload your first video.';
      return;
    }
    status.remove();
    feed.innerHTML = videos.map(renderVideoCard).join('');
    bindVideoCards(feed);
  } catch (error) {
    console.error('Home feed failed:', error);
    status.textContent = 'Could not load videos right now.';
  }
}

async function loadStories(app) {
  const row = app.querySelector('[data-stories-v2]');
  try {
    const { loadStories } = await import('../features/stories/stories.js?v=20260813-20');
    const stories = await loadStories();
    row.innerHTML = addStoryItem() + stories.map(storyItem).join('');
  } catch (error) {
    console.warn('Stories unavailable:', error);
    row.innerHTML = addStoryItem();
  }
}

async function loadNotifications(app) {
  try {
    const button = app.querySelector('[data-screen="notifications"]');
    if (!button) return;
    const { loadNotifications } = await import('../features/notifications/notifications.js?v=20260813-20');
    const items = await loadNotifications();
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
  app.innerHTML = `<div class="app-shell">
    <header class="topbar">
      <div class="brand"><span>♥</span>Indo</div>
      <div class="top-actions">
        <button data-screen="activity" aria-label="Activity">${appIcons.heart}</button>
        <button class="notification-button" data-screen="notifications" aria-label="Notifications">${appIcons.bell}</button>
      </div>
    </header>
    <div class="stories-v2" data-stories-v2></div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>
    ${renderNav()}
  </div>`;

  loadStories(app);
  loadFeed(app);
  loadNotifications(app);
}
