/**
 * Hook to resolve and manage tenant context
 */

"use client";

import { useEffect, useState } from "react";
import { setTenantId } from "@/lib/apiClient";

export function useTenant() {
  const [tenantSlug, setTenantSlug] = useState<string>("demo-salon");
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    // Resolve tenant from URL
    const resolveTenant = () => {
      if (typeof window === "undefined") return "demo-salon";

      const url = new URL(window.location.href);

      // 1. Check query parameter
      const tenantParam = url.searchParams.get("tenant");
      if (tenantParam) {
        return tenantParam;
      }

      // 2. Extract from pathname (e.g., /[salonSlug]/...)
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0 && !pathParts[0].startsWith("admin")) {
        return pathParts[0];
      }

      // 3. Extract subdomain from host
      const host = url.hostname;
      const parts = host.split(".");

      if (parts.length >= 2) {
        const subdomain = parts[0];
        // Ignore localhost, www, and single-letter subdomains
        if (subdomain !== "localhost" && subdomain !== "www" && subdomain.length > 1) {
          return subdomain;
        }
      }

      // 4. Default to demo-salon
      return "demo-salon";
    };

    const resolved = resolveTenant();
    setTenantSlug(resolved);

    // In a real app, we'd fetch salon details to get the actual ID
    // For now, we'll use the slug as the ID for MSW purposes
    setTenantIdState(resolved);
    setTenantId(resolved);
  }, []);

  return {
    tenantSlug,
    tenantId,
  };
}

