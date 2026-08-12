import { updateCurrentProfile } from './update-profile.js';

export async function editCurrentProfile(profile) {
  const name = window.prompt('User Name:', profile?.name || '');
  if (name === null) return null;

  const bio = window.prompt('Bio:', profile?.bio || '');
  if (bio === null) return null;

  return updateCurrentProfile({ name, bio });
}
