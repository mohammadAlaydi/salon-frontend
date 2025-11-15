/**
 * Admin layout with route protection
 * Public routes (like /admin/login) bypass AuthGuard
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

const AUTH_PUBLIC_ROUTES = ["/admin/login", "/admin/register"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not wrap auth-related routes in AuthGuard
  if (AUTH_PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}
