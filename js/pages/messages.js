const demoThreads = [
  {
    userId: "@indo_creator",
    preview: "Welcome to Indo!",
    time: "Now"
  },
  {
    userId: "@demo_user",
    preview: "Let's connect.",
    time: "5m"
  }
];

export function renderMessagesPage(container) {
  container.innerHTML = `
    <main class="messages-page">
      <header class="messages-header">
        <h1 class="messages-title">Messages</h1>
        <button class="messages-new" type="button" data-message-new aria-label="New message">＋</button>
      </header>

      <section class="messages-list" aria-label="Message conversations">
        ${demoThreads.map((thread, index) => `
          <button class="message-thread" type="button" data-message-index="${index}">
            <div class="message-avatar" aria-hidden="true">
              ${thread.userId.replace('@','').slice(0,1).toUpperCase()}
            </div>
            <div class="message-thread-info">
              <p class="message-user">${thread.userId}</p>
              <p class="message-preview">${thread.preview}</p>
            </div>
            <span class="message-time">${thread.time}</span>
          </button>
        `).join("")}
      </section>

      <nav class="messages-bottom-nav" aria-label="Main navigation">
        <button class="messages-nav-button" type="button" data-message-nav="home">Home</button>
        <button class="messages-nav-button" type="button" data-message-nav="reels">Reels</button>
        <button class="messages-nav-button is-active" type="button" data-message-nav="message">Message</button>
        <button class="messages-nav-button" type="button" data-message-nav="profile">Profile</button>
      </nav>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const thread = event.target.closest("[data-message-index]");
    const nav = event.target.closest("[data-message-nav]");
    const newMessage = event.target.closest("[data-message-new]");

    if (thread) {
      const selected = demoThreads[Number(thread.dataset.messageIndex)];
      window.dispatchEvent(new CustomEvent("indo:message-open", { detail: selected }));
      return;
    }

    if (newMessage) {
      window.dispatchEvent(new CustomEvent("indo:new-message"));
      return;
    }

    if (nav) {
      window.dispatchEvent(new CustomEvent("indo:navigate", {
        detail: { page: nav.dataset.messageNav }
      }));
    }
  });
}
