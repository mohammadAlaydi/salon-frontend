## GLOWNOVA MSW Mock Server Specification

This document describes how the Mock Service Worker (MSW) layer should behave in development and test environments. It mirrors the OpenAPI contract (`docs/openapi.json`) and enables realistic frontend behavior without a real backend.

---

## 1. Overview & Entry Points

- **Goals**:
  - Simulate a realistic multi-tenant backend.
  - Provide stable, deterministic responses for tests.
  - Exercise error cases (401, 409, 500) for resilience.
- **Files** (suggested):
  - `mocks/handlers.ts` – defines all request handlers.
  - `mocks/browser.ts` – MSW setup for browser (dev).
  - `mocks/server.ts` – MSW setup for Node/Jest/Playwright tests.
  - `mocks/state.ts` – in-memory state container.

MSW should be enabled by default in:
- `npm run dev`
- All unit/integration tests
- E2E tests (unless explicitly hitting a real backend).

---

## 2. Tenant Resolution

Tenants (salons) must be resolved consistently:

1. **Host-based resolution**
   - Example: `https://demo-salon.localhost:3000` → tenant slug `demo-salon`.
   - In MSW, parse `req.url` host and split subdomain as slug.
2. **Header-based resolution**
   - If present, `X-Tenant-ID` header takes precedence and maps directly to tenant slug/ID.
3. **Query param fallback**
   - For local testing without hosts file, `?tenant=demo-salon` overrides host.

**Resolution algorithm (pseudo):**
1. `tenantParam = url.searchParams.get("tenant")`
2. `tenantHeader = req.headers.get("X-Tenant-ID")`
3. `hostSubdomain = extractSubdomain(req.url)`
4. Choose the first non-null in order: `tenantParam`, `tenantHeader`, `hostSubdomain`.
5. If all missing: default to `"demo-salon"`.

If a tenant is unknown, MSW should:
- Return 404 with `ErrorResponse` `"Unknown tenant"` for admin/public endpoints.

---

## 3. In-Memory State Model

State is held in memory per test/browser session; optional persistence to `localStorage` in dev.

### 3.1 Data Structures

Create JS objects keyed by tenant ID:

- `salons: Record<string, Salon>`
- `users: Record<string, User>` (admins + staff users)
- `staffProfiles: Record<string, StaffProfile[]>`
- `services: Record<string, Service[]>`
- `customers: Record<string, Customer[]>`
- `appointments: Record<string, Appointment[]>`
- `notificationLogs: Record<string, NotificationLog[]>`
- `idempotencyStore: Record<string, { requestHash: string; response: any }>`

All entity shapes should match the OpenAPI schemas.

### 3.2 Seeding Demo Data

On MSW startup:

- Create a demo tenant `"demo-salon"`:
  - Salon slug: `"demo-salon"`.
  - Name: “GlowNova Demo Salon”.
- Seed:
  - Admin user:
    - Email: `admin@demo.local`
    - Password: `Password123!` (stored in cleartext only in mock).
  - 2–3 staff profiles (stylists).
  - 5–10 services (haircut, color, nails, etc.).
  - Some upcoming appointments for the current week.

In dev (browser context), optionally sync state to `localStorage` so a page refresh retains changes. In tests, keep purely in-memory and reset between tests.

---

## 4. Auth Handlers

### 4.1 `POST /auth/login`

- **Behavior**:
  - Read `email`, `password` from body.
  - Find user in seeded `users` map.
  - If mismatch:
    - Return 401 with `ErrorResponse` (“Invalid email or password.”).
  - On success:
    - Generate pseudo-JWT tokens:
      - Access token payload: `{ sub: user.id, role: user.role, salonId }`.
      - Refresh token payload: `{ sub: user.id, type: "refresh" }`.
    - Tokens can be opaque strings as long as the auth layer can decode or store payload separately in mock state.
  - Return `AuthResponse`.

### 4.2 `POST /auth/refresh`

- **Behavior**:
  - Validate `refreshToken`:
    - Check against an in-memory store of active refresh tokens.
  - If valid:
    - Issue new access token with updated expiry.
  - If invalid or expired:
    - Return 401.

### 4.3 `POST /auth/logout`

- **Behavior**:
  - Mark refresh token as revoked in store.
  - Return 204.

**Note**: In browser dev, tokens are likely stored in memory or `localStorage`; MSW only validates the token format and expected IDs, not cryptographic signatures.

---

## 5. Public Booking Handlers

### 5.1 `GET /public/services`

- **Behavior**:
  - Resolve tenant.
  - Return list of active services for that tenant.

### 5.2 `GET /public/staff`

- **Behavior**:
  - Resolve tenant.
  - Optionally filter availability by `serviceId`.
  - Compose `PublicStaffWithAvailability`:
    - For each staff, compute open slots from `workingHours` minus existing appointments.
    - Mark `isReserved` if a slot is in a “pending” reservation state (see idempotency & locks).

### 5.3 `POST /public/appointments`

- **Behavior**:
  - Resolve tenant.
  - Use idempotency logic (see section 7).
  - Validate:
    - Service exists & active.
    - Staff exists and is allowed for service.
    - Slot is within working hours and not overlapping existing confirmed appointments.
  - On success:
    - Create `Customer` if new (by phone/email).
    - Create `Appointment` with `source = "PUBLIC"` and status `CONFIRMED`.
    - Optionally create `NotificationLog` entries for confirmation messages.
  - On conflicts:
    - Return 409 with `ErrorResponse` (“Selected time is no longer available.”).

---

## 6. Admin Handlers

### 6.1 Auth Guard for Admin Routes

For all `/admin/*` paths:
- Extract `Authorization` header.
- Validate token structure/payload against mock:
  - If missing/invalid: return 401.
  - If valid:
    - Derive `salonId` and `user` to scope queries.

### 6.2 Services (`/admin/services`, `/admin/services/:id`)

- **GET**:
  - Return all services for tenant.
- **POST**:
  - Create service with generated ID and `isActive=true` by default.
- **PUT**:
  - Update fields with validation (e.g., non-negative price).
- **DELETE**:
  - Either remove or mark as inactive; in mock, you can simply remove.

### 6.3 Staff (`/admin/staff`, `/admin/staff/:id`)

- **GET**:
  - List staff for tenant.
- **POST**:
  - Create new staff profile; optionally create associated user account in mock.
- **PUT**:
  - Update profile, skills, rating, `workingHours`.

### 6.4 Customers (`/admin/customers`)

- **GET**:
  - Return list of customers with computed metrics (total visits, last visit).
- **POST**:
  - Create a new customer record.

### 6.5 Appointments (`/admin/appointments`, `/admin/appointments/:id`)

- **GET**:
  - Support filters: `from`, `to`, `staffId`, `status`.
- **POST**:
  - Use same validation and conflict detection rules as public endpoint.
  - Support `Idempotency-Key`.
- **PUT**:
  - Full update; ensure time changes don’t overlap.
- **PATCH (status)**:
  - Update `status` only; e.g., mark as `CANCELLED` or `NO_SHOW`.

### 6.6 Reports (`/admin/reports/daily`)

- **GET**:
  - Compute simple aggregated metrics over appointments:
    - `totalRevenueCents`, `totalAppointments`, `noShowCount`.
    - `topServices` by count and revenue.

### 6.7 Salon Settings (`/admin/salon`, `/admin/onboard`)

- **GET /admin/salon**:
  - Return salon details for current tenant.
- **PUT /admin/salon**:
  - Update profile and branding fields; persist in mock state.
- **POST /admin/onboard**:
  - Create a new salon in mock:
    - Create salon, admin user, initial services/staff if desired.
    - Return `SalonOnboardResponse`.

---

## 7. Idempotency & Reservation Locks

### 7.1 Idempotency-Key Logic

Applies to:
- `POST /public/appointments`
- `POST /admin/appointments`

Behavior:
- If `Idempotency-Key` is present:
  - Construct a hash of `{ endpoint, tenant, body }`.
  - If no existing entry:
    - Process normally.
    - Store `{ key, requestHash, response }` in `idempotencyStore`.
    - Return response with header `Idempotent-Replay: false`.
  - If existing entry and body hash matches:
    - Return stored response with `Idempotent-Replay: true`.
  - If existing entry and body hash differs:
    - Return 409 to simulate misused key.

### 7.2 Reservation Locks

For public booking:
- When client selects a slot (before final POST), the frontend may call a lightweight “lock” route in future; in mock we can simulate via:
  - On first `POST /public/appointments` (and prior check), treat the requested slot as locked during processing.
  - For concurrency tests, a configurable delay (see section 8) can create overlapping requests where only the first wins.

Implementation detail:
- Maintain a set of “pending” appointments for short-lived locks, cleared after a timeout or after final decision.

---

## 8. Concurrency & Latency Simulation

To exercise booking and calendar robustness, MSW should support:

### 8.1 Global Simulation Flags

Expose a configuration object (accessible in tests) such as:

```ts
mockConfig = {
  latencyMs: 0 | number,
  failNextRequests: {
    "/public/appointments"?: number,
    "/admin/appointments"?: number
  },
  conflictRate: {
    "/public/appointments"?: number, // 0–1 probability of 409
  }
}
```

**Note**: The snippet above is conceptual; actual implementation lives in `mocks/state.ts`.

### 8.2 Latency

- All handlers should optionally `await` a `delay(mockConfig.latencyMs)` before responding.
- Default dev latency: ~150–300ms to mimic real-world network.

### 8.3 Conflict Simulation

- For booking endpoints:
  - If `conflictRate` for that path > 0:
    - Draw random number; if below threshold, respond with 409 even if slot is technically free.
  - Use this only in tests to verify optimistic update rollbacks.

### 8.4 Failure Injection

- `failNextRequests` counters per path:
  - If non-zero, decrement and respond with 500 and `ErrorResponse`.
  - Useful for testing error toasts and retries.

---

## 9. Webhook Simulation (`/webhooks/n8n/callback`)

### 9.1 Outgoing Webhook Simulation

When an appointment is created:
- If salon has `n8nWebhookUrl` configured:
  - Mock a delayed callback by:
    - In tests: manually triggering `POST /webhooks/n8n/callback` handler from within MSW state after a timeout.
    - In dev: log to console or update a notification log to simulate the external system.

### 9.2 Incoming Handler

`POST /webhooks/n8n/callback` handler should:
- Accept arbitrary `N8nCallbackPayload`.
- Optionally:
  - Update `NotificationLog` entries.
  - Mark certain appointments as “reminder sent”.
- Always return 202 to indicate acceptance.

---

## 10. Dev & Test Integration

### 10.1 Dev (`npm run dev`)

- In `_app` or root layout bootstrap:
  - Conditionally initialize MSW only when:
    - `NODE_ENV === "development"` AND
    - `NEXT_PUBLIC_API_BASE_URL` is not set OR a config flag `NEXT_PUBLIC_USE_MOCKS` is `"true"`.
- Ensure MSW is started before the first React Query calls (await `worker.start()`).

### 10.2 Unit & Integration Tests

- Use `mocks/server.ts`:
  - `beforeAll` → `server.listen()`.
  - `afterEach` → `server.resetHandlers()` and reset mock state.
  - `afterAll` → `server.close()`.

### 10.3 Playwright E2E

- Option 1: Use MSW in browser context:
  - Inject MSW scripts via `playwright.config` or root page.
- Option 2: Hit a Node mock backend that reuses the same state/handlers.
- Tests can adjust `mockConfig` via exposed debug endpoint (e.g., `/__mock/config`) or directly in Node-based MSW.

---

## 11. Keeping Mocks in Sync with OpenAPI

### 11.1 Manual Contract-First Approach

- Treat `docs/openapi.json` as the single source of truth.
- When adding or changing endpoints:
  - Update OpenAPI first.
  - Update MSW handlers to match paths, methods, and payload shapes.

### 11.2 Optional Generator

- Optional script can:
  - Read `docs/openapi.json`.
  - Generate handler stubs (path + method + empty implementation) into `mocks/handlers.generated.ts`.
  - Developers fill in business logic in `handlers.custom.ts`.


