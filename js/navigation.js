const INDO_PAGES = {
    home: 'pages/home.html',
    clips: 'pages/clips.html',
    following: 'pages/following.html',
    create: 'pages/create.html',
    profile: 'pages/profile.html',
    settings: 'pages/settings.html',
    messages: 'pages/messages.html'
};

const INDO_SCRIPTS = {
    home: 'js/home.js',
    clips: 'js/clips.js',
    following: 'js/following.js',
    create: 'js/create.js',
    profile: 'js/profile.js',
    settings: 'js/settings.js',
    messages: 'js/messages.js'
};

async function loadIndoPage(page) {
    const path = INDO_PAGES[page];
    const scriptPath = INDO_SCRIPTS[page];
    const root = document.querySelector('#indo-app');

    if (!path || !root) return;

    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${page}`);

    root.innerHTML = await response.text();

    if (scriptPath) {
        const script = document.createElement('script');
        script.src = `${scriptPath}?v=1`;
        script.defer = true;
        document.body.appendChild(script);
    }
}

document.addEventListener('indo:navigate', (event) => {
    loadIndoPage(event.detail.page).catch(console.error);
});

document.addEventListener('indo:signout', () => {
    window.dispatchEvent(new CustomEvent('indo:auth-signout'));
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;

    event.preventDefault();
    loadIndoPage(button.dataset.page).catch(console.error);
});
