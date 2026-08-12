import { icons } from '../data.js';
import { nav } from '../components/nav.js';

export function renderCreate(app) {
  app.innerHTML = `<div class="app-shell"><header class="page-head"><button data-screen="home">${icons.back}</button><h2>Create</h2><span></span></header><main class="create-page"><button class="create-card"><span class="create-icon">▣</span><div><b>Post</b><small>Photo or video</small></div></button><button class="create-card"><span class="create-icon pink">▶</span><div><b>Reel</b><small>Short vertical video</small></div></button><button class="create-card"><span class="create-icon blue">◉</span><div><b>Story</b><small>Photo or video</small></div></button><div class="upload-note">Your content will appear on your profile after publishing.</div></main>${nav('create')}</div>`;
}
