/**
 * Admin Reports Page
 * Analytics: revenue trends, top services, with CSV export
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { TopServicesTable } from "@/components/reports/TopServicesTable";
import { useRevenueHistory, useTopServices } from "@/hooks/api/useReports";
import { useServicesList } from "@/hooks/services/useServices";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function ReportsPage() {
  // Default to last 30 days
  const [fromDate, setFromDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: revenueData = [], isLoading: isLoadingRevenue } = useRevenueHistory(
    fromDate,
    toDate
  );
  const { data: topServices = [], isLoading: isLoadingServices } = useTopServices(
    fromDate,
    toDate,
    10
  );
  const { data: services = [] } = useServicesList();

  // Map service IDs to names for the table
  const topServicesWithNames = topServices.map((item) => {
    const service = services.find((s) => s.id === item.serviceId);
    return {
      serviceId: item.serviceId,
      serviceName: service?.name || "Unknown Service",
      count: item.count,
      revenueCents: item.revenueCents || 0,
    };
  });

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-2 text-muted-foreground">
            Analytics and insights for your salon
          </p>
        </div>

        {/* Date Range Picker */}
        <Card className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <Label htmlFor="from-date">From Date</Label>
              <div className="relative mt-1">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 min-w-48">
              <Label htmlFor="to-date">To Date</Label>
              <div className="relative mt-1">
                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                // Quick preset: Last 7 days
                setFromDate(format(subDays(new Date(), 7), "yyyy-MM-dd"));
                setToDate(format(new Date(), "yyyy-MM-dd"));
              }}
              variant="outline"
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => {
                // Quick preset: Last 30 days
                setFromDate(format(subDays(new Date(), 30), "yyyy-MM-dd"));
                setToDate(format(new Date(), "yyyy-MM-dd"));
              }}
              variant="outline"
            >
              Last 30 Days
            </Button>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />
        </Card>

        {/* Top Services */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Services</h3>
          </div>
          <TopServicesTable
            services={topServicesWithNames}
            isLoading={isLoadingServices}
          />
        </Card>
      </div>
    </AppShell>
  );
}

