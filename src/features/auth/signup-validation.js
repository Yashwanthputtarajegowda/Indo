export function normalizeUserId(value) {
  return String(value || '').trim().toLowerCase().replace(/^@/, '');
}

export function validateUserId(value) {
  const userId = normalizeUserId(value);
  if (!userId) return { valid: false, error: 'User ID is required.' };
  if (!/^[a-z0-9._-]{1,50}$/.test(userId)) {
    return { valid: false, error: 'Use only letters, numbers, dots, underscores, and hyphens.' };
  }
  return { valid: true, userId: `@${userId}` };
}

export function validateSignup({ username, userId, mobile, email, password }) {
  const normalized = validateUserId(userId);
  if (!String(username || '').trim()) return { valid: false, error: 'Username is required.' };
  if (!normalized.valid) return normalized;
  if (!String(mobile || '').trim()) return { valid: false, error: 'Mobile number is required.' };
  if (!String(email || '').trim()) return { valid: false, error: 'Email ID is required.' };
  if (String(password || '').length < 8) return { valid: false, error: 'Password must be at least 8 characters.' };
  return { valid: true, userId: normalized.userId };
}
