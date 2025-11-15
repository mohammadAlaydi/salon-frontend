/**
 * Booking Step 4: Customer Details
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingDetailsSchema, type BookingDetailsData } from "@/lib/validations/booking";
import { useCreatePublicBooking, usePublicServices, usePublicStaff } from "@/hooks/booking/useBooking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function BookingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");
  const startTime = searchParams.get("startTime");

  const createBooking = useCreatePublicBooking();
  
  // Fetch service and staff details for display
  const { data: services } = usePublicServices();
  const { data: staffList } = usePublicStaff(serviceId || undefined);
  
  const selectedService = services?.find((s) => s.id === serviceId);
  const selectedStaff = staffList?.find((s) => s.staff.id === staffId)?.staff;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsData>({
    resolver: zodResolver(bookingDetailsSchema),
  });

  if (!serviceId || !staffId || !startTime) {
    router.replace("/booking/services");
    return null;
  }

  const onSubmit = async (data: BookingDetailsData) => {
    try {
      const appointment = await createBooking.mutateAsync({
        serviceId: serviceId!,
        staffId: staffId!,
        startTime: startTime!,
        notes: data.notes,
        customer: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone,
        },
      });

      // Pass booking details to confirmation page
      const params = new URLSearchParams({
        id: appointment.id,
        serviceName: selectedService?.name || "Service",
        staffName: selectedStaff?.name || "Staff",
        date: format(parseISO(startTime!), "MMMM d, yyyy"),
        time: format(parseISO(startTime!), "h:mm a"),
      });

      router.push(`/booking/confirmation?${params.toString()}`);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formattedDateTime = startTime
    ? format(parseISO(startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")
    : "";

  return (
    <div className="min-h-screen bg-glownova-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-100 to-sage-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Time Selection
            </Button>
            <h1 className="font-heading text-3xl font-bold text-glownova-primary-dark mb-2">
              Your Details
            </h1>
            <p className="text-muted-foreground">
              We'll use this information to confirm your booking
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-8">
            {/* Booking Summary */}
            <div className="mb-8 rounded-lg bg-glownova-bg p-4 space-y-2">
              <h3 className="mb-3 font-semibold">Booking Summary</h3>
              {selectedService && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Service:</span>{" "}
                  <span className="font-medium">{selectedService.name}</span>
                </p>
              )}
              {selectedStaff && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Specialist:</span>{" "}
                  <span className="font-medium">{selectedStaff.name}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="text-muted-foreground">Date & Time:</span>{" "}
                <span className="font-medium">📅 {formattedDateTime}</span>
              </p>
              {selectedService && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">{selectedService.durationMinutes} minutes</span>
                </p>
              )}
              {selectedService && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Price:</span>{" "}
                  <span className="font-medium text-glownova-primary">
                    ${(selectedService.priceCents / 100).toFixed(2)}
                  </span>
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-status-error">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-status-error">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll send your confirmation to this email
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-status-error">{errors.phone.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes for your appointment..."
                  rows={4}
                  disabled={isSubmitting}
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-sm text-status-error">{errors.notes.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Confirming Booking..." : "Confirm Booking"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By confirming, you agree to our cancellation policy
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

