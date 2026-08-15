export function validateMedia(file) {
  if (!file)
    return { valid: false, error: "Please select a file." };
  const allowed = ["image/", "video/"];
  const validType = allowed.some((type) =>
    file.type.startsWith(type),
  );
  return validType
    ? { valid: true }
    : {
        valid: false,
        error: "Only image and video files are allowed.",
      };
}
