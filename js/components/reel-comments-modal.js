import { getComments, addComment } from "../services/reel-comments-api.js";

export async function openReelCommentsModal(reelId) {
  const existing = document.querySelector("[data-reel-comments-modal]");
  existing?.remove();

  const modal = document.createElement("div");
  modal.setAttribute("data-reel-comments-modal", "true");
  modal.innerHTML = `
    <div class="reel-comments-backdrop" data-comments-close></div>
    <section class="reel-comments-sheet" role="dialog" aria-modal="true" aria-label="Comments">
      <header><strong>Comments</strong><button type="button" data-comments-close aria-label="Close">×</button></header>
      <div class="reel-comments-list" data-comments-list><p>Loading…</p></div>
      <form class="reel-comments-form" data-comments-form>
        <input name="text" maxlength="500" placeholder="Add a comment…" autocomplete="off" required />
        <button type="submit">Post</button>
      </form>
    </section>
  `;
  document.body.appendChild(modal);

  const list = modal.querySelector("[data-comments-list]");
  const form = modal.querySelector("[data-comments-form]");
  const input = form.querySelector("[name=text]");

  modal.querySelectorAll("[data-comments-close]").forEach((button) => {
    button.addEventListener("click", () => modal.remove());
  });

  const renderComments = (comments) => {
    list.innerHTML = comments.length
      ? comments.map((comment) => `
          <article class="reel-comment">
            <strong>${comment.userId || comment.name || "Indo User"}</strong>
            <p>${String(comment.text || "")}</p>
          </article>
        `).join("")
      : "<p>No comments yet.</p>";
  };

  try {
    renderComments(await getComments(reelId));
  } catch (error) {
    list.innerHTML = `<p>${error.message || "Could not load comments."}</p>`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await addComment(reelId, text);
      input.value = "";
      renderComments(await getComments(reelId));
    } catch (error) {
      button.title = error.message || "Could not add comment.";
    } finally {
      button.disabled = false;
    }
  });

  input.focus();
}
