import { logout } from './auth-session.js';

export async function handleLogout(messageElement) {
  try {
    if (messageElement) messageElement.textContent = 'Logging out...';
    await logout();
    if (messageElement) messageElement.textContent = 'Logged out.';
    return true;
  } catch (error) {
    if (messageElement) messageElement.textContent = error.message || 'Could not log out.';
    return false;
  }
}
