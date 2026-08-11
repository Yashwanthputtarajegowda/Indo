import { uploadReel } from "../services/media-upload.js";

export function renderUploadReelPage(container) {
  container.innerHTML = `
    <main class="upload-reel-page">
      <header class="upload-reel-header">
        <button type="button" data-upload-reel-back aria-label="Back">←</button>
        <h1>Upload Reel</h1>
      </header>
      <form data-upload-reel-form>
        <label>Reel<input name="video" type="file" accept="video/*" required /></label>
        <label>Caption<input name="caption" type="text" maxlength="500" /></label>
        <button type="submit" data-upload-reel-submit>Upload Reel</button>
        <p data-upload-reel-status></p>
      </form>
    </main>
  `;

  const form = container.querySelector("[data-upload-reel-form]");
  const status = container.querySelector("[data-upload-reel-status]");
  const submit = container.querySelector("[data-upload-reel-submit]");

  container.querySelector("[data-upload-reel-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "reels" } }));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = form.elements.video.files?.[0];
    const caption = String(form.elements.caption.value || "").trim();
    if (!file) return;

    submit.disabled = true;
    status.textContent = "Uploading…";
    try {
      await uploadReel(file, { caption });
      status.textContent = "Reel uploaded successfully.";
      form.reset();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "reels" } }));
      }, 700);
    } catch (error) {
      status.textContent = error.message || "Reel upload failed.";
    } finally {
      submit.disabled = false;
    }
  });
}
