const NAV_ITEMS = [
    ['Home', '⌂', './index.html'],
    ['Messages', '✉', './pages/messages.html'],
    ['Reels', '▶', './reels.html'],
    ['Profile', '◎', './pages/profile.html']
];

function buildNavigation() {
    const nav = document.querySelector('.home-nav');
    if (!nav) return;

    nav.className = 'bottom-nav home-nav';
    nav.innerHTML = '';

    NAV_ITEMS.forEach(([label, icon, url]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-btn';
        button.dataset.go = label.toLowerCase();
        button.innerHTML = `<span class="nav-icon">${icon}</span><span>${label}</span>`;
        button.addEventListener('click', () => {
            window.location.href = url;
        });
        nav.appendChild(button);
    });
}

const app = document.querySelector('#app');
if (app) {
    const observer = new MutationObserver(() => {
        const nav = document.querySelector('.home-nav');
        if (nav && nav.dataset.navigationReady !== 'true') {
            nav.dataset.navigationReady = 'true';
            buildNavigation();
        }
    });

    observer.observe(app, { childList: true, subtree: true });
    buildNavigation();
}
