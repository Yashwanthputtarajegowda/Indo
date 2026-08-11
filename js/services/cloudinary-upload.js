import { auth } from "../firebase/firebase-config.js";

const BACKEND_URL = "https://indo-backend.example.com";

export async function uploadMediaToCloudinary(file, resourceType = "auto") {
  if (!file) {
    throw new Error("No media file selected.");
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login before uploading media.");
  }

  const token = await user.getIdToken();

  const signatureResponse = await fetch(
    `${BACKEND_URL}/api/media/signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resourceType
      })
    }
  );

  if (!signatureResponse.ok) {
    throw new Error("Could not create Cloudinary upload signature.");
  }

  const signature = await signatureResponse.json();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!uploadResponse.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  return uploadResponse.json();
}
