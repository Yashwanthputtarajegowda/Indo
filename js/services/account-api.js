const BACKEND_URL = "http://localhost:3001";

export async function checkUserIdAvailability(userId) {
  const response = await fetch(
    `${BACKEND_URL}/api/account/check-user-id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not check User ID.");
  }

  return data.available === true;
}

export async function claimUserId({ idToken, userId, name }) {
  const response = await fetch(
    `${BACKEND_URL}/api/account/claim-user-id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        userId,
        name
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not create account profile.");
  }

  return data;
}
