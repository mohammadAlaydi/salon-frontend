/**
 * Booking Step 3: Time Selection
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePublicAvailability, usePublicStaff } from "@/hooks/booking/useBooking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

export default function BookingTimePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Format date for API
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // Fetch availability for the selected date
  const { data: availability, isLoading } = usePublicAvailability(
    serviceId || undefined,
    staffId || undefined,
    formattedDate
  );

  // Fetch staff info for display
  const { data: staffList } = usePublicStaff(serviceId || undefined);

  if (!serviceId || !staffId) {
    router.replace("/booking/services");
    return null;
  }

  const staffData = staffList?.find((s) => s.staff.id === staffId);

  // Filter slots for selected date (already filtered by API, but double-check)
  const availableSlotsForDate = (availability || []).filter((slot) => !slot.isReserved);

  // Group slots by time
  const timeSlots = availableSlotsForDate.map((slot) => ({
    time: format(parseISO(slot.startTime), "h:mm a"),
    startTime: slot.startTime,
  }));

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const handleSelectTime = (startTime: string) => {
    setSelectedTime(startTime);
  };

  const handleContinue = () => {
    if (selectedTime) {
      router.push(
        `/booking/details?serviceId=${serviceId}&staffId=${staffId}&startTime=${encodeURIComponent(selectedTime)}`
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Disable past dates (we'll check availability when date is selected)
  const isDateDisabled = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="min-h-screen bg-glownova-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-100 to-sage-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Staff
            </Button>
            <h1 className="font-heading text-3xl font-bold text-glownova-primary-dark mb-2">
              Select Date & Time
            </h1>
            <p className="text-muted-foreground">
              {staffData ? `Booking with ${staffData.staff.name}` : "Choose your preferred appointment time"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-glownova-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading availability...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Calendar */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Choose a Date</h2>
              <Calendar
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                disabled={isDateDisabled}
                minDate={new Date()}
                className="mx-auto"
              />
            </Card>

            {/* Time Slots */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Times
              </h2>

              {timeSlots.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mb-4 text-5xl">📅</div>
                  <p className="text-muted-foreground">
                    No available times for {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please select a different date
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.startTime}
                        variant={selectedTime === slot.startTime ? "default" : "outline"}
                        onClick={() => handleSelectTime(slot.startTime)}
                        className="h-auto py-3"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>

                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Button onClick={handleContinue} className="w-full" size="lg">
                        Continue to Details
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

