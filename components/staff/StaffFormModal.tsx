/**
 * Staff Form Modal Component
 * Create/Edit staff with profile fields, skills, and working hours
 */

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WorkingHoursEditor } from "@/components/staff/WorkingHoursEditor";
import { useCreateStaff, useUpdateStaff } from "@/hooks/api/useStaff";
import { X } from "lucide-react";
import type { StaffProfile, Service, WorkingHours } from "@/lib/types/api";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormModalProps {
  staff?: StaffProfile | null;
  services: Service[];
  open: boolean;
  onClose: () => void;
}

export function StaffFormModal({
  staff,
  services,
  open,
  onClose,
}: StaffFormModalProps) {
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const [skills, setSkills] = useState<string[]>(staff?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    staff?.workingHours || []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff
      ? {
          name: staff.name,
          bio: staff.bio || "",
          email: "",
        }
      : undefined,
  });

  useEffect(() => {
    if (open && staff) {
      reset({
        name: staff.name,
        bio: staff.bio || "",
        email: "",
      });
      setSkills(staff.skills || []);
      setWorkingHours(staff.workingHours || []);
    } else if (open && !staff) {
      reset({
        name: "",
        bio: "",
        email: "",
      });
      setSkills([]);
      setWorkingHours([]);
    }
  }, [open, staff, reset]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      const payload = {
        name: data.name,
        bio: data.bio,
        email: data.email || undefined,
        skills,
      };

      if (staff) {
        await updateStaff.mutateAsync({
          id: staff.id,
          data: {
            ...payload,
            workingHours,
          },
        });
      } else {
        await createStaff.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save staff:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff Member" : "New Staff Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="optional"
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us about this staff member..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills & Specialties</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Working Hours */}
          {staff && (
            <div>
              <Label>Working Hours</Label>
              <WorkingHoursEditor
                workingHours={workingHours}
                onChange={setWorkingHours}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : staff ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

