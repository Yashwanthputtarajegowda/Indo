import { auth } from '../auth/firebase-client.js';

const API_BASE = () => window.INDO_API_BASE || '';

async function request(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE()}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Messaging request failed.');
  return data;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

async function loadMessages(uid) {
  const data = await request(`/api/messages/${encodeURIComponent(uid)}`);
  return data.messages || [];
}

async function sendMessage(uid, text) {
  return request(`/api/messages/${encodeURIComponent(uid)}`, { method: 'POST', body: JSON.stringify({ text }) });
}

async function markRead(uid) {
  return request(`/api/messages/${encodeURIComponent(uid)}/read`, { method: 'POST' }).catch(() => null);
}

function openMessageComposer(uid, userId, name) {
  document.querySelector('[data-indo-message-modal]')?.remove();

  const overlay = document.createElement('div');
  overlay.dataset.indoMessageModal = 'true';
  overlay.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999">
      <section style="width:min(560px,100%);max-height:80vh;background:#111118;border:1px solid rgba(255,255,255,.12);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)">
        <header style="display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08)">
          <div><b>${escapeHtml(name || 'Indo User')}</b><small style="display:block;opacity:.65">${escapeHtml(userId || '')}</small></div>
          <button type="button" data-message-close aria-label="Close">×</button>
        </header>
        <div data-message-list style="padding:16px;overflow:auto;display:flex;flex-direction:column;gap:8px;min-height:180px"></div>
        <form data-message-form style="display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08)">
          <input name="text" maxlength="1000" autocomplete="off" placeholder="Write a message..." style="flex:1;min-width:0">
          <button type="submit">Send</button>
        </form>
      </section>
    </div>`;

  document.body.appendChild(overlay);

  const list = overlay.querySelector('[data-message-list]');
  const form = overlay.querySelector('[data-message-form]');
  const close = () => overlay.remove();
  overlay.querySelector('[data-message-close]').addEventListener('click', close);
  overlay.firstElementChild.addEventListener('click', (event) => { if (event.target === overlay.firstElementChild) close(); });

  const render = (messages) => {
    if (!messages.length) {
      list.innerHTML = '<div style="opacity:.6;text-align:center;padding:24px">No messages yet. Say hi.</div>';
      return;
    }
    list.innerHTML = messages.map((message) => {
      const mine = message.senderUid === auth.currentUser?.uid;
      return `<div style="align-self:${mine ? 'flex-end' : 'flex-start'};max-width:82%;padding:9px 12px;border-radius:14px;background:${mine ? '#2b5cff' : '#20202b'};word-break:break-word">${escapeHtml(message.text)}<small style="display:block;opacity:.65;margin-top:3px;font-size:10px">${new Date(Number(message.createdAt || 0)).toLocaleString()}</small></div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  };

  loadMessages(uid).then(async (messages) => {
    render(messages);
    await markRead(uid);
  }).catch((error) => {
    list.innerHTML = `<div style="color:#ff8b8b;padding:18px">${escapeHtml(error.message || 'Could not load messages.')}</div>`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = form.elements.text;
    const text = String(input.value || '').trim();
    if (!text) return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await sendMessage(uid, text);
      input.value = '';
      render(await loadMessages(uid));
    } catch (error) {
      list.insertAdjacentHTML('beforeend', `<div style="color:#ff8b8b">${escapeHtml(error.message || 'Could not send message.')}</div>`);
    } finally {
      button.disabled = false;
      input.focus();
    }
  });
}

function addMessageButtons() {
  document.querySelectorAll('[data-search-result] [data-search-follow-uid]').forEach((followButton) => {
    if (followButton.dataset.messageReady === 'true') return;
    followButton.dataset.messageReady = 'true';
    const uid = followButton.dataset.searchFollowUid;
    if (!uid) return;
    const wrapper = document.createElement('span');
    wrapper.style.cssText = 'display:inline-flex;gap:8px;margin-left:8px;';
    const messageButton = document.createElement('button');
    messageButton.type = 'button';
    messageButton.className = 'follow-btn';
    messageButton.textContent = 'Message';
    messageButton.dataset.messageUid = uid;
    messageButton.addEventListener('click', () => {
      const result = followButton.closest('.search-user-result');
      const name = result?.querySelector('.search-user-copy small')?.textContent || 'Indo User';
      const userId = result?.querySelector('.search-user-copy b')?.textContent || '';
      openMessageComposer(uid, userId, name);
    });
    followButton.insertAdjacentElement('afterend', messageButton);
  });
}

const observer = new MutationObserver(addMessageButtons);
window.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, { childList: true, subtree: true });
  addMessageButtons();
});
