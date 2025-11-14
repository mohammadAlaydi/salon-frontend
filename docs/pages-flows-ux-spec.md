## GLOWNOVA Pages, Flows, and UX Copy

This document specifies all admin and public pages, core flows (auth, booking, calendar), and UX/microcopy patterns. It is **implementation-agnostic** and meant to guide UI development.

---

## 1. Admin Area (`/admin`)

All admin routes share `AppShell` with `Sidebar`, `Topbar`, and optional `MobileNav`.

### 1.1 `/admin/login`

- **Purpose**: Authenticate salon admins/staff.
- **Layout**:
  - Split view on desktop: left side hero (brand, illustration), right side login card.
  - On mobile: logo + brief copy at top, login card below.
- **Content**:
  - Logo + product name: “GLOWNOVA”.
  - Title: “Welcome back”.
  - Subtitle: “Sign in to manage your salon schedule.”
  - Form:
    - Email (required).
    - Password (required).
    - “Remember this device” (optional).
    - Primary button: “Sign in”.
  - Secondary links:
    - “Use demo account” (prefill `admin@demo.local` / `Password123!`).
    - “Need help?” (links to support placeholder).
- **Validation & Errors**:
  - Inline Zod validation for email format and minimum password length.
  - On 401: show toast “That email or password doesn’t look right. Please try again.”
- **Success UX**:
  - On success: redirect to `/admin/dashboard`.
  - Show subtle toast: “You’re in. Let’s make today fully booked.”

### 1.2 `/admin/dashboard`

- **Purpose**: High-level overview of today’s performance.
- **Layout**:
  - Top: page title “Dashboard” + date filter (today, this week).
  - Row of 3–4 `MetricCard`s:
    - Today’s bookings.
    - Today’s revenue.
    - No-shows today.
    - New customers this week.
  - Below:
    - Left: mini calendar showing today’s timeline or upcoming slots.
    - Right: list of upcoming appointments.
- **Interactions**:
  - Click on an appointment row → opens `AppointmentDrawer`.
  - Date filter reloads KPIs via React Query.
- **Microcopy**:
  - Empty state for new salons: “No bookings yet. Your first appointment will appear here.”

### 1.3 `/admin/calendar`

- **Purpose**: Weekly calendar view with slots.
- **Layout**:
  - Header:
    - Title: “Calendar”.
    - Controls: week navigation (previous / today / next), staff filter dropdown, view switch (week / day).
  - Main: `CalendarWeek` component.
- **Interactions**:
  - Click empty slot → opens Quick Create modal with:
    - Pre-filled date/time and staff.
    - Fields: customer, service, notes.
    - Primary CTA: “Create appointment”.
  - Drag appointment block to new time/staff:
    - On drop → `onMoveAppointment` → optimistic update and toast:
      - Success: “Appointment moved to [day, time].”
      - Error (409 via mock) → revert and toast: “That slot was taken. Your calendar is unchanged.”
  - Clicking appointment → `AppointmentDrawer`.
- **Microcopy**:
  - Quick-create title: “New appointment”.
  - Drawer title: “[Service] with [Customer]”.

### 1.4 `/admin/appointments`

- **Purpose**: Tabular view of all appointments with filters.
- **Layout**:
  - Header: “Appointments” + filters row (date range, status, staff, search).
  - Main: `Table` with columns:
    - Date & time.
    - Customer.
    - Service.
    - Staff.
    - Status (badge).
    - Actions (View / Edit).
- **Interactions**:
  - Status filter chips (All, Upcoming, Completed, No-shows).
  - Click row or “View” → `AppointmentDrawer`.
  - FAB or top-right button: “New appointment” (goes to `/admin/appointments/new` modal).
- **Empty state**:
  - “No appointments match this filter.” + “Clear filters” button.

### 1.5 `/admin/appointments/new`

- **Purpose**: Quick-create appointment modal or page.
- **Layout**:
  - Multi-column form within a `Card`/`Modal`:
    - Left: Customer (search existing, or quick-create).
    - Middle: Service + Staff.
    - Right: Date/time + notes.
- **Microcopy**:
  - Title: “Create new appointment”.
  - CTA: “Save appointment”.

### 1.6 `/admin/services`

- **Purpose**: Manage service catalog.
- **Layout**:
  - Header: “Services” + primary button “Add service”.
  - Table columns:
    - Name.
    - Duration.
    - Price.
    - Status (Active/Inactive).
    - Actions (Edit / Archive).
- **Interactions**:
  - Add/Edit service modal:
    - Fields: name, description, duration, price, currency, status.
    - Inline validation: duration > 0, price ≥ 0.
  - Toggle “Active” status via inline switch.
- **Copy**:
  - Empty state: “No services yet. Add your first service to start accepting bookings.”

### 1.7 `/admin/staff`

- **Purpose**: Staff list and profiles with working hours editor.
- **Layout**:
  - Header: “Staff” + button “Add team member”.
  - Cards or table list for staff:
    - Avatar, name, role, skills, next availability.
  - Click staff → profile view (same page drawer or dedicated route).
- **Profile Content**:
  - Tabs: “Profile”, “Working hours”, “Services”.
  - Working hours:
    - Weekday grid with interactive timeline or select inputs (start/end + breaks).
  - Services tab:
    - Checkboxes to assign which services staff can perform.
- **Microcopy**:
  - Working hours heading: “Set their weekly schedule”.
  - Hint: “These hours control when this staff member appears as available in booking.”

### 1.8 `/admin/customers`

- **Purpose**: Customer CRM-style list.
- **Layout**:
  - Header: “Customers” + search bar.
  - Table/list:
    - Name, contact, last visit date, total visits.
  - Clicking row → Customer profile view:
    - Top: basic info (name, phone, email, notes).
    - Below: visit history (appointments list).
- **Microcopy**:
  - Empty state: “No customers yet. New bookings will create customers automatically.”

### 1.9 `/admin/reports`

- **Purpose**: Insights and analytics.
- **Layout**:
  - Header: “Reports”.
  - Controls:
    - Date range picker (Today, Last 7 days, This month, Custom).
  - Sections:
    - Revenue over time (line/bar chart).
    - Top services (bar chart + table).
    - No-shows and cancellations (metrics).
- **Microcopy**:
  - Subtitle: “Track how your salon is performing over time.”

### 1.10 `/admin/settings`

- **Purpose**: Salon settings and branding.
- **Layout**:
  - Tabs:
    - “Salon profile”.
    - “Branding & theme”.
    - “Integrations”.
  - Salon profile:
    - Name, address, phone, email, timezone.
  - Branding:
    - Color pickers for primary/secondary/background (within safe ranges).
    - Logo upload.
    - Live preview card for public site and admin shell.
  - Integrations:
    - n8n webhook URL input, test button (“Send test event”).
- **Dark mode**:
  - Toggle in Branding tab to preview light/dark themes.

### 1.11 `/admin/onboarding`

- **Purpose**: First-time setup wizard.
- **Steps**:
  1. Salon basics (name, location, timezone).
  2. Primary services (quick seed).
  3. Team members.
  4. Branding (colors, logo).
- **Copy**:
  - Step intro: “We’ll have you ready to take bookings in just a few steps.”
  - Completion: “You’re ready. Let’s open your calendar.”

---

## 2. Public Booking Site

Tenant-aware via `[salonSlug]` or host-based routing.

### 2.1 `/[salonSlug]/` (Home)

- **Purpose**: Salon landing page.
- **Layout**:
  - Hero:
    - Salon name, short tagline.
    - CTA: “Book an appointment”.
    - Background: soft rose gradient + imagery.
  - Sections:
    - Highlighted services (cards).
    - Staff highlights (top 2–3 staff).
    - Testimonials (optional).
    - Location & contact (embedded map optional).
- **Microcopy**:
  - CTA examples:
    - “Book your glow-up.”
    - “See available times.”

### 2.2 `/[salonSlug]/services`

- **Purpose**: Full service catalog for customers.
- **Layout**:
  - Filter bar (categories, duration, price).
  - Grid/List of `ServiceCard`s.
- **Interactions**:
  - “Book” CTA on each card → `/[salonSlug]/book` with pre-selected service.

### 2.3 `/[salonSlug]/staff`

- **Purpose**: Show staff profiles to customers.
- **Layout**:
  - Cards with photo, specialties, short bio, rating.
  - Optional “Book with [Name]” button.

### 2.4 `/[salonSlug]/book` – Multi-step Booking Flow

#### Step 1: Choose service

- **Layout**:
  - Step indicator: 1/5.
  - List of services; emphasize duration and price.
  - “Next” disabled until service selected.
- **Copy**:
  - Title: “Choose your service”.
  - Helper: “You can change this later if needed.”

#### Step 2: Choose staff

- **Options**:
  - “No preference (auto-assign)”.
  - List of `StaffCard`s with next available time.
- **Copy**:
  - Title: “Pick your stylist (optional)”.
  - Helper: “We’ll match you with the best available stylist if you’re not sure.”

#### Step 3: Choose date & time

- **Layout**:
  - DatePicker for day.
  - `TimeSlotPicker` for available slots.
- **Interactions**:
  - Selecting a date reloads availability via React Query.
  - Selecting a slot visually locks it; other clients requesting same slot see conflict in MSW-mock.
- **Copy**:
  - Title: “When would you like to come in?”
  - Error (409): “That time just got taken. Please choose another slot.”

#### Step 4: Customer details

- **Fields**:
  - Full name (required).
  - Email (optional but recommended).
  - Phone (required, with country code helper).
  - Notes (optional, e.g., “I have long hair”).
- **Copy**:
  - Title: “Tell us about you”.
  - Helper: “We’ll use these details only to manage your appointment.”

#### Step 5: Review & confirm

- **Summary**:
  - Service, staff, date/time, salon location.
  - Total price.
- **Actions**:
  - Primary: “Confirm booking”.
  - Secondary: “Back”.
- **Success**:
  - Redirect to `/[salonSlug]/book/confirmation`.

### 2.5 `/[salonSlug]/book/confirmation`

- **Purpose**: Booking success page.
- **Content**:
  - Headline: “You’re booked ✨” (or similar, but emoji optional in implementation).
  - Subtext: “We’ve sent your booking details to [email/phone].”
  - Appointment details card.
  - CTA: “Add to calendar” (ICS link).
  - Secondary: “Book another appointment”.

---

## 3. Auth Flow UX (Frontend Perspective)

### 3.1 Login

- User enters email/password on `/admin/login`.
- On submit:
  - Disable button, show spinner in button.
  - Call `/auth/login` via React Query mutation.
  - On success:
    - Store tokens via auth layer (see auth spec).
    - Redirect to `/admin/dashboard`.
  - On error:
    - Show inline field-level messages for validation.
    - Show toast for invalid credentials.

### 3.2 Logout

- Available via user menu in `Topbar`.
- On click:
  - Optional confirm dialog: “Sign out from GLOWNOVA?” (for mobile).
  - Call `/auth/logout` (MSW stub).
  - Clear auth state and tokens.
  - Redirect to `/admin/login`.

### 3.3 Session Expiry

- If API call returns 401 due to expired access token:
  - Attempt refresh via `/auth/refresh`.
  - If refresh succeeds:
    - Retry original request silently.
  - If refresh fails:
    - Clear auth state.
    - Redirect to `/admin/login` with toast:
      - “Your session expired. Please sign in again.”

---

## 4. Calendar & Appointment Flow UX

### 4.1 Creating Appointment from Calendar

- User clicks an empty slot in `CalendarWeek`.
- Quick-create modal pre-fills date/time/staff.
- Form behavior:
  - Customer search with typeahead (mocked).
  - “New customer” option opens inline fields.
  - Service dropdown filtered by staff’s allowed services.
- On submit:
  - Optimistic update shows appointment block on calendar.
  - Toast: “Appointment created.”
  - On error (409):
    - Remove block.
    - Toast: “That slot is no longer available.”

### 4.2 Editing/Rescheduling Appointment

- User opens `AppointmentDrawer`.
- Changes fields or drags appointment in `CalendarWeek`.
- If using drag:
  - Show ghost block while dragging.
  - On drop → call update endpoint and optimistically move block.
- If editing in drawer:
  - Show “Save changes” button at bottom.
- Cancellation:
  - `ConfirmDialog` before marking as cancelled/no-show.
  - Copy: “Mark as no-show?” / “Cancel this appointment?”.

---

## 5. UX Copy Guidelines

### 5.1 Tone & Style

- Calm, confident, and concise.
- Prefer present tense and plain language.
- Examples:
  - “Save changes” instead of “Submit”.
  - “Something went wrong. Please try again.” instead of generic error codes.

### 5.2 Button Text

- Primary actions: verbs, 2–3 words.
  - “Book appointment”.
  - “Save service”.
  - “Update hours”.
- Secondary actions:
  - “Cancel”.
  - “Back”.
  - “View details”.

### 5.3 Error Messages

- Validation errors:
  - “Please enter a valid email address.”
  - “Password must be at least 8 characters.”
  - “Choose a date in the future.”
- System errors:
  - “We couldn’t load your calendar. Please refresh.”
  - “We couldn’t save your changes. Your data is safe; try again in a moment.”

### 5.4 Onboarding Hints

- Dashboard empty:
  - “Start by adding your services and staff. Your calendar will light up as bookings come in.”
- Services empty:
  - “Add your most popular services first – we’ve seen salons start with 5–10.”


