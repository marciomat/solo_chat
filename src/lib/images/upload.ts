import { createImage } from "jazz-tools/media";
import { ImageDefinition, type Account, type Group, co } from "jazz-tools";

/**
 * Upload an image to Jazz
 * @param blob - The image blob to upload
 * @param owner - The owner (account or group) for the image
 * @returns The uploaded ImageDefinition
 */
export async function uploadImage(
  blob: Blob,
  owner: Account | Group
): Promise<co.loaded<typeof ImageDefinition>> {
  // Convert blob to file if needed
  const file = blob instanceof File 
    ? blob 
    : new File([blob], "image.png", { type: blob.type });

  // Create the image using Jazz's media handling
  const image = await createImage(file, { owner });
  
  return image;
}

/**
 * Get image dimensions from a blob
 */
export function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}
