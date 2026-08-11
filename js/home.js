import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const app = document.querySelector('#app');

function renderHome(user) {
    const name = user?.email?.split('@')[0] || 'Creator';
    const initial = (user?.email?.[0] || 'I').toUpperCase();

    app.innerHTML = `
        <section class="indo-home">
            <header class="home-header">
                <div class="home-brand">Indo</div>
                <button class="home-icon" type="button" data-page="profile" aria-label="Profile">⌕</button>
            </header>

            <main class="home-content">
                <div class="home-welcome">
                    <div>
                        <span class="home-kicker">WELCOME BACK</span>
                        <h2>${name}</h2>
                    </div>
                    <button class="avatar-btn" type="button" data-page="profile">${initial}</button>
                </div>

                <section class="featured-card">
                    <div class="featured-art"><span>INDO</span></div>
                    <div class="featured-info">
                        <span class="pill">FEATURED</span>
                        <h3>Your world. Your videos.</h3>
                        <p>Discover creators, clips and stories made for Indo.</p>
                        <button class="watch-btn" type="button">Explore Indo</button>
                    </div>
                </section>

                <div class="section-heading">
                    <h3>Fresh for you</h3>
                    <button type="button">See all</button>
                </div>

                <section class="video-grid">
                    <article class="video-card">
                        <div class="video-art art-one">01</div>
                        <strong>New stories</strong>
                        <span>Explore something new</span>
                    </article>

                    <article class="video-card">
                        <div class="video-art art-two">02</div>
                        <strong>Indo Clips</strong>
                        <span>Quick moments</span>
                    </article>

                    <article class="video-card">
                        <div class="video-art art-three">03</div>
                        <strong>Creators</strong>
                        <span>People to discover</span>
                    </article>

                    <article class="video-card">
                        <div class="video-art art-four">04</div>
                        <strong>Trending</strong>
                        <span>What people love</span>
                    </article>
                </section>
            </main>

            <nav class="bottom-nav" aria-label="Main navigation">
                <button class="nav-item active" type="button"><span>⌂</span><small>Home</small></button>
                <button class="nav-item" type="button"><span>◉</span><small>Clips</small></button>
                <button class="nav-create" type="button"><span>＋</span></button>
                <button class="nav-item" type="button"><span>♡</span><small>Following</small></button>
                <button class="nav-item" type="button" data-page="profile"><span>◎</span><small>Profile</small></button>
            </nav>
        </section>
    `;

    app.querySelector('[data-page="profile"]')?.addEventListener('click', () => {
        window.location.href = './profile.html';
    });
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    renderHome(user);
});
