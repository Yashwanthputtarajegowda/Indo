export function renderBottomNavigation(container) {
  container.innerHTML = `
    <nav class="bottom-navigation" aria-label="Main navigation">
      <button type="button" data-route="home">Home</button>
      <button type="button" data-route="reels">Reels</button>
      <button type="button" data-route="create">Create</button>
      <button type="button" data-route="following">Following</button>
      <button type="button" data-route="library">Library</button>
    </nav>
  `;
}
