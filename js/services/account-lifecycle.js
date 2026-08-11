const ACCOUNT_ACTIVITY_KEY = "indo-account-activity";
const INACTIVE_LIMIT_MS = 1000 * 60 * 60 * 24 * 30 * 6;

function readActivity() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_ACTIVITY_KEY) || "null") || {
      lastActiveAt: Date.now()
    };
  } catch {
    return {
      lastActiveAt: Date.now()
    };
  }
}

function writeActivity(activity) {
  localStorage.setItem(
    ACCOUNT_ACTIVITY_KEY,
    JSON.stringify(activity)
  );
}

export function touchAccountActivity() {
  const activity = {
    ...readActivity(),
    lastActiveAt: Date.now()
  };

  writeActivity(activity);

  return activity;
}

export function getAccountActivity() {
  return readActivity();
}

export function isAccountInactive(now = Date.now()) {
  const { lastActiveAt } = readActivity();

  return now - Number(lastActiveAt) >= INACTIVE_LIMIT_MS;
}

export function clearAccountActivity() {
  localStorage.removeItem(ACCOUNT_ACTIVITY_KEY);
}

export { INACTIVE_LIMIT_MS };
