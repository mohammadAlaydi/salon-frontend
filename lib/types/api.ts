/**
 * TypeScript types generated from OpenAPI specification
 * All types match the schemas defined in docs/openapi.json
 */

// ========== Auth Types ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ========== User & Roles ==========
export type UserRole = "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatarUrl?: string;
  salonId: string;
}

// ========== Salon & Branding ==========
export interface Salon {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  branding?: SalonBranding;
  timezone?: string;
}

export interface SalonBranding {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  darkModeEnabled?: boolean;
}

export interface SalonUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  branding?: SalonBranding;
  n8nWebhookUrl?: string;
}

export interface SalonOnboardRequest {
  salonName: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
}

export interface SalonOnboardResponse {
  salon: Salon;
  adminUser: User;
  auth: AuthResponse;
}

// ========== Customer Types ==========
export interface Customer {
  id: string;
  salonId: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

// ========== Service Types ==========
export interface Service {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  currency?: string;
  isActive?: boolean;
}

export interface ServiceCreateRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  currency?: string;
}

export interface ServiceUpdateRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  priceCents?: number;
  currency?: string;
  isActive?: boolean;
}

// ========== Staff Types ==========
export interface WorkingHoursBreak {
  startTime: string;
  endTime: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string;
  endTime: string;
  breaks?: WorkingHoursBreak[];
}

export interface StaffProfile {
  id: string;
  salonId: string;
  userId?: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  rating?: number;
  workingHours?: WorkingHours[];
}

export interface StaffCreateRequest {
  name: string;
  email?: string;
  bio?: string;
  skills?: string[];
}

export interface StaffUpdateRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  workingHours?: WorkingHours[];
}

export interface PublicStaffWithAvailability {
  staff: StaffProfile;
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  isReserved?: boolean;
}

// ========== Appointment Types ==========
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type AppointmentSource = "ADMIN" | "PUBLIC";

export interface Appointment {
  id: string;
  salonId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  source?: AppointmentSource;
}

export interface AppointmentCreateRequest {
  serviceId: string;
  staffId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface AppointmentUpdateRequest {
  serviceId?: string;
  staffId?: string;
  customerId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentStatusUpdateRequest {
  status: AppointmentStatus;
}

export interface PublicAppointmentCreateRequest {
  serviceId: string;
  staffId: string;
  startTime: string;
  notes?: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
}

// ========== Reports Types ==========
export interface TopServiceMetric {
  serviceId: string;
  count: number;
  revenueCents?: number;
}

export interface DailyReport {
  date: string;
  totalRevenueCents?: number;
  totalAppointments?: number;
  noShowCount?: number;
  topServices?: TopServiceMetric[];
}

// ========== Notification Types ==========
export type NotificationType = "EMAIL" | "SMS" | "WHATSAPP" | "WEBHOOK";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationLog {
  id: string;
  appointmentId: string;
  type: NotificationType;
  status: NotificationStatus;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ========== Webhook Types ==========
export interface N8nCallbackPayload {
  event?: string;
  appointmentId?: string;
  status?: string;
  meta?: Record<string, unknown>;
}

// ========== Error Response ==========
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ========== Query & Pagination Types ==========
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AppointmentFilters {
  from?: string;
  to?: string;
  staffId?: string;
  status?: AppointmentStatus;
}

// ========== API Response Helpers ==========
export type ApiResponse<T> = {
  data: T;
  error?: never;
};

export type ApiError = {
  data?: never;
  error: ErrorResponse;
};

export type ApiResult<T> = ApiResponse<T> | ApiError;

