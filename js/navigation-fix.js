const NAV_ITEMS = [
    ['Home', '⌂', './index.html'],
    ['Messages', '✉', './pages/messages.html'],
    ['Reels', '▶', './pages/reels.html'],
    ['Profile', '◎', './pages/profile.html']
];

function normalizeNavigation() {
    const nav = document.querySelector('.home-nav');
    if (!nav || nav.dataset.fixed === 'true') return;

    const buttons = nav.querySelectorAll('.nav-btn, .nav-button');
    if (buttons.length === NAV_ITEMS.length &&
        [...buttons].every((button, i) => button.textContent.includes(NAV_ITEMS[i][0]))) {
        nav.dataset.fixed = 'true';
        return;
    }

    nav.dataset.fixed = 'true';
    nav.replaceChildren(...NAV_ITEMS.map(([label, icon, url]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-btn';
        button.innerHTML = `<span class="nav-icon">${icon}</span><span>${label}</span>`;
        button.onclick = () => { window.location.href = url; };
        return button;
    }));
}

const app = document.querySelector('#app');
if (app) {
    new MutationObserver(normalizeNavigation).observe(app, { childList: true, subtree: true });
    normalizeNavigation();
}
