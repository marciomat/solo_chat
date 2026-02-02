const STORAGE_KEY = "solo-username";

/**
 * Get the stored username
 * Returns null if no username is set
 */
export function getUsername(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set the username
 */
export function setUsername(username: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const trimmed = username.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Clear the username
 */
export function clearUsername(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get display name - username if set, otherwise a short device ID
 */
export function getDisplayName(): string {
  const username = getUsername();
  if (username) {
    return username;
  }
  // Return empty string - let the UI decide what to show for anonymous users
  return "";
}
