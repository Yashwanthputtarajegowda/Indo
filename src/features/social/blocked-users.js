const STORAGE_KEY = 'indo_blocked_users';

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function write(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }

export function loadBlockedUsers() { return Promise.resolve({ users: read() }); }

export function toggleBlockedUser(targetUid, blocked, profile = null) {
  const users = read().filter((item) => item.uid !== targetUid);
  if (blocked) users.push({ uid: targetUid, username: profile?.username || `@${targetUid.slice(0, 8)}`, name: profile?.name || 'Indo User' });
  write(users);
  return Promise.resolve({ ok: true, blocked });
}

export function isBlocked(targetUid) { return read().some((item) => item.uid === targetUid); }
