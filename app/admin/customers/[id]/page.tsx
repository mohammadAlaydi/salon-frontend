/**
 * Customer Profile Page
 * View customer details, visit history, and notes
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CustomerProfile } from "@/components/customers/CustomerProfile";
import { useCustomer } from "@/hooks/api/useCustomers";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { data: customer, isLoading, error } = useCustomer(customerId);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error || !customer) {
    return (
      <AppShell>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Customer not found</p>
            <Button onClick={() => router.push("/admin/customers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="mt-1 text-muted-foreground">Customer Profile</p>
          </div>
        </div>

        <CustomerProfile customer={customer} />
      </div>
    </AppShell>
  );
}

