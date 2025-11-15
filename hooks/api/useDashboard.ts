/**
 * React Query hooks for Dashboard data
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type { DailyReport, Appointment } from "@/lib/types/api";

/**
 * Fetch daily report metrics for a given date
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
 * Fetch upcoming appointments
 */
export function useUpcomingAppointments(limit: number = 10, date?: string) {
  return useQuery({
    queryKey: ["appointments", "upcoming", limit, date],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("upcoming", "true");
      params.set("limit", limit.toString());
      if (date) {
        params.set("from", date);
      }
      return api.get<Appointment[]>(`/admin/appointments?${params.toString()}`);
    },
  });
}

/**
 * Fetch top services for a date range
 */
export function useTopServices(from?: string, to?: string, limit: number = 5) {
  return useQuery({
    queryKey: ["reports", "top-services", from, to, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", limit.toString());
      return api.get<{ serviceId: string; count: number; revenueCents: number }[]>(
        `/admin/reports/top-services?${params.toString()}`
      );
    },
    enabled: Boolean(from && to),
  });
}

