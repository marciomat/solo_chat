"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the app is running as an installed PWA
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check for iOS standalone mode
    const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    
    // Check for Android/other standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    // Check for fullscreen mode
    const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
    
    setIsPWA(isIOSStandalone || isStandalone || isFullscreen);
  }, []);

  return isPWA;
}
