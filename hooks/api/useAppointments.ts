/**
 * React Query hooks for Appointments CRUD operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentStatusUpdateRequest,
  AppointmentFilters,
} from "@/lib/types/api";

/**
 * Generate a client-side idempotency key
 */
function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Fetch appointments with optional filters
 */
export function useAppointmentsList(filters?: AppointmentFilters & { upcoming?: boolean; limit?: number; q?: string }) {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.staffId) params.set("staffId", filters.staffId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.upcoming) params.set("upcoming", "true");
  if (filters?.limit) params.set("limit", filters.limit.toString());
  if (filters?.q) params.set("q", filters.q);

  return useQuery({
    queryKey: queryKeys.appointments(filters),
    queryFn: () => api.get<Appointment[]>(`/admin/appointments?${params.toString()}`),
  });
}

/**
 * Fetch a single appointment
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => api.get<Appointment>(`/admin/appointments/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create a new appointment with idempotency
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentCreateRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      return api.post<Appointment>("/admin/appointments", data, {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      toast.success("Appointment created", {
        description: "The appointment has been created successfully.",
      });
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error("Appointment conflict", {
          description: "This time slot is already booked. Please choose a different time.",
        });
      } else {
        toast.error("Failed to create appointment", {
          description: error?.message || "Please try again later.",
        });
      }
    },
  });
}

/**
 * Update an existing appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AppointmentUpdateRequest }) =>
      api.put<Appointment>(`/admin/appointments/${id}`, data),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointment(updatedAppointment.id) });
      toast.success("Appointment updated", {
        description: "The appointment has been updated successfully.",
      });
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error("Appointment conflict", {
          description: "This time slot is already booked. Please choose a different time.",
        });
      } else {
        toast.error("Failed to update appointment", {
          description: error?.message || "Please try again later.",
        });
      }
    },
  });
}

/**
 * Update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatusUpdateRequest["status"] }) =>
      api.patch<Appointment>(`/admin/appointments/${id}`, { status }),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointment(updatedAppointment.id) });
      toast.success("Status updated", {
        description: `Appointment marked as ${updatedAppointment.status.toLowerCase().replace("_", " ")}.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update status", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Delete an appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      toast.success("Appointment deleted", {
        description: "The appointment has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete appointment", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

