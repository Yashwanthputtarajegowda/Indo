import { isUserIdAvailable } from "./user-id.js";

export async function createAccountProfile({ userName, userId }) {
  const normalizedUserId = userId.trim();

  const available = await isUserIdAvailable(normalizedUserId);

  if (!available) {
    throw new Error("Invalid User ID.");
  }

  return {
    userName: userName.trim(),
    userId: normalizedUserId,
    createdAt: Date.now(),
    lastActiveAt: Date.now()
  };
}

export function markAccountActive(profile) {
  return {
    ...profile,
    lastActiveAt: Date.now()
  };
}
