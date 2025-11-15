/**
 * MSW handlers for public booking endpoints
 */

import { http, HttpResponse } from "msw";
import {
  mockState,
  simulateDelay,
  getTenantSalon,
  getTenantServices,
  getTenantStaff,
  getTenantCustomers,
  getTenantAppointments,
} from "../state";
import { resolveTenant, generateUUID, generateIdempotencyHash } from "../utils/tenantResolver";
import type {
  PublicAppointmentCreateRequest,
  Appointment,
  Customer,
} from "@/lib/types/api";

export const publicHandlers = [
  // GET /public/salons/:slug
  http.get("/public/salons/:slug", async ({ params }) => {
    await simulateDelay();

    const { slug } = params;
    const salon = Object.values(mockState.salons).find((s) => s.slug === slug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json(salon, { status: 200 });
  }),

  // GET /public/salons/:slug/services
  http.get("/public/salons/:slug/services", async ({ params }) => {
    await simulateDelay();

    const { slug } = params;
    const salon = Object.values(mockState.salons).find((s) => s.slug === slug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const services = getTenantServices(salon.id).filter((s) => s.isActive !== false);

    return HttpResponse.json(services, { status: 200 });
  }),

  // GET /public/salons/:slug/staff
  http.get("/public/salons/:slug/staff", async ({ params }) => {
    await simulateDelay();

    const { slug } = params;
    const salon = Object.values(mockState.salons).find((s) => s.slug === slug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const staffProfiles = getTenantStaff(salon.id);

    return HttpResponse.json(staffProfiles, { status: 200 });
  }),

  // GET /public/services
  http.get("/public/services", async ({ request }) => {
    await simulateDelay();

    const tenantSlug = resolveTenant(request);
    const salon = getTenantSalon(tenantSlug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const services = getTenantServices(salon.id).filter((s) => s.isActive !== false);

    return HttpResponse.json(services, { status: 200 });
  }),

  // GET /public/staff
  http.get("/public/staff", async ({ request }) => {
    await simulateDelay();

    const tenantSlug = resolveTenant(request);
    const salon = getTenantSalon(tenantSlug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const serviceId = url.searchParams.get("serviceId");

    const staffProfiles = getTenantStaff(salon.id);

    // Simple availability calculation (mock)
    const staffWithAvailability = staffProfiles.map((staff) => {
      // Generate mock availability slots for next 7 days
      const availability = [];
      const now = new Date();

      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);

        // Find working hours for this day
        const dayOfWeek = date.getDay();
        const workingHour = staff.workingHours?.find((wh) => wh.dayOfWeek === dayOfWeek);

        if (workingHour) {
          // Generate 30-minute slots
          const startHour = parseInt(workingHour.startTime.split(":")[0]);
          const endHour = parseInt(workingHour.endTime.split(":")[0]);

          for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = new Date(date);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(date);
            slotEnd.setHours(hour, 30, 0, 0);

            availability.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              isReserved: false,
            });
          }
        }
      }

      return {
        staff,
        availability,
      };
    });

    return HttpResponse.json(staffWithAvailability, { status: 200 });
  }),

  // GET /public/availability
  http.get("/public/availability", async ({ request }) => {
    await simulateDelay();

    const tenantSlug = resolveTenant(request);
    const salon = getTenantSalon(tenantSlug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const serviceId = url.searchParams.get("serviceId");
    const staffId = url.searchParams.get("staffId");
    const dateParam = url.searchParams.get("date");

    if (!staffId) {
      return HttpResponse.json(
        { message: "staffId is required", code: "MISSING_STAFF_ID" },
        { status: 400 }
      );
    }

    const staff = getTenantStaff(salon.id).find((s) => s.id === staffId);
    if (!staff) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Parse date or use today
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dayOfWeek = targetDate.getDay();

    // Find working hours for this day
    const workingHour = staff.workingHours?.find((wh) => wh.dayOfWeek === dayOfWeek);

    const availability = [];

    if (workingHour) {
      const startHour = parseInt(workingHour.startTime.split(":")[0]);
      const endHour = parseInt(workingHour.endTime.split(":")[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const slotStart = new Date(targetDate);
          slotStart.setHours(hour, min, 0, 0);
          const slotEnd = new Date(targetDate);
          slotEnd.setHours(hour, min + 30, 0, 0);

          // Check if slot is in the past
          if (slotStart < new Date()) {
            continue;
          }

          availability.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isReserved: false,
          });
        }
      }
    }

    return HttpResponse.json(availability, { status: 200 });
  }),

  // POST /public/appointments
  http.post("/public/appointments", async ({ request }) => {
    await simulateDelay();

    const tenantSlug = resolveTenant(request);
    const salon = getTenantSalon(tenantSlug);

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as PublicAppointmentCreateRequest;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    // Check idempotency
    if (idempotencyKey) {
      const hash = generateIdempotencyHash("/public/appointments", tenantSlug, body);
      const existing = mockState.idempotencyStore[idempotencyKey];

      if (existing && existing.requestHash === hash) {
        // Return cached response
        return HttpResponse.json(existing.response as object, {
          status: 201,
          headers: { "Idempotent-Replay": "true" },
        });
      }

      if (existing && existing.requestHash !== hash) {
        return HttpResponse.json(
          { message: "Idempotency key reused with different request", code: "IDEMPOTENCY_MISMATCH" },
          { status: 409 }
        );
      }
    }

    // Validate service exists
    const service = getTenantServices(salon.id).find((s) => s.id === body.serviceId);
    if (!service) {
      return HttpResponse.json(
        { message: "Service not found", code: "SERVICE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Validate staff exists
    const staff = getTenantStaff(salon.id).find((s) => s.id === body.staffId);
    if (!staff) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Find or create customer
    let customer = getTenantCustomers(salon.id).find((c) => c.phone === body.customer.phone);

    if (!customer) {
      customer = {
        id: generateUUID(),
        salonId: salon.id,
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!mockState.customers[salon.id]) {
        mockState.customers[salon.id] = [];
      }
      mockState.customers[salon.id].push(customer);
    }

    // Check for conflicts
    const appointments = getTenantAppointments(salon.id);
    const startTime = new Date(body.startTime);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

    const hasConflict = appointments.some((apt) => {
      if (apt.staffId !== body.staffId) return false;
      if (apt.status === "CANCELLED") return false;

      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);

      return (
        (startTime >= aptStart && startTime < aptEnd) ||
        (endTime > aptStart && endTime <= aptEnd) ||
        (startTime <= aptStart && endTime >= aptEnd)
      );
    });

    if (hasConflict) {
      return HttpResponse.json(
        { message: "Selected time is no longer available", code: "SLOT_CONFLICT" },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment: Appointment = {
      id: generateUUID(),
      salonId: salon.id,
      serviceId: body.serviceId,
      staffId: body.staffId,
      customerId: customer.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "CONFIRMED",
      notes: body.notes,
      source: "PUBLIC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!mockState.appointments[salon.id]) {
      mockState.appointments[salon.id] = [];
    }
    mockState.appointments[salon.id].push(appointment);

    // Store idempotency
    if (idempotencyKey) {
      mockState.idempotencyStore[idempotencyKey] = {
        requestHash: generateIdempotencyHash("/public/appointments", tenantSlug, body),
        response: appointment,
      };
    }

    return HttpResponse.json(appointment, {
      status: 201,
      headers: idempotencyKey ? { "Idempotent-Replay": "false" } : {},
    });
  }),
];

