## GLOWNOVA Component Inventory

This document describes the core component library for GLOWNOVA. It is a **specification**, not implementation code. All components are React + TypeScript, styled with Tailwind and shadcn primitives, and must be accessible and responsive.

For each component:
- Props are described as TypeScript-like signatures (for reference only).
- Accessibility and interaction rules are explicitly noted.

---

### 1. Layout Components

#### 1.1 `AppShell`

- **Purpose**: Main admin layout with sidebar, topbar, and content region.
- **Used in**: All `/admin/*` routes after login.
- **Key props**:
  - `sidebar: ReactNode` – sidebar content (usually `<Sidebar />`).
  - `topbar: ReactNode` – top bar content (`<Topbar />`).
  - `children: ReactNode` – page content.
  - `withPadding?: boolean` – toggles standard page padding.
- **Behavior**:
  - Responsive layout: desktop shows fixed sidebar; mobile uses a collapsible drawer triggered by Topbar.
  - Content region scrolls independently; sidebar remains fixed.
- **Accessibility**:
  - Landmarks: `<header>` for topbar, `<nav>` for sidebar, `<main>` for content.
  - Includes a "Skip to content" link at top that jumps to main.

#### 1.2 `PublicLayout`

- **Purpose**: Layout for public booking pages.
- **Key props**:
  - `header?: ReactNode`
  - `footer?: ReactNode`
  - `children: ReactNode`
- **Behavior**:
  - Sticky top navigation (brand + Book CTA).
  - Central, narrow content column on desktop, full-width on mobile.
- **Accessibility**:
  - Semantic `<header>`, `<main>`, `<footer>`.
  - Navigation links with clear focus styles.

---

### 2. Navigation Components

#### 2.1 `Sidebar`

- **Purpose**: Admin navigation for main sections.
- **Key props**:
  - `items: { label: string; icon: IconType; href: string; badgeCount?: number }[]`
  - `currentPath: string`
- **Behavior**:
  - Highlights active item based on `currentPath`.
  - Collapsed mode for small viewports (icons only).
- **Accessibility**:
  - `<nav aria-label="Admin main">`.
  - List of `<button>` or `<a>` elements with `aria-current="page"` where active.

#### 2.2 `Topbar`

- **Purpose**: Top navigation with search, salon selector, user menu.
- **Key props**:
  - `onToggleSidebar?: () => void` (mobile).
  - `user: { name: string; role: string; avatarUrl?: string }`
  - `salonName: string`
- **Behavior**:
  - Shows user avatar/menu (profile, logout).
  - Optional global search input.
- **Accessibility**:
  - `role="banner"` or `<header>`.
  - User menu is a menu button with keyboard navigation (Arrow keys, Esc).

#### 2.3 `MobileNav`

- **Purpose**: Bottom navigation for mobile admin.
- **Key props**:
  - Similar to Sidebar but optimized for 3–5 primary actions.
- **Accessibility**:
  - `<nav aria-label="Primary">`.
  - Large tap targets (min 44x44px).

---

### 3. Data Display Components

#### 3.1 `Card`

- **Purpose**: Base card for grouping content.
- **Key props**:
  - `title?: string`
  - `subtitle?: string`
  - `children: ReactNode`
  - `className?: string`
- **Behavior**:
  - Uses soft background surface, `--radius-md`, and `--shadow-card`.
- **Accessibility**:
  - Semantic `<section>` with optional `aria-labelledby` when `title` present.

#### 3.2 `MetricCard`

- **Purpose**: Dashboard KPI card.
- **Key props**:
  - `label: string`
  - `value: string | number`
  - `delta?: { value: number; direction: "up" | "down" }`
  - `icon?: IconType`
- **Behavior**:
  - Shows main value prominently; delta indicated via color & arrow.
- **Accessibility**:
  - `aria-label` describing metric and trend.

#### 3.3 `Table`

- **Purpose**: Generic data table, built on shadcn `Table`.
- **Key props**:
  - `columns: { key: string; header: string; render: (row: any) => ReactNode }[]`
  - `data: any[]`
  - `emptyState?: ReactNode`
  - `sortable?: boolean`
- **Behavior**:
  - Optional sort controls in headers.
  - Integrates with pagination/sorting in parent.
- **Accessibility**:
  - `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`.
  - Row actions accessible via keyboard.

#### 3.4 `Avatar`

- **Purpose**: Circular avatar for staff/users.
- **Key props**:
  - `src?: string`
  - `alt: string`
  - `fallback: string` (initials).
- **Accessibility**:
  - `<img>` with descriptive `alt` or initials rendered as text.

#### 3.5 `Badge` / `Tag` / `Pill`

- **Purpose**: Small labels (status, service type).
- **Key props**:
  - `variant: "default" | "success" | "warning" | "error" | "info" | "outline"`
  - `children: ReactNode`
- **Behavior**:
  - Color-coded using status tokens.

---

### 4. Form Components

All form components integrate with React Hook Form via a common `FormField` wrapper.

#### 4.1 `FormField`

- **Purpose**: Wrapper for labels, inputs, errors.
- **Key props**:
  - `name: string`
  - `label: string`
  - `description?: string`
  - `required?: boolean`
  - `children: ReactNode` (render prop or field component).
- **Accessibility**:
  - Associates `<label>` via `htmlFor`.
  - Renders error in an element with `role="alert"` and links via `aria-describedby`.

#### 4.2 `Input`

- **Purpose**: Text/number/email fields.
- **Key props**:
  - `type?: "text" | "email" | "password" | "number" | "tel"`
  - `value`, `onChange`, `placeholder`
  - `disabled?: boolean`
  - `className?: string`
- **Accessibility**:
  - Standard input semantics.
  - Visible focus ring using primary color.

#### 4.3 `Select`

- **Purpose**: Dropdown select (staff, services).
- **Key props**:
  - `options: { value: string; label: string }[]`
  - `value?: string`
  - `onChange: (value: string) => void`
  - `placeholder?: string`
- **Accessibility**:
  - Either native `<select>` or ARIA-compliant custom select from shadcn.

#### 4.4 `DatePicker`

- **Purpose**: Pick date for appointments/reports.
- **Key props**:
  - `value?: Date`
  - `onChange: (date: Date | null) => void`
  - `minDate?: Date`
  - `maxDate?: Date`
- **Accessibility**:
  - Keyboard navigation across days/weeks.
  - Announces selected date to screen readers.

#### 4.5 `TimePicker`

- **Purpose**: Select time slot (hh:mm).
- **Key props**:
  - `value?: string` (ISO time, e.g., `"14:30"`)
  - `onChange: (value: string) => void`
  - `stepMinutes?: number`
- **Accessibility**:
  - Tab/arrow navigation across times.
  - Visible selected state.

#### 4.6 `Switch`, `Checkbox`, `RadioGroup`

- Wrap shadcn primitives with:
  - Clear labels.
  - `aria-checked` / `role="switch"` where applicable.

#### 4.7 `Button`

- **Purpose**: Primary CTA and secondary actions.
- **Variants**:
  - `variant: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"`
  - `size: "sm" | "md" | "lg"`
- **Behavior**:
  - Primary: rose background, white text, subtle scale hover.
  - Disabled: lower opacity and no hover scale.
- **Accessibility**:
  - `type="button"` by default to avoid accidental form submits.
  - Loading state can show spinner and `aria-busy="true"`.

---

### 5. Booking and Calendar Components

#### 5.1 `CalendarWeek`

- **Purpose**: Weekly calendar view for admin.
- **Key props**:
  - `weekStart: Date`
  - `appointments: Appointment[]` (type from OpenAPI)
  - `staffFilter?: string`
  - `onSelectSlot: (slot: { start: Date; end: Date; staffId?: string }) => void`
  - `onSelectAppointment: (appointmentId: string) => void`
  - `onMoveAppointment: (id: string, nextStart: Date, nextEnd: Date) => void` (drag-and-drop).
- **Behavior**:
  - Renders columns by day, rows by hour.
  - Appointments show as colored blocks; can be dragged to new times.
  - Clicking empty slot triggers quick-create flow via `onSelectSlot`.
- **Accessibility**:
  - Each appointment block is a button with `aria-label` summarizing booking.
  - Keyboard support for moving appointments: arrow keys with modifiers to adjust time.

#### 5.2 `TimeSlotPicker`

- **Purpose**: Public booking – show available slots for a given staff/service/day.
- **Key props**:
  - `slots: { start: Date; end: Date; isReserved?: boolean }[]`
  - `selectedSlot?: { start: Date; end: Date }`
  - `onSelectSlot: (slot: { start: Date; end: Date }) => void`
- **Behavior**:
  - Groups slots by time-of-day (morning/afternoon/evening).
  - Temporarily locks selected slot (marks as reserved) until user completes or cancels.
- **Accessibility**:
  - Each slot is a radio-style button with `aria-checked` and part of a `radiogroup`.

#### 5.3 `AppointmentDrawer`

- **Purpose**: Slide-over drawer for viewing/editing appointment details.
- **Key props**:
  - `appointmentId: string | null`
  - `open: boolean`
  - `onClose: () => void`
- **Behavior**:
  - Loads appointment details via React Query when opened.
  - Allows editing status, notes, and rescheduling.
- **Accessibility**:
  - Drawer has `role="dialog"` with `aria-modal="true"`.
  - Focus trapped inside; Esc closes; header has accessible close button.

#### 5.4 `StaffCard`

- **Purpose**: Display staff info and availability summary.
- **Key props**:
  - `staff: StaffProfile` (from OpenAPI)
  - `onSelect?: () => void`
- **Behavior**:
  - Shows avatar, name, specialties, rating, next available slot.
  - Clickable card optionally used to select staff in booking flow.

#### 5.5 `ServiceCard`

- **Purpose**: Display service details (name, duration, price).
- **Key props**:
  - `service: Service`
  - `onBook?: () => void`
- **Behavior**:
  - Shows price and duration prominently, with "Book" button.

---

### 6. Feedback & Overlay Components

#### 6.1 `Toast` System

- **Purpose**: Global notifications (success, error, info).
- **Key behaviors**:
  - Position: top-right on desktop, full-width top on mobile.
  - Variants: success, error, warning, info.
  - Auto-dismiss with pause-on-hover.
- **Accessibility**:
  - `role="status"` for non-critical info; `role="alert"` for errors.
  - Respect reduced motion preference.

#### 6.2 `Modal`

- **Purpose**: Centered overlay dialog (e.g., delete confirmation).
- **Key props**:
  - `open: boolean`
  - `title: string`
  - `description?: string`
  - `onClose: () => void`
  - `children: ReactNode`
- **Accessibility**:
  - `role="dialog"`, `aria-modal="true"`.
  - Focus trap; Esc closes; clicking backdrop can optionally close.

#### 6.3 `Drawer`

- **Purpose**: Side panel for appointment details, settings on mobile.
- Behavior and accessibility similar to `Modal` but anchored to edge and slide-in animation.

#### 6.4 `ConfirmDialog`

- **Purpose**: Simple confirm/cancel modal for destructive actions.
- **Props**:
  - `title`, `description`, `confirmLabel`, `cancelLabel`
  - `onConfirm`, `onCancel`

#### 6.5 `LoadingSpinner`, `EmptyState`, `ErrorState`

- **Purpose**: Standardized loading and fallback UIs.
- **Accessibility**:
  - Loading: `role="status"` with text like "Loading appointments…".
  - Error: `role="alert"` with retry action button.

---

### 7. Authentication & Utility Components

#### 7.1 `AuthGuard`

- **Purpose**: Protect admin pages and redirect unauthenticated users.
- **Key props**:
  - `children: ReactNode`
  - `requiredRole?: "ADMIN" | "STAFF"`
- **Behavior**:
  - Checks auth state from `useAuth`.
  - Shows loading spinner while validating token/refresh.
  - Redirects to `/admin/login` if not authenticated.

#### 7.2 `ThemeToggle`

- **Purpose**: Toggle light/dark mode.
- **Behavior**:
  - Updates `document.documentElement` class (`dark`).
  - Persists preference in `localStorage` under a salon-scoped key.
- **Accessibility**:
  - `role="switch"` with `aria-checked`.

---

### 8. Hooks (Specification)

Hooks are not visual components but are central to behavior.

#### 8.1 `useAuth`

- **Responsibilities**:
  - Expose `user`, `accessToken`, `isAuthenticated`, `login`, `logout`, `refresh`.
  - Integrate with React Query for token-aware requests.
  - Use MSW during dev; later real backend.

#### 8.2 `useBooking`

- **Responsibilities**:
  - Manage booking flow state: selected service, staff, date, slot, customer info.
  - Provide `reset`, `setStep`, `submitBooking`.

#### 8.3 `useTenant`

- **Responsibilities**:
  - Derive current tenant from host (e.g., `demo-salon.localhost`) or `tenant` query param.
  - Provide `tenantId`, `salonSlug`, and header metadata for API calls.

---

### 9. Visual Notes (Figma-like Summaries)

#### 9.1 Admin Dashboard

- Layout:
  - `AppShell` with sidebar on left (256px), topbar at top.
  - Content area: 3-column grid on desktop containing four `MetricCard`s.
  - Below metrics: two-column layout – left calendar preview, right upcoming appointments list.
- Spacing:
  - Outer padding: 24px.
  - Cards separated by 16px.

#### 9.2 Public Booking Wizard

- Steps:
  - Stepper at top (Service → Staff → Time → Details → Confirm).
  - Each step uses `<Card>` with clear headings and CTAs.
- Mobile:
  - Vertical stack, sticky bottom bar with "Next" button.


