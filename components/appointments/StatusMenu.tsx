/**
 * Appointment Status Menu Component
 * Inline dropdown to change appointment status with confirmation for destructive actions
 */

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useUpdateAppointmentStatus } from "@/hooks/api/useAppointments";
import type { AppointmentStatus } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface StatusMenuProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

const STATUS_VARIANTS: Record<AppointmentStatus, "default" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

export function StatusMenu({ appointmentId, currentStatus }: StatusMenuProps) {
  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (newStatus === currentStatus) return;

    // Confirm destructive actions
    if (newStatus === "CANCELLED" || newStatus === "NO_SHOW") {
      const action = newStatus === "CANCELLED" ? "cancel" : "mark as no-show";
      if (!confirm(`Are you sure you want to ${action} this appointment?`)) {
        return;
      }
    }

    await updateStatus.mutateAsync({
      id: appointmentId,
      status: newStatus,
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
        disabled={updateStatus.isPending}
        className={cn(
          "appearance-none rounded-md border-0 px-2 py-1 pr-8 text-xs font-medium cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          STATUS_VARIANTS[currentStatus] === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          STATUS_VARIANTS[currentStatus] === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          STATUS_VARIANTS[currentStatus] === "destructive" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          STATUS_VARIANTS[currentStatus] === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        )}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg
          className="h-3 w-3 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}

