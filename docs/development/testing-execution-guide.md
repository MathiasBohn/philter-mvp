# Testing Execution Guide - Phase 1 Implementation

**Purpose:** Step-by-step guide for executing integration tests on Tasks 1.1-1.10
**Last Updated:** 2025-11-16

## Prerequisites

Before starting testing:
1. Ensure development server is running: `npm run dev`
2. Open browser DevTools (F12) to monitor console for errors
3. Clear localStorage to start fresh: `localStorage.clear()` in console
4. Have the integration testing checklist ready for marking completed items

---

## Testing Setup

### 1. Environment Preparation
```bash
# Start the development server
npm run dev

# Server should be running at http://localhost:3000
```

### 2. Browser DevTools Setup
- Open DevTools (F12 or right-click → Inspect)
- Navigate to Console tab - watch for errors
- Navigate to Application/Storage tab - monitor localStorage
- Navigate to Network tab - check for failed requests

### 3. Test Data Preparation
Create a test applicant profile with realistic data for consistent testing.

---

## Section-by-Section Testing Guide

## Test 1: Reference Letter Collection

### Steps:
1. Navigate to application form
2. Locate "Reference Letters" section
3. Click "Add Reference Letter" button
4. Fill in first reference:
   - Name: "John Smith"
   - Email: "john.smith@example.com"
   - Phone: "(555) 123-4567"
   - Relationship: "Former Landlord"
   - Years Known: "3"
5. Click "Add Reference Letter" again
6. Add second reference with different data
7. Verify both references display in the list
8. Test validation by leaving fields empty
9. Test deleting a reference
10. Check localStorage in DevTools: Look for reference letter data

### Expected Results:
- ✓ Forms validate required fields
- ✓ Email and phone formats validated
- ✓ Can add multiple references
- ✓ Can delete references
- ✓ Data persists in localStorage
- ✓ No console errors

### Test on Mobile:
- Resize browser to 375px width
- Verify cards stack vertically
- Verify buttons are tappable (min 44px)

---

## Test 2: NYC Lead Paint Disclosure

### Steps:
1. Navigate to disclosure section
2. Read through disclosure text
3. Locate acknowledgment checkbox
4. Try to proceed without checking (should be blocked)
5. Check the acknowledgment box
6. Verify timestamp is recorded
7. Check localStorage for acknowledgment data
8. Refresh page and verify acknowledgment persists

### Admin Testing:
1. Access admin panel
2. Find "NYC Lead Paint Disclosure" toggle
3. Toggle OFF - verify section disappears from applicant view
4. Toggle ON - verify section reappears
5. Check that toggle state persists

### Expected Results:
- ✓ Disclosure text displays correctly
- ✓ Cannot proceed without acknowledgment
- ✓ Timestamp captured
- ✓ Data persists
- ✓ Admin toggle works
- ✓ No console errors

---

## Test 3: Flood Zone Disclosure

### Steps:
1. Navigate to flood zone disclosure section
2. Read informational content
3. Check acknowledgment checkbox
4. Verify property address auto-fills (if previously entered)
5. Check localStorage for data
6. Refresh and verify persistence

### Admin Testing:
1. Toggle requirement on/off in admin panel
2. Verify visibility changes for applicants

### Expected Results:
- ✓ Content displays correctly
- ✓ Acknowledgment works
- ✓ Data persists
- ✓ Admin toggle functions
- ✓ No console errors

---

## Test 4: Consumer Report Authorization

### Steps:
1. Navigate to authorization section
2. Read legal text thoroughly
3. Note the auto-populated date
4. Try to proceed without signing (should be blocked)
5. Enter signature/name
6. Verify acknowledgment
7. Check localStorage for authorization data
8. Verify timestamp captured

### Expected Results:
- ✓ Legal text displays clearly
- ✓ Date auto-populates
- ✓ Cannot proceed without authorization
- ✓ Signature/name recorded
- ✓ Timestamp captured
- ✓ Data persists

---

## Test 5: Lease Terms Section

### Steps:
1. Navigate to lease terms section
2. Select desired move-in date using date picker
3. Enter lease term length (e.g., "12 months")
4. Enter monthly rent budget: "$3,500"
5. Enter security deposit: "$3,500"
6. Add additional terms in notes field
7. Save and verify localStorage
8. Refresh page and verify all data loads

### Validation Testing:
- Try entering past date (should fail)
- Try entering non-numeric rent (should fail)
- Leave required fields empty (should fail)

### Expected Results:
- ✓ Date picker works
- ✓ All fields validate correctly
- ✓ Numeric fields format properly
- ✓ Data persists
- ✓ No console errors

---

## Test 6: Move-in Date Preferences

### Steps:
1. Locate move-in date picker
2. Click calendar icon
3. Select future date
4. Try selecting past date (should be prevented)
5. Select "Flexible" option if available
6. Save and check localStorage
7. Refresh and verify persistence

### Expected Results:
- ✓ Calendar displays correctly
- ✓ Past dates disabled
- ✓ Selection saves
- ✓ Data persists

---

## Test 7: Rent Budget Range

### Steps:
1. Locate budget range inputs
2. Enter minimum rent: "$2,500"
3. Enter maximum rent: "$4,000"
4. Try entering min > max (should fail validation)
5. Try entering non-numeric values (should fail)
6. Save and check localStorage
7. Verify currency formatting

### Expected Results:
- ✓ Min/max validation works
- ✓ Numeric validation works
- ✓ Currency formatting applied
- ✓ Data persists

---

## Test 8: Housing History Section

### Steps:
1. Navigate to housing history
2. Click "Add Previous Residence"
3. Fill in first residence:
   - Address: "123 Main St, New York, NY 10001"
   - Landlord: "ABC Property Management"
   - Landlord Contact: "(555) 987-6543"
   - Move-in: "01/2020"
   - Move-out: "12/2022"
   - Monthly Rent: "$2,800"
   - Reason: "Upgrading to larger unit"
4. Add second residence
5. Mark one as "Current Residence"
6. Test date validation (move-out before move-in)
7. Delete one entry
8. Check localStorage

### Expected Results:
- ✓ Can add multiple residences
- ✓ All fields validate
- ✓ Date validation works
- ✓ Can mark current residence
- ✓ Can delete entries
- ✓ Data persists

---

## Test 9: Emergency Contacts Section

### Steps:
1. Navigate to emergency contacts
2. Click "Add Emergency Contact"
3. Fill in first contact:
   - Name: "Jane Doe"
   - Relationship: "Sister"
   - Primary Phone: "(555) 111-2222"
   - Secondary Phone: "(555) 333-4444"
   - Email: "jane.doe@example.com"
4. Add second contact
5. Test phone number formatting
6. Test email validation
7. Delete one contact
8. Check localStorage

### Expected Results:
- ✓ Can add multiple contacts
- ✓ Phone formatting works
- ✓ Email validation works
- ✓ Can delete contacts
- ✓ Data persists

---

## Test 10: Unit Owner/Seller Party Section

### Steps:
1. Navigate to unit owner section
2. Select "Individual" owner type
3. Fill in individual fields:
   - First Name: "Robert"
   - Last Name: "Johnson"
   - Email: "robert.j@example.com"
   - Phone: "(555) 999-8888"
   - Address: "456 Park Ave, NY 10022"
4. Switch to "Entity" type
5. Fill in entity fields:
   - Company Name: "XYZ Realty LLC"
   - Contact Person: "Michael Chen"
   - Email: "contact@xyzrealty.com"
   - Phone: "(555) 777-6666"
6. Verify field switching works correctly
7. Check localStorage

### Expected Results:
- ✓ Type selection works
- ✓ Fields change based on type
- ✓ All validations work
- ✓ Data persists

---

## Cross-Section Integration Testing

### Complete Application Flow Test
1. Start a new application from scratch
2. Complete ALL sections in order
3. Navigate back and forth between sections
4. Verify no data loss
5. Check progress indicators
6. Save at various points
7. Close browser completely
8. Reopen and verify all data loads
9. Complete and submit application

### Expected Results:
- ✓ Smooth navigation between sections
- ✓ No data loss during navigation
- ✓ Progress saves automatically
- ✓ Can resume from any point
- ✓ All data persists across sessions

---

## localStorage Testing

### Verification Steps:
1. Open DevTools → Application/Storage → localStorage
2. Verify structure of stored data
3. Check for these keys:
   - `application_referenceLetters`
   - `application_leadPaintAcknowledgment`
   - `application_floodZoneAcknowledgment`
   - `application_consumerReportAuth`
   - `application_leaseTerms`
   - `application_housingHistory`
   - `application_emergencyContacts`
   - `application_unitOwner`
4. Verify data format is valid JSON
5. Check storage size doesn't exceed limits
6. Test clearing specific sections
7. Test clearing all data

---

## Mobile Responsiveness Testing

### Device Testing Matrix:
Test on each device size:
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPad (768px)
- iPad Pro (1024px)

### For Each Device:
1. Complete application on device
2. Verify all touch targets are accessible
3. Check form field spacing
4. Verify date pickers work on touch devices
5. Test scrolling and navigation
6. Verify no horizontal scrolling
7. Check button sizes (min 44px)

### Browser Testing (Mobile):
- Safari (iOS)
- Chrome (Android)
- Firefox (Mobile)

---

## Cross-Browser Testing Checklist

### Chrome (Latest)
- [ ] Complete full application
- [ ] Check DevTools console
- [ ] Verify localStorage
- [ ] Test all interactive elements

### Safari (Latest)
- [ ] Complete full application
- [ ] Check Web Inspector console
- [ ] Verify localStorage
- [ ] Test date pickers specifically
- [ ] Test all interactive elements

### Firefox (Latest)
- [ ] Complete full application
- [ ] Check Browser Console
- [ ] Verify localStorage
- [ ] Test all interactive elements

### Edge (Latest)
- [ ] Complete full application
- [ ] Check DevTools console
- [ ] Verify localStorage
- [ ] Test all interactive elements

---

## Performance Testing

### Metrics to Monitor:
1. **Page Load Time:**
   - Open DevTools → Network tab
   - Reload page
   - Check total load time (should be < 3 seconds)

2. **Interaction Response:**
   - Time button clicks
   - Time form submissions
   - Should feel instant (< 100ms)

3. **Memory Usage:**
   - Open DevTools → Performance/Memory
   - Monitor during extended use
   - Watch for memory leaks

---

## Accessibility Testing

### Keyboard Navigation:
1. Tab through entire form
2. Verify logical tab order
3. Check focus indicators visible
4. Verify can complete form keyboard-only
5. Test Shift+Tab (reverse navigation)

### Screen Reader Testing:
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through form
3. Verify labels read correctly
4. Verify error messages announced
5. Verify required fields indicated

### Color Contrast:
1. Use browser DevTools Accessibility checker
2. Verify all text meets WCAG AA (4.5:1)
3. Check focus indicators visible
4. Test in dark mode if available

---

## Bug Reporting Template

When issues are found, document them:

### Bug Report Format:
```
**Bug ID:** [Unique ID]
**Section:** [Which section/task]
**Severity:** Critical | High | Medium | Low
**Browser:** [Chrome 120.0, etc.]
**Device:** [Desktop/Mobile, OS]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Console Errors:**
[Attach evidence]

**localStorage State:**
[Copy relevant data if applicable]
```

---

## Test Completion Checklist

### Before Signing Off:
- [ ] All 10 sections tested individually
- [ ] Full application flow tested
- [ ] localStorage verified working
- [ ] Mobile responsiveness confirmed
- [ ] All browsers tested
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] All bugs documented
- [ ] Integration testing checklist completed
- [ ] Test results documented

---

## Next Steps After Testing

1. Review all bugs found
2. Prioritize fixes (Critical → High → Medium → Low)
3. Update integration-testing-checklist.md with results
4. Create GitHub issues for bugs
5. Retest after fixes implemented
6. Final sign-off when all critical issues resolved

---

## Notes

- Take screenshots of any issues
- Save console errors
- Document any edge cases discovered
- Note any UX improvements needed
- Record performance metrics
