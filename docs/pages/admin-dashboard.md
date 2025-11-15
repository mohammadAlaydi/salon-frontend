# Admin Dashboard

## Route
`/admin/dashboard`

## Purpose
Executive overview showing today's key metrics, upcoming appointments, and a mini calendar for quick navigation.

## Data Queries

### Hooks Used
- `useDailyReport(date)` from `hooks/api/useDashboard.ts`
  - Endpoint: `GET /admin/reports/daily?date=YYYY-MM-DD`
  - Returns: Total bookings, revenue, completed count, no-shows for selected date

- `useUpcomingAppointments(limit, date)` from `hooks/api/useDashboard.ts`
  - Endpoint: `GET /admin/appointments?upcoming=true&limit=10`
  - Returns: List of upcoming appointments from selected date

- `useServicesList()` from `hooks/services/useServices.ts`
  - Endpoint: `GET /admin/services`
  - Returns: All services for populating appointment details

- `useStaffList()` from `hooks/api/useStaff.ts`
  - Endpoint: `GET /admin/staff`
  - Returns: All staff members for appointment details

- `useCustomersList()` from `hooks/api/useCustomers.ts`
  - Endpoint: `GET /admin/customers`
  - Returns: All customers for appointment details

## Components Used
- `MetricCards` - Displays 4 key metrics with icons and loading states
- `UpcomingAppointments` - List of upcoming appointments with filtering
- `MiniCalendar` - Month view calendar with day counts and selection

## Features
- View metrics for any date by selecting in the calendar
- Appointment counts shown on calendar days
- Click calendar day to filter upcoming appointments
- Loading skeletons and error states
- Responsive layout for mobile/tablet/desktop

## Acceptance Criteria
✅ Dashboard loads without errors  
✅ Metrics display correctly from MSW data  
✅ Upcoming appointments list is populated  
✅ Calendar shows appointment counts per day  
✅ Selecting a date filters the appointments list  
✅ Loading states are shown during data fetch  
✅ Error states handled gracefully

