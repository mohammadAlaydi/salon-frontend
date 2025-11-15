# 🎨 GLOWNOVA Admin Dashboard - Complete Integration Guide

This document demonstrates the complete admin dashboard experience, showing authentication flow, layout structure, metrics, appointments management, and how all components work together.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Layout Architecture](#layout-architecture)
4. [Dashboard Page](#dashboard-page)
5. [Appointments Management](#appointments-management)
6. [Design System Consistency](#design-system-consistency)
7. [Real-time Updates](#real-time-updates)

---

## Overview

The GLOWNOVA admin dashboard provides a complete salon management interface:

```
/admin                  → Redirects to /admin/dashboard
/admin/login            → Authentication (bypasses AuthGuard)
/admin/dashboard        → Metrics, upcoming appointments, mini calendar
/admin/appointments     → Full appointment list with filtering, status updates
/admin/staff            → Staff management with working hours
/admin/customers        → Customer profiles and appointment history
/admin/services         → Service catalog management
/admin/reports          → Revenue charts, top services, CSV export
/admin/settings         → Branding, integrations, business hours
/admin/calendar         → Calendar view of all appointments
```

---

## Authentication Flow

### Login Page (`app/admin/login/page.tsx`)

**Purpose**: Authenticate admin/staff users before accessing protected routes.

**Features**:
- Email + password form with validation
- "Use Demo Account" quick login button
- Form validation with React Hook Form + Zod
- Loading states during authentication
- Error handling with toast notifications
- Redirect to dashboard on success

**Form Schema** (`lib/validations/auth.ts`):
```typescript
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
```

**Authentication Hook** (`contexts/AuthContext.tsx`):
```typescript
const { login, isLoading } = useAuth();

const onSubmit = async (data: LoginData) => {
  try {
    await login(data.email, data.password);
    router.push("/admin/dashboard");
  } catch (error) {
    toast.error("Login failed", {
      description: "Invalid email or password",
    });
  }
};
```

**Demo Account Feature**:
```typescript
const handleDemoLogin = async () => {
  try {
    await login("admin@demo-salon.com", "demo123");
    router.push("/admin/dashboard");
  } catch (error) {
    toast.error("Demo login failed");
  }
};
```

**Design**:
```tsx
<div className="min-h-screen flex items-center justify-center bg-glownova-bg">
  <Card className="w-full max-w-md shadow-elevated">
    <CardHeader className="text-center">
      <div className="mb-4 text-5xl">🌸</div>
      <CardTitle className="font-heading text-2xl">
        Welcome to GLOWNOVA
      </CardTitle>
      <CardDescription>
        Sign in to manage your salon
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email input */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@salon.com"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-status-error">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-status-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {/* Demo button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
        >
          Use Demo Account
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
```

**MSW Handler** (`mocks/handlers/auth.ts`):
```typescript
http.post("/auth/login", async ({ request }) => {
  const { email, password } = await request.json();

  // Find user in mock database
  const user = USERS_DB.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return new HttpResponse(null, {
      status: 401,
      statusText: "Invalid credentials",
    });
  }

  // Generate tokens
  const accessToken = generateToken(user.id, "access");
  const refreshToken = generateToken(user.id, "refresh");

  // Store session
  SESSIONS_DB.set(refreshToken, {
    userId: user.id,
    tenantId: user.tenantId,
    createdAt: Date.now(),
  });

  return HttpResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});
```

### AuthGuard Component (`components/auth/AuthGuard.tsx`)

**Purpose**: Protect admin routes, redirect unauthenticated users to login.

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/admin/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-16 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
```

### Admin Layout with Conditional AuthGuard (`app/admin/layout.tsx`)

**Purpose**: Apply shell layout and authentication to all admin routes except login.

```typescript
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/app-shell";

const AUTH_PUBLIC_ROUTES = ["/admin/login", "/admin/register"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public auth routes bypass AuthGuard
  if (AUTH_PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Protected routes get shell + auth
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
```

---

## Layout Architecture

### AppShell Component (`components/layout/app-shell.tsx`)

**Purpose**: Main layout structure with sidebar, topbar, and content area.

**Structure**:
```
┌─────────────────────────────────────────┐
│  Topbar (user menu, notifications)     │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │     Page Content             │
│ (nav)    │                              │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Implementation**:
```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-glownova-bg">
      {/* Topbar */}
      <Topbar
        user={user}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content */}
        <main
          className={cn(
            "flex-1 p-8 transition-all duration-200",
            isSidebarOpen ? "lg:ml-64" : "ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Sidebar Component (`components/layout/sidebar.tsx`)

**Navigation Items**:
```typescript
const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
    badge: upcomingCount, // Dynamic count
  },
  {
    name: "Staff",
    href: "/admin/staff",
    icon: Users,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: UserCircle,
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Scissors,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
```

**Active State**:
```tsx
const pathname = usePathname();

{navigation.map((item) => {
  const isActive = pathname === item.href;
  
  return (
    <Link
      key={item.name}
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isActive
          ? "bg-glownova-primary text-white"
          : "text-muted-foreground hover:bg-glownova-surface hover:text-glownova-text"
      )}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.name}</span>
      {item.badge && (
        <Badge className="ml-auto" variant="secondary">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
})}
```

**Mobile Navigation**:
```tsx
// Mobile menu (hamburger)
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent side="left" className="w-64 p-0">
    <div className="p-6">
      <div className="mb-8 text-center">
        <div className="text-3xl mb-2">🌸</div>
        <h2 className="font-heading text-xl font-bold text-glownova-primary">
          GLOWNOVA
        </h2>
      </div>
      
      <nav className="space-y-2">
        {/* Same navigation items */}
      </nav>
    </div>
  </SheetContent>
</Sheet>
```

### Topbar Component (`components/layout/topbar.tsx`)

**Features**:
- User avatar and name
- Notifications dropdown (future)
- Settings quick access
- Logout button

```tsx
export function Topbar({
  user,
  onMenuClick,
}: {
  user: User | null;
  onMenuClick: () => void;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo (desktop) */}
        <div className="hidden lg:flex items-center gap-2 ml-4">
          <div className="text-2xl">🌸</div>
          <span className="font-heading text-lg font-bold text-glownova-primary">
            GLOWNOVA
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-glownova-primary text-white">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

---

## Dashboard Page

### Page Structure (`app/admin/dashboard/page.tsx`)

**Sections**:
1. **Metric Cards**: Revenue, appointments, customers, no-shows
2. **Upcoming Appointments**: Today's schedule
3. **Mini Calendar**: Quick date navigation

**Data Sources**:
```typescript
const { data: dailyReport } = useDailyReport();
const { data: upcomingAppointments } = useUpcomingAppointments();
```

### Metric Cards Component (`components/dashboard/MetricCards.tsx`)

**Interface**:
```typescript
interface MetricCardData {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}
```

**Implementation**:
```tsx
export function MetricCards({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={cn(
            "transition-all hover:shadow-elevated",
            metric.variant === "error" && "border-status-error/50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className={cn(
                "rounded-full p-2",
                metric.variant === "success" && "bg-status-success/10 text-status-success",
                metric.variant === "error" && "bg-status-error/10 text-status-error",
                !metric.variant && "bg-glownova-primary/10 text-glownova-primary"
              )}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtext}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
```

**Usage in Dashboard**:
```tsx
const metrics = useMemo(() => [
  {
    label: "Today's Revenue",
    value: dailyReport ? `$${(dailyReport.revenueCents / 100).toFixed(2)}` : "$0.00",
    subtext: "Total earnings today",
    variant: "success" as const,
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Appointments",
    value: dailyReport?.totalAppointments ?? 0,
    subtext: `${dailyReport?.completedAppointments ?? 0} completed`,
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "New Customers",
    value: dailyReport?.newCustomersCount ?? 0,
    subtext: "First-time visitors",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "No-shows",
    value: dailyReport?.noShowCount ?? 0,
    subtext: "Today's no-shows",
    variant: (dailyReport?.noShowCount ? "error" : "default") as "error" | "default",
    icon: <XCircle className="h-5 w-5" />,
  },
], [dailyReport]);

return <MetricCards metrics={metrics} />;
```

**MSW Handler** (`mocks/handlers/admin.ts`):
```typescript
http.get("/admin/reports/daily", ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  // Filter appointments for the given date
  const dayAppointments = APPOINTMENTS_DB.filter((apt) =>
    format(parseISO(apt.startTime), "yyyy-MM-dd") === date
  );

  const report: DailyReport = {
    date,
    totalAppointments: dayAppointments.length,
    completedAppointments: dayAppointments.filter(a => a.status === "completed").length,
    cancelledAppointments: dayAppointments.filter(a => a.status === "cancelled").length,
    noShowCount: dayAppointments.filter(a => a.status === "no-show").length,
    revenueCents: dayAppointments
      .filter(a => a.status === "completed")
      .reduce((sum, apt) => {
        const service = SERVICES_DB.find(s => s.id === apt.serviceId);
        return sum + (service?.priceCents || 0);
      }, 0),
    newCustomersCount: new Set(
      dayAppointments
        .filter(a => {
          // First appointment for this customer
          const customerAppointments = APPOINTMENTS_DB.filter(
            other => other.customerEmail === a.customerEmail
          );
          return customerAppointments[0]?.id === a.id;
        })
        .map(a => a.customerEmail)
    ).size,
  };

  return HttpResponse.json(report);
});
```

### Upcoming Appointments Component (`components/dashboard/UpcomingAppointments.tsx`)

**Purpose**: Show today's schedule with quick status updates.

```tsx
export function UpcomingAppointments({
  appointments,
  isLoading,
}: {
  appointments: Appointment[];
  isLoading: boolean;
}) {
  const { data: services } = useServices();
  const { data: staff } = useStaff();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mb-4 text-5xl">📅</div>
        <h3 className="text-lg font-semibold">No appointments today</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your schedule is clear for today
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const service = services?.find(s => s.id === appointment.serviceId);
            const staffMember = staff?.find(s => s.id === appointment.staffId);

            return (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-glownova-surface/30 transition-colors"
              >
                {/* Time */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-glownova-primary/10 px-3 py-2 min-w-[80px]">
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(appointment.startTime), "h:mm")}
                  </span>
                  <span className="text-sm font-semibold text-glownova-primary">
                    {format(parseISO(appointment.startTime), "a")}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <p className="font-semibold">{appointment.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {service?.name} with {staffMember?.name}
                  </p>
                </div>

                {/* Status badge */}
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>

                {/* Quick actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/appointments?id=${appointment.id}`)}
                >
                  View
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Mini Calendar Component (`components/dashboard/MiniCalendar.tsx`)

**Purpose**: Quick date navigation and appointment density visualization.

```tsx
export function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();

  // Fetch appointments for the selected month (for density visualization)
  const { data: monthAppointments } = useAppointmentsList({
    from: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
    to: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
  });

  // Count appointments per day
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, number>();
    monthAppointments?.forEach((apt) => {
      const day = format(parseISO(apt.startTime), "yyyy-MM-dd");
      map.set(day, (map.get(day) || 0) + 1);
    });
    return map;
  }, [monthAppointments]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      router.push(`/admin/calendar?date=${format(date, "yyyy-MM-dd")}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>
          Click a date to view appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          selected={selectedDate}
          onSelect={handleDateSelect}
          modifiers={{
            booked: (date) => {
              const day = format(date, "yyyy-MM-dd");
              return (appointmentsByDay.get(day) || 0) > 0;
            },
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "rgba(230, 164, 180, 0.2)",
              fontWeight: "bold",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
```

---

## Appointments Management

### Appointments Page (`app/admin/appointments/page.tsx`)

**Features**:
- Filterable table (date range, staff, status)
- Search by customer name/email
- Status update menu
- Create new appointment modal
- Edit appointment modal
- Pagination

**State Management**:
```typescript
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
const [filters, setFilters] = useState<AppointmentFilters>({});

const { data: appointments, isLoading } = useAppointmentsList(filters);
```

**Filters UI**:
```tsx
<div className="flex flex-wrap gap-4 mb-6">
  {/* Date range */}
  <div className="flex gap-2">
    <Input
      type="date"
      value={filters.from || ""}
      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
      placeholder="From"
    />
    <Input
      type="date"
      value={filters.to || ""}
      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
      placeholder="To"
    />
  </div>

  {/* Staff filter */}
  <Select
    value={filters.staffId || "all"}
    onValueChange={(value) =>
      setFilters({ ...filters, staffId: value === "all" ? undefined : value })
    }
  >
    <SelectTrigger className="w-48">
      <SelectValue placeholder="All Staff" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Staff</SelectItem>
      {staff?.map((s) => (
        <SelectItem key={s.id} value={s.id}>
          {s.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Status filter */}
  <Select
    value={filters.status || "all"}
    onValueChange={(value) =>
      setFilters({ ...filters, status: value === "all" ? undefined : value })
    }
  >
    <SelectTrigger className="w-48">
      <SelectValue placeholder="All Statuses" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Statuses</SelectItem>
      <SelectItem value="confirmed">Confirmed</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
      <SelectItem value="cancelled">Cancelled</SelectItem>
      <SelectItem value="no-show">No-show</SelectItem>
    </SelectContent>
  </Select>

  {/* Search */}
  <Input
    placeholder="Search customer..."
    value={filters.q || ""}
    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
    className="flex-1"
  />
</div>
```

### Appointments Table Component (`components/appointments/AppointmentsTable.tsx`)

**Columns**:
- Time (formatted with date-fns)
- Customer (name + email)
- Service (name + duration)
- Staff (name + avatar)
- Status (badge with color coding)
- Actions (status menu + edit)

```tsx
export function AppointmentsTable({
  appointments,
  isLoading,
  onEdit,
}: {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (appointment: Appointment) => void;
}) {
  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <div className="mb-4 text-5xl">📅</div>
        <h3 className="text-xl font-semibold">No appointments found</h3>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your filters or create a new appointment
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Staff</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            onEdit={onEdit}
          />
        ))}
      </TableBody>
    </Table>
  );
}
```

### Status Update Menu (`components/appointments/StatusMenu.tsx`)

**Purpose**: Quick status transitions with optimistic updates.

```tsx
export function StatusMenu({ appointment }: { appointment: Appointment }) {
  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: appointment.id,
        status: newStatus,
      });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("confirmed")}>
          <CheckCircle className="mr-2 h-4 w-4 text-status-success" />
          Mark Confirmed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
          <Check className="mr-2 h-4 w-4 text-status-success" />
          Mark Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
          <XCircle className="mr-2 h-4 w-4 text-status-error" />
          Cancel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("no-show")}>
          <AlertTriangle className="mr-2 h-4 w-4 text-status-warning" />
          Mark No-show
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Hook with Optimistic Update** (`hooks/api/useAppointments.ts`):
```typescript
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      api.patch(`/admin/appointments/${id}/status`, { status }),
    
    // Optimistic update
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments() });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(queryKeys.appointments());

      // Optimistically update
      queryClient.setQueryData(queryKeys.appointments(), (old: Appointment[]) =>
        old?.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      );

      return { previousAppointments };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          queryKeys.appointments(),
          context.previousAppointments
        );
      }
    },
    
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports() });
    },
  });
}
```

### Appointment Form Modal (`components/appointments/AppointmentFormModal.tsx`)

**Purpose**: Create/edit appointments with full validation.

**Form Schema** (`lib/validations/appointment.ts`):
```typescript
export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().min(1, "Staff is required"),
  startTime: z.string().min(1, "Date and time are required"),
  customerName: z.string().min(2, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Phone number is required"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
```

**Modal Implementation**:
```tsx
export function AppointmentFormModal({
  appointment,
  isOpen,
  onClose,
}: {
  appointment?: Appointment;
  isOpen: boolean;
  onClose: () => void;
}) {
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  
  const { data: services } = useServices();
  const { data: staff } = useStaff();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          serviceId: appointment.serviceId,
          staffId: appointment.staffId,
          startTime: appointment.startTime,
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail || "",
          customerPhone: appointment.customerPhone,
          notes: appointment.notes || "",
        }
      : undefined,
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, ...data });
        toast.success("Appointment updated");
      } else {
        await createAppointment.mutateAsync(data);
        toast.success("Appointment created");
      }
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Failed to save appointment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Update appointment details"
              : "Create a new appointment for a customer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Service selector */}
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service *</Label>
            <Select
              value={form.watch("serviceId")}
              onValueChange={(value) => form.setValue("serviceId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services?.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.durationMinutes}min - $
                    {(service.priceCents / 100).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.serviceId && (
              <p className="text-sm text-status-error">
                {form.formState.errors.serviceId.message}
              </p>
            )}
          </div>

          {/* Staff selector */}
          <div className="space-y-2">
            <Label htmlFor="staffId">Staff *</Label>
            <Select
              value={form.watch("staffId")}
              onValueChange={(value) => form.setValue("staffId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.staffId && (
              <p className="text-sm text-status-error">
                {form.formState.errors.staffId.message}
              </p>
            )}
          </div>

          {/* Date/time picker */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Date & Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...form.register("startTime")}
            />
            {form.formState.errors.startTime && (
              <p className="text-sm text-status-error">
                {form.formState.errors.startTime.message}
              </p>
            )}
          </div>

          {/* Customer fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input id="customerName" {...form.register("customerName")} />
              {form.formState.errors.customerName && (
                <p className="text-sm text-status-error">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input
                id="customerPhone"
                type="tel"
                {...form.register("customerPhone")}
              />
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-status-error">
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              {...form.register("customerEmail")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : appointment
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Design System Consistency

### Color Coding for Status

```tsx
function getStatusVariant(status: AppointmentStatus): BadgeVariant {
  switch (status) {
    case "confirmed":
      return "default"; // Primary color
    case "completed":
      return "success"; // Green
    case "cancelled":
      return "destructive"; // Red
    case "no-show":
      return "warning"; // Yellow
    default:
      return "secondary"; // Gray
  }
}
```

### Consistent Spacing

All admin pages use:
```tsx
<div className="space-y-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground">Page description</p>
    </div>
    <Button>Primary Action</Button>
  </div>

  {/* Content sections */}
  <section className="space-y-4">
    {/* ... */}
  </section>
</div>
```

### Typography Hierarchy

```tsx
// Page title
<h1 className="font-heading text-3xl font-bold tracking-tight">

// Section title
<h2 className="text-xl font-semibold">

// Card title
<h3 className="text-lg font-semibold">

// Body text
<p className="text-base">

// Muted text
<p className="text-sm text-muted-foreground">

// Small label
<span className="text-xs text-muted-foreground">
```

---

## Real-time Updates

### Query Invalidation Strategy

```typescript
// After creating appointment
queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
queryClient.invalidateQueries({ queryKey: queryKeys.reports() });

// After updating status
queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
queryClient.invalidateQueries({ queryKey: ["public", "availability"] });

// After creating staff
queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
queryClient.invalidateQueries({ queryKey: ["public", "staff"] });
```

### Optimistic Updates

```typescript
onMutate: async (updatedData) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previous = queryClient.getQueryData(queryKey);

  // Optimistically update
  queryClient.setQueryData(queryKey, (old) => /* updated value */);

  // Return context with snapshot
  return { previous };
},

onError: (err, variables, context) => {
  // Rollback on error
  if (context?.previous) {
    queryClient.setQueryData(queryKey, context.previous);
  }
},

onSettled: () => {
  // Always refetch after error or success
  queryClient.invalidateQueries({ queryKey });
}
```

---

## Summary

The GLOWNOVA admin dashboard demonstrates:

✅ **Complete Authentication Flow**: Login → AuthGuard → Protected Routes  
✅ **Robust Layout System**: Sidebar + Topbar + Content with responsive mobile nav  
✅ **Real-time Metrics**: Dashboard with daily reports, revenue, appointments  
✅ **Advanced Filtering**: Date range, staff, status, search across appointments  
✅ **Optimistic Updates**: Instant UI feedback with automatic rollback on error  
✅ **Form Validation**: React Hook Form + Zod for all data entry  
✅ **Design Consistency**: GLOWNOVA tokens applied throughout  
✅ **MSW Integration**: Full mock backend for development and testing  

The entire admin system is production-ready and follows React/Next.js best practices.

---

*Last Updated: November 15, 2025*  
*GLOWNOVA v1.0 - Multi-tenant Salon Management System*

