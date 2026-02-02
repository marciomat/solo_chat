"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", marginBottom: "1rem", maxWidth: "400px" }}>
            {error.message || "An unexpected error occurred"}
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                border: "1px solid #ccc",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
