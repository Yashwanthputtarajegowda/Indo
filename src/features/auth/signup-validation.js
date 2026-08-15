export function normalizeUserId(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  if (!raw) return "";
  return `@${raw}`;
}

export function validateUserId(value) {
  const userId = normalizeUserId(value);
  const raw = userId.replace(/^@/, "");
  if (!raw)
    return { valid: false, error: "User ID is required." };
  if (!/^[a-z0-9._-]{1,50}$/.test(raw)) {
    return {
      valid: false,
      error:
        "User ID can use only letters, numbers, dot, underscore, and hyphen.",
    };
  }
  return { valid: true, userId };
}

export function validateSignup({
  username,
  userId,
  mobile,
  email,
  password,
}) {
  const normalized = validateUserId(userId);
  if (!String(username || "").trim())
    return {
      valid: false,
      error: "Your name is required.",
    };
  if (!normalized.valid) return normalized;
  if (!String(mobile || "").trim())
    return {
      valid: false,
      error: "Mobile number is required.",
    };
  if (!String(email || "").trim())
    return { valid: false, error: "Email ID is required." };
  if (String(password || "").length < 8)
    return {
      valid: false,
      error: "Password must be at least 8 characters.",
    };
  return { valid: true, userId: normalized.userId };
}
