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
            <button class="nav-btn" data-go="home">
                ⌂
                <span>Home</span>
            </button>
            <button class="nav-btn" data-go="messages">
                ✉
                <span>Messages</span>
            </button>
            <button class="nav-btn" data-go="reels">
                ▶
                <span>Reels</span>
            </button>
            <button class="nav-btn" data-go="videos">
                ▣
                <span>Videos</span>
            </button>
            <button class="nav-btn" data-go="profile">
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
                <div class="indo-logo">Indo</div>
                <button class="icon-btn" data-go="home">×</button>
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
            <span class="mini-avatar">${user[0]}</span>
            <div>
                <strong>${user[1]}</strong>
                <small>${user[2]}</small>
            </div>
            <button class="follow">Follow</button>
        </div>
    `;
}

function profile() {
    app.innerHTML = `
        <main class="profile-page">
            <header class="topbar home-topbar">
                <div class="indo-logo">Indo</div>
                <button class="icon-btn" data-go="home">←</button>
            </header>

            <section class="profile-view">
                <div class="profile-avatar">U</div>
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

                <button class="primary">Edit Profile</button>
            </section>

            ${nav()}
        </main>
    `;
}

function videos() {
    app.innerHTML = `
        <main class="home-page">
            <header class="home-topbar">
                <div class="indo-logo">Indo</div>
                <h3>Videos</h3>
                <button class="icon-btn" data-go="search">⌕</button>
            </header>

            <section class="home-content">
                <div class="feed-list">
                    <article class="social-card">
                        <div
                            class="media-placeholder"
                            style="aspect-ratio: 16 / 9"
                        >
                            VIDEO
                        </div>
                        <div style="padding: 12px; font-weight: 700">
                            Your video feed
                        </div>
                    </article>
                </div>
            </section>

            ${nav()}
        </main>
    `;
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-go]');

    if (!button) {
        return;
    }

    const destination = button.dataset.go;

    if (destination === 'home') {
        location.href = './';
    }

    if (destination === 'reels') {
        location.href = './reels.html';
    }

    if (destination === 'search') {
        search();
    }

    if (destination === 'profile') {
        profile();
    }

    if (destination === 'videos') {
        videos();
    }
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[aria-label="Search"]');

    if (button) {
        event.preventDefault();
        search();
    }
});
