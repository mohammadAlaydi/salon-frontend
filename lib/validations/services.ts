/**
 * Validation schemas for Services
 */

import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  price: z.number().min(0, "Price cannot be negative"),
  description: z.string().optional(),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

