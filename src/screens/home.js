const appIcons = {
  home: '⌂',
  search: '⌕',
  reel: '▶',
  create: '+',
  profile: '●',
  heart: '♡',
  bell: '♧'
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function renderNav() {
  return `<nav class="bottom-nav">
    <button data-screen="home" class="active">${appIcons.home}<span>Home</span></button>
    <button data-screen="search">${appIcons.search}<span>Search</span></button>
    <button data-screen="reels">${appIcons.reel}<span>Reels</span></button>
    <button data-screen="create">${appIcons.create}<span>Create</span></button>
    <button data-screen="profile">${appIcons.profile}<span>Profile</span></button>
  </nav>`;
}

function showToast(app, message) {
  app.querySelector('[data-feed-toast]')?.remove();
  const toast = document.createElement('div');
  toast.dataset.feedToast = 'true';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:1000;padding:10px 14px;border-radius:12px;background:#17171d;color:#fff;font-size:13px;font-weight:700;';
  app.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1600);
}

function bindNavigation(app) {
  app.querySelectorAll('[data-screen]').forEach((button) => {
    button.addEventListener('click', async () => {
      const screen = button.dataset.screen;
      if (!screen || screen === 'home') return;
      try {
        const { state } = await import('../state.js');
        state.screen = screen;
        const { render } = await import('../router.js');
        render(app);
      } catch (error) {
        showToast(app, error?.message || 'Could not open this section.');
      }
    });
  });
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-11');
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

async function loadStoriesSafely(app) {
  try {
    const row = app.querySelector('[data-stories]');
    const { loadStories, renderStoriesRow, bindStoryButtons } = await import('../features/stories/stories.js?v=20260813-11');
    const stories = await loadStories();
    if (!stories.length) return;
    row.innerHTML = '<div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>' + renderStoriesRow(stories);
    bindStoryButtons(row);
  } catch (error) {
    console.warn('Stories unavailable:', error);
  }
}

async function loadNotificationsSafely(app) {
  try {
    const button = app.querySelector('[data-screen="notifications"]');
    if (!button) return;
    const { loadNotifications } = await import('../features/notifications/notifications.js?v=20260813-11');
    const items = await loadNotifications();
    const unread = items.filter((item) => !item.read).length;
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.style.cssText = 'position:absolute;top:-5px;right:-8px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#ff3b81;color:#fff;font-size:9px;font-weight:800;line-height:17px;text-align:center;';
    badge.textContent = unread > 99 ? '99+' : String(unread);
    button.style.position = 'relative';
    button.appendChild(badge);
  } catch (error) {
    console.warn('Notifications unavailable:', error);
  }
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell">
    <header class="topbar">
      <div class="brand"><span>♥</span>Indo</div>
      <div class="top-actions">
        <button data-screen="activity" aria-label="Activity">${appIcons.heart}</button>
        <button class="notification-button" data-screen="notifications" aria-label="Notifications">${appIcons.bell}</button>
      </div>
    </header>
    <div class="stories" data-stories><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div></div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>
    ${renderNav()}
  </div>`;

  bindNavigation(app);
  loadFeed(app);
  loadStoriesSafely(app);
  loadNotificationsSafely(app);
}
