export function setupCreateFilePicker(container) {
  const options = container.querySelectorAll("[data-create-type]");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const type = option.dataset.createType;
      const input = document.createElement("input");

      input.type = "file";
      input.accept = type === "photo"
        ? "image/*"
        : "video/*";

      input.addEventListener("change", () => {
        const file = input.files?.[0];

        if (!file) {
          return;
        }

        window.dispatchEvent(
          new CustomEvent("indo:media-selected", {
            detail: {
              file,
              type
            }
          })
        );
      });

      input.click();
    });
  });
}
