/**
 * Booking Step 5: Confirmation
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, Check, Download, Home } from "lucide-react";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  
  // Get booking details from URL params (passed from details page)
  const serviceName = searchParams.get("serviceName") || "Selected Service";
  const staffName = searchParams.get("staffName") || "Selected Staff";
  const bookingDate = searchParams.get("date");
  const bookingTime = searchParams.get("time");

  if (!bookingId) {
    router.replace("/booking/services");
    return null;
  }

  const handleAddToCalendar = () => {
    // Generate ICS file content
    const icsContent = generateICSFile({
      title: "Salon Appointment",
      description: "Your appointment at GLOWNOVA",
      location: "GLOWNOVA Demo Salon",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow for demo
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
    });

    // Create blob and download
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "appointment.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleBackToHome = () => {
    router.push("/booking/services");
  };

  return (
    <div className="min-h-screen bg-glownova-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-100 to-sage-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-status-success"
            >
              <Check className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="font-heading text-3xl font-bold text-glownova-primary-dark mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your appointment has been successfully scheduled
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-glownova-primary" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Booking ID */}
              <div className="flex items-center justify-between rounded-lg bg-glownova-bg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="font-mono font-semibold">{bookingId}</p>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold">{serviceName}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Specialist</p>
                  <p className="font-semibold">{staffName}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{bookingDate || "Date"}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{bookingTime || "Time"}</p>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📧 A confirmation email has been sent to your email address.
                  <br />
                  📱 You'll also receive an SMS reminder 24 hours before your appointment.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddToCalendar}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Download className="h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  onClick={handleBackToHome}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-lg border border-border bg-card p-6"
          >
            <h3 className="mb-3 font-semibold">Need to make changes?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To reschedule or cancel your appointment, please call us at{" "}
              <a href="tel:+15551234567" className="text-glownova-primary hover:underline">
                +1 (555) 123-4567
              </a>{" "}
              or email{" "}
              <a href="mailto:contact@demo-salon.com" className="text-glownova-primary hover:underline">
                contact@demo-salon.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Please provide your booking reference number when contacting us.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Generate ICS file content for calendar
 */
function generateICSFile({
  title,
  description,
  location,
  startTime,
  endTime,
}: {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}) {
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GLOWNOVA//Salon Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@glownova.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Appointment in 24 hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

