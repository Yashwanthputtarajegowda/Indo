const USER_ID_PATTERN = /^[A-Za-z0-9._]+$/;

export function normalizeUserId(value) {
  const cleanValue = String(value || "")
    .trim()
    .replace(/^@+/, "");

  return `@${cleanValue}`;
}

export function isValidUserId(value) {
  const normalizedId = normalizeUserId(value);
  const idWithoutAt = normalizedId.slice(1);

  return (
    normalizedId.startsWith("@") &&
    idWithoutAt.length > 0 &&
    USER_ID_PATTERN.test(idWithoutAt)
  );
}

export async function isUserIdAvailable(userId) {
  const normalizedId = normalizeUserId(userId);

  if (!isValidUserId(normalizedId)) {
    return false;
  }

  return true;
}
