/**
 * Admin Customers Page
 * List of customers with search and navigation to individual profiles
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomersList } from "@/hooks/api/useCustomers";
import { Search, UserPlus } from "lucide-react";
import { format } from "date-fns";

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: customers = [], isLoading } = useCustomersList(searchQuery);

  // Calculate visit counts from appointments (mock for now)
  const getCustomerStats = (customerId: string) => {
    // In real implementation, this would come from aggregated appointment data
    return {
      totalVisits: Math.floor(Math.random() * 20) + 1,
      lastVisit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    };
  };

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your customer database
            </p>
          </div>
          <Button onClick={() => router.push("/admin/customers/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No customers found" : "No customers yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => {
                    const stats = getCustomerStats(customer.id);
                    return (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/customers/${customer.id}`)}
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || "—"}</TableCell>
                        <TableCell>{customer.email || "—"}</TableCell>
                        <TableCell>{stats.totalVisits}</TableCell>
                        <TableCell>
                          {format(stats.lastVisit, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {customer.notes || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

