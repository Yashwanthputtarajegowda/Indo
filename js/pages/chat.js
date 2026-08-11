import {
  appendConversationMessage,
  getConversationMessages
} from "../services/chat-store.js";

const demoMessages = [
  { type: "incoming", text: "Welcome to Indo chat." },
  { type: "outgoing", text: "Hi 👋" }
];

export function renderChatPage(container, conversation = {}) {
  const userId = conversation.userId || "@indo_creator";
  const storedMessages = getConversationMessages(userId);
  const messagesToRender = storedMessages.length ? storedMessages : demoMessages;

  container.innerHTML = `
    <main class="chat-page">
      <header class="chat-header">
        <button class="chat-back" type="button" data-chat-back aria-label="Back">←</button>
        <h1 class="chat-user">${userId}</h1>
      </header>

      <section class="chat-messages" data-chat-messages aria-label="Messages">
        ${messagesToRender.map((message) => `
          <div class="chat-bubble ${message.type}">${message.text}</div>
        `).join("")}
      </section>

      <form class="chat-compose" data-chat-form>
        <input
          class="chat-input"
          name="message"
          type="text"
          maxlength="2000"
          autocomplete="off"
          placeholder="Message..."
          required
        />
        <button class="chat-send" type="submit">Send</button>
      </form>
    </main>
  `;

  const messages = container.querySelector("[data-chat-messages]");
  const form = container.querySelector("[data-chat-form]");
  const input = form.querySelector(".chat-input");

  container.querySelector("[data-chat-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "message" } }));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();

    if (!text) return;

    const message = appendConversationMessage(userId, {
      type: "outgoing",
      text
    });

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble outgoing";
    bubble.textContent = message.text;
    messages.appendChild(bubble);
    input.value = "";
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  });
}
