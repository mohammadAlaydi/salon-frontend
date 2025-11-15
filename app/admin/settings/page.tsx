/**
 * Admin Settings Page
 * Salon profile, branding, and webhook integration settings
 */

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandingEditor } from "@/components/settings/BrandingEditor";
import { IntegrationsEditor } from "@/components/settings/IntegrationsEditor";
import { useSalonSettings } from "@/hooks/api/useSalon";

export default function SettingsPage() {
  const { data: salon, isLoading } = useSalonSettings();

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!salon) {
    return (
      <AppShell>
        <div className="p-8">
          <p className="text-center text-muted-foreground">
            Unable to load salon settings
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your salon profile and integrations
          </p>
        </div>

        <div className="space-y-6">
          {/* Branding */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Branding</h2>
            <BrandingEditor salon={salon} />
          </Card>

          {/* Integrations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <IntegrationsEditor salon={salon} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

