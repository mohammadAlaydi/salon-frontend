# QA Checklist & Verification Guide

## Prerequisites
- Node.js 18+ installed
- All dependencies installed: `npm install`
- MSW service worker registered

## Commands

### Development Server
```bash
cd salon-frontend
npm run dev
```
Open http://localhost:3000

### Run Tests
```bash
# Unit and integration tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Manual Verification Steps

### 1. Authentication & Navigation
- [ ] Navigate to `/admin/login`
- [ ] Log in with: `admin@demo.local` / `Password123!`
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Check all nav items are visible and clickable
- [ ] Verify auth guard redirects unauthenticated users

### 2. Admin Dashboard (`/admin/dashboard`)
- [ ] Page loads without errors
- [ ] 4 metric cards display with data
- [ ] Upcoming appointments list populated
- [ ] Mini calendar shows current month
- [ ] Click a calendar day - appointments filter correctly
- [ ] Loading skeletons appear during data fetch
- [ ] All data comes from MSW (check Network tab - no real API calls)

### 3. Appointments Page (`/admin/appointments`)
- [ ] Table loads with appointments
- [ ] Search by customer name works
- [ ] Filter by status dropdown works
- [ ] Filter by staff member works
- [ ] Click "New Appointment" opens modal
- [ ] Fill form and create appointment
- [ ] New appointment appears in table
- [ ] Edit an appointment - changes save
- [ ] Change status via dropdown - updates correctly
- [ ] Delete appointment - shows confirmation, then removes
- [ ] Try creating conflicting appointment - shows 409 error

### 4. Staff Page (`/admin/staff`)
- [ ] Staff grid displays with cards
- [ ] Click "Add Staff Member" opens modal
- [ ] Create staff with name, bio, skills
- [ ] Skills can be added as tags
- [ ] Edit existing staff member
- [ ] Working hours editor shows for existing staff
- [ ] Toggle days on/off
- [ ] Set start/end times
- [ ] Validation ensures end > start
- [ ] Save changes - persist correctly
- [ ] Delete staff - shows confirmation

### 5. Customers Page (`/admin/customers`)
- [ ] Customer table loads
- [ ] Search by name/phone works
- [ ] Click customer row navigates to profile
- [ ] Profile shows contact info and stats
- [ ] Visit history table displays appointments
- [ ] Edit notes and click Save
- [ ] Success toast appears
- [ ] Notes persist after refresh
- [ ] Back button returns to list

### 6. Reports Page (`/admin/reports`)
- [ ] Page loads with default 30-day range
- [ ] Revenue chart renders with Recharts
- [ ] Chart shows data points and tooltips
- [ ] Change date range - chart updates
- [ ] "Last 7 Days" preset works
- [ ] "Last 30 Days" preset works
- [ ] Top services table displays
- [ ] Click "Export CSV" downloads file
- [ ] CSV contains correct headers and data
- [ ] Loading states appear during fetch

### 7. Settings Page (`/admin/settings`)
- [ ] Page loads salon settings
- [ ] Branding section shows current colors
- [ ] Change primary color - preview updates
- [ ] Change secondary color - preview updates
- [ ] Click Save - changes persist
- [ ] Success toast appears
- [ ] Webhook URL field accepts input
- [ ] Click "Send Test Event"
- [ ] Test result toast appears (80% success rate in MSW)

### 8. Public Landing Page (`/demo-salon`)
- [ ] Page loads without errors
- [ ] Hero displays with salon name and branding
- [ ] Primary color is applied to hero
- [ ] Services grid shows all services
- [ ] Each service card has price and duration
- [ ] Staff showcase displays team members
- [ ] Staff cards show avatars, names, skills
- [ ] Contact section shows address/phone/email
- [ ] Click "Book Now" navigates to booking flow
- [ ] Page is responsive on mobile viewport

### 9. Responsive & Accessibility
- [ ] Test all pages at 375px (mobile)
- [ ] Test all pages at 768px (tablet)
- [ ] Test all pages at 1440px (desktop)
- [ ] Tables are scrollable on mobile
- [ ] Modals center properly on all sizes
- [ ] Forms are usable on mobile
- [ ] Tab through forms - focus visible
- [ ] Screen reader can navigate menus
- [ ] Color contrast meets WCAG AA

### 10. MSW Integration
- [ ] Open DevTools Network tab
- [ ] Verify no real API calls (all intercepted by MSW)
- [ ] Check Console for MSW logs
- [ ] Verify demo data is seeded
- [ ] Test error scenarios (if implemented)

## Acceptance Criteria Summary

### Dashboard
✅ Loads and displays metrics from MSW  
✅ Calendar interaction filters appointments  
✅ All loading states work  

### Appointments
✅ CRUD operations complete successfully  
✅ Idempotency prevents duplicates  
✅ Conflict detection (409) works  
✅ Status updates with confirmation  

### Staff
✅ CRUD operations work  
✅ Working hours editor validates properly  
✅ Schedule persists correctly  

### Customers
✅ List and search functional  
✅ Profile displays complete data  
✅ Notes can be saved  
✅ Visit history shown  

### Reports
✅ Charts render with Recharts  
✅ Date range updates data  
✅ CSV export generates file  

### Settings
✅ Branding preview updates live  
✅ Changes persist via API  
✅ Webhook test works  

### Public Landing
✅ Loads with salon branding  
✅ All sections display correctly  
✅ Book CTA navigates properly  

## Known Limitations
- Calendar view placeholder (not fully implemented)
- E2E tests need Playwright setup
- Performance testing not included
- Real backend integration requires NEXT_PUBLIC_API_BASE_URL configuration

## Browser Compatibility
Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

