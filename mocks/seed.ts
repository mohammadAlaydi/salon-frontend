/**
 * Seed demo data for MSW
 * Creates the demo-salon tenant with sample data
 */

import { mockState, initializeTenantData } from "./state";
import { generateUUID } from "./utils/tenantResolver";
import type {
  Salon,
  User,
  StaffProfile,
  Service,
  Customer,
  Appointment,
} from "@/lib/types/api";

export function seedDemoData() {
  // Create demo salon
  const demoSalonId = generateUUID();
  const demoSalon: Salon = {
    id: demoSalonId,
    slug: "demo-salon",
    name: "GLOWNOVA Demo Salon",
    address: "123 Beauty Lane, San Francisco, CA 94103",
    phone: "+1 (555) 123-4567",
    email: "contact@demo-salon.com",
    timezone: "America/Los_Angeles",
    branding: {
      primaryColor: "#E6A4B4",
      secondaryColor: "#A8C3A2",
      backgroundColor: "#FAF7F5",
      darkModeEnabled: true,
    },
  };

  mockState.salons[demoSalonId] = demoSalon;
  initializeTenantData(demoSalonId);

  // Create admin user
  const adminUserId = generateUUID();
  mockState.users[adminUserId] = {
    id: adminUserId,
    email: "admin@demo.local",
    password: "Password123!",
    role: "ADMIN",
    name: "Admin User",
    salonId: demoSalonId,
  };

  // Create staff profiles
  const staff1Id = generateUUID();
  const staff1: StaffProfile = {
    id: staff1Id,
    salonId: demoSalonId,
    name: "Sophie Martinez",
    bio: "Expert stylist with 10+ years of experience specializing in color and balayage.",
    avatarUrl: undefined,
    skills: ["Haircut", "Color", "Balayage", "Styling"],
    rating: 4.9,
    workingHours: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breaks: [{ startTime: "12:00", endTime: "13:00" }] }, // Monday
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", breaks: [{ startTime: "12:00", endTime: "13:00" }] }, // Tuesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", breaks: [{ startTime: "12:00", endTime: "13:00" }] }, // Wednesday
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", breaks: [{ startTime: "12:00", endTime: "13:00" }] }, // Thursday
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", breaks: [{ startTime: "12:00", endTime: "13:00" }] }, // Friday
    ],
  };

  const staff2Id = generateUUID();
  const staff2: StaffProfile = {
    id: staff2Id,
    salonId: demoSalonId,
    name: "Emma Thompson",
    bio: "Nail artist extraordinaire with a passion for creative designs and nail health.",
    avatarUrl: undefined,
    skills: ["Manicure", "Pedicure", "Nail Art", "Gel Nails"],
    rating: 4.8,
    workingHours: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", breaks: [{ startTime: "13:00", endTime: "14:00" }] },
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", breaks: [{ startTime: "13:00", endTime: "14:00" }] },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", breaks: [{ startTime: "13:00", endTime: "14:00" }] },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", breaks: [{ startTime: "13:00", endTime: "14:00" }] },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00", breaks: [{ startTime: "13:00", endTime: "14:00" }] },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", breaks: [] }, // Saturday
    ],
  };

  const staff3Id = generateUUID();
  const staff3: StaffProfile = {
    id: staff3Id,
    salonId: demoSalonId,
    name: "Lisa Chen",
    bio: "Skincare specialist focused on natural, holistic beauty treatments.",
    avatarUrl: undefined,
    skills: ["Facial", "Massage", "Waxing", "Skincare Consultation"],
    rating: 5.0,
    workingHours: [
      { dayOfWeek: 2, startTime: "11:00", endTime: "19:00", breaks: [{ startTime: "14:00", endTime: "15:00" }] },
      { dayOfWeek: 3, startTime: "11:00", endTime: "19:00", breaks: [{ startTime: "14:00", endTime: "15:00" }] },
      { dayOfWeek: 4, startTime: "11:00", endTime: "19:00", breaks: [{ startTime: "14:00", endTime: "15:00" }] },
      { dayOfWeek: 5, startTime: "11:00", endTime: "19:00", breaks: [{ startTime: "14:00", endTime: "15:00" }] },
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", breaks: [] },
    ],
  };

  mockState.staffProfiles[demoSalonId] = [staff1, staff2, staff3];

  // Create services
  const services: Service[] = [
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Women's Haircut",
      description: "Professional cut tailored to your style and face shape",
      durationMinutes: 60,
      priceCents: 7500, // $75
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Men's Haircut",
      description: "Classic or modern men's cut with styling",
      durationMinutes: 45,
      priceCents: 5500, // $55
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Balayage Color",
      description: "Hand-painted highlights for a natural sun-kissed look",
      durationMinutes: 180,
      priceCents: 22500, // $225
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Full Color",
      description: "All-over color with toner",
      durationMinutes: 120,
      priceCents: 15000, // $150
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Manicure",
      description: "Classic manicure with polish of your choice",
      durationMinutes: 45,
      priceCents: 4500, // $45
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Gel Manicure",
      description: "Long-lasting gel manicure",
      durationMinutes: 60,
      priceCents: 6500, // $65
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Pedicure",
      description: "Relaxing pedicure with foot massage",
      durationMinutes: 60,
      priceCents: 5500, // $55
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Facial Treatment",
      description: "Customized facial for your skin type",
      durationMinutes: 75,
      priceCents: 9500, // $95
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Deep Tissue Massage",
      description: "Therapeutic massage to release tension",
      durationMinutes: 90,
      priceCents: 12000, // $120
      currency: "USD",
      isActive: true,
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Eyebrow Waxing",
      description: "Professional eyebrow shaping",
      durationMinutes: 15,
      priceCents: 2500, // $25
      currency: "USD",
      isActive: true,
    },
  ];

  mockState.services[demoSalonId] = services;

  // Create sample customers
  const customers: Customer[] = [
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 234-5678",
      notes: "Prefers natural colors, allergic to ammonia",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Michael Brown",
      email: "m.brown@example.com",
      phone: "+1 (555) 345-6789",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 456-7890",
      notes: "Regular gel manicure client, prefers nude colors",
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "Jessica Wilson",
      email: "j.wilson@example.com",
      phone: "+1 (555) 567-8901",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID(),
      salonId: demoSalonId,
      name: "David Martinez",
      email: "david.m@example.com",
      phone: "+1 (555) 678-9012",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  mockState.customers[demoSalonId] = customers;

  // Create sample appointments for this week
  const appointments: Appointment[] = [];
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  thisWeekStart.setHours(0, 0, 0, 0);

  // Today's appointments
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  appointments.push({
    id: generateUUID(),
    salonId: demoSalonId,
    serviceId: services[0].id, // Women's Haircut
    staffId: staff1Id,
    customerId: customers[0].id,
    startTime: today.toISOString(),
    endTime: new Date(today.getTime() + 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    notes: "First time client",
    source: "PUBLIC",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const today2 = new Date();
  today2.setHours(14, 0, 0, 0);
  appointments.push({
    id: generateUUID(),
    salonId: demoSalonId,
    serviceId: services[4].id, // Manicure
    staffId: staff2Id,
    customerId: customers[2].id,
    startTime: today2.toISOString(),
    endTime: new Date(today2.getTime() + 45 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    source: "ADMIN",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Tomorrow's appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);
  appointments.push({
    id: generateUUID(),
    salonId: demoSalonId,
    serviceId: services[7].id, // Facial
    staffId: staff3Id,
    customerId: customers[3].id,
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 75 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    source: "PUBLIC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Next week appointment
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(15, 0, 0, 0);
  appointments.push({
    id: generateUUID(),
    salonId: demoSalonId,
    serviceId: services[2].id, // Balayage
    staffId: staff1Id,
    customerId: customers[1].id,
    startTime: nextWeek.toISOString(),
    endTime: new Date(nextWeek.getTime() + 180 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    notes: "Client wants cool tones",
    source: "ADMIN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Past completed appointment
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(13, 0, 0, 0);
  appointments.push({
    id: generateUUID(),
    salonId: demoSalonId,
    serviceId: services[1].id, // Men's Haircut
    staffId: staff1Id,
    customerId: customers[4].id,
    startTime: lastWeek.toISOString(),
    endTime: new Date(lastWeek.getTime() + 45 * 60 * 1000).toISOString(),
    status: "COMPLETED",
    source: "PUBLIC",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  mockState.appointments[demoSalonId] = appointments;

  console.log("✅ Demo data seeded successfully!");
  console.log(`📍 Salon: ${demoSalon.name} (${demoSalon.slug})`);
  console.log(`👤 Admin: admin@demo.local / Password123!`);
  console.log(`👥 Staff: ${mockState.staffProfiles[demoSalonId].length} members`);
  console.log(`🛎️ Services: ${mockState.services[demoSalonId].length} available`);
  console.log(`👨‍👩‍👧‍👦 Customers: ${mockState.customers[demoSalonId].length} registered`);
  console.log(`📅 Appointments: ${mockState.appointments[demoSalonId].length} scheduled`);
}

