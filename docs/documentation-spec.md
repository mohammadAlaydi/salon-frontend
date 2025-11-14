## GLOWNOVA Documentation & Postman Spec

This document outlines the content and structure for the main README, docs directory, and a Postman (or similar) collection for manual API testing.

---

## 1. README Content Structure

The root `README.md` should be concise yet informative. Recommended sections:

### 1.1 Product Overview

- **Title**: `GLOWNOVA – Multi-tenant Salon Frontend`
- **Short description**:
  - “GLOWNOVA is a Next.js frontend for a multi-tenant salon SaaS, featuring an admin dashboard for salon staff and a public booking site for customers.”
- **Key features**:
  - Admin dashboard (calendar, services, staff, customers, reports, settings).
  - Public booking flow (service → staff → time → details → confirmation).
  - Theming and branding per salon (colors, logo, dark mode).

### 1.2 Tech Stack

- Next.js 14 (App Router) + TypeScript.
- Tailwind CSS + shadcn UI.
- React Query, React Hook Form, Zod.
- Framer Motion for animations.
- MSW for API mocking.
- Jest/RTL + Playwright for tests.

### 1.3 Getting Started (Local Development)

Include step-by-step instructions:

1. **Clone repo**
2. **Install dependencies**:
   - `npm install` (or alternative package manager).
3. **Copy env file**:
   - `cp .env.example .env.local`
4. **Ensure MSW is default in dev**:
   - No need to run backend; MSW mocks handle all API calls.
5. **Run dev server**:
   - `npm run dev`
6. **Open app**:
   - `http://localhost:3000` for public site.
   - `http://localhost:3000/admin/login` for admin.
7. **Demo credentials**:
   - `admin@demo.local` / `Password123!`.

### 1.4 Scripts Reference

Document all major scripts:

- `npm run dev` – Start Next dev server with MSW.
- `npm run build` – Production build.
- `npm run start` – Start production server.
- `npm run lint` – ESLint.
- `npm run typecheck` – TypeScript type check.
- `npm run test:unit` – Jest unit/integration tests.
- `npm run test:e2e` – Playwright tests.
- `npm run test:coverage` – Coverage report (optional).

### 1.5 Environment Variables & `.env.example`

Describe each variable:

- `NEXT_PUBLIC_API_BASE_URL` – Base URL for real backend; leave empty to use MSW.
- `NEXT_PUBLIC_USE_MOCKS` – `"true"` to force MSW even when API base exists.
- `NEXT_PUBLIC_APP_URL` – Public URL of the frontend (for links, E2E tests).

In `.env.example`:

- Provide commented descriptions, e.g.:
  - `# Base URL of backend API (leave blank to use MSW in dev)`
  - `NEXT_PUBLIC_API_BASE_URL=`

### 1.6 Folder Structure Overview

Summarize main directories:

- `/app` – Next.js App Router routes (`/admin`, `/[salonSlug]`).
- `/components` – Shared UI components.
- `/hooks` – Custom React hooks (auth, booking, tenant).
- `/lib` – API client, types, utilities.
- `/mocks` – MSW handlers and state.
- `/docs` – Architecture and spec documents.
- `/tests` – Unit/integration test files (optional layout).

### 1.7 Contributing Guidelines (Optional)

- Simple section describing:
  - Branching model.
  - How to add new endpoints (update OpenAPI, then MSW).
  - Code style (ESLint/Prettier).

---

## 2. Docs Directory Structure

The `/docs` folder should contain:

- `openapi.json` – API contract stub.
- `design-tokens.md` – Design tokens and Tailwind mapping.
- `components-spec.md` – Component inventory.
- `pages-flows-ux-spec.md` – Pages and UX flows.
- `msw-mock-spec.md` – MSW behavior.
- `auth-architecture.md` – Auth model and security.
- `testing-strategy.md` – Testing stack and matrix.
- `ci-cd-deployment.md` – CI/CD and deployment.
- `documentation-spec.md` – This file.
- `onboarding-frontend.md` – Salon branding and customization guide (to be created).
- `mockups.md` – Screen-level mockups (see separate spec).
- `backend-integration-handoff.md` – Integration steps (see separate spec).

### 2.1 `onboarding-frontend.md` (Outline)

Purpose:
- Explain how to customize the theme and branding per salon.

Recommended content:
- How salon-specific branding is stored in `SalonBranding` (OpenAPI).
- How to update colors and logo from `/admin/settings`.
- How to preview dark/light themes and tenant-specific themes.
- Guidelines for keeping contrast and accessibility in check.

---

## 3. Postman Collection Spec

Provide either a JSON file or clear markdown spec for creating a Postman collection named `GLOWNOVA API`.

### 3.1 Collection-Level Variables

- `{{baseUrl}}` – e.g., `http://localhost:4000` (real backend) or `http://localhost:3000/api` for mock tests if proxied.
- `{{tenantId}}` – default `demo-salon`.
- `{{accessToken}}` – populated via login request test script.

### 3.2 Folders & Requests

#### Folder: Auth

1. **Login**
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/login`
   - Body (JSON):
     - `{ "email": "admin@demo.local", "password": "Password123!" }`
   - Tests:
     - Extract `accessToken` and `refreshToken` into environment variables:
       - `pm.environment.set("accessToken", json.accessToken);`
     - Store `user` info optionally.

2. **Refresh Token**
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/refresh`
   - Body: `{ "refreshToken": "{{refreshToken}}" }`

3. **Logout**
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/logout`

#### Folder: Public

1. **List Services**
   - Method: `GET`
   - URL: `{{baseUrl}}/public/services`
   - Headers:
     - `X-Tenant-ID: {{tenantId}}`

2. **List Staff with Availability**
   - Method: `GET`
   - URL: `{{baseUrl}}/public/staff`
   - Query:
     - Optional `serviceId`.
   - Headers:
     - `X-Tenant-ID: {{tenantId}}`

3. **Create Public Appointment**
   - Method: `POST`
   - URL: `{{baseUrl}}/public/appointments`
   - Headers:
     - `X-Tenant-ID: {{tenantId}}`
     - Optional `Idempotency-Key: some-uuid`
   - Body:
     - Example JSON aligned with `PublicAppointmentCreateRequest`.

#### Folder: Admin

All admin requests include:
- Header: `Authorization: Bearer {{accessToken}}`.
- Header: `X-Tenant-ID: {{tenantId}}`.

1. **List Services**
   - `GET {{baseUrl}}/admin/services`

2. **Create Service**
   - `POST {{baseUrl}}/admin/services`
   - Body: service create payload.

3. **List Staff**
   - `GET {{baseUrl}}/admin/staff`

4. **List Customers**
   - `GET {{baseUrl}}/admin/customers`

5. **List Appointments**
   - `GET {{baseUrl}}/admin/appointments?from=...&to=...`

6. **Create Appointment**
   - `POST {{baseUrl}}/admin/appointments`
   - Headers:
     - Optional `Idempotency-Key`.

7. **Update Appointment Status**
   - `PATCH {{baseUrl}}/admin/appointments/:id`
   - Body: `{ "status": "CONFIRMED" }` etc.

8. **Daily Report**
   - `GET {{baseUrl}}/admin/reports/daily?date=YYYY-MM-DD`

9. **Salon Settings**
   - `GET {{baseUrl}}/admin/salon`
   - `PUT {{baseUrl}}/admin/salon`

10. **Onboard Salon**
   - `POST {{baseUrl}}/admin/onboard`

#### Folder: Webhooks

1. **n8n Callback**
   - `POST {{baseUrl}}/webhooks/n8n/callback`
   - Body example:
     - `{ "event": "appointment.created", "appointmentId": "UUID", "status": "DELIVERED" }`

---

## 4. Runbooks in Docs

Reference runbooks in `README`:

- Link to:
  - `docs/ci-cd-deployment.md` – CI/CD and Hostinger/Vercel details.
  - `docs/testing-strategy.md` – Testing instructions.
  - `docs/msw-mock-spec.md` – Mock behavior.
  - `docs/backend-integration-handoff.md` – How to go from mock to real backend.


