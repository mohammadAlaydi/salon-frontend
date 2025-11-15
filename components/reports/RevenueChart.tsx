/**
 * Revenue Chart Component
 * Line chart showing revenue over time using Recharts
 */

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available for the selected period
      </div>
    );
  }

  // Format data for display
  const chartData = data.map((item) => ({
    ...item,
    displayDate: format(new Date(item.date), "MMM d"),
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="displayDate"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number, name: string) => {
              if (name === "revenue") return [`$${value.toFixed(2)}`, "Revenue"];
              return [value, "Appointments"];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--color-primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--color-primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

