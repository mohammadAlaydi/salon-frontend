/**
 * Hook to require authentication and redirect if not authenticated
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAuth(redirectTo: string = "/admin/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const redirectPath = currentPath ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}` : redirectTo;
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

