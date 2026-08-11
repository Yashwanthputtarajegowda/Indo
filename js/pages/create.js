export function renderCreatePage(container) {
  container.innerHTML = `
    <main class="create-page">
      <header class="create-header">
        <button type="button" data-route="home" aria-label="Back">‹</button>
        <h1>Create</h1>
        <span></span>
      </header>

      <section class="create-options">
        <button type="button" class="create-option" data-create-type="video">
          <span class="create-option__icon">▶</span>
          <span>
            <strong>Upload Video</strong>
            <small>Share a video with Indo</small>
          </span>
        </button>

        <button type="button" class="create-option" data-create-type="reel">
          <span class="create-option__icon">◉</span>
          <span>
            <strong>Create Reel</strong>
            <small>Share a short vertical reel</small>
          </span>
        </button>

        <button type="button" class="create-option" data-create-type="photo">
          <span class="create-option__icon">▣</span>
          <span>
            <strong>Upload Photo</strong>
            <small>Share a photo with your followers</small>
          </span>
        </button>
      </section>
    </main>
  `;
}
