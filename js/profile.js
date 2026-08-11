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

document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        if (action === 'edit') {
            alert('Edit Profile will be added in the next step.');
        }

        if (action === 'settings') {
            navigate('settings');
        }

        if (action === 'signout') {
            document.dispatchEvent(new CustomEvent('indo:signout'));
        }
    });
});
