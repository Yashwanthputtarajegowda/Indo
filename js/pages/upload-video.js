import { uploadVideo } from "../services/media-upload.js";

export function renderUploadVideoPage(container) {
  container.innerHTML = `
    <main class="upload-video-page">
      <header class="upload-video-header">
        <button type="button" data-upload-back aria-label="Back">←</button>
        <h1>Upload Video</h1>
      </header>
      <form data-upload-form>
        <label>Video<input name="video" type="file" accept="video/*" required /></label>
        <label>Title<input name="title" type="text" maxlength="120" required /></label>
        <button type="submit" data-upload-submit>Upload</button>
        <p data-upload-status></p>
      </form>
    </main>
  `;
  const form = container.querySelector("[data-upload-form]");
  const status = container.querySelector("[data-upload-status]");
  const submit = container.querySelector("[data-upload-submit]");
  container.querySelector("[data-upload-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "home" } }));
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = form.elements.video.files?.[0];
    const title = String(form.elements.title.value || "").trim();
    if (!file || !title) return;
    submit.disabled = true;
    status.textContent = "Uploading…";
    try {
      await uploadVideo(file, title);
      status.textContent = "Video uploaded successfully.";
      form.reset();
    } catch (error) {
      status.textContent = error.message || "Upload failed.";
    } finally {
      submit.disabled = false;
    }
  });
}
