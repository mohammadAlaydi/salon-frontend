/**
 * Working Hours Editor Component
 * Weekday rows with start/end time pickers, toggle enabled, validation
 */

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { WorkingHours } from "@/lib/types/api";

interface WorkingHoursEditorProps {
  workingHours: WorkingHours[];
  onChange: (workingHours: WorkingHours[]) => void;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function WorkingHoursEditor({ workingHours, onChange }: WorkingHoursEditorProps) {
  const getDayHours = (dayOfWeek: number): WorkingHours | null => {
    return workingHours.find((h) => h.dayOfWeek === dayOfWeek) || null;
  };

  const handleToggleDay = (dayOfWeek: number) => {
    const existingHours = getDayHours(dayOfWeek);

    if (existingHours) {
      // Remove the day
      onChange(workingHours.filter((h) => h.dayOfWeek !== dayOfWeek));
    } else {
      // Add the day with default hours
      onChange([
        ...workingHours,
        {
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          breaks: [],
        },
      ]);
    }
  };

  const handleUpdateHours = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    onChange(
      workingHours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const validateTimes = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) return null;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end <= start) {
      return "End time must be after start time";
    }

    return null;
  };

  return (
    <div className="mt-2 space-y-3 border rounded-lg p-4">
      {DAYS.map((day) => {
        const dayHours = getDayHours(day.value);
        const isEnabled = Boolean(dayHours);
        const error = dayHours
          ? validateTimes(dayHours.startTime, dayHours.endTime)
          : null;

        return (
          <div
            key={day.value}
            className="flex items-center gap-4 py-2 border-b last:border-b-0"
          >
            <div className="flex items-center gap-2 w-32">
              <Switch
                checked={isEnabled}
                onCheckedChange={() => handleToggleDay(day.value)}
                id={`day-${day.value}`}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="font-medium cursor-pointer"
              >
                {day.label}
              </Label>
            </div>

            {isEnabled && dayHours ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`start-${day.value}`} className="text-sm text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id={`start-${day.value}`}
                    type="time"
                    value={dayHours.startTime}
                    onChange={(e) =>
                      handleUpdateHours(day.value, "startTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`end-${day.value}`} className="text-sm text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id={`end-${day.value}`}
                    type="time"
                    value={dayHours.endTime}
                    onChange={(e) =>
                      handleUpdateHours(day.value, "endTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground">Not working</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

