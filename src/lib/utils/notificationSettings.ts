/**
 * Notification settings stored in localStorage
 */

const NOTIFICATIONS_ENABLED_KEY = "solo-notifications-enabled";

export function areNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  // Default to false - user must explicitly enable notifications
  if (stored === null) {
    return false;
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
