/**
 * Staff Showcase Component
 * Display staff members with photos, names, and specialties
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import type { StaffProfile } from "@/lib/types/api";

interface StaffShowcaseProps {
  staff: StaffProfile[];
  isLoading?: boolean;
}

export function StaffShowcase({ staff, isLoading }: StaffShowcaseProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-2 justify-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {staff.map((member) => (
        <Card key={member.id} className="p-6 text-center hover:shadow-lg transition-shadow">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-glownova-primary text-white text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
            )}
          </Avatar>

          <h3 className="text-xl font-semibold mb-1">{member.name}</h3>

          {member.rating && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{member.rating.toFixed(1)}</span>
            </div>
          )}

          {member.bio && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {member.bio}
            </p>
          )}

          {member.skills && member.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {member.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{member.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

