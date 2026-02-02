"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is iOS
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    // Also check for iOS 13+ iPad which reports as MacIntel
    const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    
    setIsIOS(isIOSDevice || isIPadOS);
  }, []);

  return isIOS;
}
