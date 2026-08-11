const input = document.querySelector('#search');
const results = document.querySelector('#results');

input.addEventListener('input', () => {
    const query = input.value.trim();

    if (query) {
        results.textContent = `Searching for ${query}…`;
        return;
    }

    results.textContent = '';
});
