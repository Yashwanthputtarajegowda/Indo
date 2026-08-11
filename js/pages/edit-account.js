import { getProfile, updateProfile } from "../services/profile-state.js";
import { updateMyProfile } from "../services/profile-api.js";

export function renderEditAccountPage(container, profile = getProfile()) {
  const userName = profile.userName || "Indo User";
  const userId = String(profile.userId || "@indo_user").replace(/^@+/, "");
  const bio = profile.bio || "";

  container.innerHTML = `
    <main class="edit-account-page">
      <section class="edit-account-card">
        <header class="edit-account-header">
          <button class="edit-account-back" type="button" data-edit-account-back aria-label="Back">←</button>
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
              <input id="edit-user-id" name="userId" type="text" value="${userId}" readonly />
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
  const submit = form.querySelector("[type='submit']");

  container.querySelector("[data-edit-account-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "profile" } }));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    error.textContent = "";
    submit.disabled = true;

    const formData = new FormData(form);
    const name = String(formData.get("userName") || "").trim();
    const bioValue = String(formData.get("bio") || "").trim();

    if (!name) {
      error.textContent = "Enter your User Name.";
      submit.disabled = false;
      return;
    }

    try {
      const result = await updateMyProfile({ name, bio: bioValue });
      const savedProfile = updateProfile({
        userName: result.name || name,
        userId: result.username || profile.userId || `@${userId}`,
        bio: result.bio || ""
      });

      window.dispatchEvent(new CustomEvent("indo:account-updated", { detail: savedProfile }));
      status.textContent = "Account updated successfully.";
    } catch (accountError) {
      error.textContent = accountError.message || "Could not update account.";
    } finally {
      submit.disabled = false;
    }
  });
}
