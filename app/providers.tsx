/**
 * Global providers wrapper for the app
 */

"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/react-query";
import { MSWInit } from "./msw-init";
import { Toaster } from "@/components/ui/toaster";
import { setTenantId } from "@/lib/apiClient";

function TenantInitializer() {
  // Set tenant immediately and also in useEffect for route changes
  const resolveTenant = () => {
    if (typeof window === "undefined") {
      setTenantId("demo-salon");
      return;
    }

    const url = new URL(window.location.href);

    // 1. Check query parameter
    const tenantParam = url.searchParams.get("tenant");
    if (tenantParam) {
      setTenantId(tenantParam);
      return;
    }

    // 2. Extract from pathname (e.g., /[salonSlug]/...)
    // Skip common non-salon paths
    const pathParts = url.pathname.split("/").filter(Boolean);
    const excludedPaths = ["admin", "booking", "login", "api", "auth"];
    if (pathParts.length > 0 && !excludedPaths.includes(pathParts[0])) {
      setTenantId(pathParts[0]);
      return;
    }

    // 3. Extract subdomain from host
    const host = url.hostname;
    const parts = host.split(".");

    if (parts.length >= 2) {
      const subdomain = parts[0];
      // Ignore localhost, www, and single-letter subdomains
      if (subdomain !== "localhost" && subdomain !== "www" && subdomain.length > 1) {
        setTenantId(subdomain);
        return;
      }
    }

    // 4. Default to demo-salon for local development
    setTenantId("demo-salon");
  };

  // Set immediately on mount
  if (typeof window !== "undefined") {
    resolveTenant();
  }

  // Also set in useEffect to handle route changes
  useEffect(() => {
    resolveTenant();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MSWInit>
      <QueryClientProvider client={queryClient}>
        <TenantInitializer />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </MSWInit>
  );
}

