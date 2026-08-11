import { auth } from './firebase.js';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const app = document.querySelector('#app');
const loginForm = document.querySelector('#login-form');
const createAccount = document.querySelector('#create-account');
const authMessage = document.querySelector('#auth-message');

function showMessage(message, isError = false) {
    if (!authMessage) return;

    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
}

function getCredentials() {
    return {
        email: document.querySelector('#email')?.value.trim() || '',
        password: document.querySelector('#password')?.value || ''
    };
}

function validateCredentials(email, password) {
    if (!email) return 'Enter your email address.';
    if (!password) return 'Enter your password.';
    if (password.length < 6) {
        return 'Password must be at least 6 characters.';
    }

    return '';
}

function firebaseError(error) {
    switch (error?.code) {
        case 'auth/email-already-in-use':
            return 'This email already has an Indo account. Please sign in.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
        case 'auth/operation-not-allowed':
            return 'Email sign-up is disabled in Firebase.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection.';
        case 'auth/invalid-credential':
            return 'Email or password is incorrect.';
        default:
            console.error('Indo auth error:', error);
            return 'Unable to continue. Please try again.';
    }
}

function renderHome(user, active = 'home') {
    if (!app) return;

    const name = user?.email?.split('@')[0] || 'Creator';
    const initial = (user?.email?.[0] || 'I').toUpperCase();

    const pages = {
        home: `
            <div class="home-welcome">
                <div>
                    <span class="home-kicker">WELCOME BACK</span>
                    <h2>${name}</h2>
                </div>

                <button
                    class="avatar-btn"
                    type="button"
                    data-page="profile"
                >
                    ${initial}
                </button>
            </div>

            <section class="featured-card">
                <div class="featured-art">
                    <span>INDO</span>
                </div>

                <div class="featured-info">
                    <span class="pill">FEATURED</span>
                    <h3>Your world. Your videos.</h3>
                    <p>Discover creators, clips and stories made for Indo.</p>

                    <button
                        class="watch-btn"
                        type="button"
                        data-page="clips"
                    >
                        Explore Indo
                    </button>
                </div>
            </section>

            <div class="section-heading">
                <h3>Fresh for you</h3>
                <button type="button" data-page="clips">See all</button>
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
        `,

        clips: `
            <div class="page-title">
                <span>INDO</span>
                <h2>Clips</h2>
                <p>Short moments made for Indo.</p>
            </div>

            <section class="clips-grid">
                <article>
                    <div class="clip-art art-one">PLAY</div>
                    <strong>Daily moments</strong>
                    <small>Fresh clips</small>
                </article>

                <article>
                    <div class="clip-art art-two">PLAY</div>
                    <strong>Creator picks</strong>
                    <small>Discover people</small>
                </article>

                <article>
                    <div class="clip-art art-three">PLAY</div>
                    <strong>Trending now</strong>
                    <small>Popular on Indo</small>
                </article>

                <article>
                    <div class="clip-art art-four">PLAY</div>
                    <strong>New vibes</strong>
                    <small>Something different</small>
                </article>
            </section>
        `,

        following: `
            <div class="page-title">
                <span>YOUR FEED</span>
                <h2>Following</h2>
                <p>Creators you choose to follow will appear here.</p>
            </div>

            <div class="empty-state">
                <div>♡</div>
                <h3>Your following feed is empty</h3>
                <p>Discover creators in Clips and follow the ones you like.</p>

                <button
                    class="watch-btn"
                    type="button"
                    data-page="clips"
                >
                    Discover creators
                </button>
            </div>
        `,

        profile: `
            <div class="profile-card">
                <button class="profile-avatar" type="button">
                    ${initial}
                </button>

                <span class="home-kicker">INDO CREATOR</span>
                <h2>${name}</h2>
                <p>${user?.email || ''}</p>

                <div class="profile-stats">
                    <div>
                        <strong>0</strong>
                        <span>Videos</span>
                    </div>
                    <div>
                        <strong>0</strong>
                        <span>Followers</span>
                    </div>
                    <div>
                        <strong>0</strong>
                        <span>Following</span>
                    </div>
                </div>

                <button
                    class="secondary-btn"
                    id="sign-out"
                    type="button"
                >
                    Sign Out
                </button>
            </div>
        `
    };

    app.innerHTML = `
        <section class="indo-home">
            <header class="home-header">
                <div class="home-brand">Indo</div>

                <button
                    class="home-icon"
                    type="button"
                    data-page="profile"
                    aria-label="Profile"
                >
                    ⌕
                </button>
            </header>

            <main class="home-content">
                ${pages[active] || pages.home}
            </main>

            <nav class="bottom-nav" aria-label="Main navigation">
                <button
                    class="nav-item ${active === 'home' ? 'active' : ''}"
                    type="button"
                    data-page="home"
                >
                    <span>⌂</span>
                    <small>Home</small>
                </button>

                <button
                    class="nav-item ${active === 'clips' ? 'active' : ''}"
                    type="button"
                    data-page="clips"
                >
                    <span>◉</span>
                    <small>Clips</small>
                </button>

                <button
                    class="nav-create"
                    type="button"
                    data-page="create"
                    aria-label="Create"
                >
                    <span>＋</span>
                </button>

                <button
                    class="nav-item ${active === 'following' ? 'active' : ''}"
                    type="button"
                    data-page="following"
                >
                    <span>♡</span>
                    <small>Following</small>
                </button>

                <button
                    class="nav-item ${active === 'profile' ? 'active' : ''}"
                    type="button"
                    data-page="profile"
                >
                    <span>◎</span>
                    <small>Profile</small>
                </button>
            </nav>
        </section>
    `;

    app.querySelectorAll('[data-page]').forEach((button) => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;

            if (page === 'create') {
                showCreate();
                return;
            }

            renderHome(user, page);
        });
    });

    app.querySelector('#sign-out')?.addEventListener('click', () => {
        signOut(auth);
    });
}

function showCreate() {
    const modal = document.createElement('div');

    modal.className = 'create-modal';

    modal.innerHTML = `
        <div class="create-sheet">
            <button
                class="close-create"
                type="button"
                aria-label="Close"
            >
                ×
            </button>

            <span class="home-kicker">CREATE ON INDO</span>
            <h2>Share something</h2>
            <p>Video upload will be connected in the next step.</p>

            <button class="primary-btn" type="button">
                Choose video
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal
        .querySelector('.close-create')
        ?.addEventListener('click', () => modal.remove());
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        renderHome(user);
    }
});

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { email, password } = getCredentials();
    const validationError = validateCredentials(email, password);

    if (validationError) {
        showMessage(validationError, true);
        return;
    }

    const button = loginForm.querySelector('.primary-btn');

    if (button) {
        button.disabled = true;
    }

    showMessage('Signing in...');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showMessage(firebaseError(error), true);

        if (button) {
            button.disabled = false;
        }
    }
});

createAccount?.addEventListener('click', async () => {
    const { email, password } = getCredentials();
    const validationError = validateCredentials(email, password);

    if (validationError) {
        showMessage(validationError, true);
        return;
    }

    createAccount.disabled = true;
    showMessage('Creating your Indo account...');

    try {
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
    } catch (error) {
        showMessage(firebaseError(error), true);
        createAccount.disabled = false;
    }
});
