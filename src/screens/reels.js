import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { loadReels, recordReelView, renderReel, bindReelWatchProgress } from '../features/feed/reels-feed.js';
import { loadEngagement, toggleLike, toggleSave, addComment, shareMedia } from '../features/feed/media-engagement.js';
import { loadFollowStatus, toggleFollow } from '../features/social/follow.js';

async function bindReelActions(root) {
  root.querySelectorAll('[data-engagement]').forEach((button) => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    const card = button.closest('[data-video-id]');
    if (!card) return;
    const mediaId = card.dataset.videoId;
    const kind = button.dataset.engagement;
    if (kind === 'like' || kind === 'save') {
      loadEngagement(mediaId).then((data) => {
        button.dataset.active = kind === 'like' ? (data.liked ? '1' : '0') : (data.saved ? '1' : '0');
        button.classList.toggle('active', button.dataset.active === '1');
        if (kind === 'like') {
          const small = button.querySelector('small');
          if (small) small.textContent = Number(data.likes || 0).toLocaleString();
        }
      }).catch(() => {});
    }
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        if (kind === 'like') {
          const next = button.dataset.active !== '1';
          const data = await toggleLike(mediaId, next);
          button.dataset.active = data.liked ? '1' : '0';
          button.classList.toggle('active', button.dataset.active === '1');
          const small = button.querySelector('small');
          if (small) small.textContent = Number(data.likes || 0).toLocaleString();
        } else if (kind === 'save') {
          const next = button.dataset.active !== '1';
          const data = await toggleSave(mediaId, next);
          button.dataset.active = data.saved ? '1' : '0';
          button.classList.toggle('active', button.dataset.active === '1');
        } else if (kind === 'comment') {
          const text = window.prompt('Write a comment');
          if (text?.trim()) await addComment(mediaId, text.trim());
        } else if (kind === 'share') {
          await shareMedia(mediaId);
        }
      } catch (error) {
        button.title = error?.message || 'Action failed.';
      } finally {
        button.disabled = false;
      }
    });
  });

  root.querySelectorAll('[data-follow-uid]').forEach((button) => {
    if (button.dataset.followBound === '1') return;
    button.dataset.followBound = '1';
    const uid = button.dataset.followUid;
    if (!uid) return;
    loadFollowStatus(uid).then((data) => {
      button.dataset.following = data.following ? '1' : '0';
      button.textContent = data.requested ? 'Requested' : (data.following ? 'Following' : 'Follow');
    }).catch(() => {});
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;
      try {
        const next = button.dataset.following !== '1';
        const data = await toggleFollow(uid, next);
        button.dataset.following = data.following ? '1' : '0';
        button.textContent = data.requested ? 'Requested' : (data.following ? 'Following' : 'Follow');
      } catch (error) {
        button.title = error?.message || 'Could not update follow status.';
      } finally {
        button.disabled = false;
      }
    });
  });
}

export function renderReels(app) {
  app.innerHTML = `<div class="app-shell reels-shell"><header class="reels-top"><button data-screen="home" aria-label="Back">${icons.back}</button><h2>Reels</h2><button data-screen="create" aria-label="Create">＋</button></header><main class="reels-list" data-reels-list><div class="feed-status">Loading reels...</div></main>${nav('reels')}</div>`;

  const list = app.querySelector('[data-reels-list]');
  loadReels().then((reels) => {
    if (!reels.length) {
      list.innerHTML = '<div class="feed-status">No reels yet. Upload your first reel from Create.</div>';
      return;
    }
    list.innerHTML = reels.map(renderReel).join('');
    bindReelWatchProgress(list);
    bindReelActions(list);
    list.querySelectorAll('.reel-video').forEach((videoElement) => {
      const card = videoElement.closest('[data-video-id]');
      if (!card) return;
      let counted = false;
      const recordOnce = () => {
        if (counted) return;
        counted = true;
        recordReelView(card.dataset.videoId).catch(() => {});
      };
      videoElement.addEventListener('play', recordOnce, { once: true });
      videoElement.addEventListener('loadeddata', () => videoElement.play().catch(() => {}), { once: true });
    });
  }).catch((error) => {
    list.innerHTML = `<div class="feed-status">${error.message || 'Could not load reels.'}</div>`;
  });
}
