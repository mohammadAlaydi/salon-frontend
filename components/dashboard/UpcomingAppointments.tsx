/**
 * Upcoming Appointments List
 * Shows a list of upcoming appointments with customer, service, staff, and status
 */

"use client";

import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment, Service, StaffProfile, Customer } from "@/lib/types/api";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  services: Service[];
  staff: StaffProfile[];
  customers: Customer[];
  isLoading?: boolean;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function UpcomingAppointments({
  appointments,
  services,
  staff,
  customers,
  isLoading,
  onAppointmentClick,
}: UpcomingAppointmentsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No upcoming appointments</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
      <div className="space-y-4">
        {appointments.map((appointment) => {
          const service = services.find((s) => s.id === appointment.serviceId);
          const staffMember = staff.find((s) => s.id === appointment.staffId);
          const customer = customers.find((c) => c.id === appointment.customerId);

          return (
            <div
              key={appointment.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onAppointmentClick?.(appointment)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onAppointmentClick?.(appointment);
                }
              }}
            >
              <Avatar className="h-10 w-10">
                <div className="flex h-full w-full items-center justify-center bg-glownova-primary text-white text-sm font-medium">
                  {customer?.name?.charAt(0) || "?"}
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {customer?.name || "Unknown Customer"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {service?.name || "Unknown Service"} • {staffMember?.name || "Unassigned"} •{" "}
                  {format(new Date(appointment.startTime), "h:mm a")}
                </p>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AppointmentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    COMPLETED: "success",
    CANCELLED: "destructive",
    NO_SHOW: "destructive",
  };

  return (
    <Badge variant={variants[status] || "default"} className="text-xs">
      {status.replace("_", " ")}
    </Badge>
  );
}

