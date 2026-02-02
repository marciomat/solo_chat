/**
 * Format a timestamp into a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return "Just now";
  }
  
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  if (days === 1) {
    return "Yesterday";
  }
  
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // Format as date for older messages
  return formatDate(timestamp);
}

/**
 * Format a timestamp into a short time string (e.g., "2:30 PM")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a timestamp into a date string (e.g., "Jan 15")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Same year? Show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  
  // Different year? Show full date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a timestamp for message display
 * Shows time for today, date for older
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return formatTime(timestamp);
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  
  if (isYesterday) {
    return `Yesterday ${formatTime(timestamp)}`;
  }
  
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}
