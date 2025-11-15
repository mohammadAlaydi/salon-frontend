/**
 * React Query hooks for Public Booking flow
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import { useTenant } from "@/hooks/useTenant";
import type {
  Service,
  StaffProfile,
  PublicStaffWithAvailability,
  PublicAppointmentCreateRequest,
  Appointment,
  AvailabilitySlot,
} from "@/lib/types/api";

/**
 * Fetch public services
 */
export function usePublicServices() {
  const { tenantSlug } = useTenant();

  return useQuery({
    queryKey: queryKeys.publicServices(tenantSlug),
    queryFn: () => api.get<Service[]>("/public/services"),
    enabled: !!tenantSlug,
  });
}

/**
 * Fetch staff by service
 */
export function usePublicStaff(serviceId?: string) {
  const { tenantSlug } = useTenant();

  return useQuery({
    queryKey: queryKeys.publicStaff(tenantSlug, serviceId),
    queryFn: () => {
      const url = serviceId ? `/public/staff?serviceId=${serviceId}` : "/public/staff";
      return api.get<PublicStaffWithAvailability[]>(url);
    },
    enabled: !!tenantSlug,
  });
}

/**
 * Fetch availability slots for a specific staff member and date
 */
export function usePublicAvailability(
  serviceId?: string,
  staffId?: string,
  date?: string
) {
  const { tenantSlug } = useTenant();

  return useQuery({
    queryKey: queryKeys.publicAvailability(tenantSlug, serviceId, staffId, date),
    queryFn: () => {
      const params = new URLSearchParams();
      if (serviceId) params.append("serviceId", serviceId);
      if (staffId) params.append("staffId", staffId);
      if (date) params.append("date", date);

      return api.get<AvailabilitySlot[]>(`/public/availability?${params.toString()}`);
    },
    enabled: !!tenantSlug && !!staffId,
  });
}

/**
 * Create a public booking
 */
export function useCreatePublicBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublicAppointmentCreateRequest) => {
      // Generate idempotency key
      const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return api.post<Appointment>("/public/appointments", data, {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      });
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicStaff("") });
      queryClient.invalidateQueries({ queryKey: ["public", "availability"] });
      toast.success("Booking confirmed!", {
        description: "You'll receive a confirmation shortly.",
      });
    },
    onError: (error: any) => {
      const message = error?.status === 409
        ? "This time slot is no longer available. Please select another time."
        : "Failed to create booking. Please try again.";

      toast.error("Booking failed", {
        description: message,
      });
    },
  });
}

