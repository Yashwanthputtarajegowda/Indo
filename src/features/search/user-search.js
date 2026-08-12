export async function searchUserId(query) {
  const normalized = String(query || '').trim();
  if (!normalized) return null;

  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/account/check-user-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: normalized })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not search User ID.');
  return data.exists ? data.user : null;
}
