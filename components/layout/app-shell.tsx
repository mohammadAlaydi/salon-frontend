"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar className="hidden w-64 lg:flex" />

      {/* Sidebar - Mobile (overlay) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <Sidebar className="fixed left-0 top-0 z-50 h-full w-64 lg:hidden" />
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-y-auto bg-glownova-bg",
            "pb-16 lg:pb-0" // Add padding for mobile nav
          )}
        >
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </div>
  );
}

