import { auth } from "./firebase-auth.js";
import { clearProfile } from "./profile-state.js";
import { clearAccountActivity } from "./account-lifecycle.js";

export async function deleteAccount() {
  clearProfile();
  clearAccountActivity();

  if (auth.currentUser) {
    await auth.currentUser.delete();
  }

  window.dispatchEvent(
    new CustomEvent("indo:account-deleted")
  );
}
