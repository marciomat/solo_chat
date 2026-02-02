"use client";

import { 
  JazzReactProvider, 
  useAccount as useJazzAccount, 
  useCoState as useJazzCoState,
} from "jazz-tools/react";
import { ReactNode, useState, useEffect } from "react";

// Re-export hooks for convenience
export { useJazzAccount as useAccount, useJazzCoState as useCoState };

interface JazzProviderProps {
  children: ReactNode;
}

// Wrapper component that only renders on client
function ClientOnly({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return <>{children}</>;
}

export function JazzProvider({ children }: JazzProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_JAZZ_API_KEY || "solo-chat@example.com";

  return (
    <ClientOnly>
      <JazzReactProvider
        authSecretStorageKey="solo-chat-auth-storage"
        sync={{
          peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
        }}
        defaultProfileName="Solo User"
      >
        {children}
      </JazzReactProvider>
    </ClientOnly>
  );
}
