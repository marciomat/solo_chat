"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateSeed } from "@/lib/seed/generate";
import { Copy, RefreshCw, Check } from "lucide-react";
import { SeedDisplay } from "./SeedDisplay";

interface SeedGeneratorProps {
  onSeedGenerated: (seed: string) => void;
}

export function SeedGenerator({ onSeedGenerated }: SeedGeneratorProps) {
  const [seed, setSeed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!seed) return;
    
    try {
      await navigator.clipboard.writeText(seed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [seed]);

  const handleContinue = useCallback(() => {
    if (seed) {
      onSeedGenerated(seed);
    }
  }, [seed, onSeedGenerated]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Chat</CardTitle>
        <CardDescription>
          Generate a 12-word seed phrase. Anyone with this seed can join your chat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!seed ? (
          <Button onClick={handleGenerate} className="w-full" size="lg">
            Generate Seed Phrase
          </Button>
        ) : (
          <>
            <SeedDisplay seed={seed} />
            
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Save this seed phrase securely! It&apos;s the only way to access this chat from other devices.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Seed
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerate}
                variant="outline"
                size="icon"
                title="Generate new seed"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            <Button onClick={handleContinue} className="w-full" size="lg">
              Start Chat
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
