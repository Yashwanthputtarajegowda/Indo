export function renderProfilePage(container) {
  container.innerHTML = `
    <main class="indo-page">
      <header class="indo-header">
        <h1>Profile</h1>
      </header>

      <section class="profile-content">
        <div class="profile-avatar" aria-hidden="true">
          <span>Y</span>
        </div>

        <h2 class="profile-name">Your Name</h2>
        <p class="profile-username">@username</p>

        <div class="profile-stats">
          <div>
            <strong>0</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Followers</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Following</span>
          </div>
        </div>
      </section>
    </main>
  `;
}
