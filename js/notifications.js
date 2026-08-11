const notificationList = document.querySelector('#notification-list');
const notificationEmpty = document.querySelector('#notification-empty');

function renderNotifications(notifications = []) {
    if (!notificationList || !notificationEmpty) return;

    notificationEmpty.hidden = notifications.length > 0;

    notificationList.innerHTML = notifications.map((item) => `
        <article class="notification-row">
            <div class="notification-avatar">${item.initial || 'I'}</div>
            <div class="notification-copy">
                <strong>${item.title}</strong>
                <span>${item.text}</span>
            </div>
            <time>${item.time || ''}</time>
        </article>
    `).join('');
}

document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('indo:navigate', {
            detail: { page: button.dataset.page }
        }));
    });
});

renderNotifications();
