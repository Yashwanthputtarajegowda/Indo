const navigationButtons = document.querySelectorAll(
    '.nav-button'
);

function openPage(page) {
    if (page === 'home') {
        window.location.href = '../index.html';
        return;
    }

    if (page === 'messages') {
        window.location.href = './messages.html';
        return;
    }

    if (page === 'reels') {
        window.location.href = './reels.html';
        return;
    }

    if (page === 'profile') {
        window.location.href = './profile.html';
    }
}

navigationButtons.forEach((button) => {
    button.addEventListener('click', () => {
        openPage(button.dataset.page);
    });
});
