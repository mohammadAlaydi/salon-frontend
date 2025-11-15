/**
 * Admin Appointments Page
 * Full appointments management with table, filters, create/edit, and status updates
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { AppointmentFormModal } from "@/components/appointments/AppointmentFormModal";
import { useAppointmentsList } from "@/hooks/api/useAppointments";
import { useServicesList } from "@/hooks/services/useServices";
import { useStaffList } from "@/hooks/api/useStaff";
import { useCustomersList } from "@/hooks/api/useCustomers";
import { Plus } from "lucide-react";
import type { Appointment, AppointmentFilters } from "@/lib/types/api";

export default function AppointmentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({});

  // Fetch data
  const { data: appointments = [], isLoading } = useAppointmentsList(filters);
  const { data: services = [] } = useServicesList();
  const { data: staff = [] } = useStaffList();
  const { data: customers = [] } = useCustomersList();

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingAppointment(null);
  };

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="mt-2 text-muted-foreground">
              Manage and schedule appointments for your salon
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <AppointmentsTable
          appointments={appointments}
          services={services}
          staff={staff}
          customers={customers}
          isLoading={isLoading}
          onEdit={handleEdit}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {(isCreateModalOpen || editingAppointment) && (
          <AppointmentFormModal
            appointment={editingAppointment}
            services={services}
            staff={staff}
            customers={customers}
            open={isCreateModalOpen || !!editingAppointment}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </AppShell>
  );
}

