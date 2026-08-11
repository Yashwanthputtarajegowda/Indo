const PROFILE_STATE_KEY = "indo-profile-state";

const defaultProfile = {
  userName: "Indo User",
  userId: "@indo_user",
  bio: ""
};

function readProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STATE_KEY);

    if (!stored) {
      return { ...defaultProfile };
    }

    return {
      ...defaultProfile,
      ...JSON.parse(stored)
    };
  } catch {
    return { ...defaultProfile };
  }
}

export function getProfile() {
  return readProfile();
}

export function updateProfile(changes) {
  const currentProfile = readProfile();
  const nextProfile = {
    ...currentProfile,
    ...changes
  };

  localStorage.setItem(PROFILE_STATE_KEY, JSON.stringify(nextProfile));

  window.dispatchEvent(
    new CustomEvent("indo:profile-updated", {
      detail: nextProfile
    })
  );

  return nextProfile;
}
