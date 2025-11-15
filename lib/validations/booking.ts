/**
 * Validation schemas for Booking
 */

import { z } from "zod";

export const bookingDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

export type BookingDetailsData = z.infer<typeof bookingDetailsSchema>;

