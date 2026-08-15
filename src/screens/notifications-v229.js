import { renderNotifications as renderBaseNotifications } from "./notifications.js?v=229";

export async function renderNotifications(
  app,
  mode = "all",
) {
  await renderBaseNotifications(app, mode);
  if (mode === "all") {
    window.dispatchEvent(
      new CustomEvent("indo:notifications-read"),
    );
  }
}
