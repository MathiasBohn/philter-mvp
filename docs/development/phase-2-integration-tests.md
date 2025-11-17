# Phase 2 Integration Test Plan

**Document Version:** 1.0
**Last Updated:** November 16, 2025
**Test Phase:** Phase 2 - Important Enhancements
**Status:** Ready for Testing

---

## Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Scenarios](#test-scenarios)
4. [Cross-Role Testing](#cross-role-testing)
5. [Performance Testing](#performance-testing)
6. [Mobile Testing](#mobile-testing)
7. [Test Results & Sign-off](#test-results--sign-off)

---

## Overview

### Purpose
This document outlines the comprehensive integration testing plan for Phase 2 enhancements to the Philter MVP application. All features must pass these tests before Phase 2 can be considered complete.

### Phase 2 Features to Test
1. Enhanced employment section with full employment details
2. Real estate holdings tracking
3. Expanded financial categories (assets & liabilities)
4. Building policies display screen
5. Eight (8) additional acknowledgement forms
6. Cover letters / personal introduction
7. Left sidebar global navigation
8. Application age and activity tracking

### Test Success Criteria
- All test scenarios pass 100%
- No critical bugs found
- Performance benchmarks met
- Cross-browser compatibility verified
- Mobile responsiveness confirmed
- All user roles can complete their workflows

---

## Test Environment Setup

### Prerequisites
- Development environment running (`npm run dev`)
- Test database with sample data
- Test user accounts for each role:
  - Applicant user
  - Broker user
  - Admin/Agent user
  - Board member user

### Test Data Requirements
- 5+ sample applications in various states
- Sample documents (PDF, images) for uploads
- Building policies documents
- Reference contact information

### Browser Requirements
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Devices
- iOS (iPhone 12+, iPad)
- Android (Pixel, Samsung Galaxy)

---

## Test Scenarios

### 1. Enhanced Employment Section Tests

#### Test 1.1: Add Employment Record
**Priority:** High
**Role:** Applicant

**Steps:**
1. Navigate to Employment section
2. Click "Add Employment"
3. Fill all required fields:
   - Employer name
   - Position/Title
   - Start date
   - End date (or mark as current)
   - Annual income
   - Employment type (Full-time, Part-time, Contract, Self-employed)
   - Supervisor name and contact
4. Save employment record

**Expected Results:**
- ✅ All fields save correctly
- ✅ Current employment checkbox disables end date
- ✅ Income displays with proper currency formatting
- ✅ Record appears in employment list
- ✅ Edit and delete buttons work

**Test Data:**
```
Employer: ABC Corporation
Position: Software Engineer
Start Date: 01/2020
Current: Yes
Annual Income: $125,000
Type: Full-time
Supervisor: Jane Smith (jane@abc.com, 555-1234)
```

---

#### Test 1.2: Multiple Employment Records
**Priority:** High
**Role:** Applicant

**Steps:**
1. Add 3 employment records (current + 2 previous)
2. Verify chronological ordering
3. Calculate total annual income
4. Test edit/delete functionality

**Expected Results:**
- ✅ Multiple records display correctly
- ✅ Records sorted by date (most recent first)
- ✅ Total income calculates correctly
- ✅ Can edit each record independently
- ✅ Delete confirmation prevents accidental deletion

---

#### Test 1.3: Self-Employment Details
**Priority:** Medium
**Role:** Applicant

**Steps:**
1. Add employment with type "Self-employed"
2. Verify additional fields appear:
   - Business name
   - Tax ID/EIN
   - Business type
3. Fill and save

**Expected Results:**
- ✅ Self-employment fields show conditionally
- ✅ Business information saves correctly
- ✅ Displays properly in broker/admin view

---

### 2. Real Estate Holdings Tests

#### Test 2.1: Add Property
**Priority:** High
**Role:** Applicant

**Steps:**
1. Navigate to Real Estate Holdings section
2. Click "Add Property"
3. Fill property details:
   - Property address
   - Property type (Primary Residence, Investment, Vacation)
   - Purchase date
   - Purchase price
   - Current value
   - Outstanding mortgage
   - Monthly payment
   - Rental income (if applicable)
4. Save property

**Expected Results:**
- ✅ All fields save correctly
- ✅ Equity calculation: Current Value - Mortgage
- ✅ Property appears in holdings list
- ✅ Edit/delete functionality works

**Test Data:**
```
Address: 123 Main St, Apt 4B, New York, NY 10001
Type: Primary Residence
Purchase Date: 06/2018
Purchase Price: $800,000
Current Value: $950,000
Mortgage: $600,000
Monthly Payment: $3,500
Rental Income: N/A
```

---

#### Test 2.2: Multiple Properties
**Priority:** High
**Role:** Applicant

**Steps:**
1. Add 3 properties (primary + investment + vacation)
2. Verify total equity calculation
3. Test sorting and filtering
4. Verify rental income totals

**Expected Results:**
- ✅ Multiple properties display correctly
- ✅ Total equity = Sum of (Value - Mortgage)
- ✅ Total rental income calculates
- ✅ Property type badges display correctly
- ✅ Can edit/delete any property

---

### 3. Expanded Financial Categories Tests

#### Test 3.1: Add Assets
**Priority:** High
**Role:** Applicant

**Steps:**
1. Navigate to Financial Information > Assets
2. Add various asset types:
   - Cash/Checking ($50,000)
   - Savings ($100,000)
   - Stocks/Bonds ($250,000)
   - Retirement Accounts ($500,000)
   - Cryptocurrency ($25,000)
   - Other Assets ($10,000)
3. Verify total assets calculation

**Expected Results:**
- ✅ All asset categories available
- ✅ Currency formatting correct
- ✅ Total assets = $935,000
- ✅ Can add multiple entries per category
- ✅ Edit/delete works per entry

---

#### Test 3.2: Add Liabilities
**Priority:** High
**Role:** Applicant

**Steps:**
1. Navigate to Financial Information > Liabilities
2. Add various liability types:
   - Credit Card Debt ($5,000)
   - Auto Loans ($30,000)
   - Student Loans ($50,000)
   - Personal Loans ($10,000)
   - Other Debts ($5,000)
3. Verify total liabilities calculation

**Expected Results:**
- ✅ All liability categories available
- ✅ Currency formatting correct
- ✅ Total liabilities = $100,000
- ✅ Can add multiple entries per category
- ✅ Minimum monthly payment field works

---

#### Test 3.3: Net Worth Calculation
**Priority:** High
**Role:** Applicant, Broker, Admin

**Steps:**
1. Complete assets and liabilities sections
2. Navigate to Financial Summary
3. Verify calculations:
   - Total Assets
   - Total Liabilities
   - Net Worth = Assets - Liabilities

**Expected Results:**
- ✅ All totals calculate correctly
- ✅ Net Worth = $835,000 (from test data above)
- ✅ Displays in applicant, broker, and admin views
- ✅ Updates in real-time when values change

---

### 4. Building Policies Display Tests

#### Test 4.1: View Building Policies
**Priority:** High
**Role:** Applicant

**Steps:**
1. Start new application
2. Navigate to Building Policies screen
3. Verify policies display:
   - Pet Policy
   - Alteration Policy
   - Subletting Policy
   - Move-in/Move-out Policy
   - Financial Requirements
   - Other Building Rules
4. Test PDF download links

**Expected Results:**
- ✅ All policy sections display
- ✅ Policy text readable and formatted
- ✅ PDF downloads work (if available)
- ✅ "I have read and understand" checkbox works
- ✅ Cannot proceed without acknowledging

---

#### Test 4.2: Building-Specific Policies
**Priority:** Medium
**Role:** Admin

**Steps:**
1. Configure different policies for different buildings
2. Start application for Building A
3. Verify Building A policies display
4. Start application for Building B
5. Verify Building B policies display

**Expected Results:**
- ✅ Correct policies show per building
- ✅ No policy cross-contamination
- ✅ Updates reflect immediately

---

### 5. Acknowledgement Forms Tests

#### Test 5.1: All 8 Additional Acknowledgements
**Priority:** Critical
**Role:** Applicant

**Test each acknowledgement form:**

1. **Personal Information Authorization**
   - Display checkbox and text
   - Verify required before submission
   - Test signature/date capture

2. **Credit Check Authorization**
   - Display authorization text
   - Verify checkbox functionality
   - Test SSN masking/security

3. **Background Check Consent**
   - Display consent form
   - Verify checkbox required
   - Test data privacy notice

4. **Reference Contact Authorization**
   - Display reference release
   - Verify checkbox functionality
   - Test reference list display

5. **Employment Verification Authorization**
   - Display employer contact consent
   - Verify checkbox functionality
   - Test supervisor info display

6. **Financial Statement Verification**
   - Display bank account verification
   - Verify checkbox functionality
   - Test document upload link

7. **Pet Ownership Declaration**
   - Conditional display (only if building allows pets)
   - Pet details form
   - Pet deposit calculation

8. **Move-in Date Commitment**
   - Display date picker
   - Verify date validation
   - Test commitment statement

**Expected Results:**
- ✅ All acknowledgements display correctly
- ✅ All checkboxes functional
- ✅ All are required (cannot submit without)
- ✅ Conditional logic works (pet form)
- ✅ Saves state on navigation
- ✅ Displays in broker/admin review

---

#### Test 5.2: Acknowledgement Validation
**Priority:** High
**Role:** Applicant

**Steps:**
1. Fill application completely
2. Skip one acknowledgement
3. Try to submit application
4. Verify validation error

**Expected Results:**
- ✅ Cannot submit with missing acknowledgements
- ✅ Error message specifies which acknowledgement missing
- ✅ Navigates to missing acknowledgement
- ✅ Highlights missing checkbox

---

### 6. Cover Letter / Personal Introduction Tests

#### Test 6.1: Add Cover Letter
**Priority:** High
**Role:** Applicant

**Steps:**
1. Navigate to Personal Introduction section
2. Enter cover letter text (500-1000 words)
3. Test rich text formatting (if enabled)
4. Save cover letter
5. Preview cover letter

**Expected Results:**
- ✅ Text area with character counter
- ✅ Formatting preserved (line breaks, paragraphs)
- ✅ Saves correctly
- ✅ Preview displays formatted text
- ✅ Can edit after saving

**Test Data:**
```
Dear Board Members,

I am writing to express my strong interest in becoming a resident of [Building Name]. As a [profession] with [X years] of experience in [industry], I have long admired this building's architecture and the vibrant community it houses.

[Continue with 3-4 paragraphs about background, financial stability, community involvement, etc.]

Thank you for your consideration.

Sincerely,
[Applicant Name]
```

---

#### Test 6.2: Cover Letter in Review
**Priority:** Medium
**Role:** Broker, Admin

**Steps:**
1. Open application with cover letter
2. Navigate to Personal Introduction tab
3. Verify cover letter displays
4. Test print/export functionality

**Expected Results:**
- ✅ Cover letter displays in review interface
- ✅ Formatting preserved
- ✅ Character count visible
- ✅ Can print/export to PDF

---

### 7. Left Sidebar Navigation Tests

#### Test 7.1: Sidebar Display
**Priority:** High
**Role:** Applicant

**Steps:**
1. Open any application
2. Verify sidebar displays on left
3. Check all sections listed:
   - Application Info
   - Personal Information
   - Employment
   - Financial Information
   - Real Estate Holdings
   - Documents
   - References
   - Acknowledgements
   - Building Policies
   - Personal Introduction
4. Verify current section highlighted

**Expected Results:**
- ✅ Sidebar displays on all application pages
- ✅ All sections listed in order
- ✅ Current section highlighted
- ✅ Sticky positioning (follows scroll)
- ✅ Icons display correctly

---

#### Test 7.2: Sidebar Navigation
**Priority:** High
**Role:** Applicant

**Steps:**
1. Click each sidebar section
2. Verify navigation works
3. Test section completion indicators
4. Verify section status colors

**Expected Results:**
- ✅ Clicking navigates to section
- ✅ URL updates correctly
- ✅ Completion checkmarks appear
- ✅ Status colors correct:
   - ⚪ Not Started (gray)
   - 🟡 In Progress (yellow)
   - 🟢 Complete (green)
   - 🔴 Needs Attention (red)

---

#### Test 7.3: Sidebar Status Updates
**Priority:** High
**Role:** Applicant

**Steps:**
1. Start with empty application
2. Complete each section
3. Watch sidebar status update in real-time
4. Navigate back and verify status persists

**Expected Results:**
- ✅ Status updates immediately on save
- ✅ Completion checkmarks appear
- ✅ Colors update correctly
- ✅ Status persists across sessions

---

#### Test 7.4: Mobile Sidebar
**Priority:** High
**Role:** Applicant (Mobile)

**Steps:**
1. Open application on mobile
2. Verify sidebar is collapsible
3. Test hamburger menu
4. Test sidebar collapse/expand
5. Verify navigation works on mobile

**Expected Results:**
- ✅ Sidebar collapses on mobile (<768px)
- ✅ Hamburger icon displays
- ✅ Tap to expand/collapse
- ✅ Navigation works when expanded
- ✅ Auto-collapses after navigation
- ✅ Doesn't block content

---

### 8. Application Age & Activity Tracking Tests

#### Test 8.1: Age Calculation
**Priority:** High
**Role:** Broker, Admin

**Steps:**
1. Open broker dashboard
2. View "Age" column
3. Verify age calculations:
   - Application submitted today = 0 days
   - Application submitted 5 days ago = 5 days
   - Application submitted 2 weeks ago = 14 days
4. Verify color coding:
   - 0-7 days = normal (black/white)
   - 8-14 days = warning (yellow)
   - 15+ days = urgent (red)

**Expected Results:**
- ✅ Age calculates correctly from submission date
- ✅ Updates daily (shows current age)
- ✅ Color coding applies correctly
- ✅ Sortable by age
- ✅ Filters work (show only old applications)

---

#### Test 8.2: Last Activity Tracking
**Priority:** High
**Role:** Broker, Admin

**Steps:**
1. Open application
2. Make a change (save a section)
3. View broker/admin dashboard
4. Verify "Last Activity" column updates
5. Verify timestamp correct

**Expected Results:**
- ✅ Last Activity shows timestamp of last change
- ✅ Updates in real-time
- ✅ Displays relative time ("2 hours ago", "3 days ago")
- ✅ Sortable by last activity
- ✅ Shows who made last change (applicant/broker/admin)

---

#### Test 8.3: Activity Tracking Details
**Priority:** Medium
**Role:** Admin

**Steps:**
1. Open application details
2. View activity log/timeline
3. Verify all activities tracked:
   - Section saves
   - Document uploads
   - Status changes
   - Comments added
   - RFIs sent
4. Verify timestamps and user attribution

**Expected Results:**
- ✅ Complete activity timeline
- ✅ All actions logged
- ✅ Timestamps accurate
- ✅ User names displayed
- ✅ Filterable by action type

---

## Cross-Role Testing

### Role: Applicant
**Test Full Application Workflow**

**Steps:**
1. Create account
2. Start new application
3. Complete all sections using test data above
4. Upload all required documents
5. Complete all acknowledgements
6. Write cover letter
7. Review and submit application
8. Track application status

**Expected Results:**
- ✅ Can complete entire application
- ✅ All sections save correctly
- ✅ Can navigate via sidebar
- ✅ Validation prevents incomplete submission
- ✅ Confirmation email received
- ✅ Can view submitted application

**Time Estimate:** 45-60 minutes

---

### Role: Broker
**Test Broker QA Workflow**

**Steps:**
1. Log in as broker
2. View broker dashboard
3. Check application list with age/activity columns
4. Open application
5. Review all sections
6. Verify all Phase 2 data displays:
   - Employment details
   - Real estate holdings
   - Expanded financial info
   - All acknowledgements
   - Cover letter
7. Add comments/notes
8. Flag issues for applicant
9. Submit to admin review

**Expected Results:**
- ✅ All Phase 2 data visible
- ✅ Age and activity tracking works
- ✅ Can navigate via sidebar
- ✅ Can add comments per section
- ✅ Can request additional info
- ✅ Can submit for admin review

**Time Estimate:** 30-40 minutes per application

---

### Role: Admin/Agent
**Test Admin Review Workflow**

**Steps:**
1. Log in as admin
2. View admin inbox
3. Sort by age and activity
4. Open application for review
6. Review all Phase 2 sections
7. Verify all data complete and accurate
8. Check acknowledgements completed
9. Review cover letter
10. Make decision or request info (RFI)
11. Track application aging

**Expected Results:**
- ✅ All applications visible in inbox
- ✅ Age and activity columns accurate
- ✅ Can filter and sort effectively
- ✅ All Phase 2 data accessible
- ✅ Can make decisions
- ✅ Can send RFIs

**Time Estimate:** 20-30 minutes per application

---

### Role: Board Member
**Test Board Review Workflow**

**Steps:**
1. Log in as board member
2. View applications pending board approval
3. Open application
4. Review applicant profile summary
5. Review financial snapshot
6. Read cover letter
7. Review documents
8. Vote on application
9. Add board notes

**Expected Results:**
- ✅ Can view all applications assigned to board
- ✅ Summary view includes Phase 2 data
- ✅ Cover letter displays prominently
- ✅ Can access full application details
- ✅ Can vote and add notes

**Time Estimate:** 15-20 minutes per application

---

## Performance Testing

### Test P1: Large Document Upload
**Priority:** High

**Steps:**
1. Navigate to Documents section
2. Upload large PDF (10-20 MB)
3. Measure upload time
4. Verify processing
5. Test download

**Expected Results:**
- ✅ Upload completes within 30 seconds
- ✅ Progress indicator shows during upload
- ✅ File processes without errors
- ✅ Thumbnail generates (if applicable)
- ✅ Download works correctly

**Performance Benchmark:** <30 seconds for 20MB file

---

### Test P2: Multiple Simultaneous Uploads
**Priority:** Medium

**Steps:**
1. Select 10 documents to upload
2. Upload all simultaneously
3. Monitor progress
4. Verify all complete

**Expected Results:**
- ✅ All uploads process
- ✅ No timeouts or errors
- ✅ Individual progress bars
- ✅ Overall progress indicator
- ✅ All files saved correctly

**Performance Benchmark:** All 10 files upload within 2 minutes

---

### Test P3: Page Load Times
**Priority:** High

**Steps:**
1. Measure page load times for key pages:
   - Dashboard (broker/admin)
   - Application detail view
   - Document view
   - Financial summary
2. Test with varying data volumes:
   - 10 applications
   - 50 applications
   - 100 applications

**Expected Results:**
- ✅ Dashboard loads <2 seconds
- ✅ Application detail loads <1.5 seconds
- ✅ Document viewer loads <1 second
- ✅ No performance degradation with more data

**Performance Benchmarks:**
- Dashboard: <2s
- Application detail: <1.5s
- Document viewer: <1s

---

### Test P4: Sidebar Navigation Performance
**Priority:** Medium

**Steps:**
1. Open application with all sections complete
2. Rapidly click between sidebar sections
3. Measure navigation response time
4. Test with large applications (many documents)

**Expected Results:**
- ✅ Section loads <500ms
- ✅ No lag or stuttering
- ✅ Smooth transitions
- ✅ Sidebar updates immediately

**Performance Benchmark:** <500ms section navigation

---

### Test P5: Real-time Calculations
**Priority:** Medium

**Steps:**
1. Navigate to Financial Information
2. Add/edit assets and liabilities
3. Measure calculation time for:
   - Total assets
   - Total liabilities
   - Net worth
   - Debt-to-income ratio
4. Test with many line items (20+)

**Expected Results:**
- ✅ Calculations instant (<100ms)
- ✅ No delays or loading indicators needed
- ✅ Updates in real-time as user types
- ✅ Accurate calculations

**Performance Benchmark:** <100ms for all calculations

---

## Mobile Testing

### iOS Testing

#### Test M1: iPhone - Application Flow
**Device:** iPhone 12/13/14
**Browser:** Safari

**Steps:**
1. Create account on mobile
2. Start new application
3. Complete all sections
4. Test sidebar navigation
5. Upload photos from camera
6. Upload documents
7. Complete acknowledgements
8. Submit application

**Expected Results:**
- ✅ All pages responsive
- ✅ Touch targets adequate (44x44px min)
- ✅ Sidebar collapses properly
- ✅ Forms usable
- ✅ Camera integration works
- ✅ Document upload works
- ✅ Checkboxes/buttons functional
- ✅ Scrolling smooth

---

#### Test M2: iPad - Broker Dashboard
**Device:** iPad Air/Pro
**Browser:** Safari

**Steps:**
1. Log in as broker
2. View dashboard in portrait and landscape
3. Review applications
4. Test age/activity sorting
5. Add comments
6. Submit for admin review

**Expected Results:**
- ✅ Dashboard responsive in both orientations
- ✅ Tables scroll horizontally if needed
- ✅ All controls accessible
- ✅ Sidebar works appropriately
- ✅ No layout breaks

---

### Android Testing

#### Test M3: Android Phone - Application Flow
**Device:** Pixel 6/7 or Samsung Galaxy
**Browser:** Chrome

**Steps:**
1. Create account
2. Start application
3. Complete all sections
4. Test sidebar
5. Upload files
6. Complete acknowledgements
7. Submit

**Expected Results:**
- ✅ All pages responsive
- ✅ Touch targets adequate
- ✅ Sidebar collapses properly
- ✅ Forms usable
- ✅ File upload works
- ✅ Checkboxes/buttons functional
- ✅ Scrolling smooth

---

#### Test M4: Android Tablet - Admin Review
**Device:** Samsung Galaxy Tab
**Browser:** Chrome

**Steps:**
1. Log in as admin
2. View inbox
3. Review applications
4. Make decisions
5. Send RFIs

**Expected Results:**
- ✅ Dashboard responsive
- ✅ All controls accessible
- ✅ Tables functional
- ✅ No layout breaks

---

### Cross-Device Testing

#### Test M5: Application Started on Desktop, Continued on Mobile
**Priority:** High

**Steps:**
1. Start application on desktop (Chrome)
2. Complete 3-4 sections
3. Log out
4. Log in on mobile (iPhone Safari)
5. Continue application
6. Complete remaining sections
7. Submit

**Expected Results:**
- ✅ All data persists across devices
- ✅ Can continue seamlessly
- ✅ No data loss
- ✅ Session management works
- ✅ Can submit from mobile

---

## Test Results & Sign-off

### Test Execution Summary

| Test Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|--------------|-------------|---------|---------|---------|-----------|
| Employment Section | 3 | - | - | - | -% |
| Real Estate Holdings | 2 | - | - | - | -% |
| Financial Categories | 3 | - | - | - | -% |
| Building Policies | 2 | - | - | - | -% |
| Acknowledgements | 2 | - | - | - | -% |
| Cover Letter | 2 | - | - | - | -% |
| Sidebar Navigation | 4 | - | - | - | -% |
| Age & Activity | 3 | - | - | - | -% |
| Cross-Role Testing | 4 | - | - | - | -% |
| Performance Tests | 5 | - | - | - | -% |
| Mobile Tests | 5 | - | - | - | -% |
| **TOTAL** | **35** | **-** | **-** | **-** | **-%** |

---

### Critical Bugs Found

| Bug ID | Severity | Description | Status | Assigned To |
|--------|----------|-------------|---------|-------------|
| - | - | - | - | - |

---

### Known Issues / Limitations

| Issue | Impact | Workaround | Resolution Plan |
|-------|---------|------------|-----------------|
| - | - | - | - |

---

### Test Sign-off

**Test Lead:** _________________________
**Date:** _________________________
**Signature:** _________________________

**Development Lead:** _________________________
**Date:** _________________________
**Signature:** _________________________

**Product Owner:** _________________________
**Date:** _________________________
**Signature:** _________________________

---

### Phase 2 Completion Checklist

- [ ] All integration tests passed (100%)
- [ ] No critical bugs remain
- [ ] Performance benchmarks met
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed
- [ ] Documentation updated
- [ ] User guides created
- [ ] Video tutorials recorded
- [ ] Stakeholder approval received
- [ ] Ready for production deployment

---

**Next Steps After Sign-off:**
1. Deploy to staging environment
2. User acceptance testing (UAT)
3. Production deployment
4. Begin Phase 3 development
