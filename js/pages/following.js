const demoFollowing = [
  {
    name: "Indo Creator",
    userId: "@indo_creator"
  },
  {
    name: "Indo Movies",
    userId: "@indo_movies"
  }
];

export function renderFollowingPage(container) {
  container.innerHTML = `
    <main class="following-page">
      <header class="following-header">
        <h1>Following</h1>
      </header>

      <section class="following-list" aria-label="Following users">
        ${demoFollowing.map((user) => `
          <article class="following-user">
            <div class="following-avatar" aria-hidden="true">
              ${user.name.charAt(0)}
            </div>

            <div class="following-user-info">
              <h2 class="following-user-name">${user.name}</h2>
              <p class="following-user-id">${user.userId}</p>
            </div>

            <button
              class="following-button is-following"
              type="button"
              data-following-user="${user.userId}"
            >
              Following
            </button>
          </article>
        `).join("")}
      </section>

      <nav class="following-bottom-nav" aria-label="Main navigation">
        <button class="following-nav-button" type="button" data-following-nav="home">
          Home
        </button>
        <button class="following-nav-button" type="button" data-following-nav="reels">
          Reels
        </button>
        <button class="following-nav-button is-active" type="button" data-following-nav="following">
          Following
        </button>
        <button class="following-nav-button" type="button" data-following-nav="profile">
          Profile
        </button>
      </nav>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const navigationButton = event.target.closest("[data-following-nav]");

    if (navigationButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: navigationButton.dataset.followingNav
          }
        })
      );
    }

    const userButton = event.target.closest("[data-following-user]");

    if (userButton) {
      window.dispatchEvent(
        new CustomEvent("indo:profile", {
          detail: {
            userId: userButton.dataset.followingUser
          }
        })
      );
    }
  });
}
