/**
 * Integrations Editor Component
 * Configure n8n webhook with test functionality
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useUpdateSalon, useTestWebhook } from "@/hooks/api/useSalon";
import { Save, Send, ExternalLink } from "lucide-react";
import type { Salon } from "@/lib/types/api";

interface IntegrationsEditorProps {
  salon: Salon;
}

export function IntegrationsEditor({ salon }: IntegrationsEditorProps) {
  const [webhookUrl, setWebhookUrl] = useState(
    (salon as any).n8nWebhookUrl || ""
  );

  const updateSalon = useUpdateSalon();
  const testWebhook = useTestWebhook();

  const handleSave = async () => {
    await updateSalon.mutateAsync({
      n8nWebhookUrl: webhookUrl,
    } as any);
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      return;
    }
    await testWebhook.mutateAsync(webhookUrl);
  };

  const hasChanges = webhookUrl !== ((salon as any).n8nWebhookUrl || "");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">n8n Webhook Integration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your salon to n8n for automated workflows
            </p>
          </div>
          <a
            href="https://n8n.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook/..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Appointment events will be sent to this URL
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSalon.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateSalon.isPending ? "Saving..." : "Save URL"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!webhookUrl || testWebhook.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {testWebhook.isPending ? "Testing..." : "Send Test Event"}
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Log Card */}
      <Card className="p-4 bg-muted">
        <h4 className="font-medium text-sm mb-2">Events Sent</h4>
        <p className="text-xs text-muted-foreground">
          Appointment created, updated, cancelled, and completed events will be sent to your webhook.
        </p>
      </Card>
    </div>
  );
}

