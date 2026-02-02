"use client";

interface SeedDisplayProps {
  seed: string;
  showNumbers?: boolean;
}

export function SeedDisplay({ seed, showNumbers = true }: SeedDisplayProps) {
  const words = seed.split(" ");

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg">
      {words.map((word, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 bg-background rounded border text-sm"
        >
          {showNumbers && (
            <span className="text-muted-foreground text-xs w-4">
              {index + 1}.
            </span>
          )}
          <span className="font-mono">{word}</span>
        </div>
      ))}
    </div>
  );
}
