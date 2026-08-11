const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_UPLOAD_PRESET';

function validateCloudinaryConfig() {
    return (
        CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
        CLOUDINARY_UPLOAD_PRESET !== 'YOUR_UNSIGNED_UPLOAD_PRESET'
    );
}

async function uploadMediaToCloudinary(file) {
    if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is not set yet.');
    }

    if (!(file instanceof File)) {
        throw new Error('Please select a valid image or video.');
    }

    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Cloudinary upload failed.');
    }

    const data = await response.json();

    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType,
        width: data.width || null,
        height: data.height || null,
        duration: data.duration || null,
        format: data.format || null
    };
}
