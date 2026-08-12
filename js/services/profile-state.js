const PROFILE_STATE_KEY = "indo-profile-state";

const defaultProfile = {
  userName: "Indo User",
  userId: "@indo_user",
  bio: ""
};

function countKeys(value) {
  return value && typeof value === "object" ? Object.keys(value).length : 0;
}

function readProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STATE_KEY);
    if (!stored) return { ...defaultProfile };
    return { ...defaultProfile, ...JSON.parse(stored) };
  } catch {
    return { ...defaultProfile };
  }
}

export function getProfile() {
  return readProfile();
}

export function updateProfile(changes) {
  const currentProfile = readProfile();
  const nextProfile = { ...currentProfile, ...changes };
  localStorage.setItem(PROFILE_STATE_KEY, JSON.stringify(nextProfile));
  window.dispatchEvent(new CustomEvent("indo:profile-updated", { detail: nextProfile }));
  return nextProfile;
}

export function profileFromBackend(profile) {
  if (!profile) return getProfile();
  return updateProfile({
    uid: profile.uid || "",
    userName: profile.name || "Indo User",
    userId: profile.username || "@indo_user",
    bio: profile.bio || "",
    indoId: profile.indoId || "",
    email: profile.email || "",
    accountType: profile.accountType || "public",
    following: countKeys(profile.following),
    followers: countKeys(profile.followers),
    createdAt: profile.createdAt || null,
    lastActiveAt: profile.lastActiveAt || null
  });
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_STATE_KEY);
  window.dispatchEvent(new CustomEvent("indo:profile-cleared"));
  return { ...defaultProfile };
}
