const PAGE_LINKS = {
    home: 'home.html',
    clips: 'clips.html',
    following: 'following.html',
    create: 'create.html',
    profile: 'profile.html',
    settings: 'settings.html',
    messages: 'messages.html',
    search: 'search.html'
};

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;

    const page = button.dataset.page;
    const target = PAGE_LINKS[page];

    if (!target) return;

    event.preventDefault();
    window.location.href = target;
});
