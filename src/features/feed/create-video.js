import { auth } from '../auth/firebase-client.js';

async function getUploadSignature() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please login first.');
  const token = await user.getIdToken();
  const apiBase = window.INDO_API_BASE || '';
  const response = await fetch(`${apiBase}/api/media/signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not prepare video upload.');
  return { ...data, token };
}

async function uploadToCloudinary(file, config) {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(config.timestamp));
  form.append('signature', config.signature);
  form.append('folder', config.folder || 'indo/videos');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/video/upload`, {
    method: 'POST',
    body: form
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || 'Cloudinary upload failed.');
  return data;
}

async function saveVideo(uploaded, formValues, token) {
  const apiBase = window.INDO_API_BASE || '';
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
      storage: 'cloudinary',
      resourceType: uploaded.resource_type || 'video'
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not save the video.');
  return data.video;
}

export async function uploadVideo(file, { title = '', caption = '', onProgress = () => {} } = {}) {
  if (!(file instanceof File)) throw new Error('Select a video file.');
  if (!file.type.startsWith('video/')) throw new Error('Please select a valid video file.');

  onProgress(5, 'Preparing Cloudinary upload...');
  const config = await getUploadSignature();
  onProgress(15, 'Uploading video to Cloudinary...');
  const uploaded = await uploadToCloudinary(file, config);
  onProgress(85, 'Saving video details...');
  const video = await saveVideo(uploaded, { title, caption }, config.token);
  onProgress(100, 'Published successfully.');
  return video;
}
