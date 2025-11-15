/**
 * Dashboard Metric Cards
 * Displays key metrics: Total bookings, Revenue, Completed, No-shows
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardData {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}

interface MetricCardsProps {
  metrics: MetricCardData[];
  isLoading?: boolean;
}

export function MetricCards({ metrics, isLoading }: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

function MetricCard({ label, value, subtext, variant = "default", icon }: MetricCardData) {
  const variantStyles = {
    default: "border-border",
    success: "border-status-success/20 bg-status-success/5",
    warning: "border-status-warning/20 bg-status-warning/5",
    error: "border-status-error/20 bg-status-error/5",
  };

  return (
    <Card className={cn("p-6", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-muted-foreground opacity-50">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

