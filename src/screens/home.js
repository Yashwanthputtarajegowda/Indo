import { icons, samplePosts } from '../data.js';
import { nav } from '../components/nav.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function postCard(post) {
  const user = escapeHtml(post.user);
  const id = escapeHtml(post.id);
  const caption = escapeHtml(post.caption);
  return `<article class="post-card" data-post-id="${id}">
    <div class="post-head"><div class="avatar small">${escapeHtml((post.user || 'U').charAt(0).toUpperCase())}</div><div><strong>${user}</strong><small>${id}</small></div><button class="icon-btn" aria-label="More options">${icons.more}</button></div>
    <img class="post-image" src="${escapeHtml(post.image)}" alt="Post">
    <div class="post-actions"><button aria-label="Like">${icons.heart}</button><button aria-label="Comment">${icons.comment}</button><button aria-label="Share">${icons.share}</button><button class="push-right" aria-label="Save">${icons.bookmark}</button></div>
    <div class="post-copy"><strong>${escapeHtml(post.likes)} likes</strong><p><b>${id}</b> ${caption}</p><span>View all ${escapeHtml(post.comments)} comments</span></div>
  </article>`;
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>Indo</div><div class="top-actions"><button aria-label="Activity">${icons.heart}</button><button data-screen="notifications" aria-label="Notifications">${icons.bell}</button></div></header>
    <div class="stories"><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>${['Demo User','Demo User 2','Demo User 3','Demo User 4'].map((x,i)=>`<div class="story"><div class="avatar ring">${x.charAt(0)}</div><span>${x}</span></div>`).join('')}</div>
    <main class="feed">${samplePosts.map(postCard).join('')}</main>${nav('home')}</div>`;
}
