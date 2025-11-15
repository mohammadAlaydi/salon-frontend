/**
 * Appointment Form Modal Component
 * Create/Edit appointment with service, staff, date/time picker, notes
 */

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/api/useAppointments";
import type { Appointment, Service, StaffProfile, Customer } from "@/lib/types/api";
import { format } from "date-fns";

// Validation schema
const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().min(1, "Staff is required"),
  customerId: z.string().min(1, "Customer is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormModalProps {
  appointment?: Appointment | null;
  services: Service[];
  staff: StaffProfile[];
  customers: Customer[];
  open: boolean;
  onClose: () => void;
}

export function AppointmentFormModal({
  appointment,
  services,
  staff,
  customers,
  open,
  onClose,
}: AppointmentFormModalProps) {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          serviceId: appointment.serviceId,
          staffId: appointment.staffId,
          customerId: appointment.customerId,
          date: format(new Date(appointment.startTime), "yyyy-MM-dd"),
          time: format(new Date(appointment.startTime), "HH:mm"),
          notes: appointment.notes || "",
        }
      : undefined,
  });

  const selectedServiceId = watch("serviceId");
  const selectedService = services.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    if (open && appointment) {
      reset({
        serviceId: appointment.serviceId,
        staffId: appointment.staffId,
        customerId: appointment.customerId,
        date: format(new Date(appointment.startTime), "yyyy-MM-dd"),
        time: format(new Date(appointment.startTime), "HH:mm"),
        notes: appointment.notes || "",
      });
    } else if (open && !appointment) {
      reset({
        serviceId: "",
        staffId: "",
        customerId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        notes: "",
      });
    }
  }, [open, appointment, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Calculate start and end times
      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (selectedService?.durationMinutes || 60));

      const payload = {
        serviceId: data.serviceId,
        staffId: data.staffId,
        customerId: data.customerId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: data.notes,
      };

      if (appointment) {
        await updateAppointment.mutateAsync({
          id: appointment.id,
          data: payload,
        });
      } else {
        await createAppointment.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      // Error handling is done in the hooks with toasts
      console.error("Failed to save appointment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Service */}
            <div className="col-span-2">
              <Label htmlFor="serviceId">Service *</Label>
              <select
                id="serviceId"
                {...register("serviceId")}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.durationMinutes} min - $
                    {(service.priceCents / 100).toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <p className="mt-1 text-sm text-destructive">{errors.serviceId.message}</p>
              )}
            </div>

            {/* Staff */}
            <div className="col-span-2">
              <Label htmlFor="staffId">Staff *</Label>
              <select
                id="staffId"
                {...register("staffId")}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select staff member</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.staffId && (
                <p className="mt-1 text-sm text-destructive">{errors.staffId.message}</p>
              )}
            </div>

            {/* Customer */}
            <div className="col-span-2">
              <Label htmlFor="customerId">Customer *</Label>
              <select
                id="customerId"
                {...register("customerId")}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone ? `(${customer.phone})` : ""}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-destructive">{errors.customerId.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="mt-1"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                {...register("time")}
                className="mt-1"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>

            {/* Duration & Price info */}
            {selectedService && (
              <div className="col-span-2 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Duration:</span> {selectedService.durationMinutes} minutes
                  {" • "}
                  <span className="font-medium">Price:</span> $
                  {(selectedService.priceCents / 100).toFixed(2)}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Add any notes for this appointment..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : appointment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

