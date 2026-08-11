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

document.querySelectorAll('[data-setting]').forEach((button) => {
    button.addEventListener('click', () => {
        const setting = button.dataset.setting;
        console.log(`Indo setting selected: ${setting}`);
    });
});
