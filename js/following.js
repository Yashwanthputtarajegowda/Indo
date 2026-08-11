const emptyMessage = document.querySelector('.following-empty');

function navigate(page) {
    document.dispatchEvent(
        new CustomEvent('indo:navigate', {
            detail: { page }
        })
    );
}

document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
        navigate(button.dataset.page);
    });
});

if (emptyMessage) {
    emptyMessage.setAttribute('data-ready', 'true');
}
