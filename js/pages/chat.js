import { watchConversation, sendConversationMessage } from "../services/chat-realtime.js";

const demoMessages = [
  { type: "incoming", text: "Welcome to Indo chat." },
  { type: "outgoing", text: "Hi 👋" }
];

export function renderChatPage(container, conversation = {}) {
  const userId = conversation.userId || "@indo_creator";

  container.innerHTML = `
    <main class="chat-page">
      <header class="chat-header">
        <button class="chat-back" type="button" data-chat-back aria-label="Back">←</button>
        <h1 class="chat-user">${userId}</h1>
      </header>

      <section class="chat-messages" data-chat-messages aria-label="Messages">
        ${demoMessages.map((message) => `
          <div class="chat-bubble ${message.type}">${message.text}</div>
        `).join("")}
      </section>

      <form class="chat-compose" data-chat-form>
        <input class="chat-input" name="message" type="text" maxlength="2000" autocomplete="off" placeholder="Message..." required />
        <button class="chat-send" type="submit">Send</button>
      </form>
    </main>
  `;

  const messages = container.querySelector("[data-chat-messages]");
  const form = container.querySelector("[data-chat-form]");
  const input = form.querySelector(".chat-input");
  let unsubscribe = () => {};

  const renderMessages = (items) => {
    messages.innerHTML = items.map((message) => `
      <div class="chat-bubble ${message.type === "incoming" ? "incoming" : "outgoing"}">${String(message.text || "")}</div>
    `).join("");
    messages.scrollTop = messages.scrollHeight;
  };

  try {
    unsubscribe = watchConversation(userId, (items) => {
      renderMessages(items.length ? items : demoMessages);
    });
  } catch (error) {
    console.warn("Indo realtime chat setup failed:", error.message);
  }

  container.querySelector("[data-chat-back]").addEventListener("click", () => {
    unsubscribe();
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "message" } }));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const sendButton = form.querySelector(".chat-send");
    sendButton.disabled = true;

    try {
      await sendConversationMessage(userId, text);
      input.value = "";
      input.focus();
    } catch (error) {
      form.dataset.error = error.message || "Could not send message.";
    } finally {
      sendButton.disabled = false;
    }
  });
}
