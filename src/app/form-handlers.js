import { state } from "../state.js";
import { requestPayout } from "../features/earning/wallet.js";
import { updateCurrentProfile } from "../features/profile/update-profile.js";
import { submitSignup } from "../features/auth/signup-form.js";
import { submitLogin } from "../features/auth/login-form.js";

export function createFormHandlers({
  goTo,
  refreshProfile,
  refreshEarning,
}) {
  function register() {
    document.addEventListener("submit", async (event) => {
      const form = event.target;

      if (form.id === "payout-form") {
        event.preventDefault();
        const button = form.querySelector(".primary-btn");
        const message = form.querySelector(
          "[data-wallet-message]",
        );
        const amount = Number(
          form.querySelector('[name="amount"]')?.value || 0,
        );
        const method =
          form.querySelector('[name="method"]')?.value ||
          "manual";
        if (button) button.disabled = true;
        if (message)
          message.textContent =
            "Creating payout request...";

        try {
          const result = await requestPayout(
            amount,
            method,
          );
          if (message)
            message.textContent = `Payout request created for $${Number(result.payout.amount).toFixed(2)}.`;
          form.reset();
          setTimeout(() => goTo("wallet"), 500);
        } catch (error) {
          if (message)
            message.textContent =
              error.message ||
              "Could not create payout request.";
        } finally {
          if (button) button.disabled = false;
        }
        return;
      }

      if (form.id === "edit-profile-form") {
        event.preventDefault();
        const button = form.querySelector(".primary-btn");
        const message = form.querySelector(
          ".edit-profile-message",
        );
        const name =
          form.querySelector('[name="name"]')?.value || "";
        const bio =
          form.querySelector('[name="bio"]')?.value || "";
        if (button) button.disabled = true;
        if (message) message.textContent = "Saving...";

        try {
          state.profile = await updateCurrentProfile({
            name,
            bio,
          });
          state.accountType =
            state.profile?.accountType || state.accountType;
          if (message)
            message.textContent = "Profile updated.";
          setTimeout(() => goTo("profile"), 400);
        } catch (error) {
          if (message)
            message.textContent =
              error.message || "Could not update profile.";
          if (button) button.disabled = false;
        }
        return;
      }

      if (!["signup-form", "login-form"].includes(form.id))
        return;
      event.preventDefault();
      const button = form.querySelector(".auth-submit");
      const message = form.querySelector(".auth-message");
      if (button) button.disabled = true;
      if (message)
        message.textContent =
          form.id === "signup-form"
            ? "Creating account..."
            : "Logging in...";

      try {
        if (form.id === "signup-form") {
          const result = await submitSignup(form);
          state.accountType =
            result.accountType || "public";
          await refreshProfile().catch(() => {});
          await refreshEarning().catch(() => {});
          if (message)
            message.textContent = `Account created. Your User ID is ${result.username}.`;
        } else {
          const result = await submitLogin(form);
          state.accountType =
            result?.accountType || state.accountType;
          await refreshProfile().catch(() => {});
          await refreshEarning().catch(() => {});
          if (message)
            message.textContent = "Login successful.";
        }
        setTimeout(() => goTo("home"), 500);
      } catch (error) {
        if (message)
          message.textContent =
            error.message || "Something went wrong.";
        if (button) button.disabled = false;
      }
    });
  }

  return { register };
}
