import {
  auth,
  sendPasswordResetEmail,
} from "./firebase-client.js";

export async function resetPassword(email) {
  const normalized = String(email || "").trim();
  if (!normalized) throw new Error("Email ID is required.");
  await sendPasswordResetEmail(auth, normalized);
  return { ok: true };
}
