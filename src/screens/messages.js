import { auth } from "../features/auth/firebase-client.js";
import { renderIndoBrandTopbar } from "../components/indo-brand-topbar.js";
import { nav } from "../components/nav.js";

const API = () => window.INDO_API_BASE || "";
const esc = (value = "") =>
  String(value).replace(
    /[&<>\"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[c],
  );

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");
  const headers = {
    Authorization: `Bearer ${await user.getIdToken()}`,
    ...(options.headers || {}),
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${API()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Messaging request failed.");
  return data;
}

function formatTime(value) {
  const ts = Number(value || 0);
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

async function loadConversations() {
  const data = await request("/api/messages");
  return Array.isArray(data.conversations) ? data.conversations : [];
}

async function loadConversation(uid) {
  const data = await request(`/api/messages/${encodeURIComponent(uid)}`);
  return Array.isArray(data.messages) ? data.messages : [];
}

async function markRead(uid) {
  return request(`/api/messages/${encodeURIComponent(uid)}/read`, {
    method: "POST",
  }).catch(() => null);
}

async function sendMessage(uid, text) {
  return request(`/api/messages/${encodeURIComponent(uid)}`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

function installStyles() {
  const id = "indo-messages-v2";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .indo-msg{width:min(100%,520px);min-height:100vh;margin:auto;background:#05070d;color:#f7f8ff;padding-bottom:82px}
    .indo-msg-main{padding:12px 12px 28px}.indo-msg-title{font-size:20px;font-weight:900;margin:4px 4px 14px}
    .indo-msg-list{display:grid;gap:8px}.indo-msg-card{width:100%;border:1px solid #22293b;border-radius:14px;background:#0b0f19;color:#fff;padding:11px;display:grid;grid-template-columns:42px 1fr auto;gap:10px;text-align:left;cursor:pointer}.indo-msg-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#6f43ff,#db38ac);display:grid;place-items:center;font-weight:900}.indo-msg-copy{min-width:0}.indo-msg-name{font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-msg-last{margin-top:4px;color:#9199aa;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.indo-msg-time{color:#757d8f;font-size:9px}.indo-msg-badge{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:999px;background:#8b4cff;color:#fff;font-size:9px;font-weight:900}.indo-msg-empty{padding:48px 18px;text-align:center;border:1px dashed #242c3f;border-radius:14px;color:#7f8798;font-size:12px}.indo-chat-backdrop{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.7);display:grid;place-items:end center}.indo-chat{width:min(100%,520px);height:min(82vh,720px);background:#0a0e17;border:1px solid #293149;border-bottom:0;border-radius:20px 20px 0 0;display:flex;flex-direction:column;overflow:hidden}.indo-chat-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 12px;border-bottom:1px solid #20283a;background:#0c111c}.indo-chat-head-title{min-width:0}.indo-chat-head-title b{display:block;font-size:13px}.indo-chat-head-title span{display:block;margin-top:2px;color:#828b9e;font-size:9px}.indo-chat-close{width:32px;height:32px;border:0;border-radius:50%;background:#171d29;color:#fff;font-size:20px}.indo-chat-list{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.indo-chat-msg{max-width:82%;padding:9px 11px;border-radius:14px;background:#191f2c;color:#e8ecf4;font-size:12px;line-height:1.4;word-break:break-word}.indo-chat-msg.mine{align-self:flex-end;background:linear-gradient(135deg,#6942ff,#b93cae)}.indo-chat-time{display:block;margin-top:3px;font-size:8px;opacity:.6}.indo-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid #20283a;background:#0b1019}.indo-chat-form input{flex:1;min-width:0;height:40px;border:1px solid #293246;border-radius:11px;background:#0d121c;color:#fff;padding:0 11px;outline:none}.indo-chat-form button{width:46px;height:40px;border:0;border-radius:11px;background:linear-gradient(135deg,#7444ff,#ca3cb0);color:#fff;font-weight:900}
  `;
  document.head.appendChild(style);
}

async function openConversation(conversation) {
  const uid = String(conversation?.uid || "").trim();
  if (!uid) return;
  document.querySelector("[data-indo-chat]")?.remove();
  const overlay = document.createElement("div");
  overlay.dataset.indoChat = "1";
  const name = String(conversation.name || conversation.username || "Indo User");
  const userId = String(conversation.username || "").replace(/^@/, "");
  overlay.className = "indo-chat-backdrop";
  overlay.innerHTML = `<section class="indo-chat"><header class="indo-chat-head"><div class="indo-chat-head-title"><b>${esc(name)}</b><span>${esc(userId ? `@${userId}` : "")}</span></div><button class="indo-chat-close" type="button" aria-label="Close">×</button></header><div class="indo-chat-list" data-chat-list><div style="color:#7f8798;font-size:11px;text-align:center;padding:24px">Loading...</div></div><form class="indo-chat-form" data-chat-form><input name="text" maxlength="1000" autocomplete="off" placeholder="Write a message..."><button type="submit">➤</button></form></section>`;
  document.body.appendChild(overlay);
  const list = overlay.querySelector("[data-chat-list]");
  const form = overlay.querySelector("[data-chat-form]");
  const close = () => overlay.remove();
  overlay.querySelector(".indo-chat-close")?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  const render = (messages) => {
    if (!messages.length) {
      list.innerHTML =
        '<div style="color:#7f8798;font-size:11px;text-align:center;padding:24px">No messages yet.</div>';
      return;
    }
    const me = auth.currentUser?.uid || "";
    list.innerHTML = messages
      .map(
        (message) =>
          `<div class="indo-chat-msg${String(message.senderUid) === String(me) ? " mine" : ""}">${esc(message.text)}<span class="indo-chat-time">${esc(formatTime(message.createdAt))}</span></div>`,
      )
      .join("");
    list.scrollTop = list.scrollHeight;
  };
  try {
    render(await loadConversation(uid));
    await markRead(uid);
  } catch (error) {
    list.innerHTML = `<div style="color:#ff8b8b;font-size:11px;padding:18px">${esc(error.message || "Could not load messages.")}</div>`;
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.elements.text;
    const text = String(input.value || "").trim();
    if (!text) return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await sendMessage(uid, text);
      input.value = "";
      render(await loadConversation(uid));
    } catch (error) {
      list.insertAdjacentHTML(
        "beforeend",
        `<div style="color:#ff8b8b;font-size:11px;padding:8px">${esc(error.message || "Could not send message.")}</div>`,
      );
    } finally {
      button.disabled = false;
      input.focus();
    }
  });
}

export async function renderMessages(app) {
  installStyles();
  app.innerHTML = `<div class="indo-msg">${renderIndoBrandTopbar()}<main class="indo-msg-main"><div class="indo-msg-title">Messages</div><div class="indo-msg-list" data-message-list><div class="indo-msg-empty">Loading conversations...</div></div></main>${nav("messages")}</div>`;
  const list = app.querySelector("[data-message-list]");
  try {
    const conversations = await loadConversations();
    if (!conversations.length) {
      list.innerHTML = '<div class="indo-msg-empty">No conversations yet.</div>';
      return;
    }
    list.innerHTML = conversations
      .map((item) => {
        const displayName = String(item.name || item.username || "Indo User");
        const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "I";
        const unread = Number(item.unreadCount || 0);
        return `<button class="indo-msg-card" type="button" data-conversation-uid="${esc(item.uid || "")}"><span class="indo-msg-avatar">${esc(initial)}</span><span class="indo-msg-copy"><span class="indo-msg-name">${esc(displayName)}${unread ? `<span class="indo-msg-badge">${unread > 99 ? "99+" : unread}</span>` : ""}</span><span class="indo-msg-last">${esc(item.lastMessage || "Start a conversation")}</span></span><span class="indo-msg-time">${esc(formatTime(item.lastMessageAt))}</span></button>`;
      })
      .join("");
    list.querySelectorAll("[data-conversation-uid]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = conversations.find(
          (row) => String(row.uid) === String(button.dataset.conversationUid),
        );
        openConversation(item).catch(() => {});
      });
    });
  } catch (error) {
    list.innerHTML = `<div class="indo-msg-empty">${esc(error.message || "Could not load messages.")}</div>`;
  }
}
