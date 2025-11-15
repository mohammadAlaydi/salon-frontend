# Admin Staff

## Route
`/admin/staff`

## Purpose
Manage staff profiles, skills, and working hours schedules.

## Data Queries & Mutations

### Hooks Used
- `useStaffList()` from `hooks/api/useStaff.ts`
  - Endpoint: `GET /admin/staff`
  - Returns: All staff members

- `useCreateStaff()` from `hooks/api/useStaff.ts`
  - Endpoint: `POST /admin/staff`
  - Creates new staff member

- `useUpdateStaff()` from `hooks/api/useStaff.ts`
  - Endpoint: `PUT /admin/staff/:id`
  - Updates staff profile and working hours

- `useDeleteStaff()` from `hooks/api/useStaff.ts`
  - Endpoint: `DELETE /admin/staff/:id`
  - Removes staff member with confirmation

- `useStaffSchedule(staffId)` from `hooks/api/useStaff.ts`
  - Endpoint: `GET /admin/staff/:id/schedule`
  - Returns: Working hours for staff member

- `useUpdateStaffSchedule()` from `hooks/api/useStaff.ts`
  - Endpoint: `PUT /admin/staff/:id/schedule`
  - Updates working hours

## Components Used
- `StaffCard` - Card display with avatar, skills, and actions
- `StaffFormModal` - Create/edit form with skills management
- `WorkingHoursEditor` - Weekly schedule editor with validation

## Features
- Grid view of all staff members
- Add/edit staff with name, bio, email, and skills
- Skills management with tag input
- Working hours editor (only shown for existing staff)
- Toggle days on/off with time pickers
- Validation ensures end time is after start time
- Delete with confirmation
- Responsive grid layout

## Acceptance Criteria
✅ Staff grid loads with MSW data  
✅ Create modal validates required fields  
✅ Skills can be added and removed  
✅ Working hours editor shows current schedule  
✅ Days can be toggled on/off  
✅ Time validation works (end > start)  
✅ Schedule updates persist via API  
✅ Delete requires confirmation  
✅ Form closes after successful save

