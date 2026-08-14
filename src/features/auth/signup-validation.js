export function normalizeUserId(value) {
  // User IDs are chosen by the user. Keep the value readable and preserve
  // whatever spelling/case the user entered; only trim outer whitespace and
  // add the conventional @ prefix for display/storage compatibility.
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.startsWith('@') ? raw : `@${raw}`;
}

export function validateUserId(value) {
  const userId = normalizeUserId(value);
  if (!userId) return { valid: false, error: 'User ID is required.' };
  return { valid: true, userId };
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
