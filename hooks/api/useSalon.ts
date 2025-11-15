/**
 * React Query hooks for Salon settings
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query";
import type { Salon, SalonUpdateRequest } from "@/lib/types/api";

/**
 * Fetch current salon settings
 */
export function useSalonSettings() {
  return useQuery({
    queryKey: queryKeys.salon(),
    queryFn: () => api.get<Salon>("/admin/salon"),
  });
}

/**
 * Update salon settings
 */
export function useUpdateSalon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SalonUpdateRequest) =>
      api.put<Salon>("/admin/salon", data),
    onSuccess: (updatedSalon) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salon() });
      toast.success("Settings updated", {
        description: "Your salon settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update settings", {
        description: error?.message || "Please try again later.",
      });
    },
  });
}

/**
 * Test webhook integration
 */
export function useTestWebhook() {
  return useMutation({
    mutationFn: (webhookUrl: string) =>
      api.post<{ success: boolean; message: string }>("/admin/webhook/test", {
        webhookUrl,
      }),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Webhook test successful", {
          description: response.message || "The webhook received the test event.",
        });
      } else {
        toast.error("Webhook test failed", {
          description: response.message || "The webhook did not respond as expected.",
        });
      }
    },
    onError: (error: any) => {
      toast.error("Webhook test failed", {
        description: error?.message || "Could not reach the webhook endpoint.",
      });
    },
  });
}

