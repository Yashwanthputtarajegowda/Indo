import { watchConversation } from "../services/chat-realtime.js";

const demoThreads = [
  { userId: "@indo_creator", preview: "Welcome to Indo!", time: "Now" },
  { userId: "@demo_user", preview: "Let's connect.", time: "5m" }
];

function formatTime(timestamp) {
  if (!timestamp) return "Now";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Now";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function renderMessagesPage(container) {
  const threads = demoThreads.map((thread) => ({ ...thread }));

  container.innerHTML = `
    <main class="messages-page">
      <header class="messages-header">
        <h1 class="messages-title">Messages</h1>
        <button class="messages-new" type="button" data-message-new aria-label="New message">＋</button>
      </header>
      <section class="messages-list" data-messages-list aria-label="Message conversations">
        ${threads.map((thread, index) => `
          <button class="message-thread" type="button" data-message-index="${index}">
            <div class="message-avatar" aria-hidden="true">${thread.userId.replace('@','').slice(0,1).toUpperCase()}</div>
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

  const list = container.querySelector("[data-messages-list]");
  const unsubscribers = [];

  function refreshThread(index, items) {
    const latest = items.at(-1);
    const button = list.querySelector(`[data-message-index="${index}"]`);
    if (!button || !latest) return;
    const preview = button.querySelector(".message-preview");
    const time = button.querySelector(".message-time");
    if (preview) preview.textContent = String(latest.text || "");
    if (time) time.textContent = formatTime(latest.createdAt);
  }

  threads.forEach((thread, index) => {
    try {
      unsubscribers.push(
        watchConversation(thread.userId, (items) => refreshThread(index, items))
      );
    } catch (error) {
      console.warn("Indo message thread sync failed:", error.message);
    }
  });

  container.addEventListener("click", (event) => {
    const thread = event.target.closest("[data-message-index]");
    const nav = event.target.closest("[data-message-nav]");
    const newMessage = event.target.closest("[data-message-new]");

    if (thread) {
      const selected = threads[Number(thread.dataset.messageIndex)];
      window.dispatchEvent(new CustomEvent("indo:message-open", { detail: selected }));
      return;
    }
    if (newMessage) {
      window.dispatchEvent(new CustomEvent("indo:new-message"));
      return;
    }
    if (nav) {
      window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: nav.dataset.messageNav } }));
    }
  });

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}
