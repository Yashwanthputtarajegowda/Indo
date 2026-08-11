const app = document.querySelector('#app');

const pages = {
  home: { title: 'Home', text: 'Your feed will appear here.' },
  videos: { title: 'Videos', text: 'Videos will appear here.' },
  reels: { title: 'Reels', text: 'Reels will appear here.' },
  messages: { title: 'Messages', text: 'Your conversations will appear here.' },
  profile: { title: 'Profile', text: 'Your profile will appear here.' }
};

function render(page = 'home') {
  const current = pages[page];
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">Indo</div>
      </header>
      <main class="content">
        <section class="stories" aria-label="Stories">
          <div class="story"><div class="avatar">Y</div><small>Your story</small></div>
          <div class="story"><div class="avatar">+</div><small>Add story</small></div>
        </section>
        <section class="welcome">
          <div class="muted">${current.title.toUpperCase()}</div>
          <h1>${current.title}</h1>
          <p class="muted">${current.text}</p>
        </section>
      </main>
      <nav class="bottom-nav" aria-label="Main navigation">
        ${Object.entries(pages).map(([key, item]) => `
          <button class="${key === page ? 'active' : ''}" data-page="${key}">
            <span class="icon">${key === 'home' ? '⌂' : key === 'videos' ? '▶' : key === 'reels' ? '◉' : key === 'messages' ? '✉' : '●'}</span>
            ${item.title}
          </button>`).join('')}
      </nav>
    </div>`;

  document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => render(button.dataset.page));
  });
}

render();
