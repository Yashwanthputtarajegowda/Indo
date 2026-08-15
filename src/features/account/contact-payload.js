export function getAccountContact(form) {
  return {
    mobile: form.querySelector("#signup-mobile")?.value.trim() || "",
    email:
      form.querySelector("#signup-email")?.value.trim().toLowerCase() || "",
  };
}
