const app = document.querySelector('#app');

const users = [
    ['A', '@alex', 'Alex'],
    ['R', '@ravi', 'Ravi'],
    ['S', '@sneha', 'Sneha'],
    ['M', '@manu_07', 'Manu'],
    ['P', '@pavi_25', 'Pavithra'],
    ['N', '@nithin_9', 'Nithin']
];

function nav() {
    return `
        <nav class="bottom-nav home-nav">
            <button
                class="nav-btn"
                data-go="home"
                type="button"
            >
                ⌂
                <span>Home</span>
            </button>

            <button
                class="nav-btn"
                data-go="messages"
                type="button"
            >
                ✉
                <span>Messages</span>
            </button>

            <button
                class="nav-btn"
                data-go="reels"
                type="button"
            >
                ▶
                <span>Reels</span>
            </button>

            <button
                class="nav-btn"
                data-go="profile"
                type="button"
            >
                ◎
                <span>Profile</span>
            </button>
        </nav>
    `;
}

function search() {
    app.innerHTML = `
        <main class="search-page">
            <header class="topbar home-topbar">
                <div class="indo-logo">
                    Indo
                </div>

                <button
                    class="icon-btn"
                    data-go="home"
                    type="button"
                >
                    ×
                </button>
            </header>

            <div class="search-box">
                <span>⌕</span>
                <input
                    id="globalSearch"
                    autofocus
                    placeholder="Search people"
                >
            </div>

            <section class="search-section">
                <h3>Suggested for you</h3>
                <div id="results">
                    ${users.map((user) => userTemplate(user)).join('')}
                </div>
            </section>

            ${nav()}
        </main>
    `;

    document
        .querySelector('#globalSearch')
        .addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase();

            document.querySelector('#results').innerHTML = users
                .filter((user) => {
                    return user
                        .join(' ')
                        .toLowerCase()
                        .includes(query);
                })
                .map((user) => userTemplate(user))
                .join('') || '<p class="muted">No users found</p>';
        });
}

function userTemplate(user) {
    return `
        <div class="search-user">
            <span class="mini-avatar">
                ${user[0]}
            </span>

            <div>
                <strong>${user[1]}</strong>
                <small>${user[2]}</small>
            </div>

            <button
                class="follow"
                type="button"
            >
                Follow
            </button>
        </div>
    `;
}

function profile() {
    app.innerHTML = `
        <main class="profile-page">
            <header class="topbar home-topbar">
                <div class="indo-logo">
                    Indo
                </div>

                <button
                    class="icon-btn"
                    data-go="home"
                    type="button"
                >
                    ←
                </button>
            </header>

            <section class="profile-view">
                <div class="profile-avatar">
                    U
                </div>

                <h2>Your Indo Profile</h2>
                <p class="muted">@your_id</p>

                <div class="profile-stats">
                    <div>
                        <strong>12</strong>
                        <span>Posts</span>
                    </div>

                    <div>
                        <strong>248</strong>
                        <span>Followers</span>
                    </div>

                    <div>
                        <strong>180</strong>
                        <span>Following</span>
                    </div>
                </div>

                <button
                    class="primary"
                    type="button"
                >
                    Edit Profile
                </button>
            </section>

            ${nav()}
        </main>
    `;
}

function openMessages() {
    location.href = './pages/messages.html';
}

function openReels() {
    location.href = './reels.html';
}

function openProfile() {
    location.href = './pages/profile.html';
}

function openHome() {
    location.href = './';
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-btn, .nav-button');

    if (!button) {
        return;
    }

    const destination = button.dataset.go ||
        button.dataset.page;

    if (destination === 'home') {
        openHome();
        return;
    }

    if (destination === 'messages') {
        openMessages();
        return;
    }

    if (destination === 'reels') {
        openReels();
        return;
    }

    if (destination === 'profile') {
        openProfile();
    }
});

document.addEventListener('click', (event) => {
    const searchButton = event.target.closest(
        '[aria-label="Search"]'
    );

    if (!searchButton) {
        return;
    }

    event.preventDefault();
    search();
});
