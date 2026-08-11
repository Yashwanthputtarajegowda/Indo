export function createMediaCard({
  title,
  creator,
  imageUrl,
  type = "video"
}) {
  const card = document.createElement("article");

  card.className = type === "reel"
    ? "media-card media-card--reel"
    : "media-card media-card--video";

  card.innerHTML = `
    <div class="media-card__image-wrap">
      <img
        class="media-card__image"
        src="${imageUrl}"
        alt="${title}"
        loading="lazy"
      />
      <button
        class="media-card__play"
        type="button"
        aria-label="Play ${title}"
      >▶</button>
    </div>

    <div class="media-card__details">
      <h3>${title}</h3>
      <p>${creator}</p>
    </div>
  `;

  return card;
}
