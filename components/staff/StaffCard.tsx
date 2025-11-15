/**
 * Staff Card Component
 * Displays staff member with avatar, skills, rating, and actions
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star } from "lucide-react";
import { useDeleteStaff } from "@/hooks/api/useStaff";
import type { StaffProfile } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface StaffCardProps {
  staff: StaffProfile;
  onEdit: (staff: StaffProfile) => void;
}

export function StaffCard({ staff, onEdit }: StaffCardProps) {
  const deleteStaff = useDeleteStaff();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove ${staff.name} from staff?`)) {
      await deleteStaff.mutateAsync(staff.id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <div className="flex h-full w-full items-center justify-center bg-glownova-primary text-white text-xl font-medium">
              {staff.name.charAt(0)}
            </div>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{staff.name}</h3>
            {staff.rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{staff.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {staff.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {staff.bio}
        </p>
      )}

      {staff.skills && staff.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {staff.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {staff.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{staff.skills.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {staff.workingHours && staff.workingHours.length > 0 && (
        <div className="text-sm text-muted-foreground mb-4">
          Working {staff.workingHours.length} {staff.workingHours.length === 1 ? "day" : "days"} per week
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(staff)}
          className="flex-1"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteStaff.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

