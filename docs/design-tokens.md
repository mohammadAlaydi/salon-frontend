## GLOWNOVA Design Tokens and Tailwind Mapping

This document defines the design tokens for GLOWNOVA and describes how they map into Tailwind configuration and CSS variables. It is **specification only** – engineers should translate this into `tailwind.config.ts`, `globals.css`, and the shadcn theme file.

---

### 1. Color Tokens

All colors are defined as CSS variables at the `:root` level for light mode and under `.dark` for dark mode. Tailwind color extensions should reference these via `rgb(var(--color-*) / <alpha-value>)` patterns.

#### 1.1 Core Brand Colors

- **Primary / Soft Rose**
  - Token: `--color-primary`
  - Hex: `#E6A4B4`
  - Usage: Primary buttons, key highlights, accent borders, hero gradients.

- **Primary Dark / Deep Rosewood**
  - Token: `--color-primary-dark`
  - Hex: `#B75C76`
  - Usage: Hover/active states, dark mode emphasis, selected items.

- **Secondary / Sage Green**
  - Token: `--color-secondary`
  - Hex: `#A8C3A2`
  - Usage: Secondary accents, subtle success backgrounds, tags/pills.

#### 1.2 Neutrals (Light Mode)

- **Text / Rich Charcoal**
  - Token: `--color-text`
  - Hex: `#1F1F1F`

- **Background / Warm White**
  - Token: `--color-bg`
  - Hex: `#FAF7F5`

- **Card / Soft Gray**
  - Token: `--color-surface`
  - Hex: `#E3E1DF`

- **Muted Text / Mid Gray**
  - Token: `--color-text-muted`
  - Hex: `#8C8C8C`

#### 1.3 Dark Mode

- **Background / Dark Mode Base**
  - Token: `--color-bg`
  - Hex (dark): `#0E0E0E`

- **Surface / Dark Mode Surface**
  - Token: `--color-surface`
  - Hex (dark): `#1A1A1A`

- **Text (Light on Dark)**
  - Token: `--color-text`
  - Hex (dark): `#F5F5F5`

- **Muted Text**
  - Token: `--color-text-muted`
  - Hex (dark): `#A3A3A3`

Primary and secondary colors stay the same but may be slightly lightened for dark mode in implementation if needed for contrast.

#### 1.4 Status Colors

- **Success**
  - Token: `--color-success`
  - Hex: `#4CAF50`

- **Warning**
  - Token: `--color-warning`
  - Hex: `#FFC107`

- **Error**
  - Token: `--color-error`
  - Hex: `#FF5252`

- **Info**
  - Token: `--color-info`
  - Hex: `#42A5F5`

#### 1.5 Tailwind Color Mapping

In Tailwind, define a `glownova` color namespace that maps to the CSS variables.

- **Tailwind theme extension (conceptual):**
  - `colors.glownova.primary` → `rgb(var(--color-primary) / <alpha-value>)`
  - `colors.glownova.primaryDark` → `rgb(var(--color-primary-dark) / <alpha-value>)`
  - `colors.glownova.secondary` → `rgb(var(--color-secondary) / <alpha-value>)`
  - `colors.glownova.bg` → `rgb(var(--color-bg) / <alpha-value>)`
  - `colors.glownova.surface` → `rgb(var(--color-surface) / <alpha-value>)`
  - `colors.glownova.text` → `rgb(var(--color-text) / <alpha-value>)`
  - `colors.glownova.textMuted` → `rgb(var(--color-text-muted) / <alpha-value>)`
  - `colors.status.success` → `rgb(var(--color-success) / <alpha-value>)`
  - `colors.status.warning` → `rgb(var(--color-warning) / <alpha-value>)`
  - `colors.status.error` → `rgb(var(--color-error) / <alpha-value>)`
  - `colors.status.info` → `rgb(var(--color-info) / <alpha-value>)`

These are **not** literal config snippets but describe the intended mapping.

---

### 2. Typography Tokens

#### 2.1 Font Families

- **UI Font / Inter**
  - Token: `--font-sans`
  - Stack: `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - Usage: Body text, labels, navigation, tables, form inputs.

- **Heading Font / Playfair Display**
  - Token: `--font-heading`
  - Stack: `"Playfair Display", "Times New Roman", serif`
  - Usage: Hero headings, page titles, key section headings.

#### 2.2 Font Weights

- Tokens:
  - `--font-weight-regular` = 400
  - `--font-weight-semibold` = 600
  - `--font-weight-bold` = 700

#### 2.3 Font Sizes & Line Heights

Base font size is 16px. Use a modular scale for headings:

- **Body / Default**
  - Token: `--text-body`
  - Size: 16px
  - Line-height: 1.6

- **Small**
  - Token: `--text-sm`
  - Size: 14px
  - Line-height: 1.5

- **Subheading**
  - Token: `--text-subheading`
  - Size: 18px
  - Line-height: 1.5

- **H4**
  - Token: `--text-h4`
  - Size: 20px
  - Line-height: 1.4

- **H3**
  - Token: `--text-h3`
  - Size: 24px
  - Line-height: 1.3

- **H2**
  - Token: `--text-h2`
  - Size: 28px
  - Line-height: 1.2

- **H1**
  - Token: `--text-h1`
  - Size: 32px
  - Line-height: 1.15

#### 2.4 Tailwind Font Mapping

- `fontFamily.sans` → `var(--font-sans)`
- `fontFamily.display` or `fontFamily.heading` → `var(--font-heading)`

Font sizes can be mapped to Tailwind utilities:

- `text-sm` → `var(--text-sm)`
- `text-base` → `var(--text-body)`
- `text-lg` → `var(--text-subheading)`
- `text-xl` → `var(--text-h4)`
- `text-2xl` → `var(--text-h3)`
- `text-3xl` → `var(--text-h2)`
- `text-4xl` → `var(--text-h1)`

---

### 3. Radius, Spacing, and Shadows

#### 3.1 Border Radius

Global radius is soft and consistent:

- **Base Radius**
  - Token: `--radius-md`
  - Value: `0.9rem` (14–16px)

- **Smaller Radius**
  - Token: `--radius-sm`
  - Value: `0.5rem`

- **Larger Radius**
  - Token: `--radius-lg`
  - Value: `1.25rem`

Mapping:

- Tailwind `borderRadius`:
  - `rounded-md` → `var(--radius-md)` (use for cards, modals, key UI blocks)
  - `rounded-lg` → `var(--radius-lg)` (hero cards, large CTAs)
  - `rounded-sm` → `var(--radius-sm)` (chips, tags)

#### 3.2 Spacing Scale

Use a 4px base grid with preferred spacing between 12–32px.

- Tokens:
  - `--space-1` = 4px
  - `--space-2` = 8px
  - `--space-3` = 12px
  - `--space-4` = 16px
  - `--space-5` = 20px
  - `--space-6` = 24px
  - `--space-7` = 28px
  - `--space-8` = 32px

Mapping:

- Tailwind `spacing` scale should be adjusted so `3` and `8` are used heavily:
  - `p-3` / `py-3` → 12px
  - `p-4` → 16px
  - `p-6` → 24px
  - `p-8` → 32px

#### 3.3 Shadows

Shadows are soft and spa-like, never harsh.

- **Card Shadow**
  - Token: `--shadow-card`
  - Value (concept): `0 10px 30px rgba(0, 0, 0, 0.08)`

- **Elevated Modal Shadow**
  - Token: `--shadow-elevated`
  - Value (concept): `0 18px 45px rgba(0, 0, 0, 0.16)`

Tailwind mapping:

- `boxShadow`:
  - `shadow-card` → `var(--shadow-card)`
  - `shadow-elevated` → `var(--shadow-elevated)`

---

### 4. Motion & Animation Tokens

Use Framer Motion for all animated components. Tokens define consistent durations and easing.

#### 4.1 Duration Tokens

- `--motion-fast` = 150ms (micro interactions)
- `--motion-normal` = 200ms (standard fades)
- `--motion-slow` = 250ms (slides, modal transitions)

#### 4.2 Easing Tokens

- `--easing-standard` = `cubic-bezier(0.22, 0.61, 0.36, 1)` (soft ease-out)
- `--easing-enter` = `cubic-bezier(0.16, 1, 0.3, 1)`
- `--easing-exit` = `cubic-bezier(0.7, 0, 0.84, 0)`

#### 4.3 Motion Patterns

- **Fade In**
  - Initial: opacity 0
  - Animate: opacity 1
  - Duration: `--motion-normal`

- **Slide Up (Modals/Drawers)**
  - Initial: opacity 0, translateY(16px)
  - Animate: opacity 1, translateY(0)
  - Duration: `--motion-slow`

- **CTA Hover Micro-Interaction**
  - Scale: 1 → 1.02
  - Duration: `--motion-fast`

Tailwind utilities can define a small set of keyframes/animations that mirror these patterns (e.g., `animate-fade-in`, `animate-slide-up`), but Framer Motion should handle most component-level animation.

---

### 5. Iconography Tokens

Use Lucide or Heroicons with consistent stroke weight (1.5–2).

- Icon color is derived from text tokens:
  - Default: `--color-text`
  - Muted: `--color-text-muted`
  - Accent: `--color-primary`

Semantic mapping:

- `icon.menu` → menu / hamburger
- `icon.calendar` → calendar
- `icon.user` → user
- `icon.settings` → settings/cog
- `icon.bell` → notifications
- `icon.check` → success/confirmation
- `icon.x` → close/dismiss

---

### 6. Theme & Dark Mode Wiring

#### 6.1 CSS Variable Structure

At a minimum, define:

- `:root` (light mode):
  - `--color-primary`, `--color-primary-dark`, `--color-secondary`
  - `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`
  - `--color-success`, `--color-warning`, `--color-error`, `--color-info`
  - `--font-sans`, `--font-heading`
  - Radius, spacing, shadow, motion tokens as above.

- `.dark` (dark mode):
  - Override `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`
  - Optionally slightly adjust `--color-primary` for contrast.

#### 6.2 Tailwind Dark Mode Strategy

- Configure Tailwind `darkMode` to `"class"`.
- Apply `.dark` class on `<html>` or `<body>` based on:
  - User preference toggle in settings.
  - Persisted value in `localStorage` per salon.

---

### 7. ShadCN Theme Overrides

Shadcn components should consume the same tokens via CSS variables:

- `--background` → `--color-bg`
- `--foreground` → `--color-text`
- `--primary` → `--color-primary`
- `--primary-foreground` → light-on-dark or white
- `--secondary` → `--color-secondary`
- `--muted` → `--color-surface`
- `--muted-foreground` → `--color-text-muted`
- `--destructive` → `--color-error`
- `--ring` → a subtle version of `--color-primary`

Ensure border radius tokens are wired:

- `--radius` → `--radius-md`

This allows shadcn primitives to look on-brand without forking their internal structure.


