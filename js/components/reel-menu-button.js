import { openReelMenu } from "./reel-menu.js";

export function setupReelMenuButton(container) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reel-menu-button]");

    if (!button) {
      return;
    }

    const reel = button.closest("[data-reel-user-id]");
    const userId = reel?.dataset.reelUserId || "@user";

    openReelMenu(container, userId);
  });
}
