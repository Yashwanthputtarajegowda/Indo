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

function createNavigationButton(item) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'nav-btn';
    button.innerHTML = `
        <span class="nav-icon">
            ${item.icon}
        </span>
        <span>
            ${item.label}
        </span>
    `;

    button.addEventListener('click', item.action);

    return button;
}

function getCurrentPage() {
    const path = window.location.pathname;

    if (path.endsWith('/messages.html')) {
        return 'Messages';
    }

    if (path.endsWith('/reels.html')) {
        return 'Reels';
    }

    if (path.endsWith('/profile.html')) {
        return 'Profile';
    }

    return 'Home';
}

function normalizeNavigation() {
    const nav = document.querySelector('.home-nav');

    if (!nav) {
        return;
    }

    const currentPage = getCurrentPage();

    nav.innerHTML = '';

    NAV_ITEMS.forEach((item) => {
        const button = createNavigationButton(item);

        if (item.label === currentPage) {
            button.classList.add('active');
            button.setAttribute('aria-current', 'page');
        }

        nav.appendChild(button);
    });
}

function startNavigationFix() {
    const app = document.querySelector(APP_SELECTOR);

    if (!app) {
        return;
    }

    const observer = new MutationObserver(() => {
        observer.disconnect();
        normalizeNavigation();
        observer.observe(app, {
            childList: true,
            subtree: true
        });
    });

    observer.observe(app, {
        childList: true,
        subtree: true
    });

    normalizeNavigation();
}

startNavigationFix();
