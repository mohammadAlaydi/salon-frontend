/**
 * MSW initialization for client-side
 * This ensures MSW is initialized before the app renders
 */

"use client";

import { useEffect, useState } from "react";

export function MSWInit({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(() => {
    // Skip MSW init if explicitly disabled or in production without mocks
    if (typeof window === "undefined") return true;
    if (process.env.NODE_ENV !== "development") return true;
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "false") return true;
    return false;
  });

  useEffect(() => {
    const initMSW = async () => {
      if (typeof window === "undefined") return;
      if (process.env.NODE_ENV !== "development") return;
      if (process.env.NEXT_PUBLIC_USE_MOCKS === "false") return;

      // Seed demo data first
      const { seedDemoData } = await import("@/mocks/seed");
      seedDemoData();

      // Dynamically import and start MSW worker
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });

      setMswReady(true);
    };

    if (!mswReady) {
      initMSW();
    }
  }, [mswReady]);

  if (!mswReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌸</div>
          <div style={{ fontSize: "18px", color: "#666" }}>Initializing GLOWNOVA...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

