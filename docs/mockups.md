## GLOWNOVA Screen-Level Mockups (Markdown)

This document describes static layouts for key screens. Use it as a blueprint when implementing pages and components.

Spacing references use the design tokens from `docs/design-tokens.md` (e.g., `--space-6` ≈ 24px).

---

## 1. Admin Dashboard (Desktop & Mobile)

### 1.1 Desktop Layout (`/admin/dashboard`)

- **Overall grid**
  - `AppShell` with sidebar on the left (fixed width ~260px), topbar at top.
  - Content area max-width: 1200–1280px, centered, with horizontal padding ~24px.
  - Vertical spacing between sections: 24px.

- **Header row**
  - Left: Page title `Dashboard` in Playfair Display (`text-2xl`).
  - Right: date range selector (“Today”, “This week”) and optional salon selector.
  - Elements aligned on a baseline; top margin from topbar: 16–24px.

- **KPI row**
  - Four `MetricCard`s in a responsive grid:
    - 4 columns on large screens (`min-width ~1200px`).
    - 2 columns on medium screens (`min-width ~768px`).
  - Each card:
    - Height: ~120–140px.
    - Padding: 20–24px.
    - Layout:
      - Top row: label left, icon right.
      - Middle: value in large font (`text-3xl` or `text-4xl` Inter).
      - Bottom: delta pill (e.g. “+12% vs last week”).

- **Main content region**
  - Two-column layout:
    - Left column (approx 60% width): “Today’s schedule” mini calendar or upcoming timeline.
    - Right column (approx 40% width): “Upcoming appointments” list.
  - On narrower screens (<1024px), stacks vertically with schedule above list.

- **Upcoming appointments list**
  - Card with soft surface, `--radius-md`, `--shadow-card`.
  - Each row:
    - Time on left (bold).
    - Service + customer name in middle.
    - Staff name and status badge on right.
  - Row height: ~56–64px; vertical spacing 8–12px.

### 1.2 Mobile Layout

- Sidebar collapses into a hamburger menu in `Topbar`.
- Content stacks vertically:
  - Title + date filter.
  - KPI cards in 2 columns or single column depending on width.
  - Upcoming list full width.
- Padding reduced to 16px.
- Floating action button (optional) bottom-right: “New appointment”.

---

## 2. Calendar Week View (`/admin/calendar`)

### 2.1 Desktop Layout

- **Header bar**
  - Left: title `Calendar`.
  - Center: week navigation:
    - `<<` (previous), `Today` (text button), `>>` (next).
    - Current week label (e.g., “Oct 21 – Oct 27”).
  - Right: staff filter dropdown + view toggle (Week/Day).

- **Grid**
  - Horizontal axis: days of week (Mon–Sun) or (Sun–Sat), each as a column.
  - Vertical axis: time slots (e.g., 8:00–20:00) as rows every 30 or 60 minutes.
  - Fixed left column: time labels (e.g., “8 AM”, “9 AM”).
  - Each day column:
    - Background alternating between surface and slightly tinted rows for readability.

- **Appointment blocks**
  - Rendered as rounded rectangles within day columns.
  - Height proportional to duration (e.g., 60-minute block spans 2 rows if the base slot is 30 minutes).
  - Color:
    - Background: light version of primary or secondary.
    - Border: `--color-primary`.
  - Content:
    - Line 1: time range (“10:00–11:00”).
    - Line 2: customer name.
    - Optional: service name truncated.
  - Drag handle area at top or left edge (subtle).

- **Interactions**
  - Hover: slight elevation (`shadow-card` intensifies), pointer cursor.
  - Selected: border accent and subtle glow.
  - Empty slots: on hover, show a faint “+” icon.

### 2.2 Tablet & Mobile

- Switch to **Day view** by default:
  - Tabs or dropdown to choose day.
  - Single column time grid with appointments stacked.
- Appointments use full width card style with timeline indicator on left.

---

## 3. Appointment Drawer

### 3.1 Desktop Drawer Layout

- **Position**: slides in from the right, width ~420–480px.
- **Container**:
  - Full height of viewport.
  - Background: `--color-surface` (light) or `--color-bg` (dark).
  - Box shadow: `--shadow-elevated`.

- **Header**
  - Title: “[Service] with [Customer]”.
  - Small subtitle: `[Date], [Time range]`.
  - Right side: close icon button (`X`).

- **Body sections (scrollable)**
  1. **Status & Actions**
     - Status badge with dropdown (Pending / Confirmed / Completed / Cancelled / No-show).
     - Quick action buttons:
       - “Mark as complete”.
       - “Cancel appointment”.
  2. **Details**
     - Two-column layout on desktop:
       - Left column:
         - Service name and duration.
         - Staff card (avatar, name).
       - Right column:
         - Customer info (name, phone, email).
  3. **Notes**
     - Textarea with label “Internal notes”.
  4. **History / Activity**
     - Timeline list showing creation time and any status changes.

- **Footer**
  - Sticks to bottom of drawer.
  - Contains:
    - Primary button: “Save changes”.
    - Secondary: “Close”.

### 3.2 Mobile Drawer

- Drawer takes full screen height; header becomes sticky at top.
- Sections stack vertically with generous spacing.

---

## 4. Public Booking Wizard (`/[salonSlug]/book`)

### 4.1 Desktop Layout

- **Global layout**
  - `PublicLayout` with minimal header (logo, back-to-home link).
  - Main content centered with max-width ~720–840px.
  - Background: warm white with soft gradient in hero area.

- **Stepper**
  - Horizontal stepper at top:
    - Steps: “Service”, “Stylist”, “Time”, “Details”, “Confirm”.
    - Each step as a circle with label below.
    - Current step: rose circle with white number.
    - Completed steps: smaller filled circles with check icon.

- **Content Card**
  - Single large `Card` with:
    - Header: step title and 1-line helper copy.
    - Body: inputs and options for current step.
    - Footer: navigation buttons.
  - Padding: ~24–28px, vertical spacing between fields ~16–20px.

- **Step specifics**
  - **Service step**:
    - List of `ServiceCard`s with radio selection.
    - Each card full-width with hover shadow and selected border highlight.
  - **Stylist step**:
    - Option at top: “No preference”.
    - Grid of `StaffCard`s (2 columns on desktop).
  - **Time step**:
    - DatePicker row at top.
    - `TimeSlotPicker` below in segmented layout: morning / afternoon / evening.
  - **Details step**:
    - Form fields stacked with `FormField` wrappers.
  - **Confirm step**:
    - Summary card with service, staff, time, price.
    - Subtle divider lines.

- **Navigation buttons**
  - Bottom of card:
    - Left: “Back” (secondary).
    - Right: “Next” or “Confirm booking” (primary).
  - Buttons aligned horizontally with space-between, stacked on mobile.

### 4.2 Mobile Layout

- Stepper becomes a horizontal scrollable or compact bar:
  - Show current step label and X/5.
- Content card becomes full width with reduced padding (~16px).
- Primary button moves to sticky footer:
  - Always visible “Next” / “Confirm” at bottom of screen.

---

## 5. Login Screen & Onboarding Wizard

### 5.1 Login (`/admin/login`)

- **Desktop**
  - Two-column layout:
    - Left: brand panel with gradient background, large heading “GLOWNOVA”, and tagline (“Beautiful bookings for modern salons.”).
    - Right: login card centered vertically.
  - Login card:
    - Width ~400px.
    - Card header:
      - Title: “Welcome back”.
      - Subtext: “Sign in to manage your salon.”
    - Form fields:
      - Email input.
      - Password input.
      - “Remember this device” checkbox.
    - Footer:
      - Primary button “Sign in”.
      - Link “Use demo account” inline under form.

- **Mobile**
  - Brand area collapses into small top header.
  - Login card takes full width with margin around edges.

### 5.2 Onboarding Wizard (`/admin/onboarding`)

- **Layout**
  - Centered multi-step wizard card (width ~720px).
  - Top: progress indicator (e.g., 4-step bar).
  - Body: form fields for current step.
  - Right side on large screens:
    - Preview panel showing how public booking page will look with chosen branding.

- **Steps**
  1. **Salon basics**
     - Inputs: name, address, timezone.
  2. **Services**
     - Simple repeater list to add a few key services.
  3. **Team**
     - Fields for adding first team members (name, role).
  4. **Branding**
     - Color pickers for primary/secondary.
     - Logo upload (with simple placeholder).

- **Navigation**
  - Buttons at bottom:
    - “Back” (except step 1).
    - “Next”.
    - Final step: “Finish setup”.

---

## 6. Visual Alignment with Brand

- Colors:
  - Primary CTAs use Soft Rose (`#E6A4B4`) with hover in Deep Rosewood (`#B75C76`).
  - Surfaces and cards use warm white and soft gray backgrounds.
  - Secondary accents (chips, highlights) use Sage Green (`#A8C3A2`).
- Typography:
  - Use Playfair Display for main page titles (dashboard, booking header).
  - Body and secondary text in Inter with 16px base size.
- Shadows and radius:
  - Cards and modals use `--radius-md` and `--shadow-card` for a spa-like softness.


