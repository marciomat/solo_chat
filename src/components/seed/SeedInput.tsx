"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { validateSeedWithMessage, normalizeSeed } from "@/lib/seed/validate";
import { AlertCircle } from "lucide-react";

interface SeedInputProps {
  onSeedSubmitted: (seed: string) => void;
}

export function SeedInput({ onSeedSubmitted }: SeedInputProps) {
  const [seed, setSeed] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSeed(value);
    
    // Clear error when typing
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSeedWithMessage(seed);
    
    if (!validation.isValid) {
      setError(validation.error || "Invalid seed");
      return;
    }
    
    const normalizedSeed = normalizeSeed(seed);
    onSeedSubmitted(normalizedSeed);
  }, [seed, onSeedSubmitted]);

  const wordCount = seed.trim() ? seed.trim().split(/\s+/).length : 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join Existing Chat</CardTitle>
        <CardDescription>
          Enter the 12-word seed phrase to join a chat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your 12-word seed phrase..."
              value={seed}
              onChange={handleChange}
              rows={3}
              className={error ? "border-destructive" : ""}
            />
            <div className="flex justify-between text-sm">
              <span className={`${wordCount === 12 ? "text-green-500" : "text-muted-foreground"}`}>
                {wordCount}/12 words
              </span>
              {error && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </span>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={wordCount !== 12}
          >
            Join Chat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
