"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Share, Plus } from "lucide-react";
import { useIsIOS } from "@/hooks/use-is-ios";
import { useIsPWA } from "@/hooks/use-is-pwa";
import { getItem, setItem } from "@/lib/utils/storage";

const DISMISSED_KEY = "install-prompt-dismissed";

export function InstallPrompt() {
  const [dismissed, setDismissed] = useState(() => {
    // Initialize from storage during state creation
    if (typeof window === "undefined") return true;
    return getItem<boolean>(DISMISSED_KEY) === true;
  });
  const isIOS = useIsIOS();
  const isPWA = useIsPWA();

  // Don't show if already installed as PWA or not on iOS
  if (isPWA || !isIOS || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setItem(DISMISSED_KEY, true);
    setDismissed(true);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Install Solo Chat</CardTitle>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Install Solo Chat for the best experience with push notifications.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">1</span>
            <span>Tap the Share button</span>
            <Share className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</span>
            <span>Scroll down and tap &quot;Add to Home Screen&quot;</span>
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
