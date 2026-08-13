import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { state } from '../state.js';
import { auth } from '../auth/firebase-client.js';
import { loadCurrentProfile } from '../features/profile/current-profile.js';
import { loadHomeVideos, renderVideoCard, bindVideoCards } from '../features/feed/home-feed.js';
import { loadNotifications } from '../features/notifications/notifications.js';
import { loadStories, renderStoriesRow, bindStoryButtons } from '../features/stories/stories.js';

function renderNotificationBadge(app) {
  const button = app.querySelector('[data-screen="notifications"]');
  if (!button) return;
  loadNotifications().then((items) => {
    const unread = items.filter((item) => !item.read).length;
    button.querySelector('.notification-badge')?.remove();
    if (!unread) return;
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.style.cssText = 'position:absolute;top:-5px;right:-8px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#ff3b81;color:#fff;font-size:9px;font-weight:800;line-height:17px;text-align:center;border:2px solid #07070a;';
    badge.textContent = unread > 99 ? '99+' : String(unread);
    button.style.position = 'relative';
    button.appendChild(badge);
  }).catch(() => {});
}

function renderStories(app) {
  const row = app.querySelector('[data-stories]');
  if (!row) return;
  loadStories().then((stories) => {
    if (!stories.length) {
      row.innerHTML = '<div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>';
      return;
    }
    row.innerHTML = '<div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>' + renderStoriesRow(stories);
    bindStoryButtons(row);
  }).catch(() => {});
}

function profilePhotoFrom(profile) {
  return profile?.photoURL || profile?.photoUrl || profile?.avatarUrl || profile?.profilePhoto || profile?.imageUrl || profile?.photo || auth.currentUser?.photoURL || '';
}

async function hydrateOwnVideoAvatars(feed) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const profile = await loadCurrentProfile().catch(() => null);
  const photo = profilePhotoFrom(profile);
  if (!photo) return;
  feed.querySelectorAll('[data-owner-uid]').forEach((card) => {
    if (card.dataset.ownerUid !== uid) return;
    const creator = card.querySelector('.post-creator');
    if (!creator || creator.querySelector('.post-avatar-image')) return;
    const avatar = creator.querySelector('.avatar');
    if (!avatar) return;
    const img = document.createElement('img');
    img.className = 'avatar small post-avatar-image';
    img.src = photo;
    img.alt = creator.textContent.trim();
    img.loading = 'lazy';
    avatar.replaceWith(img);
  });
}

function showToast(app, message) {
  app.querySelector('[data-feed-toast]')?.remove();
  const toast = document.createElement('div');
  toast.dataset.feedToast = 'true';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:1000;padding:10px 14px;border-radius:12px;background:#17171d;color:#fff;font-size:13px;font-weight:700;box-shadow:0 8px 30px rgba(0,0,0,.35);';
  app.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1600);
}

function closeFeedMenus(app) {
  app.querySelectorAll('[data-feed-menu]').forEach((menu) => menu.remove());
}

function openFeedMenu(app, card) {
  closeFeedMenus(app);
  card.style.position = 'relative';
  const menu = document.createElement('div');
  menu.dataset.feedMenu = 'true';
  menu.style.cssText = 'position:absolute;top:54px;right:10px;z-index:30;min-width:170px;padding:6px;border-radius:14px;background:#17171d;border:1px solid #2b2b35;box-shadow:0 12px 28px rgba(0,0,0,.45);';
  menu.innerHTML = '<button type="button" data-menu-action="hide" style="display:block;width:100%;padding:10px 12px;border:0;background:transparent;color:#fff;text-align:left;font:inherit;cursor:pointer;">Hide this video</button><button type="button" data-menu-action="copy" style="display:block;width:100%;padding:10px 12px;border:0;background:transparent;color:#fff;text-align:left;font:inherit;cursor:pointer;">Copy video link</button><button type="button" data-menu-action="close" style="display:block;width:100%;padding:10px 12px;border:0;background:transparent;color:#aaa;text-align:left;font:inherit;cursor:pointer;">Cancel</button>';
  card.appendChild(menu);
}

async function openCreatorProfile(app, username) {
  const apiBase = window.INDO_API_BASE || '';
  try {
    const response = await fetch(`${apiBase}/api/account/profile/${encodeURIComponent(username)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.profile) throw new Error('Profile could not be opened.');
    state.profile = data.profile;
    state.screen = 'profile';
    const { render } = await import('../router.js');
    render(app);
  } catch (error) {
    showToast(app, error.message || 'Profile could not be opened.');
  }
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button data-screen="activity" aria-label="Activity">${icons.heart}</button><button class="notification-button" data-screen="notifications" aria-label="Notifications">${icons.bell}</button></div></header>
    <div class="stories" data-stories><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div></div>
    <main class="feed"><div class="feed-status" data-feed-status>Loading videos...</div><div data-home-feed></div></main>${nav('home')}</div>`;

  renderNotificationBadge(app);
  renderStories(app);

  const feed = app.querySelector('[data-home-feed]');
  const status = app.querySelector('[data-feed-status]');

  feed.addEventListener('click', async (event) => {
    const profileButton = event.target.closest('[data-profile-username]');
    if (profileButton) {
      event.preventDefault();
      event.stopPropagation();
      closeFeedMenus(app);
      await openCreatorProfile(app, profileButton.dataset.profileUsername || '');
      return;
    }

    const moreButton = event.target.closest('[data-feed-more]');
    if (moreButton) {
      event.preventDefault();
      event.stopPropagation();
      openFeedMenu(app, moreButton.closest('[data-video-id]'));
      return;
    }

    const menuAction = event.target.closest('[data-menu-action]');
    if (menuAction) {
      event.preventDefault();
      event.stopPropagation();
      const card = menuAction.closest('[data-video-id]');
      const action = menuAction.dataset.menuAction;
      closeFeedMenus(app);
      if (action === 'hide' && card) {
        card.remove();
        showToast(app, 'Video hidden');
      } else if (action === 'copy' && card) {
        const id = card.dataset.videoId || '';
        const link = `${window.location.origin}${window.location.pathname}#video=${encodeURIComponent(id)}`;
        try {
          await navigator.clipboard.writeText(link);
          showToast(app, 'Video link copied');
        } catch {
          showToast(app, 'Could not copy link');
        }
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-feed-menu], [data-feed-more]')) closeFeedMenus(app);
  }, { once: true });

  loadHomeVideos().then((videos) => {
    if (!videos.length) {
      status.textContent = 'No videos yet. Upload your first video.';
      return;
    }
    status.remove();
    feed.innerHTML = videos.map(renderVideoCard).join('');
    bindVideoCards(feed);
    hydrateOwnVideoAvatars(feed);
  }).catch((error) => {
    status.textContent = error.message || 'Could not load videos.';
  });
}
