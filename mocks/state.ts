/**
 * In-memory state container for MSW
 * Simulates a multi-tenant database
 */

import type {
  Salon,
  User,
  StaffProfile,
  Service,
  Customer,
  Appointment,
  NotificationLog,
} from "@/lib/types/api";

export interface MockState {
  salons: Record<string, Salon>;
  users: Record<string, User & { password: string }>;
  staffProfiles: Record<string, StaffProfile[]>;
  services: Record<string, Service[]>;
  customers: Record<string, Customer[]>;
  appointments: Record<string, Appointment[]>;
  notificationLogs: Record<string, NotificationLog[]>;
  idempotencyStore: Record<string, { requestHash: string; response: unknown }>;
  refreshTokens: Record<string, { userId: string; expiresAt: number }>;
}

// Global mock state
export const mockState: MockState = {
  salons: {},
  users: {},
  staffProfiles: {},
  services: {},
  customers: {},
  appointments: {},
  notificationLogs: {},
  idempotencyStore: {},
  refreshTokens: {},
};

// Mock config for simulating latency and errors
export const mockConfig = {
  latencyMs: 150,
  failNextRequests: {} as Record<string, number>,
  conflictRate: {} as Record<string, number>,
};

// Helper functions to access tenant-scoped data
export function getTenantSalon(tenantSlug: string): Salon | undefined {
  return Object.values(mockState.salons).find((salon) => salon.slug === tenantSlug);
}

export function getTenantServices(salonId: string): Service[] {
  return mockState.services[salonId] || [];
}

export function getTenantStaff(salonId: string): StaffProfile[] {
  return mockState.staffProfiles[salonId] || [];
}

export function getTenantCustomers(salonId: string): Customer[] {
  return mockState.customers[salonId] || [];
}

export function getTenantAppointments(salonId: string): Appointment[] {
  return mockState.appointments[salonId] || [];
}

export function getTenantNotifications(salonId: string): NotificationLog[] {
  return mockState.notificationLogs[salonId] || [];
}

// Initialize empty arrays for a salon
export function initializeTenantData(salonId: string) {
  if (!mockState.services[salonId]) mockState.services[salonId] = [];
  if (!mockState.staffProfiles[salonId]) mockState.staffProfiles[salonId] = [];
  if (!mockState.customers[salonId]) mockState.customers[salonId] = [];
  if (!mockState.appointments[salonId]) mockState.appointments[salonId] = [];
  if (!mockState.notificationLogs[salonId]) mockState.notificationLogs[salonId] = [];
}

// Reset state (useful for tests)
export function resetMockState() {
  mockState.salons = {};
  mockState.users = {};
  mockState.staffProfiles = {};
  mockState.services = {};
  mockState.customers = {};
  mockState.appointments = {};
  mockState.notificationLogs = {};
  mockState.idempotencyStore = {};
  mockState.refreshTokens = {};
}

// Simulated delay
export async function simulateDelay() {
  if (mockConfig.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, mockConfig.latencyMs));
  }
}

