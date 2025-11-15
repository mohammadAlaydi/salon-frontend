/**
 * React Query hooks for Customers CRUD operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type {
  Customer,
  CustomerCreateRequest,
} from "@/lib/types/api";

/**
 * Fetch all customers with optional search
 */
export function useCustomersList(searchQuery?: string) {
  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);

  return useQuery({
    queryKey: queryKeys.customers(),
    queryFn: () => api.get<Customer[]>(`/admin/customers?${params.toString()}`),
  });
}

/**
 * Fetch a single customer
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => api.get<Customer>(`/admin/customers/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create a new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerCreateRequest) =>
      api.post<Customer>("/admin/customers", data),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      toast.success("Customer added", {
        description: `${newCustomer.name} has been added successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add customer", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Update an existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerCreateRequest> }) =>
      api.put<Customer>(`/admin/customers/${id}`, data),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(updatedCustomer.id) });
      toast.success("Customer updated", {
        description: `${updatedCustomer.name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update customer", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Delete a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      toast.success("Customer deleted", {
        description: "The customer has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to delete customer", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

