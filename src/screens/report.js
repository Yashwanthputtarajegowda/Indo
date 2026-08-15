import { auth } from "../features/auth/firebase-client.js";

const REASONS = [
  ["spam", "Spam or misleading"],
  ["harassment", "Harassment or bullying"],
  ["hate", "Hate or abusive content"],
  ["violence", "Violence or dangerous content"],
  ["sexual", "Sexual content"],
  ["copyright", "Copyright issue"],
  ["other", "Something else"],
];

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>\"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function context() {
  const value = window.__indoReportContext;
  return value && typeof value === "object" ? value : {};
}

function home() {
  window.__indoReportContext = null;
  window.__indoNavigate?.("home");
}

export async function renderReport(app) {
  const report = context();
  const videoId = String(report.videoId || "").trim();
  const title = String(report.title || "Video").trim();

  app.innerHTML = `
    <main class="indo-report-page">
      <section class="indo-report-card" aria-label="Report video">
        <header class="indo-report-header">
          <button
            type="button"
            class="indo-report-back"
            data-report-back
            aria-label="Back"
          >
            ←
          </button>
          <h1>Report Video</h1>
          <span></span>
        </header>

        <div class="indo-report-body">
          <p class="indo-report-kicker">Reporting: ${escapeHtml(title)}</p>
          <h2>Why are you reporting this video?</h2>
          <p class="indo-report-help">
            Your report is reviewed by Indo and helps keep the community safe.
          </p>

          <form class="indo-report-form" data-report-form>
            <div class="indo-report-reasons">
              ${REASONS.map(
                ([value, label]) => `
                  <label class="indo-report-reason">
                    <input
                      type="radio"
                      name="reason"
                      value="${value}"
                      required
                    >
                    <span>${label}</span>
                  </label>
                `,
              ).join("")}
            </div>

            <textarea
              name="details"
              maxlength="500"
              placeholder="Provide more details (optional)"
            ></textarea>

            <p class="indo-report-error" data-report-error hidden></p>

            <button
              type="submit"
              class="indo-report-submit"
              ${videoId ? "" : "disabled"}
            >
              Submit Report
            </button>

            <button
              type="button"
              class="indo-report-cancel"
              data-report-back
            >
              Cancel
            </button>
          </form>
        </div>
      </section>
    </main>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .indo-report-page {
      min-height: 100vh;
      box-sizing: border-box;
      padding: 0 0 24px;
      background: #08080d;
      color: #f4f4f7;
    }
    .indo-report-card {
      width: min(560px, 100%);
      min-height: 100vh;
      margin: 0 auto;
      background: #101017;
    }
    .indo-report-header {
      position: sticky;
      top: 0;
      z-index: 2;
      height: 58px;
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      align-items: center;
      border-bottom: 1px solid #292934;
      background: #101017;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .indo-report-header h1 {
      margin: 0;
      text-align: center;
      font-size: 17px;
      font-weight: 800;
    }
    .indo-report-back {
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      background: #1b1b25;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .indo-report-body {
      padding: 28px 18px 34px;
    }
    .indo-report-kicker {
      margin: 0 0 22px;
      color: #9696a4;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .indo-report-body h2 {
      margin: 0 0 10px;
      font-size: 25px;
      line-height: 1.2;
    }
    .indo-report-help {
      margin: 0 0 24px;
      color: #9999a6;
      font-size: 13px;
      line-height: 1.5;
    }
    .indo-report-reasons {
      display: grid;
      gap: 2px;
    }
    .indo-report-reason {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      color: #f2f2f5;
      font-size: 14px;
      cursor: pointer;
    }
    .indo-report-reason input {
      width: 20px;
      height: 20px;
      accent-color: #ff3d8d;
      flex: 0 0 auto;
    }
    .indo-report-form textarea {
      width: 100%;
      min-height: 110px;
      box-sizing: border-box;
      margin: 18px 0 12px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #292934;
      border-radius: 12px;
      outline: none;
      background: #0b0b11;
      color: #fff;
      font: 14px/1.5 system-ui, sans-serif;
    }
    .indo-report-submit {
      width: 100%;
      min-height: 48px;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(135deg, #743cff, #d23cae);
      color: #fff;
      font-weight: 800;
      cursor: pointer;
    }
    .indo-report-submit:disabled {
      opacity: .45;
      cursor: not-allowed;
    }
    .indo-report-cancel {
      width: 100%;
      min-height: 44px;
      margin-top: 8px;
      border: 0;
      background: transparent;
      color: #aaaab5;
      font-weight: 700;
      cursor: pointer;
    }
    .indo-report-error {
      margin: 0 0 10px;
      color: #ff6b8f;
      font-size: 13px;
    }
    .indo-report-success {
      display: grid;
      min-height: 100vh;
      place-items: center;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .indo-report-success-icon {
      width: 74px;
      height: 74px;
      display: grid;
      place-items: center;
      margin: 0 auto 22px;
      border: 2px solid #28d98b;
      border-radius: 50%;
      color: #28d98b;
      font-size: 38px;
    }
    .indo-report-success h2 {
      margin: 0 0 10px;
      font-size: 25px;
    }
    .indo-report-success p {
      margin: 0 auto 26px;
      max-width: 320px;
      color: #9c9ca8;
      line-height: 1.5;
    }
    .indo-report-home {
      width: min(360px, 100%);
      min-height: 48px;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(135deg, #743cff, #d23cae);
      color: #fff;
      font-weight: 800;
      cursor: pointer;
    }
  `;
  app.appendChild(style);

  app.querySelectorAll("[data-report-back]").forEach((button) => {
    button.addEventListener("click", home);
  });

  const form = app.querySelector("[data-report-form]");
  const errorNode = app.querySelector("[data-report-error]");
  const submit = app.querySelector(".indo-report-submit");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    const selected = form.querySelector(
      'input[name="reason"]:checked',
    );
    const details = String(
      form.querySelector('[name="details"]')?.value || "",
    ).trim();

    if (!user) {
      errorNode.textContent = "Please login to report this video.";
      errorNode.hidden = false;
      return;
    }

    if (!videoId || !selected) {
      errorNode.textContent = "Please select a reason.";
      errorNode.hidden = false;
      return;
    }

    submit.disabled = true;
    submit.textContent = "Submitting...";
    errorNode.hidden = true;

    try {
      const response = await fetch(
        `${window.INDO_API_BASE || ""}/api/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            videoId,
            reason: selected.value,
            details,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Could not submit the report.",
        );
      }

      app.innerHTML = `
        <main class="indo-report-success">
          <section>
            <div class="indo-report-success-icon">✓</div>
            <h2>Report submitted</h2>
            <p>
              Thank you for helping keep Indo safe.
            </p>
            <button
              type="button"
              class="indo-report-home"
              data-report-home
            >
              Back to Home
            </button>
          </section>
        </main>
      `;
      app
        .querySelector("[data-report-home]")
        ?.addEventListener("click", home);
    } catch (requestError) {
      submit.disabled = false;
      submit.textContent = "Submit Report";
      errorNode.textContent =
        requestError?.message ||
        "Could not submit the report.";
      errorNode.hidden = false;
    }
  });
}
