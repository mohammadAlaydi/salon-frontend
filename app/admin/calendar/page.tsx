/**
 * Admin Calendar Page (Placeholder)
 * Full calendar view of appointments
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-2 text-muted-foreground">
            Monthly calendar view of all appointments
          </p>
        </div>

        <Card className="p-12 text-center">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Calendar View Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The full calendar view with drag-and-drop appointment management is currently
            in development. Use the Appointments page to manage your bookings.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

