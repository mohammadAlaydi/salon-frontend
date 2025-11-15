/**
 * Central export for all TypeScript types
 */

export * from "./api";

// Import types needed for local interfaces
import type { User } from "./api";

// Additional frontend-specific types
export interface BookingState {
  step: number;
  serviceId?: string;
  staffId?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface TenantContext {
  tenantId: string;
  salonSlug: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

