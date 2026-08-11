const list = document.querySelector('#chatList');
const navigationButtons = document.querySelectorAll('.nav-button');

const users = [
    'User One',
    'User Two',
    'User Three'
];

function renderChats() {
    list.innerHTML = users
        .map((user) => {
            return `
                <div class="chat">
                    <b>${user}</b>
                    <br>
                    <small>Tap to open chat</small>
                </div>
            `;
        })
        .join('');
}

function openPage(page) {
    if (page === 'home') {
        window.location.href = '../index.html';
        return;
    }

    if (page === 'messages') {
        window.location.href = './messages.html';
        return;
    }

    if (page === 'reels') {
        window.location.href = './reels.html';
        return;
    }

    if (page === 'profile') {
        window.location.href = './profile.html';
    }
}

navigationButtons.forEach((button) => {
    button.addEventListener('click', () => {
        openPage(button.dataset.page);
    });
});

renderChats();
