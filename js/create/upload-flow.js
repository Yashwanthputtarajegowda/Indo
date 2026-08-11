import { uploadMediaToCloudinary } from "../services/cloudinary-upload.js";
import { saveMediaRecord } from "../services/media-database.js";

export async function uploadSelectedMedia(file, type) {
  if (!file) {
    throw new Error("Please select a media file.");
  }

  const resourceType = type === "photo"
    ? "image"
    : "video";

  const uploadResult = await uploadMediaToCloudinary(
    file,
    resourceType
  );

  return saveMediaRecord({
    type,
    resourceType,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    thumbnailUrl: uploadResult.thumbnail_url || "",
    format: uploadResult.format || file.type,
    bytes: uploadResult.bytes || file.size
  });
}
