import { createUserWithEmailAndPassword, auth } from "./firebase-client.js";
import { validateSignup } from "./signup-validation.js";
import { saveAccountContact } from "./save-contact.js";

export async function submitSignup(form) {
  const values = {
    username: form.querySelector("#signup-username")?.value,
    userId: form.querySelector("#signup-user-id")?.value,
    mobile: form.querySelector("#signup-mobile")?.value,
    email: form.querySelector("#signup-email")?.value,
    password: form.querySelector("#signup-password")?.value,
  };

  const validation = validateSignup(values);
  if (!validation.valid) throw new Error(validation.error);

  // Canonical source of truth is the authenticated user's UID branch.
  // Do not block signup on a separate availability probe; the backend claim
  // endpoint performs the authoritative uniqueness check against users/{uid}.
  const credential = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
  const token = await credential.user.getIdToken(true);
  const apiBase = window.INDO_API_BASE || "";

  try {
    const response = await fetch(`${apiBase}/api/account/claim-user-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: validation.userId,
        name: values.username.trim(),
        accountType: "public",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Could not create the Indo profile.");
    }

    await saveAccountContact({
      mobile: values.mobile.trim(),
      email: values.email.trim(),
    });
    return { ...data, mobile: values.mobile.trim() };
  } catch (error) {
    try {
      const cleanupToken = await credential.user.getIdToken(true);
      await fetch(`${apiBase}/api/account/delete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cleanupToken}` },
      });
    } catch {}
    await credential.user.delete().catch(() => {});
    throw error;
  }
}
