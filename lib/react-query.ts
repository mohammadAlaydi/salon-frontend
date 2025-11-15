/**
 * React Query configuration and provider setup
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 401 which is handled by API client)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 401) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Query keys factory for consistent cache management
 */
export const queryKeys = {
  // Auth
  me: () => ["me"] as const,

  // Salon
  salon: (salonId?: string) => ["salon", salonId] as const,

  // Services
  services: (salonId?: string) => ["services", salonId] as const,
  service: (id: string) => ["services", id] as const,

  // Staff
  staff: (salonId?: string) => ["staff", salonId] as const,
  staffMember: (id: string) => ["staff", id] as const,

  // Customers
  customers: (salonId?: string) => ["customers", salonId] as const,
  customer: (id: string) => ["customers", id] as const,

  // Appointments
  appointments: (filters?: unknown) =>
    ["appointments", filters] as const,
  appointment: (id: string) => ["appointments", id] as const,

  // Public
  publicServices: (tenantSlug: string) => ["public", "services", tenantSlug] as const,
  publicStaff: (tenantSlug: string, serviceId?: string) =>
    ["public", "staff", tenantSlug, serviceId] as const,
  publicAvailability: (
    tenantSlug: string,
    serviceId?: string,
    staffId?: string,
    date?: string
  ) => ["public", "availability", tenantSlug, serviceId, staffId, date] as const,

  // Reports
  dailyReport: (date?: string) => ["reports", "daily", date] as const,
  topServices: (from?: string, to?: string, limit?: number) =>
    ["reports", "top-services", from, to, limit] as const,
  staffSchedule: (staffId: string) => ["staff", staffId, "schedule"] as const,
};

