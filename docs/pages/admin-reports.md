# Admin Reports

## Route
`/admin/reports`

## Purpose
Analytics dashboard with revenue trends, top services, and CSV export functionality.

## Data Queries

### Hooks Used
- `useRevenueHistory(from, to)` from `hooks/api/useReports.ts`
  - Endpoint: Multiple `GET /admin/reports/daily?date=` calls
  - Returns: Array of daily revenue and appointment data

- `useTopServices(from, to, limit)` from `hooks/api/useReports.ts`
  - Endpoint: `GET /admin/reports/top-services?from=&to=&limit=`
  - Returns: Top services by booking count with revenue

- `useServicesList()` from `hooks/services/useServices.ts`
  - Used to map service IDs to names

## Components Used
- `RevenueChart` - Recharts line chart showing revenue over time
- `TopServicesTable` - Table with CSV export functionality

## Features
- Date range picker with quick presets (Last 7/30 days)
- Revenue trend line chart with Recharts
- Responsive chart with tooltips
- Top services table with bookings, revenue, and avg per booking
- Client-side CSV export with proper formatting
- Loading states for charts and tables
- Empty states when no data available

## Acceptance Criteria
✅ Reports page loads without errors  
✅ Date range picker updates charts  
✅ Revenue chart renders with Recharts  
✅ Chart shows tooltips on hover  
✅ Top services table displays correctly  
✅ CSV export button generates file  
✅ CSV contains proper headers and data  
✅ Quick preset buttons work  
✅ Loading states shown during fetch  
✅ Empty states handled gracefully

