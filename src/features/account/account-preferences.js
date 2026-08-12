export const DEFAULT_ACCOUNT_TYPE = 'public';

export function normalizeAccountType(value) {
  return value === 'private' ? 'private' : 'public';
}
