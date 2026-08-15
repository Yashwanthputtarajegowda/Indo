import { renderNotifications as renderBaseNotifications } from "./notifications.js?v=230";
import { markAllNotificationsRead } from "../features/notifications/notifications.js?v=230";

export async function renderNotifications(app, mode = "all") {
  await renderBaseNotifications(app, mode);
  if (mode !== "activity") {
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.warn("Notification read-all failed:", error);
    }
    window.dispatchEvent(new CustomEvent("indo:notifications-read"));
  }
}
