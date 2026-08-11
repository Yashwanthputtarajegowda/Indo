import { openProfileMenu } from "./profile-menu.js";

export function setupProfileMenuButton(container) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-profile-menu]");

    if (!button) {
      return;
    }

    openProfileMenu(container);
  });
}
