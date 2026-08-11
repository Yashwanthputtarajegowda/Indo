const APP_SELECTOR = '#app';

const NAV_ITEMS = [
    {
        label: 'Home',
        icon: '⌂',
        action: () => {
            window.location.href = './index.html';
        }
    },
    {
        label: 'Messages',
        icon: '✉',
        action: () => {
            window.location.href = './pages/messages.html';
        }
    },
    {
        label: 'Reels',
        icon: '▶',
        action: () => {
            window.location.href = './pages/reels.html';
        }
    },
    {
        label: 'Profile',
        icon: '◎',
        action: () => {
            window.location.href = './pages/profile.html';
        }
    }
];

function createNavigationButton(item, currentPage) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'nav-btn';
    button.innerHTML = `
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
    `;

    if (item.label === currentPage) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
    }

    button.addEventListener('click', item.action);
    return button;
}

function getCurrentPage() {
    const path = window.location.pathname;

    if (path.endsWith('/messages.html')) return 'Messages';
    if (path.endsWith('/reels.html')) return 'Reels';
    if (path.endsWith('/profile.html')) return 'Profile';
    return 'Home';
}

function normalizeNavigation() {
    const nav = document.querySelector('.home-nav');

    if (!nav || nav.dataset.navigationReady === 'true') {
        return;
    }

    const currentPage = getCurrentPage();
    const buttons = Array.from(nav.querySelectorAll('.nav-btn'));
    const hasEmptyButton = buttons.some((button) => {
        return !button.textContent.trim();
    });

    const hasCorrectButtonCount = buttons.length === NAV_ITEMS.length;

    if (!hasEmptyButton && hasCorrectButtonCount) {
        nav.dataset.navigationReady = 'true';
        return;
    }

    nav.replaceChildren(
        ...NAV_ITEMS.map((item) => createNavigationButton(item, currentPage))
    );

    nav.dataset.navigationReady = 'true';
}

function startNavigationFix() {
    const app = document.querySelector(APP_SELECTOR);

    if (!app) return;

    const observer = new MutationObserver(() => {
        normalizeNavigation();
    });

    observer.observe(app, {
        childList: true,
        subtree: true
    });

    normalizeNavigation();
}

startNavigationFix();
