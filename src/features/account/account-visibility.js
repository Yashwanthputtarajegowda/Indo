export function normalizeAccountVisibility(value) {
  return value === "private" ? "private" : "public";
}

export function isPrivateAccount(value) {
  return normalizeAccountVisibility(value) === "private";
}
