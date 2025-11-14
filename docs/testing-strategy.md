## GLOWNOVA Testing Strategy & Matrix

This document defines the testing approach for GLOWNOVA, including unit, integration, E2E, and concurrency testing. It assumes Jest + React Testing Library for unit/integration and Playwright for E2E, with MSW providing a consistent mock backend.

---

## 1. Testing Stack Overview

- **Unit tests**
  - Framework: Jest.
  - Focus: Pure functions, hooks logic, simple presentational components.
- **Integration tests**
  - Framework: Jest + React Testing Library.
  - Focus: Page-level behavior, form validation, React Query + MSW interaction.
- **End-to-End (E2E) tests**
  - Framework: Playwright.
  - Focus: Full flows in browser (auth, booking, calendar, settings).
- **Mocking & test data**
  - MSW for all HTTP requests.
  - Deterministic seeded state (`demo-salon`).

Targets:
- **Coverage**:
  - 80%+ for booking and auth-related logic.
  - 70%+ overall statement/branch coverage.
- **Reliability**:
  - Tests stable against time-dependent data by controlling dates and mock state.

---

## 2. Unit Tests

### 2.1 Scope

- Utility functions:
  - Date/slot calculations.
  - Price formatting.
  - Tenant resolution logic.
- Hooks (logic only):
  - `useBooking` state transitions.
  - Pure parts of `useTenant`.
  - Any custom data transformation hooks.
- Small visual components with minimal side effects:
  - `MetricCard` rendering with different deltas.
  - `Button` variants and disabled/loading states.

### 2.2 Example Unit Test Cases

- **Booking logic**
  - Given selection of service, staff, and slot:
    - `useBooking` transitions through steps correctly.
  - Resetting booking clears all state.
- **Date utilities**
  - Given working hours and appointments:
    - Inferred availability slots do not overlap with existing appointments.
- **Tenant resolution**
  - Host `demo-salon.localhost` yields tenant `demo-salon`.
  - Query `?tenant=another-salon` overrides host.

---

## 3. Integration Tests

### 3.1 Scope

- Page-level components rendered with:
  - `AppShell` or `PublicLayout` as appropriate.
  - React Query provider + MSW server.
  - `AuthProvider` and `ThemeProvider`.

### 3.2 Auth Integration

- **Login page**
  - Renders form inputs and validates Zod schema on submit.
  - On valid credentials:
    - Calls MSW `/auth/login`.
    - Sets user in context.
    - Redirects to `/admin/dashboard`.
  - On invalid credentials:
    - Shows inline error and toast message.

### 3.3 Services CRUD

- **`/admin/services` page**
  - Loads services list from MSW.
  - Opens “Add service” modal, fills fields, and submits:
    - MSW creates service.
    - Table updates with new row.
  - Edits service, toggles active status, and validates that MSW received requests.

### 3.4 Booking Flow Integration

- **Public booking multi-step flow (component-level)**
  - Render `/[salonSlug]/book` with initial route context.
  - Simulate service selection, staff selection, time slot selection, details entry, and confirmation.
  - Assert that:
    - React Hook Form validation messages appear for missing details.
    - On successful final step, MSW receives `POST /public/appointments`.

### 3.5 Dark Mode & Theme

- Check that toggling the theme:
  - Adds/removes `.dark` class on `html/body`.
  - Applies correct CSS variables (can be tested via DOM style inspection).

---

## 4. E2E Tests (Playwright)

### 4.1 Setup

- Use the Next.js dev server or a production build + `next start` for E2E runs.
- Ensure MSW is active in browser context.
- Seed the mock MSW state with known data for `demo-salon`.

### 4.2 Core Flows

#### 4.2.1 Admin Login & Dashboard

- Steps:
  1. Navigate to `/admin/login`.
  2. Fill demo credentials and submit.
  3. Wait for dashboard to load.
  4. Verify:
     - URL is `/admin/dashboard`.
     - KPI cards are visible with non-empty values.

#### 4.2.2 Calendar Appointment Creation & Reschedule

- Steps:
  1. Login as admin.
  2. Navigate to `/admin/calendar`.
  3. Click an empty slot to open quick-create modal.
  4. Select customer, service, time (or accept pre-filled).
  5. Save appointment.
  6. Drag appointment to a different slot.
  7. Verify:
     - Updated time is displayed.
     - No error toast, or error followed by rollback when conflict is injected (see concurrency tests).

#### 4.2.3 Public Booking Flow

- Steps:
  1. Navigate to `/demo-salon/book`.
  2. Select service.
  3. Choose “No preference” or specific staff.
  4. Pick a date and time slot.
  5. Fill customer details and confirm.
  6. Verify:
     - Redirect to `/demo-salon/book/confirmation`.
     - Confirmation details match selected slot.

#### 4.2.4 Dark Mode Toggle

- Steps:
  1. Login and go to settings.
  2. Toggle dark mode.
  3. Verify `.dark` class applied and key colors invert.

---

## 5. Concurrency & Idempotency Testing

### 5.1 Objective

- Ensure that only one booking succeeds when multiple E2E clients compete for the same time slot.
- Verify that repeated calls with same `Idempotency-Key` do not create duplicates.

### 5.2 Playwright Concurrency Recipe

1. In a single test file:
   - Start with a known date/time and seed MSW so the slot is free.
2. Launch multiple parallel page contexts (e.g., 8–12).
3. Each context:
   - Navigates to `/demo-salon/book`.
   - Goes through steps with the same service, staff, and time.
   - Uses either:
     - The same `Idempotency-Key` to test replay behavior, or
     - Different keys to test conflict behavior.
4. Assert:
   - Exactly one request returns 201 with appointment created.
   - Others either:
     - Receive same response with `Idempotent-Replay: true`, or
     - Receive 409 conflicts when using unique keys.

Implementation detail:
- Use MSW’s `mockConfig` to:
  - Introduce artificial latency.
  - Detect and log which request wins for debugging.

---

## 6. Test Matrix

Table summarizing major flows, test types, and success criteria.

| Area              | Scenario                                      | Type          | Tools                      | Success Criteria                                                           |
|-------------------|-----------------------------------------------|---------------|----------------------------|----------------------------------------------------------------------------|
| Auth              | Login success                                 | Integration   | Jest, RTL, MSW             | Token stored, redirect to dashboard, user shown in header.                |
| Auth              | Login failure (401)                           | Integration   | Jest, RTL, MSW             | Error message + no redirect.                                              |
| Auth              | Token refresh on 401                          | Integration   | Jest, RTL, MSW             | Refresh called, retried request succeeds, user stays on page.            |
| Booking (public)  | Full booking flow                             | E2E           | Playwright, MSW            | Confirmation page shows correct appointment details.                      |
| Booking (public)  | Slot conflict                                 | Integration/E2E | Jest/Playwright, MSW      | 409 handled, user asked to choose new slot.                               |
| Booking (admin)   | Create appointment from calendar              | Integration   | Jest, RTL, MSW             | New appointment appears in calendar and list views.                       |
| Booking (admin)   | Reschedule via drag-and-drop                  | E2E           | Playwright, MSW            | Appointment visually moved; underlying data updated.                      |
| Services          | CRUD lifecycle                                | Integration   | Jest, RTL, MSW             | Create, update, delete, and list operations behave correctly.            |
| Staff             | Edit working hours                            | Integration   | Jest, RTL, MSW             | New hours reflected in public availability.                               |
| Customers         | Auto-creation from public booking             | Integration   | Jest, RTL, MSW             | Booking creates customer record with linked visits.                       |
| Reports           | Daily report retrieval                        | Unit/Integration | Jest, MSW                | Aggregated metrics match underlying appointments.                         |
| Theme             | Dark/light toggle                             | Integration   | Jest, RTL                  | `.dark` class toggles and appropriate CSS variables applied.             |
| Accessibility     | Keyboard navigation through modal             | Unit/Integration | Jest, RTL                | Focus trap enforced; Esc closes modal.                                    |
| Concurrency       | Parallel booking requests                     | E2E           | Playwright, MSW            | Single winner; others idempotent replay or conflict as configured.       |

---

## 7. Running Tests & Coverage

- Example commands (for engineers to implement in `package.json`):
  - `npm run test:unit` – Jest unit + integration tests.
  - `npm run test:e2e` – Playwright tests.
  - `npm run test:coverage` – Run Jest with coverage thresholds.
- CI:
  - Fails pipeline if coverage drops below configured thresholds.


