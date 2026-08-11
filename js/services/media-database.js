import { push, ref, serverTimestamp, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import { auth, database } from "../firebase/firebase-config.js";

export async function saveMediaMetadata(media) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login before saving media.");
  }

  if (!media?.secureUrl) {
    throw new Error("Cloudinary media URL is required.");
  }

  const mediaRef = push(ref(database, "media"));

  const mediaData = {
    id: mediaRef.key,
    ownerUid: user.uid,
    type: media.type || "video",
    title: media.title || "",
    secureUrl: media.secureUrl,
    publicId: media.publicId || "",
    resourceType: media.resourceType || "video",
    thumbnailUrl: media.thumbnailUrl || "",
    createdAt: serverTimestamp()
  };

  await set(mediaRef, mediaData);

  return mediaData;
}
