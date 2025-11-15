/**
 * React Query hooks for Staff CRUD operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type {
  StaffProfile,
  StaffCreateRequest,
  StaffUpdateRequest,
  WorkingHours,
} from "@/lib/types/api";

/**
 * Fetch all staff for the current salon
 */
export function useStaffList() {
  return useQuery({
    queryKey: queryKeys.staff(),
    queryFn: () => api.get<StaffProfile[]>("/admin/staff"),
  });
}

/**
 * Fetch a single staff member
 */
export function useStaffMember(id: string) {
  return useQuery({
    queryKey: queryKeys.staffMember(id),
    queryFn: () => api.get<StaffProfile>(`/admin/staff/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Fetch staff schedule/working hours
 */
export function useStaffSchedule(staffId: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedule(staffId),
    queryFn: () => api.get<WorkingHours[]>(`/admin/staff/${staffId}/schedule`),
    enabled: Boolean(staffId),
  });
}

/**
 * Create a new staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffCreateRequest) =>
      api.post<StaffProfile>("/admin/staff", data),
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast.success("Staff member added", {
        description: `${newStaff.name} has been added successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add staff member", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Update an existing staff member
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffUpdateRequest }) =>
      api.put<StaffProfile>(`/admin/staff/${id}`, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      queryClient.invalidateQueries({ queryKey: queryKeys.staffMember(updatedStaff.id) });
      toast.success("Staff member updated", {
        description: `${updatedStaff.name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update staff member", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Update staff schedule/working hours
 */
export function useUpdateStaffSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, schedule }: { staffId: string; schedule: WorkingHours[] }) =>
      api.put<StaffProfile>(`/admin/staff/${staffId}/schedule`, { workingHours: schedule }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedule(variables.staffId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staffMember(variables.staffId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast.success("Schedule updated", {
        description: "Working hours have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update schedule", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Delete a staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast.success("Staff member removed", {
        description: "The staff member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to remove staff member", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

