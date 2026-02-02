"use client";

import { 
  JazzReactProvider, 
  useAccount as useJazzAccount, 
  useCoState as useJazzCoState,
} from "jazz-tools/react";
import { ReactNode, useState, useEffect, Component, ErrorInfo } from "react";

// Re-export hooks for convenience
export { useJazzAccount as useAccount, useJazzCoState as useCoState };

interface JazzProviderProps {
  children: ReactNode;
}

// Error boundary to catch Jazz initialization errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class JazzErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Jazz] Provider error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to initialize chat. Please check your connection and try again.
          </p>
          <p className="text-xs text-muted-foreground font-mono mb-4">
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that only renders on client with timeout
function ClientOnly({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "timeout">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatus((prev) => prev === "loading" ? "timeout" : prev);
    }, 10000);

    try {
      if (typeof indexedDB === "undefined") {
        setErrorMsg("IndexedDB not supported");
        setStatus("error");
        return;
      }
      
      if (typeof WebSocket === "undefined") {
        setErrorMsg("WebSocket not supported");
        setStatus("error");
        return;
      }

      setStatus("ready");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }

    return () => clearTimeout(timeout);
  }, []);
  
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Browser Not Supported</h2>
        <p className="text-muted-foreground">{errorMsg}</p>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Connection Timeout</h2>
        <p className="text-muted-foreground mb-4">
          Taking too long to connect. Please check your internet connection.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export function JazzProvider({ children }: JazzProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_JAZZ_API_KEY || "solo-chat@example.com";

  return (
    <ClientOnly>
      <JazzErrorBoundary>
        <JazzReactProvider
          authSecretStorageKey="solo-chat-auth-storage"
          sync={{
            peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
          }}
          defaultProfileName="Solo User"
        >
          {children}
        </JazzReactProvider>
      </JazzErrorBoundary>
    </ClientOnly>
  );
}
