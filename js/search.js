const searchForm = document.querySelector('#indo-search-form');
const searchInput = document.querySelector('#indo-search-input');
const searchResults = document.querySelector('#search-results');

function showSearchMessage(title, text) {
    if (!searchResults) return;

    searchResults.innerHTML = `
        <div class="search-empty">
            <div class="search-icon">⌕</div>
            <h2>${title}</h2>
            <p>${text}</p>
        </div>
    `;
}

searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = searchInput?.value.trim() || '';

    if (!query) {
        showSearchMessage('Start searching', 'Enter a creator or topic to discover on Indo.');
        return;
    }

    showSearchMessage('Search ready', `Results for “${query}” will be connected to Firebase next.`);
});

document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('indo:navigate', {
            detail: { page: button.dataset.page }
        }));
    });
});
