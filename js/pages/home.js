import { renderBottomNavigation } from '../components/bottom-navigation.js';

export function renderHomePage(container) {
  container.innerHTML = `
    <main class="indo-app">
      <header class="indo-header">
        <h1>Indo</h1>
      </header>

      <section class="indo-content">
        <h2>Movies, Videos & Reels</h2>
        <p>Welcome to Indo.</p>
      </section>

      <div id="bottom-navigation"></div>
    </main>
  `;

  const navigation = document.getElementById('bottom-navigation');

  if (navigation) {
    renderBottomNavigation(navigation);
  }
}
