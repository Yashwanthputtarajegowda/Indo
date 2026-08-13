import { auth } from '../auth/firebase-client.js';

const LAST_STORY_KEY = 'indo:last-story';
const STORY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function normalizeStory(story, currentUid = '') {
  if (!story || typeof story !== 'object') return null;
  return {
    ...story,
    ownerUid: String(story.ownerUid || story.uid || story.userId || story.creatorUid || currentUid || ''),
    secureUrl: story.secureUrl || story.videoUrl || story.url || story.mediaUrl || ''
  };
}

function readLocalStory(currentUid) {
  try {
    const cached = JSON.parse(localStorage.getItem(LAST_STORY_KEY) || 'null');
    const story = normalizeStory(cached, currentUid);
    if (!story || story.ownerUid !== currentUid || !story.secureUrl) return null;
    const createdAt = Number(story.createdAt || 0);
    if (createdAt && Date.now() - createdAt > STORY_MAX_AGE_MS) {
      localStorage.removeItem(LAST_STORY_KEY);
      return null;
    }
    return story;
  } catch {
    return null;
  }
}

export async function loadStories() {
  const user = auth.currentUser;
  if (!user) return [];
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load stories.');

  const stories = Array.isArray(data.stories)
    ? data.stories.map((story) => normalizeStory(story, user.uid)).filter(Boolean)
    : [];

  const localStory = readLocalStory(user.uid);
  if (localStory && !stories.some((story) => String(story.ownerUid) === user.uid && String(story.id || '') === String(localStory.id || ''))) {
    stories.unshift(localStory);
  }

  return stories;
}

export function renderStoriesRow(stories) {
  const active = Array.isArray(stories) ? stories : [];
  const unique = [];
  const seen = new Set();
  for (const story of active) {
    const owner = String(story.ownerUid || story.uid || story.userId || '');
    if (!owner || seen.has(owner)) continue;
    seen.add(owner);
    unique.push(story);
  }
  return unique.map((story) => {
    const name = String(story.name || story.username || 'Indo User');
    const username = String(story.username || story.name || 'Indo User').replace(/^@/, '');
    const initial = name.replace(/^@/, '').trim().charAt(0).toUpperCase() || 'I';
    const storyUrl = story.secureUrl || story.videoUrl || story.url || story.mediaUrl || '';
    return `<button class="story" type="button" data-story-url="${escapeHtml(storyUrl)}" data-story-name="${escapeHtml(name)}"><div class="avatar gradient">${escapeHtml(initial)}</div><span>@${escapeHtml(username)}</span></button>`;
  }).join('');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char]));
}

export function bindStoryButtons(root) {
  root.querySelectorAll('[data-story-url]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.dataset.storyUrl;
      const name = button.dataset.storyName || 'Indo User';
      if (!url) return;
      const overlay = document.createElement('div');
      overlay.className = 'story-viewer';
      overlay.innerHTML = `<button type="button" class="story-viewer-close" aria-label="Close">×</button><div class="story-viewer-card"><b>${escapeHtml(name)}</b><video src="${escapeHtml(url)}" controls autoplay playsinline></video></div>`;
      overlay.querySelector('.story-viewer-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    });
  });
}
