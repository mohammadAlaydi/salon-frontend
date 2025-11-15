/**
 * Hook to require admin role
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "./useRequireAuth";

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  useRequireAuth();

  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
}

