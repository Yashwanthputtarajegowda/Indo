export function renderEditAccountPage(container, profile = {}) {
  const userName = profile.userName || "Indo User";
  const userId = String(profile.userId || "@indo_user").replace(/^@+/, "");
  const bio = profile.bio || "";

  container.innerHTML = `
    <main class="edit-account-page">
      <section class="edit-account-card">
        <header class="edit-account-header">
          <button class="edit-account-back" type="button" data-edit-account-back aria-label="Back">
            ←
          </button>
          <h1 class="edit-account-title">Edit Account</h1>
        </header>

        <form class="edit-account-form" data-edit-account-form>
          <div class="edit-account-field">
            <label for="edit-user-name">User Name</label>
            <input id="edit-user-name" name="userName" type="text" value="${userName}" required />
          </div>

          <div class="edit-account-field">
            <label for="edit-user-id">User ID</label>
            <div class="edit-account-user-id">
              <span>@</span>
              <input id="edit-user-id" name="userId" type="text" value="${userId}" pattern="[A-Za-z0-9._]+" required />
            </div>
          </div>

          <div class="edit-account-field">
            <label for="edit-bio">Bio</label>
            <textarea id="edit-bio" name="bio" maxlength="160">${bio}</textarea>
          </div>

          <div class="edit-account-status" data-edit-account-status></div>
          <div class="edit-account-error" data-edit-account-error></div>

          <button class="edit-account-save" type="submit">Save Changes</button>
        </form>
      </section>
    </main>
  `;

  const form = container.querySelector("[data-edit-account-form]");
  const status = container.querySelector("[data-edit-account-status]");
  const error = container.querySelector("[data-edit-account-error]");

  container.querySelector("[data-edit-account-back]").addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("indo:navigate", {
        detail: { page: "profile" }
      })
    );
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    error.textContent = "";

    const formData = new FormData(form);
    const nextProfile = {
      userName: String(formData.get("userName") || "").trim(),
      userId: `@${String(formData.get("userId") || "").trim().replace(/^@+/, "")}`,
      bio: String(formData.get("bio") || "").trim()
    };

    if (!nextProfile.userName || nextProfile.userId === "@") {
      error.textContent = "Enter your User Name and User ID.";
      return;
    }

    window.dispatchEvent(
      new CustomEvent("indo:account-updated", {
        detail: nextProfile
      })
    );

    status.textContent = "Account updated successfully.";
  });
}
