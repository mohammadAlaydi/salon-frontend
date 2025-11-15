/**
 * Customer Profile Component
 * Shows contact info, visit history table, and notes editor
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateCustomer } from "@/hooks/api/useCustomers";
import { useAppointmentsList } from "@/hooks/api/useAppointments";
import { useServicesList } from "@/hooks/services/useServices";
import { useStaffList } from "@/hooks/api/useStaff";
import { format } from "date-fns";
import { Mail, Phone, Calendar, Save } from "lucide-react";
import type { Customer } from "@/lib/types/api";

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const [notes, setNotes] = useState(customer.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const updateCustomer = useUpdateCustomer();
  const { data: services = [] } = useServicesList();
  const { data: staff = [] } = useStaffList();

  // Fetch customer's appointments
  const { data: allAppointments = [] } = useAppointmentsList();
  const customerAppointments = allAppointments.filter(
    (apt) => apt.customerId === customer.id
  );

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        data: { notes },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats
  const totalVisits = customerAppointments.length;
  const completedVisits = customerAppointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const totalRevenue = customerAppointments
    .filter((a) => a.status === "COMPLETED")
    .reduce((sum, apt) => {
      const service = services.find((s) => s.id === apt.serviceId);
      return sum + (service?.priceCents || 0);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Contact Info & Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Customer since {format(new Date(customer.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-glownova-primary">
                {totalVisits}
              </p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {completedVisits}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notes</h3>
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={isSaving || notes === customer.notes}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this customer (allergies, preferences, etc.)..."
          rows={4}
        />
      </Card>

      {/* Visit History */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Visit History</h3>
        {customerAppointments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No appointments yet
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerAppointments.map((appointment) => {
                  const service = services.find((s) => s.id === appointment.serviceId);
                  const staffMember = staff.find((s) => s.id === appointment.staffId);

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(new Date(appointment.startTime), "MMM d, yyyy")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(appointment.startTime), "h:mm a")}
                        </span>
                      </TableCell>
                      <TableCell>{service?.name || "Unknown"}</TableCell>
                      <TableCell>{staffMember?.name || "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "COMPLETED"
                              ? "success"
                              : appointment.status === "CANCELLED"
                                ? "destructive"
                                : "default"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${((service?.priceCents || 0) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

