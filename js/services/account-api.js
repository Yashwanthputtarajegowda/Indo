const BACKEND_URL = globalThis.INDO_API_BASE_URL || "/api";

export async function checkUserId(userId) {
  const response = await fetch(`${BACKEND_URL}/account/check-user-id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not check User ID.");
  }

  return data;
}

export async function claimUserId({ user, userId, name, accountType = "public" }) {
  if (!user) {
    throw new Error("Authentication required.");
  }

  const idToken = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}/account/claim-user-id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({
      userId,
      name,
      accountType
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Could not create account profile.");
  }

  return data;
}
