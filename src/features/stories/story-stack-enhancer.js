import { auth } from '../auth/firebase-client.js';

const LAST_STORY_KEY = 'indo:last-story';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\\"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#039;' }[char]));
}

function normalizeStory(story) {
  if (!story || typeof story !== 'object') return null;
  const secureUrl = String(story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '').trim();
  if (!secureUrl) return null;
  return { ...story, secureUrl };
}

function ensureStyles() {
  if (document.getElementById('indo-story-stack-v1')) return;
  const style = document.createElement('style');
  style.id = 'indo-story-stack-v1';
  style.textContent = `
    .stories-v2 .story-stack-ring{position:relative;width:56px;height:56px;padding:3px;border-radius:50%;background:linear-gradient(135deg,#743cff,#f83ab8,#ff9d3d);}
    .stories-v2 .story-stack-ring>span{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:#111;color:#fff;}
    .stories-v2 .story-stack-count{position:absolute;right:-3px;bottom:-3px;min-width:20px;height:20px;padding:0 5px;border:2px solid #09090e;border-radius:999px;background:#7b3cff;color:#fff;font-size:10px;font-weight:900;display:grid;place-items:center;}
    .story-stack-bars{position:absolute;left:10px;right:10px;top:10px;z-index:8;display:flex;gap:3px;}
    .story-stack-bar{height:3px;flex:1;border-radius:999px;background:rgba(255,255,255,.35);overflow:hidden;}
    .story-stack-bar i{display:block;width:0;height:100%;background:#fff;}
    .story-stack-nav{position:absolute;inset:0;z-index:7;display:flex;}
    .story-stack-nav button{width:50%;height:100%;border:0;background:transparent;cursor:pointer;}
    .story-stack-meta{position:absolute;left:54px;top:16px;z-index:9;color:#fff;font-size:13px;font-weight:800;}
    .story-stack-counter{position:absolute;right:94px;top:17px;z-index:9;color:rgba(255,255,255,.82);font-size:12px;font-weight:700;}
    .story-stack-card video{position:relative;z-index:5;}
    .story-stack-card .story-stack-nav{z-index:7;}
  `;
  document.head.appendChild(style);
}

function storyName(story) {
  return String(story.username || story.userName || story.handle || story.displayName || story.name || 'User').replace(/^@/, '') || 'User';
}

async function fetchStories() {
  const user = auth.currentUser;
  if (!user) return [];
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load stories.');
  return (Array.isArray(data.stories) ? data.stories : [])
    .map(normalizeStory)
    .filter((story) => Number(story.expiresAt || 0) > Date.now());
}

function openPicker(event) {
  event.preventDefault();
  event.stopPropagation();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  input.style.width = '1px';
  input.style.height = '1px';
  document.body.appendChild(input);
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file || !file.type.startsWith('video/')) return;
    window.__indoStoryDraftFile = file;
    await window.__indoNavigate?.('story-create');
  }, { once: true });
  try {
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.click();
  } catch {
    input.click();
  }
}

async function deleteStory(storyId, overlay) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories/${encodeURIComponent(storyId)}/delete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not delete story.');
  overlay.remove();
  localStorage.removeItem(LAST_STORY_KEY);
  const row = document.querySelector('[data-stories-v2]');
  if (row) await renderStoryRow(row);
}

function shareStory(story) {
  const id = String(story?.id || story?.publicId || '').trim();
  if (!id) return Promise.resolve();
  const url = `${window.location.origin}${window.location.pathname}?story=${encodeURIComponent(id)}`;
  if (navigator.share) return navigator.share({ title: 'Indo story', text: 'Watch this story on Indo', url });
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(url);
  window.prompt('Copy this story link:', url);
  return Promise.resolve();
}

function openViewer(group, startIndex = 0) {
  const stories = Array.isArray(group) ? group.filter(Boolean) : [];
  if (!stories.length) return;
  let index = Math.max(0, Math.min(stories.length - 1, startIndex));
  document.querySelector('.story-viewer-v2')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'story-viewer-v2 story-stack-overlay';
  overlay.innerHTML = `<div class="story-viewer-v2-card story-stack-card"><div class="story-stack-bars"></div><button class="story-viewer-v2-close" type="button" aria-label="Close">×</button><button class="story-viewer-v2-share" type="button" aria-label="Share story">↗</button><button class="story-viewer-v2-menu" type="button" aria-label="More">⋯</button><div class="story-viewer-v2-actions"><button class="story-delete" type="button">Delete story</button></div><div class="story-stack-meta"></div><div class="story-stack-counter"></div><video autoplay playsinline></video><div class="story-stack-nav"><button type="button" data-prev aria-label="Previous story"></button><button type="button" data-next aria-label="Next story"></button></div></div>`;
  const card = overlay.querySelector('.story-stack-card');
  const video = overlay.querySelector('video');
  const bars = overlay.querySelector('.story-stack-bars');
  const meta = overlay.querySelector('.story-stack-meta');
  const counter = overlay.querySelector('.story-stack-counter');
  const actions = overlay.querySelector('.story-viewer-v2-actions');
  const deleteButton = overlay.querySelector('.story-delete');

  const close = () => { video.pause(); overlay.remove(); };
  const render = () => {
    const story = stories[index];
    const own = String(story.ownerUid || '') === String(auth.currentUser?.uid || '');
    bars.innerHTML = stories.map((_, i) => `<span class="story-stack-bar"><i style="width:${i < index ? '100%' : '0'}"></i></span>`).join('');
    meta.textContent = `@${storyName(story)}`;
    counter.textContent = `${index + 1}/${stories.length}`;
    video.src = story.secureUrl;
    video.load();
    video.play().catch(() => {});
    card.querySelector('.story-viewer-v2-menu').style.display = own ? '' : 'none';
    actions.classList.remove('open');
    deleteButton.disabled = false;
    deleteButton.textContent = 'Delete story';
  };
  const next = () => { if (index >= stories.length - 1) return close(); index += 1; render(); };
  const prev = () => { if (index <= 0) return; index -= 1; render(); };

  overlay.querySelector('.story-viewer-v2-close').addEventListener('click', close);
  overlay.querySelector('.story-viewer-v2-share').addEventListener('click', (event) => { event.stopPropagation(); shareStory(stories[index]).catch(() => {}); });
  card.querySelector('[data-next]').addEventListener('click', (event) => { event.stopPropagation(); next(); });
  card.querySelector('[data-prev]').addEventListener('click', (event) => { event.stopPropagation(); prev(); });
  card.querySelector('.story-viewer-v2-menu').addEventListener('click', (event) => { event.stopPropagation(); actions.classList.toggle('open'); });
  deleteButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    const story = stories[index];
    deleteButton.disabled = true;
    deleteButton.textContent = 'Deleting...';
    try { await deleteStory(String(story.id || ''), overlay); }
    catch (error) { deleteButton.disabled = false; deleteButton.textContent = error?.message || 'Delete story'; }
  });
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  video.addEventListener('ended', next);
  video.addEventListener('timeupdate', () => {
    const bar = bars.querySelectorAll('.story-stack-bar i')[index];
    if (bar && video.duration) bar.style.width = `${Math.min(100, (video.currentTime / video.duration) * 100)}%`;
  });
  document.body.appendChild(overlay);
  render();
}

function groupStories(stories) {
  const groups = new Map();
  for (const story of stories) {
    const owner = String(story.ownerUid || story.uid || story.userId || story.creatorUid || '').trim();
    if (!owner) continue;
    if (!groups.has(owner)) groups.set(owner, []);
    groups.get(owner).push(story);
  }
  for (const group of groups.values()) group.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  return groups;
}

function renderGroup(group, isOwn) {
  const first = group[0];
  const name = storyName(first);
  const initial = name.charAt(0).toUpperCase() || 'U';
  return `<div class="story-v2 story-stack-item" data-story-stack-owner="${escapeHtml(first.ownerUid || '')}"><span class="story-v2-avatar"><span class="story-stack-ring"><span>${initial}</span></span>${isOwn ? '<button class="story-v2-add" type="button" data-story-add aria-label="Add another story">+</button>' : ''}<span class="story-stack-count">${group.length}</span></span><span class="story-v2-name">@${escapeHtml(name)}</span></div>`;
}

async function renderStoryRow(row) {
  const stories = await fetchStories();
  const groups = groupStories(stories);
  const currentUid = String(auth.currentUser?.uid || '');
  const html = [];
  const own = groups.get(currentUid);
  if (own?.length) html.push(renderGroup(own, true));
  else html.push(`<button class="story-v2" type="button" data-story-add aria-label="Add your story"><span class="story-v2-avatar">+</span><span class="story-v2-name">Your story</span></button>`);
  for (const [owner, group] of groups) if (owner !== currentUid) html.push(renderGroup(group, false));
  row.innerHTML = html.join('');
  row.querySelectorAll('[data-story-add]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); openPicker(event); }));
  row.querySelectorAll('[data-story-stack-owner]').forEach((item) => item.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-story-add]')) return;
    openViewer(groups.get(item.dataset.storyStackOwner) || []);
  }));
}

export async function enhanceStoryRow(app) {
  ensureStyles();
  const row = app.querySelector('[data-stories-v2]');
  if (!row) return;
  try { await renderStoryRow(row); }
  catch (error) { console.warn('Story stack enhancer unavailable:', error); }
}
