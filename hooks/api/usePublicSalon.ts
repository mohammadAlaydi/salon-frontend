/**
 * React Query hooks for Public Salon data
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type { Salon, Service, StaffProfile } from "@/lib/types/api";

/**
 * Fetch public salon data by slug
 */
export function usePublicSalon(slug: string) {
  return useQuery({
    queryKey: ["public", "salon", slug],
    queryFn: () => api.get<Salon>(`/public/salons/${slug}`),
    enabled: Boolean(slug),
  });
}

/**
 * Fetch public services for a salon
 */
export function usePublicServices(slug: string) {
  return useQuery({
    queryKey: queryKeys.publicServices(slug),
    queryFn: () => api.get<Service[]>(`/public/salons/${slug}/services`),
    enabled: Boolean(slug),
  });
}

/**
 * Fetch public staff for a salon
 */
export function usePublicStaff(slug: string) {
  return useQuery({
    queryKey: queryKeys.publicStaff(slug),
    queryFn: () => api.get<StaffProfile[]>(`/public/salons/${slug}/staff`),
    enabled: Boolean(slug),
  });
}

