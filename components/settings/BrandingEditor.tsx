/**
 * Branding Editor Component
 * Edit salon branding: primary color, logo, with live preview
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useUpdateSalon } from "@/hooks/api/useSalon";
import { Save } from "lucide-react";
import type { Salon } from "@/lib/types/api";

interface BrandingEditorProps {
  salon: Salon;
}

export function BrandingEditor({ salon }: BrandingEditorProps) {
  const [primaryColor, setPrimaryColor] = useState(
    salon.branding?.primaryColor || "#E6A4B4"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    salon.branding?.secondaryColor || "#A8C3A2"
  );

  const updateSalon = useUpdateSalon();

  useEffect(() => {
    setPrimaryColor(salon.branding?.primaryColor || "#E6A4B4");
    setSecondaryColor(salon.branding?.secondaryColor || "#A8C3A2");
  }, [salon]);

  const handleSave = async () => {
    await updateSalon.mutateAsync({
      branding: {
        ...salon.branding,
        primaryColor,
        secondaryColor,
      },
    });
  };

  const hasChanges =
    primaryColor !== (salon.branding?.primaryColor || "#E6A4B4") ||
    secondaryColor !== (salon.branding?.secondaryColor || "#A8C3A2");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Color Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-24 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#E6A4B4"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used for buttons, links, and primary UI elements
            </p>
          </div>

          <div>
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-24 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#A8C3A2"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used for accents and secondary UI elements
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSalon.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateSalon.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          <div className="space-y-4">
            <div
              className="h-24 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Color
            </div>
            <div
              className="h-24 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Color
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

