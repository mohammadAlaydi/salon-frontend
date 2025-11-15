/**
 * Admin Dashboard Page
 * Shows key metrics, upcoming appointments, and mini calendar
 */

"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { useDailyReport, useUpcomingAppointments } from "@/hooks/api/useDashboard";
import { useServicesList } from "@/hooks/services/useServices";
import { useStaffList } from "@/hooks/api/useStaff";
import { useCustomersList } from "@/hooks/api/useCustomers";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Format selected date for API
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch data
  const { data: dailyReport, isLoading: isLoadingReport } = useDailyReport(selectedDateStr);
  const { data: appointments = [], isLoading: isLoadingAppointments } = useUpcomingAppointments(10, selectedDateStr);
  const { data: services = [] } = useServicesList();
  const { data: staff = [] } = useStaffList();
  const { data: customers = [] } = useCustomersList();

  // Fetch appointment counts for the calendar month
  const monthStart = format(startOfMonth(selectedDate), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedDate), "yyyy-MM-dd");

  // Calculate appointment counts by date for the mini calendar
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((apt) => {
      const dateKey = format(new Date(apt.startTime), "yyyy-MM-dd");
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Format metrics for MetricCards
  const metrics = [
    {
      label: "Total Bookings",
      value: dailyReport?.totalAppointments ?? 0,
      subtext: "Today's appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Revenue",
      value: dailyReport?.totalRevenueCents
        ? `$${(dailyReport.totalRevenueCents / 100).toFixed(2)}`
        : "$0.00",
      subtext: "Today's revenue",
      variant: "success" as const,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "COMPLETED").length,
      subtext: "Completed today",
      variant: "success" as const,
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "No-shows",
      value: dailyReport?.noShowCount ?? 0,
      subtext: "Today's no-shows",
      variant: (dailyReport?.noShowCount ? "error" : "default") as "error" | "default",
      icon: <XCircle className="h-5 w-5" />,
    },
  ];

  return (
    <AppShell>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user?.name || user?.email}!
          </p>
        </div>

        <MetricCards metrics={metrics} isLoading={isLoadingReport} />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UpcomingAppointments
              appointments={appointments}
              services={services}
              staff={staff}
              customers={customers}
              isLoading={isLoadingAppointments}
            />
          </div>
          <div>
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointmentCounts={appointmentCounts}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

