const clips = [
    {
        title: 'Daily moments',
        subtitle: 'Fresh clips',
        label: '01'
    },
    {
        title: 'Creator picks',
        subtitle: 'Discover people',
        label: '02'
    },
    {
        title: 'Trending now',
        subtitle: 'Popular on Indo',
        label: '03'
    },
    {
        title: 'New vibes',
        subtitle: 'Something different',
        label: '04'
    }
];

const clipsList = document.querySelector('#clips-list');

function renderClips() {
    if (!clipsList) return;

    clipsList.innerHTML = clips.map((clip) => `
        <article class="clip-card">
            <div class="clip-art">${clip.label}</div>
            <div class="clip-info">
                <strong>${clip.title}</strong>
                <span>${clip.subtitle}</span>
            </div>
            <button class="clip-play" type="button" aria-label="Play ${clip.title}">
                ▶
            </button>
        </article>
    `).join('');
}

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

renderClips();
