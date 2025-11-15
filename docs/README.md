# 📚 GLOWNOVA Documentation

Welcome to the comprehensive documentation for the GLOWNOVA frontend application.

---

## 📖 Documentation Index

### 🎯 Getting Started

Start here if you're new to the GLOWNOVA codebase:

1. **[COMPLETE_INTEGRATION_SUMMARY.md](./COMPLETE_INTEGRATION_SUMMARY.md)** ⭐️  
   **Read this first!** Executive summary of the entire system, features, architecture, and deployment guide.

2. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)**  
   Visual diagrams showing system architecture, data flow, authentication, MSW integration, and deployment structure.

### 🛠️ Feature Deep-Dives

Detailed walkthroughs of major features:

3. **[BOOKING_FLOW_GUIDE.md](./BOOKING_FLOW_GUIDE.md)**  
   Complete integration guide for the 5-step public booking flow, including:
   - Service selection
   - Staff selection
   - Date/time picker with availability
   - Customer details form
   - Booking confirmation
   - Idempotency implementation
   - MSW handlers

4. **[ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)**  
   Deep-dive into admin features:
   - Authentication flow
   - Layout architecture (AppShell, Sidebar, Topbar)
   - Dashboard metrics
   - Appointments management
   - Optimistic updates
   - Status transitions

### 🔧 Troubleshooting & History

5. **[DIAGNOSTIC_REPORT.md](./DIAGNOSTIC_REPORT.md)**  
   Historical record of issues found and fixes applied during the frontend repair, including:
   - Tailwind configuration issues
   - Layout system problems
   - API client errors
   - TypeScript fixes

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
```

### Installation

```bash
# Install dependencies
npm install

# Start development server (with MSW mocks)
npm run dev

# Visit http://localhost:3000
```

### Key Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues

# Production
npm run build            # Build for production
npm start                # Start production server

# Testing
npm run test             # Run Vitest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:coverage    # Generate coverage report
```

---

## 📁 Project Structure

```
salon-frontend/
├── app/                    # Next.js App Router
│   ├── (admin)            # Admin routes with AuthGuard
│   ├── (public)           # Public booking flow
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # GLOWNOVA design system
│   └── providers.tsx      # Global providers
│
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Shell, Sidebar, Topbar
│   ├── auth/             # AuthGuard
│   └── [feature]/        # Feature-specific components
│
├── hooks/                 # React Query hooks
│   ├── api/              # API data hooks
│   ├── booking/          # Booking flow hooks
│   └── ...
│
├── lib/                   # Utilities & configuration
│   ├── apiClient.ts      # API wrapper with auth
│   ├── react-query.ts    # QueryClient setup
│   ├── types/            # TypeScript types
│   └── validations/      # Zod schemas
│
├── mocks/                 # MSW mock handlers
│   ├── handlers/         # Request handlers
│   ├── seed.ts           # Mock data
│   └── state.ts          # In-memory DB
│
└── docs/                  # 📚 You are here!
    ├── README.md         # This file
    ├── COMPLETE_INTEGRATION_SUMMARY.md
    ├── ARCHITECTURE_DIAGRAM.md
    ├── BOOKING_FLOW_GUIDE.md
    ├── ADMIN_DASHBOARD_GUIDE.md
    └── DIAGNOSTIC_REPORT.md
```

---

## 🎨 Design System

### Brand Colors

```css
/* Primary */
Rose: #E6A4B4
Deep Rosewood: #B75C76
Sage Green: #A8C3A2

/* Status */
Success: #4CAF50
Warning: #FFC107
Error: #FF5252
Info: #42A5F5
```

### Typography

```css
Body: Inter (--font-sans)
Headings: Playfair Display (--font-heading)
```

### Usage

```tsx
<div className="bg-glownova-primary text-white rounded-lg shadow-card">
  <h1 className="font-heading text-3xl">GLOWNOVA</h1>
  <p className="text-muted-foreground">Multi-tenant salon management</p>
</div>
```

**Full design tokens**: See `app/globals.css`

---

## 🔐 Authentication

### Demo Account

```
Email: admin@demo-salon.com
Password: demo123
```

### Flow

1. User visits protected route (`/admin/dashboard`)
2. `AuthGuard` checks authentication
3. If not authenticated, redirect to `/admin/login`
4. After login, tokens stored in `AuthContext` + localStorage
5. All API calls include `Authorization: Bearer {token}`
6. Token refresh on 401 error

**Details**: [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md#authentication-flow)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with demo account
- [ ] Dashboard loads with metrics
- [ ] Create appointment
- [ ] Update appointment status
- [ ] Complete booking flow (all 5 steps)
- [ ] Generate report and export CSV
- [ ] Update salon branding

### E2E Testing

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npx playwright test --ui
```

**Example test**: See [BOOKING_FLOW_GUIDE.md](./BOOKING_FLOW_GUIDE.md#testing-the-flow)

---

## 🚢 Deployment

### Environment Variables

```bash
# Production
NEXT_PUBLIC_API_BASE_URL=https://api.glownova.com
NEXT_PUBLIC_USE_MOCKS=false
NODE_ENV=production

# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCKS=true
NODE_ENV=development
```

### Build & Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel deploy
```

**Full deployment guide**: [COMPLETE_INTEGRATION_SUMMARY.md](./COMPLETE_INTEGRATION_SUMMARY.md#deployment-checklist)

---

## 📊 Key Features

### ✅ Admin Portal

- **Dashboard**: Real-time metrics, upcoming appointments, calendar
- **Appointments**: CRUD operations, filtering, status updates
- **Staff**: Profile management, working hours, skills
- **Customers**: Contact info, appointment history
- **Services**: Catalog with pricing and categories
- **Reports**: Revenue charts, top services, CSV export
- **Settings**: Branding customization, business hours

### ✅ Public Booking

- **5-Step Flow**: Services → Staff → Time → Details → Confirmation
- **Real-time Availability**: Dynamic slot generation
- **Conflict Detection**: Prevents double-booking
- **Idempotency**: Safe retry mechanism
- **Calendar Download**: ICS file generation

### ✅ Multi-tenancy

- Tenant isolation via `X-Tenant-ID` header
- Branded salon landing pages
- Per-tenant customization (colors, logo)

---

## 🛠️ Tech Stack

```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS + shadcn/ui
State: React Query (TanStack Query)
Forms: React Hook Form + Zod
Animations: Framer Motion
Mocking: MSW (Mock Service Worker)
Charts: Recharts
Dates: date-fns
Icons: Lucide React
Notifications: Sonner
```

---

## 🤝 Contributing

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write JSDoc for complex functions
- Use semantic commit messages

### Commit Format

```
type(scope): subject

Examples:
feat(booking): add calendar export
fix(auth): resolve token refresh race condition
docs(admin): update dashboard guide
```

---

## 📞 Support

### Documentation

- [Complete Integration Summary](./COMPLETE_INTEGRATION_SUMMARY.md) - Full system overview
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAM.md) - Visual system architecture
- [Booking Flow Guide](./BOOKING_FLOW_GUIDE.md) - Public booking deep-dive
- [Admin Dashboard Guide](./ADMIN_DASHBOARD_GUIDE.md) - Admin features deep-dive

### Troubleshooting

Common issues and solutions: [DIAGNOSTIC_REPORT.md](./DIAGNOSTIC_REPORT.md)

---

## 📝 License

**Proprietary** - GLOWNOVA Multi-tenant Salon Management System  
© 2025 GLOWNOVA. All rights reserved.

---

## ✨ Status

**Current Version**: 1.0  
**Status**: ✅ Production-ready  
**Last Updated**: November 15, 2025

---

**🎉 The GLOWNOVA frontend is complete and fully documented!**

Start with [COMPLETE_INTEGRATION_SUMMARY.md](./COMPLETE_INTEGRATION_SUMMARY.md) for the best overview.

