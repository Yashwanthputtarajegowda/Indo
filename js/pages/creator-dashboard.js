const DASHBOARD_STORAGE_KEY = "indo-creator-dashboard";

function readDashboardState() {
  const savedState = localStorage.getItem(DASHBOARD_STORAGE_KEY);

  if (!savedState) {
    return {
      earningEnabled: false
    };
  }

  try {
    return JSON.parse(savedState);
  } catch {
    return {
      earningEnabled: false
    };
  }
}

function saveDashboardState(state) {
  localStorage.setItem(
    DASHBOARD_STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function renderCreatorDashboardPage(container) {
  const state = readDashboardState();

  container.innerHTML = `
    <main class="creator-dashboard-page">
      <header class="creator-dashboard-header">
        <button
          class="creator-dashboard-back"
          type="button"
          data-creator-back
          aria-label="Back"
        >
          ←
        </button>

        <h1 class="creator-dashboard-title">
          Creator Dashboard
        </h1>
      </header>

      <section class="creator-dashboard-card">
        <h2>Overview</h2>
        <p class="creator-dashboard-value">0</p>
        <p class="creator-dashboard-muted">Total earnings</p>
      </section>

      <section class="creator-dashboard-card">
        <h2>Creator Earning</h2>
        <p class="creator-dashboard-muted">
          Enable earning features when your account is eligible.
        </p>

        <button
          class="creator-dashboard-toggle"
          type="button"
          data-creator-earning
        >
          ${state.earningEnabled ? "Earning Enabled" : "Enable Earning"}
        </button>
      </section>
    </main>
  `;

  container.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-creator-back]");

    if (backButton) {
      window.dispatchEvent(
        new CustomEvent("indo:navigate", {
          detail: {
            page: "profile"
          }
        })
      );

      return;
    }

    const earningButton = event.target.closest("[data-creator-earning]");

    if (!earningButton) {
      return;
    }

    state.earningEnabled = !state.earningEnabled;
    saveDashboardState(state);

    earningButton.textContent = state.earningEnabled
      ? "Earning Enabled"
      : "Enable Earning";
  });
}
