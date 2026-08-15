import { state } from "../state.js";
import { loadCurrentProfile } from "../features/profile/current-profile.js";
import { loadEarningStatus, loadEarningSummary } from "../features/earning/earning.js";
import { watchAuthSession } from "../features/auth/auth-session.js";
import { goTo } from "./navigation.js";

export function createSessionController(app) {
  let splashFinished = false;
  let sessionUser = null;

  async function refreshProfile() {
    state.profile = await loadCurrentProfile();
    if (state.profile?.accountType) state.accountType = state.profile.accountType;
  }

  async function refreshEarning() {
    if (!state.authenticated) {
      state.earning = null;
      state.earningSummary = null;
      return;
    }
    const [status, summary] = await Promise.all([loadEarningStatus(), loadEarningSummary()]);
    state.earning = status;
    state.earningSummary = summary;
  }

  function markSplashFinished() {
    splashFinished = true;
  }

  function getSessionUser() {
    return sessionUser;
  }

  function getRefreshers() {
    return { refreshProfile, refreshEarning };
  }

  function start() {
    watchAuthSession(
      async (user) => {
        sessionUser = user;
        state.authenticated = true;
        await refreshProfile().catch(() => {});
        await refreshEarning().catch(() => {});
        if (splashFinished && (state.screen === "auth-login" || state.screen === "auth-signup"))
          goTo(app, "home");
      },
      () => {
        sessionUser = null;
        state.authenticated = false;
        state.profile = null;
        state.accountType = "public";
        state.earning = null;
        state.earningSummary = null;
        if (splashFinished && !String(state.screen).startsWith("auth-")) goTo(app, "auth-login");
      },
    );
  }

  return { start, markSplashFinished, getSessionUser, ...getRefreshers() };
}
