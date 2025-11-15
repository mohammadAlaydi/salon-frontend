/**
 * React Query hooks for Reports data
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type { DailyReport, TopServiceMetric } from "@/lib/types/api";

/**
 * Fetch daily report for a specific date
 */
export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: queryKeys.dailyReport(date),
    queryFn: () => {
      const endpoint = date
        ? `/admin/reports/daily?date=${date}`
        : `/admin/reports/daily`;
      return api.get<DailyReport>(endpoint);
    },
  });
}

/**
 * Fetch top services for a date range
 */
export function useTopServices(from?: string, to?: string, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.topServices(from, to, limit),
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", limit.toString());
      return api.get<TopServiceMetric[]>(
        `/admin/reports/top-services?${params.toString()}`
      );
    },
    enabled: Boolean(from && to),
  });
}

/**
 * Fetch revenue data for multiple dates (for charting)
 */
export function useRevenueHistory(from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", "revenue-history", from, to],
    queryFn: async () => {
      if (!from || !to) return [];

      // Generate array of dates between from and to
      const dates: string[] = [];
      const start = new Date(from);
      const end = new Date(to);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }

      // Fetch daily report for each date
      const reports = await Promise.all(
        dates.map((date) =>
          api.get<DailyReport>(`/admin/reports/daily?date=${date}`)
        )
      );

      return reports.map((report, index) => ({
        date: dates[index],
        revenue: (report.totalRevenueCents || 0) / 100,
        appointments: report.totalAppointments || 0,
      }));
    },
    enabled: Boolean(from && to),
  });
}

