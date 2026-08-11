export function openProfileMenu(container) {
  closeProfileMenu();

  const panel = document.createElement("div");

  panel.className = "profile-menu-panel";
  panel.innerHTML = `
    <button class="profile-menu-item" type="button" data-profile-menu="edit-account">
      Edit Account
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="account-center">
      Account Center
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="account-type">
      Account Type
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="creator-dashboard">
      Creator Dashboard
    </button>
    <div class="profile-menu-divider"></div>
    <button class="profile-menu-item" type="button" data-profile-menu="help">
      Help
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="theme">
      Theme
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="settings">
      Settings
    </button>
    <button class="profile-menu-item" type="button" data-profile-menu="about">
      About
    </button>
    <div class="profile-menu-divider"></div>
    <div class="profile-menu-version">
      Indo v1.0.0
    </div>
    <button class="profile-menu-item" type="button" data-profile-menu="updates">
      Check for Updates
    </button>
  `;

  container.appendChild(panel);

  panel.addEventListener("click", (event) => {
    const item = event.target.closest("[data-profile-menu]");

    if (!item) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:profile-menu-action", {
        detail: {
          action: item.dataset.profileMenu
        }
      })
    );
  });
}

export function closeProfileMenu() {
  document.querySelector(".profile-menu-panel")?.remove();
}
