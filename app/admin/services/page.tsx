/**
 * Admin Services CRUD Page
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { useServicesList, useDeleteService } from "@/hooks/services/useServices";
import type { Service } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const { data: services, isLoading, error } = useServicesList();
  const deleteService = useDeleteService();

  const handleAddService = () => {
    setModalMode("create");
    setSelectedService(undefined);
    setModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setModalMode("edit");
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      await deleteService.mutateAsync(service.id);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCategoryLabel = (serviceName: string): string => {
    const name = serviceName.toLowerCase();
    if (name.includes("hair") || name.includes("cut") || name.includes("color") || name.includes("balayage")) {
      return "Hair";
    }
    if (name.includes("manicure") || name.includes("pedicure") || name.includes("nail")) {
      return "Nails";
    }
    if (name.includes("facial") || name.includes("skincare")) {
      return "Skincare";
    }
    if (name.includes("massage")) {
      return "Massage";
    }
    if (name.includes("wax")) {
      return "Waxing";
    }
    if (name.includes("makeup")) {
      return "Makeup";
    }
    return "Other";
  };

  return (
    <AppShell>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Services</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your salon services and pricing
            </p>
          </div>
          <Button onClick={handleAddService} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-glownova-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading services...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-status-error">Failed to load services</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please try refreshing the page
                </p>
              </div>
            ) : !services || services.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mb-4 text-4xl">💇</div>
                <h3 className="text-lg font-semibold">No services yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating your first service
                </p>
                <Button onClick={handleAddService} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.name}
                          {service.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getCategoryLabel(service.name)}
                          </Badge>
                        </TableCell>
                        <TableCell>{service.durationMinutes} min</TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(service.priceCents)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.isActive !== false ? "success" : "outline"}>
                            {service.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditService(service)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service)}
                              className="gap-2 text-status-error hover:text-status-error"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Pagination Footer (placeholder for future) */}
        {services && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 flex items-center justify-between text-sm text-muted-foreground"
          >
            <p>Showing {services.length} service(s)</p>
          </motion.div>
        )}
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        mode={modalMode}
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultValues={selectedService}
      />
    </AppShell>
  );
}

