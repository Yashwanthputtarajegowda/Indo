import { icons, samplePosts } from '../data.js';
import { nav } from '../components/nav.js';

function postCard(post) {
  return `<article class="post-card">
    <div class="post-head"><div class="avatar small">Y</div><div><strong>${post.user}</strong><small>${post.id}</small></div><button class="icon-btn">${icons.more}</button></div>
    <img class="post-image" src="${post.image}" alt="Post">
    <div class="post-actions"><button>${icons.heart}</button><button>${icons.comment}</button><button>${icons.share}</button><button class="push-right">${icons.bookmark}</button></div>
    <div class="post-copy"><strong>${post.likes} likes</strong><p><b>${post.id}</b> ${post.caption}</p><span>View all ${post.comments} comments</span></div>
  </article>`;
}

export function renderHome(app) {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand"><span>♥</span>indo</div><div class="top-actions"><button>${icons.heart}</button><button data-screen="notifications">${icons.bell}</button></div></header>
    <div class="stories"><div class="story add-story"><div class="avatar gradient">+</div><span>Your story</span></div>${['@riya_07','@karthik','@anu_12','@sam____'].map((x,i)=>`<div class="story"><div class="avatar ring">${['R','K','A','S'][i]}</div><span>${x}</span></div>`).join('')}</div>
    <main class="feed">${samplePosts.map(postCard).join('')}</main>${nav('home')}</div>`;
}
