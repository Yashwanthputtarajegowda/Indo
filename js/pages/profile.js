const profile = document.querySelector('#profile');
const navigationButtons = document.querySelectorAll('.nav-button');

profile.innerHTML = `
    <h2>Your Indo Profile</h2>
    <p>Profile data will load from Firebase.</p>
`;

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
