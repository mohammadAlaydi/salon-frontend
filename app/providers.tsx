/**
 * Global providers wrapper for the app
 */

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/react-query";
import { MSWInit } from "./msw-init";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MSWInit>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </MSWInit>
  );
}

