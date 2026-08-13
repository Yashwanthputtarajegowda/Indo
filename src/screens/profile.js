import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { auth } from '../auth/firebase-client.js';
import { loadProfileMedia } from '../features/profile/profile-media.js';
import { loadFollowStatus, toggleFollow } from '../features/social/follow.js?v=20260813-30';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function ensureProfileLayoutStyles() {
  if (document.getElementById('indo-profile-layout-v4')) return;
  const style = document.createElement('style');
  style.id = 'indo-profile-layout-v4';
  style.textContent = `
    .profile-identity-row{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:14px!important;width:100%!important;margin:4px 0 18px!important;padding:0!important}
    .profile-identity-row .profile-avatar{flex:0 0 88px!important;width:88px!important;height:88px!important;margin:0!important}
    .profile-userid-block{display:flex!important;flex:1 1 auto!important;align-items:flex-start!important;justify-content:center!important;flex-direction:column!important;min-width:0!important;gap:8px!important}
    .profile-userid{display:block!important;margin:0!important;padding:0!important;color:#fff!important;font-size:16px!important;font-weight:800!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .profile-stats-row{width:100%!important;margin:0 0 18px!important}
    .profile-follow-btn{width:100%!important;height:38px!important;border:0!important;border-radius:8px!important;background:#7b3cff!important;color:#fff!important;font-size:14px!important;font-weight:800!important;cursor:pointer!important;margin:0 0 16px!important}
    .profile-follow-btn.following{background:#2a2a31!important}
    .profile-follow-btn:disabled{opacity:.65!important;cursor:wait!important}
  `;
  document.head.appendChild(style);
}

function renderMediaGrid(videos) {
  if (!videos.length) return '<div class="profile-empty">No posts yet.</div>';
  return videos.map((video) => {
    const id = escapeHtml(video.id || '');
    const url = escapeHtml(video.secureUrl || video.videoUrl || video.url || '');
    const title = escapeHtml(video.title || 'Video');
    return `<button class="profile-media" data-video-id="${id}" type="button" aria-label="${title}"><video muted playsinline preload="metadata" src="${url}"></video><span>▶</span></button>`;
  }).join('');
}

export async function renderProfile(app, profile = null) {
  ensureProfileLayoutStyles();

  const currentUid = auth.currentUser?.uid || '';
  const targetUid = String(profile?.uid || profile?.userId || profile?.ownerUid || '').trim();
  const isOwnProfile = !!currentUid && !!targetUid && currentUid === targetUid;
  const username = escapeHtml(profile?.username || '');
  const initial = escapeHtml((profile?.name || profile?.username || 'I').replace(/^@/, '').charAt(0).toUpperCase() || 'I');
  const followers = Number(profile?.followersCount || 0);
  const following = Number(profile?.followingCount || 0);

  app.innerHTML = `<div class="app-shell">
    <header class="page-head profile-head"><button data-screen="home" aria-label="Back">‹</button><h2>${username || 'Profile'}</h2>${isOwnProfile ? `<button data-screen="settings" aria-label="Settings">${icons.settings}</button>` : '<span></span>'}</header>
    <main class="profile-page">
      <section class="profile-identity-row">
        <div class="avatar profile-avatar">${initial}${isOwnProfile ? '<span class="plus">+</span>' : ''}</div>
        <div class="profile-userid-block">
          <div class="profile-userid">${username ? `@${username.replace(/^@/, '')}` : '@user'}</div>
          ${!isOwnProfile ? '<button class="profile-follow-btn" type="button" data-follow-button>Follow</button>' : ''}
        </div>
      </section>
      <section class="stats profile-stats-row">
        <div><b data-post-count>0</b><span>Posts</span></div>
        <div><b>${followers}</b><span>Followers</span></div>
        <div><b>${following}</b><span>Following</span></div>
      </section>
      ${isOwnProfile ? '<button class="edit-btn" data-edit-profile>Edit Profile</button>' : ''}
      <div class="tabs"><button class="active">▦</button><button>▶</button><button>♧</button></div>
      <div class="grid" data-profile-media><div class="profile-empty">Loading posts...</div></div>
    </main>
    ${nav('profile')}
  </div>`;

  const mediaGrid = app.querySelector('[data-profile-media]');
  const postCount = app.querySelector('[data-post-count]');
  const followButton = app.querySelector('[data-follow-button]');

  if (followButton && targetUid) {
    try {
      const status = await loadFollowStatus(targetUid);
      const followingNow = Boolean(status?.following || status?.isFollowing);
      followButton.textContent = followingNow ? 'Following' : 'Follow';
      followButton.classList.toggle('following', followingNow);
      followButton.addEventListener('click', async () => {
        const nextFollow = !followButton.classList.contains('following');
        followButton.disabled = true;
        try {
          const result = await toggleFollow(targetUid, nextFollow);
          const nowFollowing = Boolean(result?.following ?? nextFollow);
          followButton.textContent = nowFollowing ? 'Following' : 'Follow';
          followButton.classList.toggle('following', nowFollowing);
        } catch (error) {
          followButton.textContent = error?.message || 'Could not update';
        } finally {
          followButton.disabled = false;
        }
      });
    } catch (error) {
      console.error('Follow status failed:', error);
      followButton.textContent = 'Follow';
      followButton.addEventListener('click', async () => {
        followButton.disabled = true;
        try {
          await toggleFollow(targetUid, true);
          followButton.textContent = 'Following';
          followButton.classList.add('following');
        } catch (followError) {
          followButton.textContent = followError?.message || 'Could not follow';
        } finally {
          followButton.disabled = false;
        }
      });
    }
  }

  try {
    const { videos } = await loadProfileMedia(profile);
    postCount.textContent = String(videos.length);
    mediaGrid.innerHTML = renderMediaGrid(videos);
  } catch (error) {
    postCount.textContent = '0';
    mediaGrid.innerHTML = '<div class="profile-empty">Could not load posts right now.</div>';
    console.error('Profile media failed:', error);
  }
}
