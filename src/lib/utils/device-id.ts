const STORAGE_KEY = "solo-device-id";

/**
 * Get or create a unique device identifier
 * Stored in localStorage and persists across sessions
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return `server-${Date.now()}`;
  }
  
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = generateDeviceId();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Generate a new unique device ID
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  const browserPart = getBrowserFingerprint();
  
  return `device-${timestamp}-${randomPart}-${browserPart}`;
}

/**
 * Get a simple browser fingerprint for uniqueness
 */
function getBrowserFingerprint(): string {
  if (typeof window === "undefined") {
    return "server";
  }
  
  const parts = [
    navigator.userAgent.length.toString(36),
    navigator.language.substring(0, 2),
    screen.width.toString(36),
    screen.height.toString(36),
  ];
  
  return parts.join("");
}

/**
 * Get the current device ID without creating a new one
 * Returns null if no device ID exists
 */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Reset the device ID (useful for testing)
 */
export function resetDeviceId(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
