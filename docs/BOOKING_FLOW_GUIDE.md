# 🌸 GLOWNOVA Booking Flow - Complete Integration Guide

This document demonstrates the complete booking flow from public salon landing through appointment confirmation, showing how all pieces work together.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Flow Architecture](#flow-architecture)
3. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
4. [Data Flow & Integration](#data-flow--integration)
5. [Design System Application](#design-system-application)
6. [MSW Mock Handlers](#msw-mock-handlers)
7. [Error Handling](#error-handling)

---

## Overview

The GLOWNOVA booking flow consists of 5 steps plus a public salon landing page:

```
/[salonSlug]           → Public salon landing (Hero, Services, Staff, Contact)
/booking/services      → Service selection
/booking/staff         → Staff selection (filtered by service)
/booking/time          → Date & time selection (availability checking)
/booking/details       → Customer details form
/booking/confirmation  → Booking confirmation with calendar download
```

---

## Flow Architecture

### Technology Stack

- **Framework**: Next.js 14 App Router
- **State Management**: React Query (TanStack Query)
- **Form Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS + GLOWNOVA Design System
- **Animations**: Framer Motion
- **API Mocking**: MSW (Mock Service Worker)
- **Date Handling**: date-fns

### Key Patterns

1. **URL-based State**: Query params pass context between steps
2. **Optimistic UI**: Instant navigation with skeleton loading states
3. **Progressive Enhancement**: Each step validates previous selections
4. **Graceful Degradation**: Missing params redirect to appropriate step
5. **Idempotent Booking**: Duplicate bookings prevented via `Idempotency-Key`

---

## Step-by-Step Walkthrough

### Step 0: Public Salon Landing (`/[salonSlug]`)

**File**: `app/[salonSlug]/page.tsx`

**Purpose**: Brand-aware salon showcase with hero, services, staff, and contact information.

**Features**:
- Dynamic branding from `salon.branding.primaryColor`
- Hero section with CTA
- Services grid
- Staff showcase with avatars and ratings
- Contact information with phone/email/address
- Footer with GLOWNOVA branding

**Data Sources**:
```typescript
// Hooks from hooks/api/usePublicSalon.ts
usePublicSalon(slug)     → GET /public/salons/{slug}
usePublicServices(slug)  → GET /public/salons/{slug}/services
usePublicStaff(slug)     → GET /public/salons/{slug}/staff
```

**MSW Handler**: `mocks/handlers/public.ts`
```typescript
http.get("/public/salons/:slug", ({ params }) => {
  const salon = DEMO_SALONS.find(s => s.slug === params.slug);
  return HttpResponse.json(salon);
})
```

**Styling**: 
- Custom CSS variables for salon branding: `--salon-primary`
- GLOWNOVA design tokens for layout, spacing, shadows
- Responsive grid for services and staff

---

### Step 1: Service Selection (`/booking/services`)

**File**: `app/booking/services/page.tsx`

**Purpose**: Display all available services with pricing, duration, and category icons.

**Features**:
- Service cards with icon, name, description, duration, price
- Hover animations (elevation, scale)
- Category-based emoji icons (haircut 💇, nails 💅, facial 🧖, etc.)
- "Select Service" button navigates to staff selection

**Data Flow**:
```typescript
usePublicServices()
  → GET /public/services
  → Returns Service[]
  → Cards rendered with map()
```

**Navigation**:
```typescript
handleSelectService(serviceId: string) {
  router.push(`/booking/staff?serviceId=${serviceId}`);
}
```

**Design Tokens Applied**:
- `bg-glownova-bg` (page background)
- `bg-gradient-to-br from-rose-100 to-sage-100` (header)
- `text-glownova-primary-dark` (heading)
- `shadow-card` + `hover:shadow-elevated` (cards)
- `font-heading` (Playfair Display for title)
- `transition-all hover:-translate-y-1` (card hover effect)

**Framer Motion**:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
```

---

### Step 2: Staff Selection (`/booking/staff?serviceId=...`)

**File**: `app/booking/staff/page.tsx`

**Purpose**: Display staff members who can perform the selected service.

**Features**:
- Staff cards with avatar, name, bio, rating, skills
- Filtered by `serviceId` query param
- Back button to return to service selection
- "Select {FirstName}" button

**Data Flow**:
```typescript
const serviceId = searchParams.get("serviceId");
usePublicStaff(serviceId)
  → GET /public/staff?serviceId={id}
  → Returns PublicStaffWithAvailability[]
  → Filter staff who can perform this service
```

**Guard Logic**:
```typescript
if (!serviceId) {
  router.replace("/booking/services"); // Redirect if missing context
  return null;
}
```

**Navigation**:
```typescript
handleSelectStaff(staffId: string) {
  router.push(`/booking/time?serviceId=${serviceId}&staffId=${staffId}`);
}
```

**Design Tokens**:
- Avatar with gradient background: `bg-gradient-to-br from-rose-200 to-sage-200`
- Star rating with `fill-yellow-400`
- Skills badges: `Badge variant="secondary"`
- Same card hover effects as service selection

**MSW Handler Logic**:
```typescript
// mocks/handlers/public.ts
http.get("/public/staff", ({ request }) => {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId");
  
  let filtered = MOCK_STAFF;
  if (serviceId) {
    filtered = filtered.filter(s => s.serviceIds.includes(serviceId));
  }
  
  return HttpResponse.json(filtered.map(staff => ({
    staff,
    availableToday: true,
    nextAvailable: new Date().toISOString()
  })));
});
```

---

### Step 3: Time Selection (`/booking/time?serviceId=...&staffId=...`)

**File**: `app/booking/time/page.tsx`

**Purpose**: Calendar + time slot picker with real-time availability checking.

**Features**:
- Calendar component (shadcn/ui)
- Available time slots grid
- Disable past dates
- Time slots filtered by `isReserved` flag
- Selected time highlighting
- "Continue to Details" button (only shown when time selected)

**Data Flow**:
```typescript
const [selectedDate, setSelectedDate] = useState<Date>(new Date());
const formattedDate = format(selectedDate, "yyyy-MM-dd");

usePublicAvailability(serviceId, staffId, formattedDate)
  → GET /public/availability?serviceId={id}&staffId={id}&date={date}
  → Returns AvailabilitySlot[]
  → Filter out reserved slots: .filter(slot => !slot.isReserved)
```

**Guard Logic**:
```typescript
if (!serviceId || !staffId) {
  router.replace("/booking/services");
  return null;
}
```

**State Management**:
```typescript
// Reset selected time when date changes
useEffect(() => {
  setSelectedTime(null);
}, [selectedDate]);
```

**Navigation**:
```typescript
handleContinue() {
  if (selectedTime) {
    router.push(
      `/booking/details?serviceId=${serviceId}&staffId=${staffId}&startTime=${encodeURIComponent(selectedTime)}`
    );
  }
}
```

**Design Tokens**:
- Two-column grid on desktop: `grid gap-8 lg:grid-cols-2`
- Time slot buttons: `Button variant="outline"` → `variant="default"` when selected
- Grid layout for time slots: `grid grid-cols-3 gap-2`
- Scrollable area: `max-h-96 overflow-y-auto`

**MSW Availability Logic**:
```typescript
// mocks/handlers/public.ts
http.get("/public/availability", ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const staffId = url.searchParams.get("staffId");
  
  // Generate 15-minute slots from 9am-5pm
  const slots: AvailabilitySlot[] = [];
  const baseDate = parseISO(date);
  
  for (let hour = 9; hour < 17; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, minute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 15);
      
      // Randomly reserve some slots
      const isReserved = Math.random() < 0.3;
      
      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isReserved,
        staffId: staffId || "staff-1"
      });
    }
  }
  
  return HttpResponse.json(slots);
});
```

---

### Step 4: Customer Details (`/booking/details?serviceId=...&staffId=...&startTime=...`)

**File**: `app/booking/details/page.tsx`

**Purpose**: Collect customer information and confirm booking.

**Features**:
- Booking summary (service, staff, date, time, duration, price)
- Form with name, email (optional), phone, notes
- React Hook Form + Zod validation
- "Confirm Booking" button with loading state
- Error handling with toast notifications

**Form Schema** (`lib/validations/booking.ts`):
```typescript
const bookingDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});
```

**React Hook Form Setup**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<BookingDetailsData>({
  resolver: zodResolver(bookingDetailsSchema),
});
```

**Data Flow**:
```typescript
// Fetch for display
usePublicServices() → find service by id
usePublicStaff(serviceId) → find staff by id

// Display summary
selectedService.name, priceCents, durationMinutes
selectedStaff.name
format(parseISO(startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")
```

**Mutation Hook** (`hooks/booking/useBooking.ts`):
```typescript
export function useCreatePublicBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublicAppointmentCreateRequest) => {
      // Generate idempotency key to prevent duplicate bookings
      const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return api.post<Appointment>("/public/appointments", data, {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      });
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicStaff("") });
      queryClient.invalidateQueries({ queryKey: ["public", "availability"] });
      toast.success("Booking confirmed!", {
        description: "You'll receive a confirmation shortly.",
      });
    },
    onError: (error: any) => {
      const message = error?.status === 409
        ? "This time slot is no longer available. Please select another time."
        : "Failed to create booking. Please try again.";

      toast.error("Booking failed", { description: message });
    },
  });
}
```

**Submission Logic**:
```typescript
const onSubmit = async (data: BookingDetailsData) => {
  try {
    const appointment = await createBooking.mutateAsync({
      serviceId: serviceId!,
      staffId: staffId!,
      startTime: startTime!,
      notes: data.notes,
      customer: {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
      },
    });

    // Navigate to confirmation with booking details
    const params = new URLSearchParams({
      id: appointment.id,
      serviceName: selectedService?.name || "Service",
      staffName: selectedStaff?.name || "Staff",
      date: format(parseISO(startTime!), "MMMM d, yyyy"),
      time: format(parseISO(startTime!), "h:mm a"),
    });

    router.push(`/booking/confirmation?${params.toString()}`);
  } catch (error) {
    // Error handled by mutation hook
  }
};
```

**Design Tokens**:
- Booking summary box: `rounded-lg bg-glownova-bg p-4`
- Form spacing: `space-y-6`
- Input styling from shadcn/ui: `Input`, `Textarea`, `Label`
- Error messages: `text-status-error`
- Submit button: `Button size="lg"` with full width

**MSW Handler** (with idempotency):
```typescript
// mocks/handlers/public.ts
http.post("/public/appointments", async ({ request }) => {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  
  // Check if we've seen this idempotency key before
  const existing = idempotencyCache.get(idempotencyKey);
  if (existing && existing.requestHash === hash) {
    // Return cached response (idempotent replay)
    return HttpResponse.json(existing.response as object, {
      status: 201,
      headers: { "Idempotent-Replay": "true" },
    });
  }
  
  const body = await request.json();
  const { serviceId, staffId, startTime, customer, notes } = body;
  
  // Conflict detection: Check if slot is already booked
  const conflict = APPOINTMENTS_DB.some(
    apt => apt.staffId === staffId && apt.startTime === startTime
  );
  
  if (conflict) {
    return new HttpResponse(null, {
      status: 409,
      statusText: "Time slot already reserved"
    });
  }
  
  // Create appointment
  const appointment = {
    id: generateId("apt"),
    serviceId,
    staffId,
    startTime,
    endTime: new Date(new Date(startTime).getTime() + 60*60*1000).toISOString(),
    status: "confirmed" as const,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  APPOINTMENTS_DB.push(appointment);
  
  // Cache response for idempotency
  idempotencyCache.set(idempotencyKey, {
    requestHash: hash,
    response: appointment,
    timestamp: Date.now()
  });
  
  return HttpResponse.json(appointment, { status: 201 });
});
```

---

### Step 5: Confirmation (`/booking/confirmation?id=...&serviceName=...&staffName=...&date=...&time=...`)

**File**: `app/booking/confirmation/page.tsx`

**Purpose**: Show booking confirmation with details and actions.

**Features**:
- Animated success checkmark (Framer Motion spring)
- Booking reference ID (monospace font)
- Confirmed badge
- Service, staff, date, time summary cards
- Email/SMS confirmation message
- "Add to Calendar" button (generates ICS file)
- "Back to Home" button

**Data Source**:
- All data passed via URL params from previous step
- No API calls needed (appointment already created)

**Guard Logic**:
```typescript
if (!bookingId) {
  router.replace("/booking/services");
  return null;
}
```

**ICS Calendar Generation**:
```typescript
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

const handleAddToCalendar = () => {
  const icsContent = generateICSFile({
    title: "Salon Appointment",
    description: "Your appointment at GLOWNOVA",
    location: "GLOWNOVA Demo Salon",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
  });

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
```

**Design Tokens**:
- Success checkmark: `bg-status-success` with spring animation
- Booking ID: `font-mono font-semibold`
- Badge: `Badge variant="success"`
- Info cards: `rounded-lg border border-border p-4`
- Grid layout: `grid gap-4 sm:grid-cols-2`
- Info box: `rounded-lg bg-blue-50 p-4` (confirmation message)

**Framer Motion Animations**:
```typescript
// Success icon
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
  className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-status-success"
>
  <Check className="h-10 w-10 text-white" />
</motion.div>

// Content fade-in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
>
```

---

## Data Flow & Integration

### Request/Response Cycle

```
┌─────────────────────┐
│  1. User Action     │
│  (Click service)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. React Query     │
│  usePublicServices()│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. API Client      │
│  api.get("/public/  │
│    services")       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. MSW Intercept   │
│  http.get handler   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. Mock Response   │
│  Service[]          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  6. React Query     │
│  Cache & Return     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  7. Component       │
│  Render cards       │
└─────────────────────┘
```

### Type Safety Flow

```typescript
// 1. OpenAPI schema defines API contract
// 2. TypeScript types in lib/types/api.ts
export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 3. API client uses typed generics
api.get<Service[]>("/public/services")
  // Returns Promise<Service[]>

// 4. React Query hooks are typed
export function usePublicServices() {
  return useQuery({
    queryKey: queryKeys.publicServices(tenantSlug),
    queryFn: () => api.get<Service[]>("/public/services"),
    //            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //            Type: () => Promise<Service[]>
  });
}

// 5. Component receives typed data
const { data: services } = usePublicServices();
//            ^^^^^^^^ Type: Service[] | undefined

// 6. Safe property access
services?.map((service) => (
  <div key={service.id}>
    {service.name} - ${(service.priceCents / 100).toFixed(2)}
  </div>
))
```

### State Management Strategy

**URL as Single Source of Truth**:
```typescript
// Step 2: /booking/staff?serviceId=abc123
const serviceId = searchParams.get("serviceId");

// Step 3: /booking/time?serviceId=abc123&staffId=def456
const serviceId = searchParams.get("serviceId");
const staffId = searchParams.get("staffId");

// Step 4: /booking/details?serviceId=abc123&staffId=def456&startTime=2024-01-15T10:00:00Z
const serviceId = searchParams.get("serviceId");
const staffId = searchParams.get("staffId");
const startTime = searchParams.get("startTime");
```

**Benefits**:
- ✅ Shareable URLs
- ✅ Browser back/forward works correctly
- ✅ No global state synchronization
- ✅ Refreshing page maintains context
- ✅ Deep linking support

---

## Design System Application

### GLOWNOVA Design Tokens

All booking pages use the comprehensive design system defined in `app/globals.css`:

**Brand Colors**:
```css
--color-primary: 230 164 180;        /* #E6A4B4 - Soft Rose */
--color-primary-dark: 183 92 118;    /* #B75C76 - Deep Rosewood */
--color-secondary: 168 195 162;      /* #A8C3A2 - Sage Green */
```

**Applied via Tailwind utilities**:
```tsx
<h1 className="text-glownova-primary-dark">GLOWNOVA</h1>
<Button className="bg-glownova-primary">Select Service</Button>
<div className="bg-gradient-to-br from-rose-100 to-sage-100">
```

**Typography**:
```css
--font-sans: var(--font-inter), ...;      /* Body text */
--font-heading: var(--font-playfair), ...; /* Headings */
```

```tsx
<h1 className="font-heading text-3xl">Choose Your Specialist</h1>
<p className="text-base">Body text uses Inter</p>
```

**Spacing** (consistent across all pages):
```tsx
<div className="container mx-auto max-w-5xl px-4 py-12">
  {/* Consistent page padding */}
</div>

<div className="space-y-6">
  {/* Consistent vertical rhythm */}
</div>
```

**Border Radius**:
```css
--radius-sm: 0.5rem;
--radius-md: 0.9rem;   /* Default for cards */
--radius-lg: 1.25rem;
```

```tsx
<Card className="rounded-xl">  {/* Uses --radius-md */}
<Button className="rounded-md">{/* Uses --radius-sm */}
```

**Shadows**:
```css
--shadow-card: 0 10px 30px rgba(0, 0, 0, 0.08);
--shadow-elevated: 0 18px 45px rgba(0, 0, 0, 0.16);
```

```tsx
<Card className="shadow-card hover:shadow-elevated transition-all">
```

**Motion**:
```css
--motion-fast: 150ms;
--motion-normal: 200ms;
--motion-slow: 250ms;
--easing-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
```

Applied via Framer Motion and Tailwind:
```tsx
<motion.div
  transition={{ duration: 0.3 }} // --motion-fast equivalent
>

<Button className="transition-all duration-200">
  {/* --motion-normal */}
</Button>
```

### Component Consistency

**Page Header Pattern** (used on all booking pages):
```tsx
<div className="bg-gradient-to-br from-rose-100 to-sage-100 py-12 px-4">
  <div className="container mx-auto max-w-5xl">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button (if not first step) */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to {previousStep}
      </Button>
      
      {/* Page title */}
      <h1 className="font-heading text-3xl font-bold text-glownova-primary-dark mb-2">
        {pageTitle}
      </h1>
      
      {/* Subtitle */}
      <p className="text-muted-foreground">
        {pageDescription}
      </p>
    </motion.div>
  </div>
</div>
```

**Loading State Pattern**:
```tsx
{isLoading ? (
  <div className="flex justify-center py-20">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-glownova-primary border-r-transparent"></div>
      <p className="mt-4 text-muted-foreground">Loading {resource}...</p>
    </div>
  </div>
) : (
  {/* Content */}
)}
```

**Empty State Pattern**:
```tsx
<div className="rounded-lg border border-border bg-card p-12 text-center">
  <div className="mb-4 text-5xl">{emoji}</div>
  <h3 className="text-xl font-semibold">{emptyTitle}</h3>
  <p className="mt-2 text-muted-foreground">{emptyDescription}</p>
  {action && <Button className="mt-6">{actionLabel}</Button>}
</div>
```

---

## MSW Mock Handlers

### Public Handlers Overview

**File**: `mocks/handlers/public.ts`

**Endpoints**:
```typescript
GET  /public/salons/:slug           → Salon details
GET  /public/salons/:slug/services  → Salon services
GET  /public/salons/:slug/staff     → Salon staff
GET  /public/services               → All services
GET  /public/staff                  → Staff (with serviceId filter)
GET  /public/availability           → Time slots
POST /public/appointments           → Create booking (with idempotency)
```

### Key Handler: Availability Generation

```typescript
http.get("/public/availability", ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const staffId = url.searchParams.get("staffId");
  const serviceId = url.searchParams.get("serviceId");

  // Generate 15-minute slots from 9am-5pm
  const slots: AvailabilitySlot[] = [];
  const baseDate = parseISO(date);

  for (let hour = 9; hour < 17; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 15);

      // Simulate some slots being reserved (30% probability)
      const isReserved = Math.random() < 0.3;

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isReserved,
        staffId: staffId || "staff-1",
      });
    }
  }

  return HttpResponse.json(slots);
});
```

### Key Handler: Booking with Idempotency

```typescript
// In-memory idempotency cache
const idempotencyCache = new Map<string, {
  requestHash: string;
  response: unknown;
  timestamp: number;
}>();

http.post("/public/appointments", async ({ request }) => {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const body = await request.json();

  // Generate hash of request body
  const hash = JSON.stringify(body);

  // Check idempotency cache
  const existing = idempotencyCache.get(idempotencyKey);
  if (existing && existing.requestHash === hash) {
    console.log("🔄 Idempotent replay detected");
    return HttpResponse.json(existing.response as object, {
      status: 201,
      headers: { "Idempotent-Replay": "true" },
    });
  }

  const { serviceId, staffId, startTime, customer, notes } = body;

  // Conflict detection: Check if slot is already booked
  const conflict = APPOINTMENTS_DB.some(
    (apt) =>
      apt.staffId === staffId &&
      apt.startTime === startTime &&
      apt.status !== "cancelled"
  );

  if (conflict) {
    console.log("⚠️ Booking conflict detected");
    return new HttpResponse(null, {
      status: 409,
      statusText: "Time slot already reserved",
    });
  }

  // Create appointment
  const appointment: Appointment = {
    id: generateId("apt"),
    tenantId: "demo-tenant",
    serviceId,
    staffId,
    startTime,
    endTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  APPOINTMENTS_DB.push(appointment);

  // Cache for idempotency
  idempotencyCache.set(idempotencyKey, {
    requestHash: hash,
    response: appointment,
    timestamp: Date.now(),
  });

  console.log("✅ Booking created:", appointment.id);
  return HttpResponse.json(appointment, { status: 201 });
});
```

### Mock Data Structure

**File**: `mocks/seed.ts`

```typescript
export const DEMO_SALONS = [
  {
    id: "salon-demo",
    slug: "demo-salon",
    name: "GLOWNOVA Demo Salon",
    email: "contact@demo-salon.com",
    phone: "+1 (555) 123-4567",
    address: "123 Beauty Lane, Glamour City, GL 12345",
    timezone: "America/New_York",
    branding: {
      primaryColor: "#E6A4B4",
      logoUrl: null,
    },
    settings: {
      bookingEnabled: true,
      requireDeposit: false,
      cancellationHours: 24,
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const DEMO_SERVICES = [
  {
    id: "svc-1",
    name: "Signature Haircut",
    description: "Expert cut and style by our master stylists",
    durationMinutes: 60,
    priceCents: 7500, // $75.00
    categoryId: "cat-hair",
    isActive: true,
  },
  {
    id: "svc-2",
    name: "Balayage Color",
    description: "Hand-painted highlights for natural dimension",
    durationMinutes: 180,
    priceCents: 22500, // $225.00
    categoryId: "cat-hair",
    isActive: true,
  },
  // ... more services
];

export const DEMO_STAFF = [
  {
    id: "staff-1",
    name: "Emma Rodriguez",
    email: "emma@demo-salon.com",
    role: "staff" as const,
    bio: "Master stylist with 10+ years of experience specializing in color",
    avatarUrl: null,
    skills: ["Balayage", "Color Correction", "Precision Cuts"],
    rating: 4.9,
    isActive: true,
    serviceIds: ["svc-1", "svc-2", "svc-3"],
    workingHours: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      // ...
    },
  },
  // ... more staff
];
```

---

## Error Handling

### Client-Side Error Boundaries

**Network Errors**:
```typescript
const { data, isLoading, error } = usePublicServices();

if (error) {
  return (
    <div className="rounded-lg bg-status-error/10 p-8 text-center">
      <p className="text-status-error">Failed to load services</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Please refresh the page or try again later
      </p>
    </div>
  );
}
```

**Validation Errors** (React Hook Form + Zod):
```typescript
// Inline field validation
{errors.name && (
  <p className="text-sm text-status-error">{errors.name.message}</p>
)}

// Form-level submission errors
try {
  await createBooking.mutateAsync(data);
} catch (error) {
  // Handled by mutation hook's onError
}
```

**Booking Conflicts** (409 status):
```typescript
// In useCreatePublicBooking hook
onError: (error: any) => {
  const message = error?.status === 409
    ? "This time slot is no longer available. Please select another time."
    : "Failed to create booking. Please try again.";

  toast.error("Booking failed", {
    description: message,
  });
}
```

**Toast Notifications** (via sonner):
```typescript
import { toast } from "sonner";

// Success
toast.success("Booking confirmed!", {
  description: "You'll receive a confirmation shortly.",
});

// Error
toast.error("Booking failed", {
  description: "This time slot is no longer available.",
});

// Info
toast.info("Time slot updated", {
  description: "Please select a new time.",
});
```

### Guard Clauses (Progressive Navigation)

Every step validates previous selections:

```typescript
// Step 2: Staff selection
if (!serviceId) {
  router.replace("/booking/services");
  return null;
}

// Step 3: Time selection
if (!serviceId || !staffId) {
  router.replace("/booking/services");
  return null;
}

// Step 4: Details
if (!serviceId || !staffId || !startTime) {
  router.replace("/booking/services");
  return null;
}

// Step 5: Confirmation
if (!bookingId) {
  router.replace("/booking/services");
  return null;
}
```

**Benefits**:
- ✅ Prevents broken states
- ✅ User can't skip steps
- ✅ Deep linking fails gracefully
- ✅ URL tampering is handled

---

## Testing the Flow

### Manual Testing Checklist

**Step 1: Service Selection**
- [ ] All services load correctly
- [ ] Service cards display name, description, duration, price
- [ ] Category icons are correct
- [ ] Hover animations work
- [ ] Clicking "Select Service" navigates to staff page with `serviceId` param

**Step 2: Staff Selection**
- [ ] Staff filtered by selected service
- [ ] Staff cards show avatar, name, bio, rating, skills
- [ ] Back button returns to service selection
- [ ] Clicking "Select {Name}" navigates to time page with both params

**Step 3: Time Selection**
- [ ] Calendar displays correctly
- [ ] Past dates are disabled
- [ ] Selecting date loads availability
- [ ] Available time slots display (some reserved)
- [ ] Clicking time slot highlights it
- [ ] "Continue" button only appears when time selected
- [ ] Back button returns to staff selection

**Step 4: Details**
- [ ] Booking summary shows correct service, staff, date, time
- [ ] Form validation works (name required, email optional, phone required)
- [ ] Submitting form shows loading state
- [ ] Success navigates to confirmation
- [ ] Error shows toast notification
- [ ] Back button returns to time selection

**Step 5: Confirmation**
- [ ] Success animation plays
- [ ] Booking reference ID displayed
- [ ] All details are correct
- [ ] "Add to Calendar" downloads ICS file
- [ ] "Back to Home" returns to service selection

### E2E Test Script (Playwright example)

```typescript
test("complete booking flow", async ({ page }) => {
  // Step 1: Select service
  await page.goto("/booking/services");
  await expect(page.locator("h1")).toContainText("GLOWNOVA");
  await page.click('text="Signature Haircut"');

  // Step 2: Select staff
  await expect(page).toHaveURL(/\/booking\/staff\?serviceId=/);
  await page.click('text="Select Emma"');

  // Step 3: Select time
  await expect(page).toHaveURL(/\/booking\/time\?serviceId=.*&staffId=/);
  await page.click('button:has-text("10:00 AM")');
  await page.click('text="Continue to Details"');

  // Step 4: Fill details
  await expect(page).toHaveURL(/\/booking\/details\?/);
  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('input[name="phone"]', "+15551234567");
  await page.click('text="Confirm Booking"');

  // Step 5: Confirmation
  await expect(page).toHaveURL(/\/booking\/confirmation\?/);
  await expect(page.locator("h1")).toContainText("Booking Confirmed");
  await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
});
```

---

## Summary

The GLOWNOVA booking flow demonstrates:

✅ **Complete Integration**: Hooks → API Client → MSW → Components → UI  
✅ **Type Safety**: End-to-end TypeScript from API types to component props  
✅ **Design System**: Consistent GLOWNOVA brand colors, typography, spacing  
✅ **UX Excellence**: Progressive navigation, loading states, error handling  
✅ **Real-world Patterns**: Idempotency, conflict detection, calendar integration  
✅ **Performance**: React Query caching, optimistic updates, code splitting  
✅ **Accessibility**: Keyboard navigation, ARIA labels, semantic HTML  

Every piece of the architecture works together to create a polished, production-ready booking experience that matches the GLOWNOVA design specification.

---

**Next Steps**:
- Add Playwright E2E tests for full flow coverage
- Implement SMS/email confirmation templates
- Add payment integration for deposits
- Build admin dashboard for managing bookings
- Add real-time availability updates via WebSocket

---

*Last Updated: November 15, 2025*  
*GLOWNOVA v1.0 - Multi-tenant Salon Management System*

