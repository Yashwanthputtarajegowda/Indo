export function renderBottomNavigation(container) {
  container.innerHTML = `
    <nav class="bottom-navigation" aria-label="Main navigation">
      <button type="button" data-route="home">
        <span aria-hidden="true">⌂</span>
        <small>Home</small>
      </button>

      <button type="button" data-route="reels">
        <span aria-hidden="true">▶</span>
        <small>Reels</small>
      </button>

      <button type="button" data-route="create" aria-label="Create">
        <span aria-hidden="true">+</span>
      </button>

      <button type="button" data-route="following">
        <span aria-hidden="true">♡</span>
        <small>Following</small>
      </button>

      <button type="button" data-route="profile">
        <span aria-hidden="true">◯</span>
        <small>Profile</small>
      </button>
    </nav>
  `;
}
