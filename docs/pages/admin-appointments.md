# Admin Appointments

## Route
`/admin/appointments`

## Purpose
Full appointments management including list view with filters, create/edit functionality, and status updates.

## Data Queries & Mutations

### Hooks Used
- `useAppointmentsList(filters)` from `hooks/api/useAppointments.ts`
  - Endpoint: `GET /admin/appointments?from=&to=&staffId=&status=&q=`
  - Returns: Filtered list of appointments

- `useCreateAppointment()` from `hooks/api/useAppointments.ts`
  - Endpoint: `POST /admin/appointments` (with Idempotency-Key header)
  - Creates new appointment with conflict detection

- `useUpdateAppointment()` from `hooks/api/useAppointments.ts`
  - Endpoint: `PUT /admin/appointments/:id`
  - Updates existing appointment

- `useUpdateAppointmentStatus()` from `hooks/api/useAppointments.ts`
  - Endpoint: `PATCH /admin/appointments/:id/status`
  - Updates appointment status with confirmation

- `useDeleteAppointment()` from `hooks/api/useAppointments.ts`
  - Endpoint: `DELETE /admin/appointments/:id`
  - Deletes appointment with confirmation

## Components Used
- `AppointmentsTable` - Main table with filters, search, and actions
- `AppointmentFormModal` - Create/edit form with validation
- `StatusMenu` - Inline status dropdown with confirmations

## Features
- Filter by date range, status, staff member, or search
- Create new appointments with conflict detection
- Edit existing appointments
- Update status inline with confirmation dialogs
- Delete appointments with confirmation
- Idempotency key support prevents duplicate submissions
- 409 conflict handling shows appropriate error messages
- Responsive table layout

## Acceptance Criteria
✅ Appointments table loads with data from MSW  
✅ Filters work correctly (status, staff, search)  
✅ Create modal validates all required fields  
✅ Creating appointment with idempotency key works  
✅ Duplicate submissions are prevented  
✅ 409 conflicts display error toast  
✅ Status updates work with confirmation  
✅ Delete requires confirmation  
✅ Form closes after successful save  
✅ Table updates after CRUD operations

