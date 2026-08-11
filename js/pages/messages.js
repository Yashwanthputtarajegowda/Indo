import { watchUserConversations } from "../services/chat-realtime.js";

const demoThreads = [
  { uid: "demo-indo-creator", userId: "@indo_creator", name: "Indo Creator", preview: "Welcome to Indo!", time: "Now" },
  { uid: "demo-user", userId: "@demo_user", name: "Demo User", preview: "Let's connect.", time: "5m" }
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
  container.innerHTML = `
    <main class="messages-page">
      <header class="messages-header">
        <h1 class="messages-title">Messages</h1>
        <button class="messages-new" type="button" data-message-new aria-label="New message">＋</button>
      </header>
      <section class="messages-list" data-messages-list aria-label="Message conversations"></section>
      <nav class="messages-bottom-nav" aria-label="Main navigation">
        <button class="messages-nav-button" type="button" data-message-nav="home">Home</button>
        <button class="messages-nav-button" type="button" data-message-nav="reels">Reels</button>
        <button class="messages-nav-button is-active" type="button" data-message-nav="message">Message</button>
        <button class="messages-nav-button" type="button" data-message-nav="profile">Profile</button>
      </nav>
    </main>
  `;

  const list = container.querySelector("[data-messages-list]");
  let threads = [];

  const renderThreads = (items) => {
    threads = items.length ? items : [];
    list.innerHTML = threads.length ? threads.map((thread, index) => `
      <button class="message-thread" type="button" data-message-index="${index}">
        <div class="message-avatar" aria-hidden="true">${String(thread.otherUserId || "@?").replace('@','').slice(0,1).toUpperCase()}</div>
        <div class="message-thread-info">
          <p class="message-user">${thread.otherUserId || "@user"}</p>
          <p class="message-preview">${thread.preview || ""}</p>
        </div>
        <span class="message-time">${formatTime(thread.updatedAt)}</span>
      </button>
    `).join("") : `<p class="messages-empty">No conversations yet.</p>`;
  };

  const unsubscribe = watchUserConversations((items) => renderThreads(items));
  renderThreads([]);

  container.addEventListener("click", (event) => {
    const thread = event.target.closest("[data-message-index]");
    const nav = event.target.closest("[data-message-nav]");
    const newMessage = event.target.closest("[data-message-new]");

    if (thread) {
      const selected = threads[Number(thread.dataset.messageIndex)];
      window.dispatchEvent(new CustomEvent("indo:message-open", {
        detail: { uid: selected.otherUid, userId: selected.otherUserId, name: selected.otherName }
      }));
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

  return () => unsubscribe?.();
}
