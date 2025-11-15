/**
 * React Query hooks for Services CRUD operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type {
  Service,
  ServiceCreateRequest,
  ServiceUpdateRequest,
} from "@/lib/types/api";

/**
 * Fetch all services for the current salon
 */
export function useServicesList() {
  return useQuery({
    queryKey: queryKeys.services(),
    queryFn: () => api.get<Service[]>("/admin/services"),
  });
}

/**
 * Create a new service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceCreateRequest) =>
      api.post<Service>("/admin/services", data),
    onSuccess: (newService) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
      toast.success("Service created", {
        description: `${newService.name} has been added successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create service", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Update an existing service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceUpdateRequest }) =>
      api.put<Service>(`/admin/services/${id}`, data),
    onSuccess: (updatedService) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
      queryClient.invalidateQueries({ queryKey: queryKeys.service(updatedService.id) });
      toast.success("Service updated", {
        description: `${updatedService.name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update service", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Delete a service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
      toast.success("Service deleted", {
        description: "The service has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete service", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

