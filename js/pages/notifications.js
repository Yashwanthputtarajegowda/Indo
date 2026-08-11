const notificationOptions = [
  ["Likes", "On"],
  ["Comments", "On"],
  ["Followers", "On"],
  ["Messages", "On"],
  ["Mentions", "On"],
  ["Updates", "On"]
];

export function renderNotificationsPage(container) {
  container.innerHTML = `
    <main class="notifications-page">
      <header class="notifications-header">
        <button
          class="notifications-back"
          type="button"
          data-notifications-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="notifications-title">Notifications</h1>
      </header>

      <section class="notifications-list">
        ${notificationOptions.map(([label, state]) => `
          <button
            class="notifications-item"
            type="button"
            data-notification-setting="${label.toLowerCase()}"
          >
            <span>${label}</span>
            <span>${state}</span>
          </button>
        `).join("")}
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    if (event.target.closest("[data-notifications-back]")) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "settings"
          }
        })
      );
    }
  });
}
