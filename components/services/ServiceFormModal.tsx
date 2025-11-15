/**
 * Service Form Modal - Reusable for create & edit
 */

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceFormSchema, type ServiceFormData } from "@/lib/validations/services";
import { useCreateService, useUpdateService } from "@/hooks/services/useServices";
import type { Service } from "@/lib/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

interface ServiceFormModalProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Service;
  onSuccess?: () => void;
}

const serviceCategories = [
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "massage", label: "Massage" },
  { value: "waxing", label: "Waxing" },
  { value: "makeup", label: "Makeup" },
  { value: "other", label: "Other" },
];

export function ServiceFormModal({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: ServiceFormModalProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
  });

  const activeValue = watch("active");
  const categoryValue = watch("category");

  // Load default values when editing
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      reset({
        name: defaultValues.name,
        category: getCategoryFromService(defaultValues),
        duration: defaultValues.durationMinutes,
        price: defaultValues.priceCents / 100,
        description: defaultValues.description || "",
        active: defaultValues.isActive ?? true,
      });
    } else if (mode === "create") {
      reset({
        name: "",
        category: "",
        duration: 30,
        price: 0,
        description: "",
        active: true,
      });
    }
  }, [mode, defaultValues, reset, open]);

  const getCategoryFromService = (service: Service): string => {
    const name = service.name.toLowerCase();
    if (name.includes("hair") || name.includes("cut") || name.includes("color") || name.includes("balayage")) {
      return "hair";
    }
    if (name.includes("manicure") || name.includes("pedicure") || name.includes("nail")) {
      return "nails";
    }
    if (name.includes("facial") || name.includes("skincare")) {
      return "skincare";
    }
    if (name.includes("massage")) {
      return "massage";
    }
    if (name.includes("wax")) {
      return "waxing";
    }
    if (name.includes("makeup")) {
      return "makeup";
    }
    return "other";
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (mode === "create") {
        await createService.mutateAsync({
          name: data.name,
          description: data.description,
          durationMinutes: data.duration,
          priceCents: Math.round(data.price * 100),
          currency: "USD",
        });
      } else if (mode === "edit" && defaultValues) {
        await updateService.mutateAsync({
          id: defaultValues.id,
          data: {
            name: data.name,
            description: data.description,
            durationMinutes: data.duration,
            priceCents: Math.round(data.price * 100),
            isActive: data.active,
          },
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Service" : "Edit Service"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Women's Haircut"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-status-error">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              value={categoryValue}
              {...register("category")}
            >
              <option value="">Select a category</option>
              {serviceCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-status-error">{errors.category.message}</p>
            )}
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min) *</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                placeholder="30"
                disabled={isSubmitting}
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-status-error">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="75.00"
                disabled={isSubmitting}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-status-error">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this service..."
              rows={3}
              disabled={isSubmitting}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-status-error">{errors.description.message}</p>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="active" className="text-base">Active</Label>
              <p className="text-sm text-muted-foreground">
                Make this service available for booking
              </p>
            </div>
            <Switch
              id="active"
              checked={activeValue}
              onCheckedChange={(checked) => setValue("active", checked)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Service" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

