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

function storyItem(story) {
  const username = story.username || story.userName || story.handle || story.displayName || 'User';
  const clean = username.replace(/^@/, '');
  const initial = clean.charAt(0).toUpperCase() || 'U';
  return `<button class="story" type="button" data-story-id="${story.id || ''}" style="display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:9px!important;height:52px!important;min-width:max-content!important;width:auto!important;padding:0 8px!important;margin:0!important;text-align:left!important;white-space:nowrap!important;">
    <div class="avatar story-avatar" style="width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;margin:0!important;flex:0 0 40px!important;display:grid!important;place-items:center!important;border-radius:50%!important;">${initial}</div>
    <span style="display:block!important;margin:0!important;white-space:nowrap!important;font-size:12px!important;font-weight:600!important;line-height:1!important;">@${clean}</span>
  </button>`;
}

async function loadFeed(app) {
  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');
  try {
    const { loadHomeVideos, renderVideoCard, bindVideoCards } = await import('../features/feed/home-feed.js?v=20260813-13');
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
  const row = app.querySelector('[data-stories]');
  try {
    const { loadStories } = await import('../features/stories/stories.js?v=20260813-13');
    const stories = await loadStories();
    if (!stories.length) return;
    row.innerHTML = `<button class="story add-story" type="button" style="display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:9px!important;height:52px!important;min-width:max-content!important;width:auto!important;padding:0 8px!important;margin:0!important;text-align:left!important;white-space:nowrap!important;"><div class="avatar story-avatar gradient" style="width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;margin:0!important;flex:0 0 40px!important;display:grid!important;place-items:center!important;border-radius:50%!important;">+</div><span style="display:block!important;margin:0!important;white-space:nowrap!important;font-size:12px!important;font-weight:600!important;line-height:1!important;">Your story</span></button>${stories.map(storyItem).join('')}`;
  } catch (error) {
    console.warn('Stories unavailable:', error);
  }
}

async function loadNotificationsSafely(app) {
  try {
    const button = app.querySelector('[data-screen="notifications"]');
    if (!button) return;
    const { loadNotifications } = await import('../features/notifications/notifications.js?v=20260813-13');
    const items = await loadNotifications();
    const unread = items.filter((item) => !item.read).length;
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.textContent = unread > 99 ? '99+' : unread;
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
    <div class="stories" data-stories style="display:flex!important;flex-direction:row!important;align-items:center!important;gap:4px!important;padding:8px 6px!important;overflow-x:auto!important;overflow-y:hidden!important;">
      <button class="story add-story" type="button" style="display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:9px!important;height:52px!important;min-width:max-content!important;width:auto!important;padding:0 8px!important;margin:0!important;text-align:left!important;white-space:nowrap!important;"><div class="avatar story-avatar gradient" style="width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;margin:0!important;flex:0 0 40px!important;display:grid!important;place-items:center!important;border-radius:50%!important;">+</div><span style="display:block!important;margin:0!important;white-space:nowrap!important;font-size:12px!important;font-weight:600!important;line-height:1!important;">Your story</span></button>
    </div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>
    ${renderNav()}
  </div>`;

  bindNavigation(app);
  loadFeed(app);
  loadStoriesSafely(app);
  loadNotificationsSafely(app);
}
