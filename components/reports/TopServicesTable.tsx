/**
 * Top Services Table Component
 * Shows top services with count and revenue, includes CSV export
 */

"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

interface TopService {
  serviceId: string;
  serviceName: string;
  count: number;
  revenueCents: number;
}

interface TopServicesTableProps {
  services: TopService[];
  isLoading?: boolean;
}

export function TopServicesTable({ services, isLoading }: TopServicesTableProps) {
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Service", "Bookings", "Revenue"];
    const rows = services.map((service) => [
      service.serviceName,
      service.count.toString(),
      `$${(service.revenueCents / 100).toFixed(2)}`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `top-services-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services data available
      </div>
    );
  }

  const totalRevenue = services.reduce((sum, s) => sum + s.revenueCents, 0);
  const totalBookings = services.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Avg per Booking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.serviceId}>
                <TableCell className="font-medium">{service.serviceName}</TableCell>
                <TableCell className="text-right">{service.count}</TableCell>
                <TableCell className="text-right">
                  ${(service.revenueCents / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${(service.revenueCents / service.count / 100).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/50">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalBookings}</TableCell>
              <TableCell className="text-right">
                ${(totalRevenue / 100).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">—</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

