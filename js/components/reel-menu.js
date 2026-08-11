export function openReelMenu(container, userId) {
  closeReelMenu();

  const panel = document.createElement("div");

  panel.className = "reel-menu-panel";
  panel.innerHTML = `
    <button class="reel-menu-item" type="button" data-reel-menu="report">
      Report
    </button>

    <button class="reel-menu-item" type="button" data-reel-menu="not-interested">
      Not interested
    </button>

    <button class="reel-menu-item" type="button" data-reel-menu="settings">
      Reel settings
    </button>

    <button class="reel-follow-button" type="button" data-reel-follow>
      Follow ${userId}
    </button>
  `;

  container.appendChild(panel);

  panel.addEventListener("click", (event) => {
    const action = event.target.closest("[data-reel-menu]");

    if (action) {
      window.dispatchEvent(
        new CustomEvent("indo:reel-menu-action", {
          detail: {
            action: action.dataset.reelMenu
          }
        })
      );

      closeReelMenu();
      return;
    }

    const followButton = event.target.closest("[data-reel-follow]");

    if (followButton) {
      window.dispatchEvent(
        new CustomEvent("indo:follow", {
          detail: {
            userId
          }
        })
      );

      followButton.textContent = "Following";
      followButton.disabled = true;
    }
  });
}

export function closeReelMenu() {
  document.querySelector(".reel-menu-panel")?.remove();
}
