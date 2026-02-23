/**
 * Notification settings stored in localStorage
 */

const NOTIFICATIONS_ENABLED_KEY = "solo-notifications-enabled";

export function areNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  // If key was never set (e.g. localStorage was cleared after user already granted permission),
  // treat as enabled so the subscription is automatically restored on next app load.
  if (stored === null) {
    return "Notification" in window && Notification.permission === "granted";
  }
  return stored === "true";
}

export function setNotificationsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
}

export function toggleNotifications(): boolean {
  const current = areNotificationsEnabled();
  setNotificationsEnabled(!current);
  return !current;
}
