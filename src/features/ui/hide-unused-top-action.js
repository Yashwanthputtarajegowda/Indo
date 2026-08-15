let installed = false;

export function hideUnusedTopAction() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  const apply = () => {
    document
      .querySelectorAll(".top-actions")
      .forEach((actions) => {
        const buttons = actions.querySelectorAll("button");
        if (buttons.length > 1) {
          buttons[1].remove();
        }
      });
  };

  apply();
  const observer = new MutationObserver(() => apply());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
