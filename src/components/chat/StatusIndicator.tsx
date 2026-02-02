"use client";

import { Check, CheckCheck } from "lucide-react";

interface StatusIndicatorProps {
  status: "sent" | "delivered" | "read";
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  switch (status) {
    case "sent":
      return (
        <Check className="w-3.5 h-3.5 text-muted-foreground" />
      );
    case "delivered":
      return (
        <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
      );
    case "read":
      return (
        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
      );
    default:
      return null;
  }
}
