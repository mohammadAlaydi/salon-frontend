/**
 * Mini Calendar Component
 * Month view with day counts, clicking a day filters appointments
 */

"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointmentCounts?: Record<string, number>; // ISO date string => count
}

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  appointmentCounts = {},
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const count = appointmentCounts[dateKey] || 0;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "relative p-2 text-sm rounded-md transition-colors",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-glownova-primary text-white hover:bg-glownova-primary-dark",
                isCurrentDay && !isSelected && "font-bold ring-1 ring-glownova-primary",
                !isSelected && isCurrentMonth && "text-foreground"
              )}
              aria-label={`${format(day, "MMMM d, yyyy")}${count > 0 ? `, ${count} appointments` : ""}`}
              aria-pressed={isSelected}
            >
              <span className="block">{format(day, "d")}</span>
              {count > 0 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

