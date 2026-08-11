const CHAT_KEY = "indo-chat-messages";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(store));
}

export function getConversationMessages(userId) {
  const store = readStore();
  return Array.isArray(store[userId]) ? store[userId] : [];
}

export function appendConversationMessage(userId, message) {
  const store = readStore();
  const messages = Array.isArray(store[userId]) ? store[userId] : [];

  const nextMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    type: message.type || "outgoing",
    text: String(message.text || ""),
    createdAt: Date.now()
  };

  store[userId] = [...messages, nextMessage];
  writeStore(store);

  window.dispatchEvent(
    new CustomEvent("indo:chat-message-added", {
      detail: nextMessage
    })
  );

  return nextMessage;
}
