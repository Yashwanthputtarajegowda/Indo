import { auth } from '../auth/firebase-client.js';
import { loadCurrentProfile } from './current-profile.js';

export async function loadProfileMedia() {
  const user = auth.currentUser;
  if (!user) return { profile: null, videos: [] };

  const profile = await loadCurrentProfile();
  if (!profile) return { profile: null, videos: [] };

  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/videos?limit=50`);
  if (!response.ok) throw new Error('Could not load profile videos.');
  const data = await response.json();
  const videos = Array.isArray(data.videos)
    ? data.videos.filter((video) => video.ownerUid === user.uid)
    : [];

  return { profile, videos };
}
