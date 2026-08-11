const THEME_KEY = "indo-theme";

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || "system";
}

export function applyTheme(theme) {
  const validThemes = ["white", "dark", "system"];
  const nextTheme = validThemes.includes(theme) ? theme : "system";

  localStorage.setItem(THEME_KEY, nextTheme);
  document.documentElement.dataset.theme = nextTheme;

  window.dispatchEvent(
    new CustomEvent("indo:theme-changed", {
      detail: {
        theme: nextTheme
      }
    })
  );

  return nextTheme;
}

export function initializeTheme() {
  return applyTheme(getStoredTheme());
}
