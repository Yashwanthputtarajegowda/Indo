const feed = document.querySelector('#reelFeed');

if (!feed) {
    throw new Error('Reels feed element was not found.');
}

const reels = [
    {
        user: '@alex',
        initial: 'A',
        song: 'Original audio'
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
                        <div class="reel-info">
                            <div class="reel-user">
                                <span class="reel-avatar">
                                    ${reel.initial}
                                </span>

                                <strong>
                                    ${reel.user}
                                </strong>
                            </div>

                            <div class="reel-song">
                                <span class="song-disc">
                                    ♪
                                </span>

                                <span>
                                    ${reel.song}
                                </span>
                            </div>
                        </div>

                        <div class="reel-actions">
                            <button
                                class="reel-action"
                                type="button"
                                data-action="like"
                                aria-label="Like reel"
                            >
                                <span>♡</span>
                                <small>Like</small>
                            </button>

                            <button
                                class="reel-action"
                                type="button"
                                data-action="comment"
                                aria-label="Comment on reel"
                            >
                                <span>◌</span>
                                <small>Comment</small>
                            </button>

                            <button
                                class="reel-action"
                                type="button"
                                data-action="share"
                                aria-label="Share reel"
                            >
                                <span>↗</span>
                                <small>Share</small>
                            </button>

                            <button
                                class="reel-action"
                                type="button"
                                data-action="save"
                                aria-label="Save reel"
                            >
                                <span>▱</span>
                                <small>Save</small>
                            </button>

                            <button
                                class="reel-action"
                                type="button"
                                data-action="menu"
                                aria-label="More options"
                            >
                                <span>•••</span>
                                <small>More</small>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        })
        .join('');

    bindReelActions();
}

function bindReelActions() {
    const buttons = document.querySelectorAll('.reel-action');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;

            if (action === 'like') {
                button.classList.toggle('active');
                return;
            }

            if (action === 'save') {
                button.classList.toggle('active');
                return;
            }

            if (action === 'comment') {
                alert('Comments will open here.');
                return;
            }

            if (action === 'share') {
                alert('Share options will open here.');
                return;
            }

            if (action === 'menu') {
                alert('More options will open here.');
            }
        });
    });
}

renderReels();
