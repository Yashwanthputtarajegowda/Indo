let installed = false;

function removeUnusedTopbarButton(root = document) {
  root.querySelectorAll?.('.top-actions [data-screen="activity"]').forEach((button) => button.remove());
}

export function installTopbarCleanup() {
  if (installed) return;
  installed = true;
  const run = () => removeUnusedTopbarButton(document);
  run();
  if (typeof MutationObserver === "function") {
    const observer = new MutationObserver(() => run());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}

installTopbarCleanup();
