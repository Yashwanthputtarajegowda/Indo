import { auth } from '../auth/firebase-client.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char]));
}

export async function loadStories() {
  const user = auth.currentUser;
  if (!user) return [];
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load stories.');
  return Array.isArray(data.stories) ? data.stories : [];
}

export function renderStoriesRow(stories) {
  const active = Array.isArray(stories) ? stories : [];
  const unique = [];
  const seen = new Set();
  for (const story of active) {
    const owner = String(story.ownerUid || '');
    if (!owner || seen.has(owner)) continue;
    seen.add(owner);
    unique.push(story);
  }
  return unique.map((story) => {
    const name = escapeHtml(story.name || story.username || 'Indo User');
    const username = escapeHtml(story.username || story.name || 'Indo User');
    const initial = String(story.name || story.username || 'I').replace(/^@/, '').trim().charAt(0).toUpperCase() || 'I';
    const storyUrl = escapeHtml(story.secureUrl || '');
    return `<button class="story" type="button" data-story-url="${storyUrl}" data-story-name="${name}"><div class="avatar gradient">${escapeHtml(initial)}</div><span>${username}</span></button>`;
  }).join('');
}

export function bindStoryButtons(root) {
  root.querySelectorAll('[data-story-url]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.dataset.storyUrl;
      const name = button.dataset.storyName || 'Indo User';
      if (!url) return;
      const overlay = document.createElement('div');
      overlay.className = 'story-viewer';
      overlay.innerHTML = `<button type="button" class="story-viewer-close" aria-label="Close">×</button><div class="story-viewer-card"><b>${name}</b><video src="${escapeHtml(url)}" controls autoplay playsinline></video></div>`;
      overlay.querySelector('.story-viewer-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    });
  });
}
