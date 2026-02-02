"use client";

import { useState, useEffect } from "react";
import { MaybeLoaded } from "jazz-tools";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageThumbnailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: MaybeLoaded<any>;
  onClick?: (imageUrl: string) => void;
}

export function ImageThumbnail({ image, onClick }: ImageThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  // Get a URL for the image
  useEffect(() => {
    if (!image?.$isLoaded) return;
    if (!image.original?.$isLoaded) return;
    
    const getImageUrl = async () => {
      try {
        const original = image.original;
        if (original && typeof original.toBlob === 'function') {
          const blob = await original.toBlob();
          if (blob) {
            setSrc(URL.createObjectURL(blob));
          }
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    };
    getImageUrl();
  }, [image]);

  const handleClick = () => {
    if (src && onClick) {
      onClick(src);
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg cursor-pointer"
      onClick={handleClick}
    >
      {!loaded && (
        <Skeleton className="w-48 h-36" />
      )}
      {src && (
        <img
          src={src}
          alt="Shared image"
          className={`max-w-full max-h-64 rounded-lg transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
