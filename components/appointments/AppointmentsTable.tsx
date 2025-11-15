/**
 * Appointments Table Component
 * Displays appointments with filters, search, and actions
 */

"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusMenu } from "@/components/appointments/StatusMenu";
import { Edit, Trash2, Search } from "lucide-react";
import { useDeleteAppointment } from "@/hooks/api/useAppointments";
import type { Appointment, Service, StaffProfile, Customer, AppointmentStatus } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface AppointmentsTableProps {
  appointments: Appointment[];
  services: Service[];
  staff: StaffProfile[];
  customers: Customer[];
  isLoading?: boolean;
  onEdit: (appointment: Appointment) => void;
  filters?: {
    from?: string;
    to?: string;
    staffId?: string;
    status?: string;
    q?: string;
  };
  onFiltersChange?: (filters: any) => void;
}

export function AppointmentsTable({
  appointments,
  services,
  staff,
  customers,
  isLoading,
  onEdit,
  filters = {},
  onFiltersChange,
}: AppointmentsTableProps) {
  const deleteAppointment = useDeleteAppointment();
  const [searchQuery, setSearchQuery] = useState(filters.q || "");

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      await deleteAppointment.mutateAsync(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFiltersChange?.({ ...filters, q: value });
  };

  const handleStatusFilter = (value: string) => {
    onFiltersChange?.({ ...filters, status: value === "all" ? undefined : value });
  };

  const handleStaffFilter = (value: string) => {
    onFiltersChange?.({ ...filters, staffId: value === "all" ? undefined : value });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="border rounded-lg">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filters.status || "all"}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
        <select
          value={filters.staffId || "all"}
          onChange={(e) => handleStaffFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Staff</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const service = services.find((s) => s.id === appointment.serviceId);
                const staffMember = staff.find((s) => s.id === appointment.staffId);
                const customer = customers.find((c) => c.id === appointment.customerId);

                return (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(appointment.startTime), "MMM d, yyyy")}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(appointment.startTime), "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>{customer?.name || "Unknown"}</TableCell>
                    <TableCell>{service?.name || "Unknown Service"}</TableCell>
                    <TableCell>{staffMember?.name || "Unassigned"}</TableCell>
                    <TableCell>{service?.durationMinutes || 0} min</TableCell>
                    <TableCell>
                      ${((service?.priceCents || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusMenu
                        appointmentId={appointment.id}
                        currentStatus={appointment.status}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(appointment.id)}
                          disabled={deleteAppointment.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

