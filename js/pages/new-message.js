const demoUsers = [
  { userId: "@indo_creator", name: "Indo Creator" },
  { userId: "@demo_user", name: "Demo User" }
];

const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

export function renderNewMessagePage(container) {
  container.innerHTML = `
    <main class="new-message-page">
      <header class="new-message-header">
        <button class="new-message-back" type="button" data-new-message-back aria-label="Back">←</button>
        <h1 class="new-message-title">New Message</h1>
      </header>

      <form class="new-message-search-form" data-new-message-form>
        <label for="new-message-user-id">User ID</label>
        <div class="new-message-search-row">
          <span>@</span>
          <input
            id="new-message-user-id"
            name="userId"
            type="text"
            maxlength="50"
            autocomplete="off"
            placeholder="Enter User ID"
            required
          />
          <button type="submit">Search</button>
        </div>
      </form>

      <p class="new-message-status" data-new-message-status></p>
      <section class="new-message-results" data-new-message-results aria-label="Users"></section>
    </main>
  `;

  const form = container.querySelector("[data-new-message-form]");
  const input = form.querySelector("[name='userId']");
  const status = container.querySelector("[data-new-message-status]");
  const results = container.querySelector("[data-new-message-results]");

  container.querySelector("[data-new-message-back]").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("indo:navigate", { detail: { page: "message" } }));
  });

  const renderResult = (user) => {
    results.innerHTML = `
      <button class="new-message-user-card" type="button" data-new-message-user-id="${user.userId}">
        <span class="new-message-avatar" aria-hidden="true">${user.userId.slice(1, 2).toUpperCase()}</span>
        <span>
          <strong>${user.name}</strong>
          <small>${user.userId}</small>
        </span>
      </button>
    `;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    results.innerHTML = "";

    const normalized = String(input.value || "").trim().replace(/^@+/, "").toLowerCase();

    if (!normalized) {
      status.textContent = "Enter a User ID.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/account/check-user-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: normalized })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.exists && data.user) {
        renderResult(data.user);
        return;
      }
    } catch {
      // Fall back to demo users for the UI foundation.
    }

    const fallback = demoUsers.find((user) => user.userId.slice(1) === normalized);

    if (fallback) {
      renderResult(fallback);
    } else {
      status.textContent = `@${normalized} was not found.`;
    }
  });

  results.addEventListener("click", (event) => {
    const userButton = event.target.closest("[data-new-message-user-id]");

    if (!userButton) return;

    window.dispatchEvent(new CustomEvent("indo:message-open", {
      detail: { userId: userButton.dataset.newMessageUserId }
    }));
  });
}
