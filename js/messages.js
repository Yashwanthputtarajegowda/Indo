const messages = [];

const messageList = document.querySelector('#message-list');
const messagesEmpty = document.querySelector('#messages-empty');

function renderMessages() {
    if (!messageList || !messagesEmpty) return;

    if (messages.length === 0) {
        messageList.innerHTML = '';
        messagesEmpty.hidden = false;
        return;
    }

    messagesEmpty.hidden = true;
    messageList.innerHTML = messages.map((message) => `
        <article class="message-row">
            <div class="message-avatar">${message.name.charAt(0).toUpperCase()}</div>
            <div class="message-copy">
                <strong>${message.name}</strong>
                <span>${message.preview}</span>
            </div>
            <time>${message.time}</time>
        </article>
    `).join('');
}

function navigate(page) {
    document.dispatchEvent(
        new CustomEvent('indo:navigate', {
            detail: { page }
        })
    );
}

document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
        navigate(button.dataset.page);
    });
});

document.querySelector('.floating-compose')?.addEventListener('click', () => {
    alert('New message will be connected to Firebase in the messaging step.');
});

renderMessages();
