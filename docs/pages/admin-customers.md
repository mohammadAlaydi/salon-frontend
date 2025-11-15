# Admin Customers

## Routes
- List: `/admin/customers`
- Profile: `/admin/customers/[id]`

## Purpose
View and manage customer database with search, profiles, visit history, and notes.

## Data Queries & Mutations

### Hooks Used
- `useCustomersList(searchQuery)` from `hooks/api/useCustomers.ts`
  - Endpoint: `GET /admin/customers?q=`
  - Returns: All customers with optional search filter

- `useCustomer(id)` from `hooks/api/useCustomers.ts`
  - Endpoint: `GET /admin/customers/:id`
  - Returns: Single customer details

- `useUpdateCustomer()` from `hooks/api/useCustomers.ts`
  - Endpoint: `PUT /admin/customers/:id`
  - Updates customer information and notes

- `useAppointmentsList()` from `hooks/api/useAppointments.ts`
  - Used to fetch visit history for customer profile

## Components Used
- `CustomerProfile` - Displays contact info, stats, notes editor, and visit history
- Standard UI components for table and search

## Features
- Search customers by name or phone
- Click customer row to view profile
- Profile shows contact information and statistics
- Visit history table with all appointments
- Notes editor with save functionality
- Total visits, completed visits, and revenue calculated
- Responsive table and profile layout

## Acceptance Criteria
✅ Customer list loads from MSW  
✅ Search filters customers correctly  
✅ Clicking customer navigates to profile  
✅ Profile displays contact information  
✅ Statistics are calculated correctly  
✅ Visit history shows all appointments  
✅ Notes can be edited and saved  
✅ Save toast appears on success  
✅ Back button returns to list

