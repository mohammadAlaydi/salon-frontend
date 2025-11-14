## GLOWNOVA Backend Integration & Handoff Guide

This document explains how to move from MSW-based mocks to a real backend, validate integration against staging, and maintain the API contract over time.

---

## 1. Current State (Mock-First)

- Frontend uses:
  - MSW for all HTTP requests in development and tests.
  - `docs/openapi.json` as the contract for endpoints and types.
- API client:
  - Calls either MSW-intercepted URLs (dev) or real backend (when configured).
- Auth:
  - Tokens and roles are simulated by MSW.

The goal is to swap MSW for a real NestJS backend with minimal code changes.

---

## 2. Switching from MSW to Real Backend

### 2.1 Environment Flags

- **Key env variables**:
  - `NEXT_PUBLIC_API_BASE_URL`
    - When set (e.g., `https://api.glownova.yourdomain.com`), the API client should point all requests to this base URL.
  - `NEXT_PUBLIC_USE_MOCKS`
    - When `"true"`, MSW remains enabled, even if `NEXT_PUBLIC_API_BASE_URL` is set (useful for partial migrations).

### 2.2 API Client Behavior

- Wrap fetch logic in a single module (e.g., `lib/apiClient.ts`):
  - Use `baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"` (implementation detail).
  - For MSW-only mode:
    - `NEXT_PUBLIC_API_BASE_URL` empty; MSW intercepts calls.
  - For real backend:
    - `NEXT_PUBLIC_API_BASE_URL` set; MSW disabled or used only for specific paths if needed.

### 2.3 Disabling MSW

- In production/staging builds targeting real backend:
  - Do not start `worker.start()` in browser if:
    - `NEXT_PUBLIC_USE_MOCKS !== "true"` and
    - `NEXT_PUBLIC_API_BASE_URL` is defined.
- Keep the ability to re-enable MSW in development for local testing by toggling `NEXT_PUBLIC_USE_MOCKS`.

---

## 3. Integration with Staging Backend

### 3.1 Pre-Integration Checklist

Before pointing the frontend at staging:

- [ ] Ensure staging backend implements endpoints in `docs/openapi.json`.
- [ ] Align authentication:
  - Confirm token format (JWT vs opaque).
  - Confirm login/refresh/logout endpoints and payloads.
- [ ] Agree on tenant resolution:
  - Hostname vs `X-Tenant-ID` header vs query param.

### 3.2 Staging Env Setup

- Set environment variables for staging deployment:
  - `NEXT_PUBLIC_API_BASE_URL=https://staging-api.glownova.example.com`
  - `NEXT_PUBLIC_USE_MOCKS=false`
- Deploy frontend to a staging domain (e.g., `https://staging.glownova.example.com`).

### 3.3 Smoke Tests on Staging

Using the real backend:

- Auth:
  - Login with a staging admin user.
  - Verify dashboard loads KPIs.
- Booking:
  - Complete a public booking flow and confirm appointment appears in admin calendar.
- Reports:
  - Confirm daily report endpoint returns reasonable values.
- Settings:
  - Update salon branding and verify changes in public site.

Document any discrepancies between backend behavior and OpenAPI spec and resolve them contract-first.

---

## 4. Contract Maintenance (OpenAPI & Types)

### 4.1 Single Source of Truth

- Treat `docs/openapi.json` as canonical.
- Backend should:
  - Either generate this spec or import it and validate handlers against it.
- Frontend should:
  - Generate TypeScript types and client stubs (if using a generator), or keep types manually aligned.

### 4.2 Workflow for Changes

When adding or modifying endpoints:

1. Update `docs/openapi.json`.
2. Update or regenerate frontend types/client.
3. Update MSW handlers to reflect new contract.
4. Update backend implementation.
5. Adjust tests (unit, integration, E2E).

For breaking changes:
- Use semantic versioning of the API or coordinate updates across services.

---

## 5. Auth Integration Details

### 5.1 Token Handling

- In production:
  - Prefer HTTP-only secure cookies for access and/or refresh tokens.
  - Frontend `AuthProvider` should adapt:
    - When cookies are in use, rely on session endpoints (e.g., `/auth/me`) and avoid reading tokens directly.
  - Ensure CORS and cookie domain settings allow frontend and backend to communicate.

### 5.2 Role & Permission Mapping

- Ensure backend roles align with frontend assumptions:
  - `ADMIN` → full access.
  - `STAFF` → restricted access.
- Backend should enforce RBAC; frontend UI hints should be consistent but not be sole protection.

---

## 6. Webhooks & n8n Integration

### 6.1 Connecting n8n

- In `/admin/settings`:
  - Salon owner configures `n8nWebhookUrl`.
- Backend responsibility:
  - On appointment events (create/update), POST to configured webhook.

### 6.2 Frontend Verification Flow

Once real webhooks are connected:

- Create a test appointment.
- Verify:
  - n8n receives webhook (view logs in n8n).
  - Optional: backend updates `NotificationLog` and exposes via an endpoint.
- Frontend can show basic webhook status in settings (e.g., last delivery timestamp) if backend provides it.

---

## 7. Go-Live Checklist

Before going live with real backend:

- **Functional**
  - [ ] Admin login/logout works against real backend.
  - [ ] Public booking flow completes fully, creating real appointments.
  - [ ] Calendar shows appointments correctly across timezones.
  - [ ] Services/staff/customers CRUD works end-to-end.
- **Auth & Security**
  - [ ] Tokens stored via secure HTTP-only cookies or hardened storage.
  - [ ] HTTPS enforced end-to-end.
  - [ ] Basic CSRF protection enabled if using cookies.
  - [ ] Role-based access tested (staff vs admin).
- **Performance**
  - [ ] Initial page load time acceptable on 3G/slow networks.
  - [ ] React Query caching strategies tuned (no excessive refetching).
  - [ ] Heavy components (calendar) lazy-loaded where appropriate.
- **Accessibility**
  - [ ] Keyboard navigation works for modals, drawers, stepper, and forms.
  - [ ] Focus states visible across all interactive elements.
  - [ ] Color contrast passes WCAG AA for text on primary/secondary backgrounds.
- **Monitoring**
  - [ ] Set up error tracking (e.g., Sentry) and performance monitoring.
  - [ ] Logging in backend includes correlation IDs for requests.

---

## 8. Long-Term Maintenance

- Keep:
  - CI pipelines running tests on every change.
  - OpenAPI spec updated for every backend feature.
  - MSW mocks maintained so local dev remains robust even when backend changes.
- Periodically:
  - Run E2E tests against staging and production URLs.
  - Review error logs and UX metrics to prioritize improvements.


