import { auth } from '../auth/firebase-client.js';

async function getUploadSignature() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  try {
    const response = await fetch(`${apiBase}/api/media/signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Video upload is temporarily unavailable.');
    return { ...data, token };
  } catch (error) {
    if (error?.message === 'Video upload is temporarily unavailable.') throw error;
    throw new Error('Video upload is temporarily unavailable.');
  }
}

async function uploadToStorage(file, config) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(config.timestamp));
  form.append('signature', config.signature);
  form.append('folder', config.folder || 'indo/videos');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/video/upload`, {
      method: 'POST',
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Video upload is temporarily unavailable.');
    return data;
  } catch {
    throw new Error('Video upload is temporarily unavailable.');
  }
}

async function saveVideo(uploaded, formValues, token) {
  const apiBase = window.INDO_API_BASE || '';
  try {
    const response = await fetch(`${apiBase}/api/media/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        mediaType: 'video',
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        title: formValues.title,
        caption: formValues.caption,
        duration: uploaded.duration,
        width: uploaded.width,
        height: uploaded.height,
        storage: 'video-storage',
        resourceType: uploaded.resource_type || 'video'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Could not finish publishing the video.');
    return data.video;
  } catch (error) {
    if (error?.message === 'Could not finish publishing the video.') throw error;
    throw new Error('Could not finish publishing the video.');
  }
}

export async function uploadVideo(file, { title = '', caption = '', onProgress = () => {} } = {}) {
  if (!(file instanceof File)) throw new Error('Select a video file.');
  if (!file.type.startsWith('video/')) throw new Error('Please select a valid video file.');

  onProgress(5, 'Preparing your upload...');
  const config = await getUploadSignature();
  onProgress(15, 'Uploading your video...');
  const uploaded = await uploadToStorage(file, config);
  onProgress(85, 'Finishing your video...');
  const video = await saveVideo(uploaded, { title, caption }, config.token);
  onProgress(100, 'Published successfully.');
  return video;
}
