"use client";

import { useMemo } from "react";
import { validateSeedWithMessage, getSeedWordCount } from "@/lib/seed/validate";
import { Check, X } from "lucide-react";

interface SeedValidatorProps {
  seed: string;
  showValid?: boolean;
}

export function SeedValidator({ seed, showValid = false }: SeedValidatorProps) {
  const validation = useMemo(() => validateSeedWithMessage(seed), [seed]);
  const wordCount = useMemo(() => getSeedWordCount(seed), [seed]);

  if (validation.isValid && showValid) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-500">
        <Check className="w-4 h-4" />
        <span>Valid seed phrase</span>
      </div>
    );
  }

  if (!validation.isValid && validation.error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <X className="w-4 h-4" />
        <span>{validation.error}</span>
      </div>
    );
  }

  return null;
}
