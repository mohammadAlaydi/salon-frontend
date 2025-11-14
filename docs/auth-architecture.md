## GLOWNOVA Auth Architecture & Security Spec

This document describes the frontend authentication model for GLOWNOVA, including token lifecycle, auth hooks, route guards, and security considerations when integrating with a real backend.

---

## 1. Auth Model Overview

- **Auth style**: Email + password with JWT-based access/refresh tokens.
- **Actors**:
  - `ADMIN` – full access to salon configuration, staff, reports.
  - `STAFF` – restricted access (calendar, appointments, their customers).
- **Endpoints** (from OpenAPI):
  - `POST /auth/login` → `AuthResponse`.
  - `POST /auth/refresh` → `RefreshTokenResponse`.
  - `POST /auth/logout` → 204 No Content.

The frontend:
- Treats access tokens as **short-lived** (e.g., 15–30 min).
- Treats refresh tokens as **long-lived** (e.g., days–weeks).
- Uses MSW in dev/test to simulate issuance, expiry, and revocation.

---

## 2. Token Shapes & Semantics

Conceptual payloads (subject to backend implementation):

- **Access token payload**:
  - `sub: string` – user ID.
  - `role: "ADMIN" | "STAFF"`.
  - `salonId: string`.
  - `exp: number` – expiry timestamp (epoch seconds).

- **Refresh token payload**:
  - `sub: string` – user ID.
  - `type: "refresh"`.
  - `exp: number`.

MSW may use opaque string tokens while still internally tracking these fields in mock state.

---

## 3. Token Storage Strategy

### 3.1 Development & Test (with MSW)

- **Access token**:
  - Stored in memory (e.g., React context + React Query auth store).
  - Optionally mirrored in `sessionStorage` for page reload resilience.
- **Refresh token**:
  - For simplicity in dev, can be stored in `localStorage` with a namespaced key, e.g.:
    - `glownova:refreshToken:<tenantSlug>`.
  - This is **not** recommended for production but acceptable in mocks.

### 3.2 Production Recommendation (Real Backend)

- **Access token**:
  - Can be stored in memory only.
  - Provided to frontend via HTTP-only cookie (or via explicit JSON response if using a pure SPA pattern).
- **Refresh token**:
  - **Must** be stored in an HTTP-only, `Secure`, `SameSite` cookie to mitigate XSS.
  - The frontend never reads refresh token directly; it simply calls `/auth/refresh` and lets backend manage session cookies.

The codebase should:
- Abstract token handling behind utility functions so the storage mechanism can be swapped when the backend is ready.

---

## 4. Auth Hooks & Context

### 4.1 `AuthProvider`

- **Responsibilities**:
  - Load persisted auth state on app start (if any).
  - Provide auth context to hooks.
  - Coordinate token refresh and logout side-effects.
- **Context shape (concept)**:
  - `user: User | null`
  - `accessToken: string | null`
  - `isAuthenticated: boolean`
  - `isLoading: boolean` (initial bootstrap/refresh)
  - `login(credentials)`
  - `logout()`

### 4.2 `useAuth()`

- **Usage**: Primary hook for components needing auth info.
- **Responsibilities**:
  - Expose context values.
  - Hide low-level storage details.

### 4.3 `useRequireAuth(options?)`

- **Usage**: For protected admin pages/components.
- **Behavior**:
  - If `isLoading` → show loading spinner.
  - If `!isAuthenticated`:
    - Redirect to `/admin/login`.
    - Optionally preserve `redirectTo` query param (e.g., originally requested page).

### 4.4 `useAdminAuth()` / Role Guards

- **Usage**: Components requiring `ADMIN` role.
- **Behavior**:
  - If `user.role !== "ADMIN"`:
    - Optionally redirect to a “Not authorized” page or show inline error.

---

## 5. API Client & React Query Integration

### 5.1 Typed Fetch Wrapper

- All admin/public API calls should use a shared fetch wrapper:
  - Adds `Authorization: Bearer <accessToken>` when available.
  - Adds tenant headers (`X-Tenant-ID`) when derived by `useTenant`.
  - Handles JSON serialization/deserialization.

### 5.2 Automatic Token Refresh

Flow for protected requests:

1. API call using fetch wrapper.
2. If response is 401 **and**:
   - Request is not the login/refresh endpoint.
   - A refresh token is present/valid in client storage.
3. Trigger refresh:
   - Call `/auth/refresh`.
   - If refresh succeeds:
     - Update access token in auth context.
     - Retry original request once.
   - If refresh fails:
     - Clear auth state.
     - Redirect to `/admin/login` with session expired message.

This logic should be centralized in the API client to avoid duplication in React Query hooks.

---

## 6. Route Protection Strategy

### 6.1 Admin Routes (`/admin/*`)

- Wrap page-level components with:
  - `AuthGuard` (or call `useRequireAuth` inside layout).
- Behavior:
  - For `/admin/login`:
    - If user already authenticated, redirect to `/admin/dashboard`.
  - For all other `/admin/*` routes:
    - If not authenticated, redirect to `/admin/login`.
    - If token refresh in progress, show a centered spinner.

### 6.2 Public Routes

- `/[salonSlug]/*` must not require auth (booking is public).
- Public routes may still respect auth state to show “Staff view” vs. “Customer view” if needed in future; for now, they ignore auth.

---

## 7. Security Considerations

### 7.1 XSS & Token Exposure

- Never interpolate tokens into the DOM or logs.
- Avoid storing access tokens in `localStorage` in production; use memory or HTTP-only cookies.
- Sanitize user-entered content before rendering (notes, names, etc.).

### 7.2 CSRF

- If using cookies for auth in production:
  - Enable `SameSite=Lax` or `Strict` where possible.
  - For sensitive mutations (`POST /public/appointments`, `/admin/*`):
    - Backend should support CSRF protection (double-submit cookie or header token).
  - Frontend should:
    - Include CSRF header when backend provides one.

### 7.3 Role-Based Access Control

- Ensure admin-only features (settings, reports, onboarding) require `role === "ADMIN"`.
- Staff accounts:
  - Should not be able to change salon-wide branding, webhooks, or manage admins.

### 7.4 Error Handling and Leaks

- Avoid revealing whether an email exists in the system in login errors beyond dev environment.
- In production:
  - Generic message: “We couldn’t sign you in. Please check your details.”

---

## 8. Behavior with MSW vs Real Backend

### 8.1 MSW Environment

- Tokens are:
  - Generated and validated in-memory.
  - Expiry simulated by timestamps and optional test flags.
- For tests, you can:
  - Force token expiry by manipulating mock state.
  - Verify refresh behavior and logout logic.

### 8.2 Switching to Real Backend

- Use environment variables:
  - `NEXT_PUBLIC_API_BASE_URL` – when set, API client should call real backend instead of MSW.
  - `NEXT_PUBLIC_USE_MOCKS` – optional; `true` keeps MSW on even with API base.
- Auth abstraction:
  - Token storage and retrieval should be implemented behind a small interface:
    - `getAccessToken()`, `setAccessToken()`, `clearTokens()`.
  - For real backend with HTTP-only cookies:
    - These functions become no-ops, and the client relies on cookies being sent automatically.

---

## 9. Developer Guidance

- When adding new protected endpoints:
  - Update OpenAPI spec.
  - Update MSW handler to validate bearer tokens.
  - Use React Query hooks that read from `useAuth()` for token injection.
- When debugging auth:
  - Use a dedicated dev panel (optional) to show:
    - Current user.
    - Token expiry times.
    - Tenant.


