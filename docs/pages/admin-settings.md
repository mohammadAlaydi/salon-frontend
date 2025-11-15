# Admin Settings

## Route
`/admin/settings`

## Purpose
Configure salon profile, branding (colors, logo), and integrations (n8n webhook).

## Data Queries & Mutations

### Hooks Used
- `useSalonSettings()` from `hooks/api/useSalon.ts`
  - Endpoint: `GET /admin/salon`
  - Returns: Current salon settings and branding

- `useUpdateSalon()` from `hooks/api/useSalon.ts`
  - Endpoint: `PUT /admin/salon`
  - Updates salon settings including branding

- `useTestWebhook()` from `hooks/api/useSalon.ts`
  - Endpoint: `POST /admin/webhook/test`
  - Tests webhook integration

## Components Used
- `BrandingEditor` - Color pickers with live preview
- `IntegrationsEditor` - Webhook URL configuration with test button

## Features
- Primary and secondary color pickers
- Live preview of branding colors
- Color input supports both picker and text entry
- Webhook URL configuration
- Test webhook button with success/failure feedback
- Preview shows how colors will look on buttons
- Save button disabled until changes made
- Toast notifications for save and test results

## Acceptance Criteria
✅ Settings page loads salon data  
✅ Color pickers update preview in real-time  
✅ Hex values can be typed manually  
✅ Preview accurately shows color changes  
✅ Save button persists changes via API  
✅ Webhook URL can be configured  
✅ Test webhook button works  
✅ Test results show in toast  
✅ Success/failure handled appropriately  
✅ Form validation works for URLs

