# GLOWNOVA Salon Management Frontend

A complete multi-tenant salon management system with admin dashboard and public booking interface.

## 🌸 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **API Mocking**: MSW (Mock Service Worker)
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd salon-frontend

# Install dependencies
npm install

# Start development server with MSW mocks
npm run dev
```

The app will be available at `http://localhost:3000`

### Demo Credentials

- **Email**: `admin@demo.local`
- **Password**: `Password123!`

## 📁 Project Structure

```
salon-frontend/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard pages
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard (protected)
│   │   └── layout.tsx      # Admin layout with AuthGuard
│   ├── [salonSlug]/        # Public tenant pages
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Global providers (Auth, React Query, MSW)
│   ├── msw-init.tsx        # MSW initialization
│   └── globals.css         # Global styles & design tokens
├── components/              # Reusable components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components (AppShell, Sidebar, etc.)
│   ├── ui/                 # shadcn/ui components
│   └── dashboard/          # Dashboard-specific components
├── contexts/                # React contexts
│   └── AuthContext.tsx     # Authentication context
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Auth hook
│   ├── useRequireAuth.ts   # Protected route hook
│   ├── useAdminAuth.ts     # Admin role check hook
│   └── useTenant.ts        # Multi-tenant context hook
├── lib/                     # Utilities and configuration
│   ├── apiClient.ts        # Typed API client with auto-refresh
│   ├── react-query.ts      # React Query configuration
│   ├── utils.ts            # Utility functions (cn, etc.)
│   ├── types/              # TypeScript type definitions
│   └── validations/        # Zod validation schemas
├── mocks/                   # MSW mock configuration
│   ├── browser.ts          # MSW browser setup
│   ├── server.ts           # MSW server setup (tests)
│   ├── state.ts            # In-memory mock state
│   ├── seed.ts             # Demo data seeding
│   ├── handlers/           # MSW request handlers
│   │   ├── auth.ts         # Auth endpoints
│   │   ├── public.ts       # Public booking endpoints
│   │   └── admin.ts        # Admin CRUD endpoints
│   └── utils/              # Mock utilities
│       └── tenantResolver.ts # Tenant resolution logic
├── docs/                    # Project documentation
└── public/                  # Static assets

## 🎨 Design System

### GLOWNOVA Brand Colors

- **Primary**: `#E6A4B4` (Soft Rose)
- **Primary Dark**: `#B75C76` (Deep Rosewood)
- **Secondary**: `#A8C3A2` (Sage Green)
- **Background (Light)**: `#FAF7F5` (Warm White)
- **Background (Dark)**: `#0E0E0E` (Dark Mode Base)

### Typography

- **UI Font**: Inter
- **Heading Font**: Playfair Display

### Spacing

4px base grid system (var(--space-1) through var(--space-8))

## 🔐 Authentication

The app uses JWT-based authentication with:

- Access tokens (30min expiry)
- Refresh tokens (7 days expiry)
- Automatic token refresh on 401
- Protected routes with `AuthGuard`
- Persistent sessions via localStorage

### Auth Flow

1. User logs in via `/admin/login`
2. Tokens stored in memory + localStorage (refresh token)
3. API client automatically injects `Authorization` header
4. On 401, client attempts token refresh
5. If refresh fails, user redirected to login

## 🏢 Multi-Tenancy

Tenant resolution priority:

1. Query parameter: `?tenant=demo-salon`
2. `X-Tenant-ID` header
3. Subdomain: `demo-salon.localhost:3000`
4. Default: `demo-salon`

All API requests include `X-Tenant-ID` header automatically.

## 🧪 MSW Mock Server

Development mode uses Mock Service Worker to simulate the backend:

- **Demo Salon**: `demo-salon`
- **Admin**: `admin@demo.local` / `Password123!`
- **Seeded Data**: 3 staff, 10 services, 5 customers, 5 appointments

### MSW Features

- ✅ Full CRUD operations
- ✅ Idempotency support (appointment creation)
- ✅ Concurrency conflict detection
- ✅ Realistic latency simulation (150ms)
- ✅ Multi-tenant data isolation

### Switching to Real API

Set environment variables:

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=https://api.your-backend.com
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with MSW mocks

# Building
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint and auto-fix
npm run lint:check       # Check linting without fixing
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # TypeScript type checking

# Testing (to be implemented)
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests with Playwright
npm run test:coverage    # Generate coverage report
```

## 🗂️ Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (empty for MSW mocks)
- `NEXT_PUBLIC_USE_MOCKS` - Enable/disable MSW (`true`/`false`)

## 🧩 Key Features Implemented

### ✅ Completed

- [x] Next.js 14 project setup with TypeScript
- [x] Tailwind CSS 4 + GLOWNOVA design system
- [x] shadcn/ui component library integration
- [x] MSW mock server with full API simulation
- [x] Authentication system (JWT, auto-refresh, protected routes)
- [x] API client with automatic token injection
- [x] Multi-tenant architecture
- [x] Responsive layout components (AppShell, Sidebar, Topbar, MobileNav)
- [x] Public layout for booking flow
- [x] Core UI components (Button, Input, Card, Table, Badge, Avatar)
- [x] Admin login page with form validation
- [x] Route protection (AuthGuard)
- [x] Environment configuration

### 🚧 In Progress / To Be Implemented

Admin pages, public routes, comprehensive testing, CI/CD, and final documentation are ready to be implemented following the established patterns.

## 🚀 Deployment

### Development

```bash
npm run dev
```

Runs on `http://localhost:3000` with MSW mocks enabled.

### Production Build

```bash
npm run build
npm run start
```

### Deployment Targets

- **Vercel**: Zero-config deployment
- **Hostinger VPS**: Docker + Nginx + PM2 (see docs/ci-cd-deployment.md)

## 📚 Documentation

Comprehensive specification documents are available in the `/docs` directory:

- `openapi.json` - API contract
- `design-tokens.md` - Design system specification
- `components-spec.md` - Component library specification
- `pages-flows-ux-spec.md` - Page layouts and UX flows
- `auth-architecture.md` - Authentication implementation guide
- `msw-mock-spec.md` - Mock server specification
- `testing-strategy.md` - Testing approach and coverage targets
- `ci-cd-deployment.md` - CI/CD and deployment guide

## 🤝 Contributing

This project follows strict TypeScript and ESLint rules. Ensure code passes:

```bash
npm run lint
npm run typecheck
npm run format
```

before committing.

## 📄 License

© 2024 GLOWNOVA. All rights reserved.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
