import { publishStory } from '../features/upload/story-publish.js';
import { nav } from '../components/nav.js';
import { icons } from '../data.js';

export function renderStoryCreate(app) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="page-head">
        <button data-screen="home" aria-label="Back">${icons.back}</button>
        <h2>Add to your story</h2>
        <span></span>
      </header>
      <main style="padding:18px 14px 90px;">
        <section style="border:1px solid #22232b;border-radius:16px;padding:18px;background:#101016;">
          <div style="font-weight:800;font-size:18px;margin-bottom:6px;color:#fff;">New story</div>
          <div style="color:#9999a4;font-size:12px;margin-bottom:18px;">Choose a video. Your story expires after 24 hours.</div>
          <input id="story-create-file" type="file" accept="video/*" hidden>
          <button id="story-create-select" type="button" style="width:100%;height:42px;border:0;border-radius:10px;background:#7b3cff;color:#fff;font-weight:800;">Choose video</button>
          <div id="story-create-name" style="font-size:12px;color:#aaa;margin-top:12px;min-height:18px;"></div>
          <div id="story-create-message" style="font-size:12px;color:#aaa;margin-top:12px;min-height:18px;"></div>
        </section>
      </main>
      ${nav('home')}
    </div>
  `;

  const input = app.querySelector('#story-create-file');
  const select = app.querySelector('#story-create-select');
  const name = app.querySelector('#story-create-name');
  const message = app.querySelector('#story-create-message');

  select.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    name.textContent = `${file.name} • ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    select.disabled = true;
    message.textContent = 'Uploading story...';
    try {
      await publishStory(file, () => {});
      message.textContent = 'Story published successfully.';
      input.value = '';
      window.setTimeout(() => {
        const { state } = window.__indoStateRef || {};
        if (state) state.screen = 'home';
        window.location.hash = '#home';
        window.location.reload();
      }, 700);
    } catch (error) {
      message.textContent = error?.message || 'Story upload failed. Please try again.';
      select.disabled = false;
      input.value = '';
    }
  });
}
