# GLOWNOVA Quick Start Guide 🌸

Get up and running with the GLOWNOVA frontend in minutes!

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd salon-frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. Test Admin Features

#### Login to Admin Panel
1. Navigate to: `http://localhost:3000/admin/login`
2. Enter credentials:
   - **Email:** `admin@demo.local`
   - **Password:** `Password123!`
3. Click "Sign In"

#### Manage Services
1. After login, you'll be on the dashboard
2. Click "Services" in the sidebar (or navigate to `/admin/services`)
3. Try these actions:

**Create a New Service:**
- Click "Add Service" button
- Fill in the form:
  - Name: "Express Manicure"
  - Category: "Nails"
  - Duration: 30 minutes
  - Price: 35.00
  - Description: "Quick and professional nail service"
  - Active: ON
- Click "Create Service"
- ✅ You'll see a success toast and the new service in the table

**Edit a Service:**
- Click "Edit" button on any service
- Modify any field
- Click "Save Changes"
- ✅ Changes reflected immediately

**Toggle Service Status:**
- Edit a service
- Toggle the "Active" switch
- Save
- ✅ Badge updates to show Active/Inactive

**Delete a Service:**
- Click "Delete" button
- Confirm the deletion
- ✅ Service removed from list

---

### 3. Test Public Booking Flow

#### Complete Booking Journey
1. Navigate to: `http://localhost:3000/booking`
2. You'll be redirected to the service selection page

**Step 1: Select a Service**
- Browse the service cards
- Click "Select Service" on any service (e.g., "Women's Haircut")
- ✅ Proceeds to staff selection

**Step 2: Choose a Specialist**
- View staff members who can perform the service
- See their ratings, bio, and skills
- Click "Select [Name]" on a staff member
- ✅ Proceeds to time selection

**Step 3: Pick Date & Time**
- Use the calendar to select a date (today or future)
- View available time slots for that date
- Click on a time slot to select it
- Click "Continue to Details"
- ✅ Proceeds to customer details

**Step 4: Enter Your Details**
- Fill in the form:
  - Full Name: "Jane Doe"
  - Email: "jane@example.com" (optional)
  - Phone: "+1 (555) 123-4567"
  - Special Requests: "Please use organic products" (optional)
- Review the booking summary on top
- Click "Confirm Booking"
- ✅ Creates the booking

**Step 5: View Confirmation**
- See your booking reference number
- View all appointment details
- Download calendar invite (ICS file)
- Click "Back to Home" to start over

---

## 🎯 Key Features to Test

### Admin Panel Features
- ✅ Real-time service list updates
- ✅ Form validation (try submitting with empty fields)
- ✅ Success/error toast notifications
- ✅ Loading states during API calls
- ✅ Modal dialogs with smooth animations
- ✅ Responsive design (try on mobile/tablet)

### Public Booking Features
- ✅ Service grid with beautiful cards
- ✅ Staff profiles with ratings and skills
- ✅ Interactive calendar with date validation
- ✅ Dynamic availability based on staff schedule
- ✅ Comprehensive booking summary
- ✅ Form validation on customer details
- ✅ Success animation on confirmation
- ✅ ICS calendar file download

---

## 🧪 Testing Scenarios

### Test Case 1: Create Service with Validation
1. Go to `/admin/services`
2. Click "Add Service"
3. Try to submit empty form
   - ✅ See validation errors
4. Enter invalid data (e.g., duration < 5)
   - ✅ See specific error messages
5. Fill form correctly and submit
   - ✅ Service created successfully

### Test Case 2: Complete Booking Flow
1. Start at `/booking`
2. Select "Balayage Color" service ($225, 3 hours)
3. Choose "Sophie Martinez" (rating 4.9)
4. Pick tomorrow at 10:00 AM
5. Enter customer details
6. Confirm booking
   - ✅ See booking ID
   - ✅ Download calendar invite
   - ✅ View complete details

### Test Case 3: Navigation & Back Buttons
1. Start booking flow
2. At each step, click "Back" button
   - ✅ Returns to previous step
   - ✅ Previous selections preserved
3. Navigate forward again
   - ✅ Can complete booking

### Test Case 4: Responsive Design
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile (375px): Single column
   - Tablet (768px): Two columns
   - Desktop (1440px): Three columns
   - ✅ All layouts look good

---

## 📊 Demo Data Available

### Services (10 total)
- Women's Haircut ($75, 60 min)
- Men's Haircut ($55, 45 min)
- Balayage Color ($225, 180 min)
- Full Color ($150, 120 min)
- Manicure ($45, 45 min)
- Gel Manicure ($65, 60 min)
- Pedicure ($55, 60 min)
- Facial Treatment ($95, 75 min)
- Deep Tissue Massage ($120, 90 min)
- Eyebrow Waxing ($25, 15 min)

### Staff Members (3 total)
- **Sophie Martinez** - Hair specialist (4.9★)
  - Works: Mon-Fri 9am-5pm
  - Skills: Haircut, Color, Balayage, Styling
- **Emma Thompson** - Nail artist (4.8★)
  - Works: Mon-Sat 10am-6pm
  - Skills: Manicure, Pedicure, Nail Art, Gel Nails
- **Lisa Chen** - Skincare specialist (5.0★)
  - Works: Tue-Sat 11am-7pm
  - Skills: Facial, Massage, Waxing, Skincare Consultation

### Customers (5 total)
- Sarah Johnson, Michael Brown, Emily Davis, Jessica Wilson, David Martinez

### Appointments (5 total)
- Mix of confirmed, completed, and upcoming appointments
- Various services and staff combinations

---

## 🎨 Design Highlights

### Color Palette
- **Rose Pink:** Used for primary actions and headings
- **Sage Green:** Used for secondary elements and accents
- **Warm White:** Background color
- **Rich Charcoal:** Text color

### Typography
- **Headings:** Playfair Display (elegant serif)
- **Body:** Inter (clean sans-serif)

### Animations
- Fade-in on page load
- Slide-up on card entrance
- Hover effects with elevation
- Smooth transitions on all interactions

---

## 🐛 Troubleshooting

### Issue: Server won't start
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: MSW not loading
**Check:**
1. File exists: `public/mockServiceWorker.js`
2. Browser console shows "[MSW] Mocking enabled"
3. Dev mode is active (NODE_ENV=development)

### Issue: Services not appearing
**Solution:**
1. Check browser console for errors
2. Verify MSW is running
3. Check Network tab in DevTools
4. Look for successful responses from `/admin/services`

### Issue: Booking fails
**Check:**
1. All query parameters are present
2. Selected time is not in the past
3. Staff member has working hours set
4. No conflicting appointments

---

## 📝 Next Steps

### For Development
1. ✅ Test all features thoroughly
2. ✅ Verify responsive design on real devices
3. ✅ Check accessibility with screen readers
4. ✅ Test form validation edge cases
5. ✅ Verify error states display correctly

### For Production
1. Replace MSW with real backend API
2. Update `apiClient.ts` base URL
3. Configure environment variables
4. Set up authentication provider
5. Add real payment processing
6. Implement email/SMS notifications
7. Add analytics tracking
8. Set up error monitoring (Sentry, etc.)

---

## 🆘 Need Help?

### Resources
- **Full Implementation Guide:** See `GLOWNOVA_IMPLEMENTATION_COMPLETE.md`
- **Component Documentation:** Check `docs/components-spec.md`
- **API Types:** See `lib/types/api.ts`
- **MSW Handlers:** Check `mocks/handlers/`

### Common Questions

**Q: How do I add more services?**
A: Go to `/admin/services` and click "Add Service"

**Q: Can I customize the color scheme?**
A: Yes! Edit `app/globals.css` and update the design tokens

**Q: How do I change working hours?**
A: Edit the staff data in `mocks/seed.ts`

**Q: Can I add more staff members?**
A: Yes! Add them to the seed data in `mocks/seed.ts`

**Q: How do I disable MSW?**
A: Set `NEXT_PUBLIC_USE_MOCKS=false` in your environment

---

## 🎉 You're All Set!

Your GLOWNOVA frontend is ready to use. Enjoy exploring the features!

**Happy coding! 💅✨**

