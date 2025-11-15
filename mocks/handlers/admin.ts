/**
 * MSW handlers for admin endpoints
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
import {
  extractBearerToken,
  validateMockToken,
  resolveTenant,
  generateUUID,
  generateIdempotencyHash,
} from "../utils/tenantResolver";
import type {
  Service,
  ServiceCreateRequest,
  ServiceUpdateRequest,
  StaffProfile,
  StaffCreateRequest,
  StaffUpdateRequest,
  WorkingHours,
  Customer,
  CustomerCreateRequest,
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentStatusUpdateRequest,
  Salon,
  SalonUpdateRequest,
} from "@/lib/types/api";

// Helper to check authentication and return user
function authenticate(request: Request) {
  const token = extractBearerToken(request);
  if (!token) {
    return { error: HttpResponse.json({ message: "Unauthorized", code: "NO_TOKEN" }, { status: 401 }) };
  }

  const payload = validateMockToken(token);
  if (!payload) {
    return { error: HttpResponse.json({ message: "Invalid or expired token", code: "INVALID_TOKEN" }, { status: 401 }) };
  }

  const user = mockState.users[payload.sub as string];
  if (!user) {
    return { error: HttpResponse.json({ message: "User not found", code: "USER_NOT_FOUND" }, { status: 401 }) };
  }

  return { user, payload };
}

export const adminHandlers = [
  // ========== Services CRUD ==========

  // GET /admin/services
  http.get("/admin/services", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const services = getTenantServices(user.salonId);

    return HttpResponse.json(services, { status: 200 });
  }),

  // POST /admin/services
  http.post("/admin/services", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const body = (await request.json()) as ServiceCreateRequest;

    const service: Service = {
      id: generateUUID(),
      salonId: user.salonId,
      name: body.name,
      description: body.description,
      durationMinutes: body.durationMinutes,
      priceCents: body.priceCents,
      currency: body.currency || "USD",
      isActive: true,
    };

    if (!mockState.services[user.salonId]) {
      mockState.services[user.salonId] = [];
    }
    mockState.services[user.salonId].push(service);

    return HttpResponse.json(service, { status: 201 });
  }),

  // PUT /admin/services/:id
  http.put("/admin/services/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as ServiceUpdateRequest;

    const services = getTenantServices(user.salonId);
    const serviceIndex = services.findIndex((s) => s.id === id);

    if (serviceIndex === -1) {
      return HttpResponse.json(
        { message: "Service not found", code: "SERVICE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedService = {
      ...services[serviceIndex],
      ...body,
    };

    mockState.services[user.salonId][serviceIndex] = updatedService;

    return HttpResponse.json(updatedService, { status: 200 });
  }),

  // DELETE /admin/services/:id
  http.delete("/admin/services/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const services = getTenantServices(user.salonId);
    const serviceIndex = services.findIndex((s) => s.id === id);

    if (serviceIndex === -1) {
      return HttpResponse.json(
        { message: "Service not found", code: "SERVICE_NOT_FOUND" },
        { status: 404 }
      );
    }

    mockState.services[user.salonId].splice(serviceIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // ========== Staff CRUD ==========

  // GET /admin/staff
  http.get("/admin/staff", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const staff = getTenantStaff(user.salonId);

    return HttpResponse.json(staff, { status: 200 });
  }),

  // POST /admin/staff
  http.post("/admin/staff", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const body = (await request.json()) as StaffCreateRequest;

    const staffProfile: StaffProfile = {
      id: generateUUID(),
      salonId: user.salonId,
      name: body.name,
      bio: body.bio,
      skills: body.skills || [],
      workingHours: [],
    };

    if (!mockState.staffProfiles[user.salonId]) {
      mockState.staffProfiles[user.salonId] = [];
    }
    mockState.staffProfiles[user.salonId].push(staffProfile);

    return HttpResponse.json(staffProfile, { status: 201 });
  }),

  // PUT /admin/staff/:id
  http.put("/admin/staff/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as StaffUpdateRequest;

    const staff = getTenantStaff(user.salonId);
    const staffIndex = staff.findIndex((s) => s.id === id);

    if (staffIndex === -1) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedStaff = {
      ...staff[staffIndex],
      ...body,
    };

    mockState.staffProfiles[user.salonId][staffIndex] = updatedStaff;

    return HttpResponse.json(updatedStaff, { status: 200 });
  }),

  // DELETE /admin/staff/:id
  http.delete("/admin/staff/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const staff = getTenantStaff(user.salonId);
    const staffIndex = staff.findIndex((s) => s.id === id);

    if (staffIndex === -1) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    mockState.staffProfiles[user.salonId].splice(staffIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // GET /admin/staff/:id/schedule
  http.get("/admin/staff/:id/schedule", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const staff = getTenantStaff(user.salonId);
    const staffMember = staff.find((s) => s.id === id);

    if (!staffMember) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json(staffMember.workingHours || [], { status: 200 });
  }),

  // PUT /admin/staff/:id/schedule
  http.put("/admin/staff/:id/schedule", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as { workingHours: WorkingHours[] };

    const staff = getTenantStaff(user.salonId);
    const staffIndex = staff.findIndex((s) => s.id === id);

    if (staffIndex === -1) {
      return HttpResponse.json(
        { message: "Staff not found", code: "STAFF_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedStaff = {
      ...staff[staffIndex],
      workingHours: body.workingHours,
    };

    mockState.staffProfiles[user.salonId][staffIndex] = updatedStaff;

    return HttpResponse.json(updatedStaff, { status: 200 });
  }),

  // ========== Customers CRUD ==========

  // GET /admin/customers
  http.get("/admin/customers", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const customers = getTenantCustomers(user.salonId);

    return HttpResponse.json(customers, { status: 200 });
  }),

  // GET /admin/customers/:id
  http.get("/admin/customers/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const customers = getTenantCustomers(user.salonId);
    const customer = customers.find((c) => c.id === id);

    if (!customer) {
      return HttpResponse.json(
        { message: "Customer not found", code: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json(customer, { status: 200 });
  }),

  // POST /admin/customers
  http.post("/admin/customers", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const body = (await request.json()) as CustomerCreateRequest;

    const customer: Customer = {
      id: generateUUID(),
      salonId: user.salonId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!mockState.customers[user.salonId]) {
      mockState.customers[user.salonId] = [];
    }
    mockState.customers[user.salonId].push(customer);

    return HttpResponse.json(customer, { status: 201 });
  }),

  // PUT /admin/customers/:id
  http.put("/admin/customers/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as Partial<CustomerCreateRequest>;

    const customers = getTenantCustomers(user.salonId);
    const customerIndex = customers.findIndex((c) => c.id === id);

    if (customerIndex === -1) {
      return HttpResponse.json(
        { message: "Customer not found", code: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedCustomer = {
      ...customers[customerIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    mockState.customers[user.salonId][customerIndex] = updatedCustomer;

    return HttpResponse.json(updatedCustomer, { status: 200 });
  }),

  // DELETE /admin/customers/:id
  http.delete("/admin/customers/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const customers = getTenantCustomers(user.salonId);
    const customerIndex = customers.findIndex((c) => c.id === id);

    if (customerIndex === -1) {
      return HttpResponse.json(
        { message: "Customer not found", code: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    mockState.customers[user.salonId].splice(customerIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // ========== Appointments CRUD ==========

  // GET /admin/appointments
  http.get("/admin/appointments", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const url = new URL(request.url);
    
    let appointments = getTenantAppointments(user.salonId);

    // Apply filters
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const staffId = url.searchParams.get("staffId");
    const status = url.searchParams.get("status");
    const upcoming = url.searchParams.get("upcoming");
    const limit = url.searchParams.get("limit");
    const q = url.searchParams.get("q");

    if (from) {
      const fromDate = new Date(from);
      appointments = appointments.filter((a) => new Date(a.startTime) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      appointments = appointments.filter((a) => new Date(a.endTime) <= toDate);
    }

    if (staffId) {
      appointments = appointments.filter((a) => a.staffId === staffId);
    }

    if (status) {
      appointments = appointments.filter((a) => a.status === status);
    }

    // Filter for upcoming appointments
    if (upcoming === "true") {
      const now = new Date();
      appointments = appointments.filter((a) => new Date(a.startTime) >= now);
      // Sort by start time
      appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    // Search by customer name (requires joining with customers - simplified for now)
    if (q) {
      const searchLower = q.toLowerCase();
      appointments = appointments.filter((a) => {
        // For now, just filter by appointment ID or notes
        return a.notes?.toLowerCase().includes(searchLower);
      });
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      appointments = appointments.slice(0, limitNum);
    }

    return HttpResponse.json(appointments, { status: 200 });
  }),

  // POST /admin/appointments
  http.post("/admin/appointments", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const body = (await request.json()) as AppointmentCreateRequest;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    // Check idempotency
    if (idempotencyKey) {
      const hash = generateIdempotencyHash("/admin/appointments", user.salonId, body);
      const existing = mockState.idempotencyStore[idempotencyKey];

      if (existing && existing.requestHash === hash) {
        return HttpResponse.json(existing.response as object, { status: 201 });
      }
    }

    // Check for conflicts
    const appointments = getTenantAppointments(user.salonId);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

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
        { message: "Conflicting appointment exists", code: "APPOINTMENT_CONFLICT" },
        { status: 409 }
      );
    }

    const appointment: Appointment = {
      id: generateUUID(),
      salonId: user.salonId,
      serviceId: body.serviceId,
      staffId: body.staffId,
      customerId: body.customerId,
      startTime: body.startTime,
      endTime: body.endTime,
      status: "CONFIRMED",
      notes: body.notes,
      source: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!mockState.appointments[user.salonId]) {
      mockState.appointments[user.salonId] = [];
    }
    mockState.appointments[user.salonId].push(appointment);

    // Store idempotency
    if (idempotencyKey) {
      mockState.idempotencyStore[idempotencyKey] = {
        requestHash: generateIdempotencyHash("/admin/appointments", user.salonId, body),
        response: appointment,
      };
    }

    return HttpResponse.json(appointment, { status: 201 });
  }),

  // PUT /admin/appointments/:id
  http.put("/admin/appointments/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as AppointmentUpdateRequest;

    const appointments = getTenantAppointments(user.salonId);
    const appointmentIndex = appointments.findIndex((a) => a.id === id);

    if (appointmentIndex === -1) {
      return HttpResponse.json(
        { message: "Appointment not found", code: "APPOINTMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedAppointment = {
      ...appointments[appointmentIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    mockState.appointments[user.salonId][appointmentIndex] = updatedAppointment;

    return HttpResponse.json(updatedAppointment, { status: 200 });
  }),

  // PATCH /admin/appointments/:id
  http.patch("/admin/appointments/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;
    const body = (await request.json()) as AppointmentStatusUpdateRequest;

    const appointments = getTenantAppointments(user.salonId);
    const appointmentIndex = appointments.findIndex((a) => a.id === id);

    if (appointmentIndex === -1) {
      return HttpResponse.json(
        { message: "Appointment not found", code: "APPOINTMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedAppointment = {
      ...appointments[appointmentIndex],
      status: body.status,
      updatedAt: new Date().toISOString(),
    };

    mockState.appointments[user.salonId][appointmentIndex] = updatedAppointment;

    return HttpResponse.json(updatedAppointment, { status: 200 });
  }),

  // DELETE /admin/appointments/:id
  http.delete("/admin/appointments/:id", async ({ request, params }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const { id } = params;

    const appointments = getTenantAppointments(user.salonId);
    const appointmentIndex = appointments.findIndex((a) => a.id === id);

    if (appointmentIndex === -1) {
      return HttpResponse.json(
        { message: "Appointment not found", code: "APPOINTMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    mockState.appointments[user.salonId].splice(appointmentIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // ========== Reports ==========

  // GET /admin/reports/daily
  http.get("/admin/reports/daily", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const appointments = getTenantAppointments(user.salonId);
    const services = getTenantServices(user.salonId);

    // Filter appointments for target date
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAppointments = appointments.filter((a) => {
      const aptDate = new Date(a.startTime);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });

    // Calculate metrics
    let totalRevenueCents = 0;
    const serviceCount: Record<string, number> = {};

    dayAppointments.forEach((apt) => {
      const service = services.find((s) => s.id === apt.serviceId);
      if (service && apt.status === "COMPLETED") {
        totalRevenueCents += service.priceCents;
      }

      if (apt.status !== "CANCELLED") {
        serviceCount[apt.serviceId] = (serviceCount[apt.serviceId] || 0) + 1;
      }
    });

    const topServices = Object.entries(serviceCount)
      .map(([serviceId, count]) => {
        const service = services.find((s) => s.id === serviceId);
        return {
          serviceId,
          count,
          revenueCents: service ? service.priceCents * count : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const noShowCount = dayAppointments.filter((a) => a.status === "NO_SHOW").length;

    return HttpResponse.json(
      {
        date: targetDate.toISOString().split("T")[0],
        totalRevenueCents,
        totalAppointments: dayAppointments.length,
        noShowCount,
        topServices,
      },
      { status: 200 }
    );
  }),

  // GET /admin/reports/top-services
  http.get("/admin/reports/top-services", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const appointments = getTenantAppointments(user.salonId);
    const services = getTenantServices(user.salonId);

    // Filter appointments by date range
    let filteredAppointments = appointments;
    if (from) {
      const fromDate = new Date(from);
      filteredAppointments = filteredAppointments.filter(
        (a) => new Date(a.startTime) >= fromDate
      );
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filteredAppointments = filteredAppointments.filter(
        (a) => new Date(a.startTime) <= toDate
      );
    }

    // Calculate service metrics
    const serviceCount: Record<string, { count: number; revenue: number }> = {};

    filteredAppointments.forEach((apt) => {
      if (apt.status === "CANCELLED") return;

      const service = services.find((s) => s.id === apt.serviceId);
      if (!service) return;

      if (!serviceCount[apt.serviceId]) {
        serviceCount[apt.serviceId] = { count: 0, revenue: 0 };
      }

      serviceCount[apt.serviceId].count += 1;
      if (apt.status === "COMPLETED") {
        serviceCount[apt.serviceId].revenue += service.priceCents;
      }
    });

    const topServices = Object.entries(serviceCount)
      .map(([serviceId, { count, revenue }]) => ({
        serviceId,
        count,
        revenueCents: revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return HttpResponse.json(topServices, { status: 200 });
  }),

  // ========== Salon Settings ==========

  // GET /admin/salon
  http.get("/admin/salon", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const salon = mockState.salons[user.salonId];

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json(salon, { status: 200 });
  }),

  // PUT /admin/salon
  http.put("/admin/salon", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const { user } = auth;
    const body = (await request.json()) as SalonUpdateRequest;

    const salon = mockState.salons[user.salonId];

    if (!salon) {
      return HttpResponse.json(
        { message: "Salon not found", code: "SALON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedSalon = {
      ...salon,
      ...body,
    };

    mockState.salons[user.salonId] = updatedSalon;

    return HttpResponse.json(updatedSalon, { status: 200 });
  }),

  // POST /admin/webhook/test
  http.post("/admin/webhook/test", async ({ request }) => {
    await simulateDelay();

    const auth = authenticate(request);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as { webhookUrl: string };

    // Simulate webhook test (in real implementation, this would actually make a request)
    // For MSW, we'll just simulate success or failure randomly
    const success = Math.random() > 0.2; // 80% success rate

    return HttpResponse.json(
      {
        success,
        message: success
          ? "Webhook received test event successfully"
          : "Webhook did not respond or returned an error",
      },
      { status: 200 }
    );
  }),
];
