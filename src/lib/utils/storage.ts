const STORAGE_PREFIX = "solo-";

/**
 * Get an item from localStorage with the solo prefix
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

/**
 * Set an item in localStorage with the solo prefix
 */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}

/**
 * Get all keys with the solo prefix
 */
export function getAllKeys(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ""));
    }
  }
  return keys;
}

/**
 * Clear all solo-related items from localStorage
 */
export function clearAll(): void {
  if (typeof window === "undefined") {
    return;
  }
  
  const keys = getAllKeys();
  keys.forEach((key) => removeItem(key));
}
