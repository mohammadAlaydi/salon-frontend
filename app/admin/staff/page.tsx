/**
 * Admin Staff Page
 * Manage staff profiles, skills, and working hours
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { StaffCard } from "@/components/staff/StaffCard";
import { StaffFormModal } from "@/components/staff/StaffFormModal";
import { useStaffList } from "@/hooks/api/useStaff";
import { useServicesList } from "@/hooks/services/useServices";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StaffProfile } from "@/lib/types/api";

export default function StaffPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);

  const { data: staff = [], isLoading } = useStaffList();
  const { data: services = [] } = useServicesList();

  const handleEdit = (member: StaffProfile) => {
    setEditingStaff(member);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your team members and their schedules
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No staff members yet</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Staff Member
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <StaffCard key={member.id} staff={member} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {(isCreateModalOpen || editingStaff) && (
          <StaffFormModal
            staff={editingStaff}
            services={services}
            open={isCreateModalOpen || !!editingStaff}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </AppShell>
  );
}

