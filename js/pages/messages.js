const list = document.querySelector('#chatList');

const users = [
    'User One',
    'User Two',
    'User Three'
];

list.innerHTML = users
    .map((user) => `
        <div class="chat">
            <b>${user}</b>
            <br>
            <small>Tap to open chat</small>
        </div>
    `)
    .join('');
