const feed = document.querySelector('#reelFeed');

if (!feed) {
    throw new Error('Reels feed element was not found.');
}

const reels = [
    {
        user: '@alex',
        initial: 'A'
    }
];

function renderReels() {
    if (reels.length === 0) {
        feed.innerHTML = `
            <div class="reel-empty">
                <p>No reels yet.</p>
            </div>
        `;

        return;
    }

    feed.innerHTML = reels
        .map((reel) => {
            return `
                <article class="reel-card">
                    <div class="reel-media">
                        <span>REEL VIDEO</span>
                    </div>

                    <div class="reel-overlay">
                        <div class="reel-user">
                            <span class="reel-avatar">
                                ${reel.initial}
                            </span>
                            <strong>
                                ${reel.user}
                            </strong>
                        </div>

                        <div class="reel-actions">
                            <button class="reel-action">
                                <span>♡</span>
                                <small>Like</small>
                            </button>

                            <button class="reel-action">
                                <span>◌</span>
                                <small>Comment</small>
                            </button>

                            <button class="reel-action">
                                <span>↗</span>
                                <small>Share</small>
                            </button>

                            <button class="reel-action">
                                <span>▱</span>
                                <small>Save</small>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        })
        .join('');
}

renderReels();
