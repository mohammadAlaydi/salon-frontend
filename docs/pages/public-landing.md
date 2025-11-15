# Public Salon Landing Page

## Route
`/[salonSlug]`

## Purpose
Public-facing landing page for each salon with branding, services, staff showcase, and booking CTA.

## Data Queries

### Hooks Used
- `usePublicSalon(slug)` from `hooks/api/usePublicSalon.ts`
  - Endpoint: `GET /public/salons/:slug`
  - Returns: Salon details and branding

- `usePublicServices(slug)` from `hooks/api/usePublicSalon.ts`
  - Endpoint: `GET /public/salons/:slug/services`
  - Returns: Active services for public display

- `usePublicStaff(slug)` from `hooks/api/usePublicSalon.ts`
  - Endpoint: `GET /public/salons/:slug/staff`
  - Returns: Staff profiles for showcase

## Components Used
- `Hero` - Brand-aware hero section with salon colors
- `ServicesGrid` - Grid of service cards with pricing
- `StaffShowcase` - Team member cards with photos and skills

## Features
- Dynamic branding based on salon settings
- Hero section uses salon's primary color
- Logo display if configured
- Services grid with prices and durations
- Staff showcase with avatars, bios, and skills
- About and contact sections
- "Book Now" CTA buttons link to booking flow
- Responsive design for all screen sizes
- SEO-friendly metadata per salon
- Footer with salon name and copyright

## Acceptance Criteria
✅ Landing page loads for demo-salon slug  
✅ Hero displays with salon branding  
✅ Primary color is applied correctly  
✅ Services grid shows all active services  
✅ Staff showcase displays team members  
✅ Book Now button links to booking flow  
✅ Contact information is displayed  
✅ Page is responsive on mobile/tablet  
✅ Loading states shown during data fetch  
✅ 404 shown for invalid salon slug

