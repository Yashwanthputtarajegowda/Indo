import { auth } from '../auth/firebase-client.js';

async function getStorySignature() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind: 'story' })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not prepare story upload.');
  return { ...data, token };
}

async function uploadToCloudinary(file, config) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(config.timestamp));
  form.append('signature', config.signature);
  form.append('folder', config.folder || 'indo/stories');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/video/upload`, { method: 'POST', body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || 'Cloudinary story upload failed.');
  return data;
}

export async function publishStory(file, onProgress = () => {}) {
  if (!(file instanceof File) || !file.type.startsWith('video/')) throw new Error('Please select a video story.');
  onProgress(10, 'Preparing story upload...');
  const config = await getStorySignature();
  onProgress(20, 'Uploading story to Cloudinary...');
  const uploaded = await uploadToCloudinary(file, config);
  onProgress(80, 'Publishing story...');
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
    body: JSON.stringify({ publicId: uploaded.public_id, secureUrl: uploaded.secure_url })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not publish story.');
  onProgress(100, 'Story published.');
  return data.story;
}
