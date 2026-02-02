let blinkInterval: ReturnType<typeof setInterval> | null = null;
let originalTitle: string = "";
let isBlinking = false;

/**
 * Start blinking the tab title to alert user of new messages
 */
export function startTitleBlink(unreadCount: number): void {
  if (typeof window === "undefined") return;
  if (blinkInterval) return; // Already blinking
  
  originalTitle = document.title;
  isBlinking = true;
  let showNotification = true;

  blinkInterval = setInterval(() => {
    if (showNotification) {
      document.title = unreadCount > 1 
        ? `(${unreadCount}) New messages - Solo`
        : "📬 New message - Solo";
    } else {
      document.title = originalTitle;
    }
    showNotification = !showNotification;
  }, 1000);
}

/**
 * Stop blinking the tab title
 */
export function stopTitleBlink(): void {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
    isBlinking = false;
    if (originalTitle) {
      document.title = originalTitle;
    }
  }
}

/**
 * Update the unread count in the blinking title
 */
export function updateUnreadCount(count: number): void {
  if (blinkInterval && count > 0) {
    // Restart with new count
    stopTitleBlink();
    startTitleBlink(count);
  } else if (count === 0) {
    stopTitleBlink();
  }
}

/**
 * Check if title is currently blinking
 */
export function isTitleBlinking(): boolean {
  return isBlinking;
}
