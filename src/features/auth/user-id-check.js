import { normalizeUserId } from "./signup-validation.js";

const API_BASE = window.INDO_API_BASE || "";

export async function checkUserIdAvailability(value) {
  const userId = normalizeUserId(value);
  if (!userId)
    return {
      available: false,
      error: "User ID is required.",
    };
  const response = await fetch(
    `${API_BASE}/api/account/check-user-id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || "Could not check User ID.",
    );
  return data;
}
