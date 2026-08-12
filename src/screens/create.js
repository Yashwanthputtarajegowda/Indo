import { icons } from '../data.js';
import { nav } from '../components/nav.js';
import { uploadVideo } from '../features/feed/create-video.js';
import { publishStory } from '../features/upload/story-publish.js';

export function renderCreate(app) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="page-head">
        <button data-screen="home" aria-label="Back">${icons.back}</button>
        <h2>Create</h2>
        <span></span>
      </header>

      <main class="create-page">
        <section class="create-card upload-video-card">
          <div class="create-icon">▣</div>
          <div class="create-copy">
            <b>Upload Video</b>
            <small>Choose a video, add a caption and publish it.</small>
          </div>
          <input id="video-file" type="file" accept="video/*" hidden>
          <button class="primary-btn create-select" type="button" data-select-video>Select</button>
        </section>

        <form id="video-upload-form" class="upload-form" hidden>
          <label>
            Title
            <input id="video-title" maxlength="120" placeholder="Video title">
          </label>
          <label>
            Caption
            <textarea id="video-caption" maxlength="500" rows="4" placeholder="Write a caption"></textarea>
          </label>
          <div id="selected-video" class="selected-video">No video selected.</div>
          <div class="upload-progress">
            <div id="upload-progress-bar" class="upload-progress-bar"></div>
          </div>
          <p id="upload-message" class="upload-message" aria-live="polite"></p>
          <button class="primary-btn" type="submit">Publish Video</button>
        </form>

        <button class="create-card" data-screen="reels" type="button">
          <span class="create-icon pink">▶</span>
          <div>
            <b>Reel</b>
            <small>Short vertical video</small>
          </div>
        </button>

        <section class="create-card">
          <span class="create-icon blue">◉</span>
          <div class="create-copy">
            <b>Story</b>
            <small>Video story that expires after 24 hours.</small>
          </div>
          <input id="story-file" type="file" accept="video/*" hidden>
          <button class="primary-btn create-story-select" type="button">Select</button>
        </section>

        <p id="story-message" class="upload-message" aria-live="polite"></p>
        <div class="upload-note">Published videos appear in Home and on your profile. Stories expire automatically after 24 hours.</div>
      </main>

      ${nav('create')}
    </div>
  `;

  const fileInput = app.querySelector('#video-file');
  const form = app.querySelector('#video-upload-form');
  const selected = app.querySelector('#selected-video');
  const message = app.querySelector('#upload-message');
  const bar = app.querySelector('#upload-progress-bar');
  const selectButton = app.querySelector('[data-select-video]');

  selectButton.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    form.hidden = false;
    selected.textContent = `${file.name} • ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    message.textContent = '';
    bar.style.width = '0%';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = fileInput.files?.[0];

    if (!file) {
      message.textContent = 'Please select a video first.';
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;

    try {
      await uploadVideo(file, {
        title: app.querySelector('#video-title').value.trim(),
        caption: app.querySelector('#video-caption').value.trim(),
        onProgress: (percent, text) => {
          bar.style.width = `${percent}%`;
          message.textContent = text;
        }
      });

      message.textContent = 'Video published successfully.';
      form.reset();
      selected.textContent = 'No video selected.';

      window.setTimeout(() => {
        window.location.hash = '#home';
        window.location.reload();
      }, 800);
    } catch (error) {
      message.textContent = error?.message || 'Upload failed. Please try again.';
      submit.disabled = false;
    }
  });

  const storyInput = app.querySelector('#story-file');
  const storyMessage = app.querySelector('#story-message');
  const storySelectButton = app.querySelector('.create-story-select');

  storySelectButton.addEventListener('click', () => storyInput.click());

  storyInput.addEventListener('change', async () => {
    const file = storyInput.files?.[0];
    if (!file) return;

    storyMessage.textContent = 'Preparing your story...';

    try {
      await publishStory(file, (_percent, text) => {
        storyMessage.textContent = text;
      });
      storyMessage.textContent = 'Story published successfully. It expires in 24 hours.';
      storyInput.value = '';
    } catch (error) {
      storyMessage.textContent = error?.message || 'Story upload failed. Please try again.';
      storyInput.value = '';
    }
  });
}
