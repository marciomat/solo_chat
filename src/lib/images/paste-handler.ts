/**
 * Setup a paste event handler for image pasting
 * @param onImage - Callback when an image is pasted
 * @returns Cleanup function
 */
export function setupPasteHandler(
  onImage: (blob: Blob) => void
): () => void {
  const handler = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          onImage(blob);
        }
        return;
      }
    }
  };

  document.addEventListener("paste", handler);
  return () => document.removeEventListener("paste", handler);
}

/**
 * Get image from clipboard (for programmatic access)
 */
export async function getImageFromClipboard(): Promise<Blob | null> {
  try {
    const clipboardItems = await navigator.clipboard.read();
    
    for (const item of clipboardItems) {
      const imageType = item.types.find(type => type.startsWith("image/"));
      if (imageType) {
        return await item.getType(imageType);
      }
    }
  } catch (error) {
    // Clipboard API not supported or permission denied
    console.error("Failed to read clipboard:", error);
  }
  
  return null;
}
