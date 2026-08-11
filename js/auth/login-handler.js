import { loginUser } from "../firebase/auth-service.js";

export function setupLoginHandler(container) {
  const form = container.querySelector("#login-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    try {
      await loginUser(email, password);

      form.reset();

      window.dispatchEvent(
        new CustomEvent("indo:login-success")
      );
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("indo:login-error", {
          detail: error
        })
      );
    }
  });
}
