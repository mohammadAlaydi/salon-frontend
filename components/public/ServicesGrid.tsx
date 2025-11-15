/**
 * Services Grid Component
 * Display services in a responsive grid with pricing
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, DollarSign } from "lucide-react";
import type { Service } from "@/lib/types/api";

interface ServicesGridProps {
  services: Service[];
  isLoading?: boolean;
}

export function ServicesGrid({ services, isLoading }: ServicesGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No services available at the moment
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card
          key={service.id}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold">{service.name}</h3>
            {service.isActive === false && (
              <Badge variant="secondary">Unavailable</Badge>
            )}
          </div>

          {service.description && (
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {service.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{service.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                ${(service.priceCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

