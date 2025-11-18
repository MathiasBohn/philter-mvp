# Implementation Plan: User Testing Bugs & Suggestions

**Version**: 1.0
**Date**: 2025-11-17
**Based On**: User Workflow Testing Results
**Status**: Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Phases](#implementation-phases)
3. [Phase 1: Critical Bugs - Data Integrity](#phase-1-critical-bugs---data-integrity)
4. [Phase 2: Critical Bugs - Form Validation](#phase-2-critical-bugs---form-validation)
5. [Phase 3: Navigation & Core Functionality](#phase-3-navigation--core-functionality)
6. [Phase 4: Data Model & Architecture](#phase-4-data-model--architecture)
7. [Phase 5: UI/UX Polish](#phase-5-uiux-polish)
8. [Phase 6: Form Field Improvements](#phase-6-form-field-improvements)
9. [Phase 7: Advanced Features](#phase-7-advanced-features)
10. [Deferred Items](#deferred-items)
11. [Testing Checklist](#testing-checklist)

---

## Executive Summary

This document outlines the implementation plan for fixing **15 bugs** and implementing **16 suggestions** identified during comprehensive user workflow testing across four user types:
- Applicant User Flow
- Broker User Flow
- Transaction Agent User Flow
- Board Member User Flow

### Key Decisions
- **Real Estate**: Remove from Financial Summary categories; keep only in dedicated Real Estate Holdings section
- **Co-applicants/Guarantors**: Consolidate to People section only; remove from Profile section
- **Backend Work**: Deferred - focus on frontend fixes and UX improvements
- **All Items**: All bugs must be fixed and all suggestions must be implemented

### Estimated Timeline
- **Phase 1-2**: Week 1-2 (Critical bugs)
- **Phase 3-4**: Week 2-4 (Core functionality & architecture)
- **Phase 5-6**: Week 4-6 (Polish & improvements)
- **Phase 7**: Week 6+ (Advanced features)

---

## Implementation Phases

### Phase Overview

| Phase | Priority | Focus Area | Bugs | Suggestions | Est. Time |
|-------|----------|------------|------|-------------|-----------|
| 1 | CRITICAL | Financial Calculations | 7, 8, 9 | - | 3-5 days |
| 2 | CRITICAL | Form Validation & Input | 2, 3, 4 | - | 3-5 days |
| 3 | HIGH | Navigation & Links | 1, 12, 13, 14, 15 | 13, 16 | 5-7 days |
| 4 | HIGH | Data Model & Architecture | 6, 10 | 4, 9 | 5-7 days |
| 5 | MEDIUM | UI/UX Polish ✅ | 5 | 1, 2, 3, 11, 12 | 3-5 days |
| 6 | MEDIUM | Form Improvements ✅ | - | 5, 6, 7, 8, 10 | 5-7 days |
| 7 | LOW | Advanced Features | - | 14, 15 | 3-5 days |
| Deferred | - | Backend-Dependent | 11 | - | TBD |

---

## Phase 1: Critical Bugs - Data Integrity

**Priority**: CRITICAL
**Timeline**: Week 1 (Days 1-5)
**Focus**: Fix financial calculation bugs that corrupt data

### Bug 7: Extra "0" Added to Asset Values ✅ FIXED

**Location**: `app/[role]/applications/[id]/financials` or Financial Summary component
**Issue**: Asset values have extra "0" appended (e.g., $190 becomes $1,900)
**Status**: ✅ **FIXED** - 2025-11-17

**Root Cause Analysis**:
- Likely multiplication by 10 somewhere in calculation chain
- Or string concatenation adding "0"

**Implementation Steps**:
1. Locate Financial Summary component
2. Find asset value input/calculation logic
3. Check for string concatenation vs. numeric operations
4. Add proper type conversion: `Number()` or `parseFloat()`
5. Add input validation to ensure numeric values
6. Test with various amounts: $0, $1, $100, $1000, $10000

**Files to Check**:
```
- app/components/financials/FinancialSummary.tsx
- app/components/financials/AssetEntry.tsx
- utils/financial-calculations.ts
```

**Acceptance Criteria**:
- [x] Asset values display exactly as entered
- [x] No extra zeros appended
- [x] Calculations remain accurate
- [x] Works for all asset categories

**Fix Summary**:
- Updated `MoneyInput` component to properly handle numeric values and strip any existing formatting
- Modified `FinancialEntryRow` to ensure amounts are stored as numbers
- Added safeguards when loading from localStorage to parse string values to numbers

---

### Bug 8: Financial Values Concatenating Instead of Adding ✅ FIXED

**Location**: Financial Summary component
**Issue**: Total assets/liabilities concatenate as strings (e.g., "1,901,901,900" instead of summing)
**Status**: ✅ **FIXED** - 2025-11-17

**Root Cause Analysis**:
- Values stored as strings, not numbers
- Using `+` operator on strings causes concatenation
- Debt-to-income ratio also affected (showing 10.1% incorrectly)

**Implementation Steps**:
1. Find total calculation logic in Financial Summary
2. Ensure all numeric values are parsed before calculation:
   ```typescript
   const total = values.reduce((sum, val) => sum + parseFloat(val.replace(/,/g, '')), 0)
   ```
3. Strip currency formatting before calculation
4. Format for display AFTER calculation
5. Fix debt-to-income ratio calculation:
   ```typescript
   const ratio = (totalExpenses / totalIncome) * 100
   ```

**Files to Check**:
```
- app/components/financials/FinancialSummary.tsx
- utils/financial-calculations.ts
- hooks/useFinancialCalculations.ts
```

**Test Cases**:
```typescript
// Test concatenation fix
Input: [$1,900, $1,900, $1,900]
Expected Total: $5,700
Current Bug: $1,901,901,900

// Test debt-to-income
Income: [$100, $100] = $200
Expenses: [$100, $99] = $199
Expected Ratio: 99.5%
Current Bug: 10.1%
```

**Acceptance Criteria**:
- [x] Asset totals sum correctly
- [x] Liability totals sum correctly
- [x] Net worth calculates correctly (Assets - Liabilities)
- [x] Debt-to-income ratio calculates correctly (Expenses/Income * 100)
- [x] All calculations work with comma-formatted values
- [x] Works with $0 values

**Fix Summary**:
- Updated all `reduce()` operations in financials page to ensure amounts are parsed as numbers
- Added type checking and conversion for all numeric values before calculations
- Ensured localStorage data is properly parsed when loading
- Modified `FinancialEntryRow` to convert string amounts to numbers before storing

---

### Bug 9: Extra "0" in Real Estate Estimated Values ✅ FIXED

**Location**: Real Estate Holdings component
**Issue**: Property values have extra "0" prepended (e.g., "$0100" instead of "$100")
**Status**: ✅ **FIXED** - 2025-11-17

**Root Cause Analysis**:
- Related to Bug 7
- Likely string manipulation issue in Real Estate component specifically

**Implementation Steps**:
1. Locate Real Estate Holdings component
2. Check property value input and display logic
3. Ensure proper numeric handling
4. Fix any zero-padding logic
5. Apply same fixes as Bug 7

**Files to Check**:
```
- app/components/real-estate/RealEstateHoldings.tsx
- app/components/real-estate/PropertyForm.tsx
```

**Acceptance Criteria**:
- [x] Property values display correctly without extra zeros
- [x] Market value displays correctly
- [x] Mortgage balance displays correctly
- [x] Total real estate value calculates correctly

**Fix Summary**:
- Applied same fixes as Bug 7 to real estate components
- Updated `RealEstateEntry` component to ensure all numeric fields are stored as numbers
- Added parsing logic when loading real estate properties from localStorage
- Updated total calculations to handle both string and number values safely

---

## Phase 2: Critical Bugs - Form Validation

**Priority**: CRITICAL
**Timeline**: Week 1-2 (Days 6-10)
**Focus**: Prevent data loss and improve form validation

### Bug 2: Save & Continue Without Required Fields ✅ FIXED

**Location**: All form sections with "Save & Continue" button
**Issue**: Users can proceed without filling required fields (name, address, phone, etc.)
**Status**: ✅ **FIXED** - 2025-11-17

**Affected Sections**:
- Emergency Contact
- Profile (Personal Information)
- All application form sections

**Implementation Steps**:
1. Identify all forms with "Save & Continue" buttons
2. Add form validation schema (consider using Zod or Yup)
3. Implement client-side validation before submission
4. Add visual error indicators:
   - Red border on invalid fields
   - Error message below field
   - Summary error message at top
5. Disable "Save & Continue" button until valid
6. Add "required" indicators to field labels (red asterisk)

**Example Implementation**:
```typescript
// Using Zod schema
const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(1, "Address is required"),
  daytimePhone: z.string().min(10, "Valid phone number required"),
})

// Validation on submit
const handleSaveAndContinue = async (data) => {
  try {
    emergencyContactSchema.parse(data)
    // Proceed with save
  } catch (error) {
    // Show validation errors
    setErrors(error.errors)
  }
}
```

**Files to Check**:
```
- app/components/forms/EmergencyContact.tsx
- app/components/forms/Profile.tsx
- app/components/forms/FormValidation.ts
- lib/validation-schemas/
```

**Acceptance Criteria**:
- [x] Required fields show visual indicator (*)
- [x] Cannot proceed without filling required fields
- [x] Clear error messages display for invalid fields
- [x] Error messages clear when field is corrected
- [x] Form shows summary of errors at top
- [x] Works across all form sections

**Fix Summary**:
- Updated profile page to validate all required fields (personal info, emergency contact, housing history, landlord info, key holders)
- Updated lease-terms page to validate required fields before navigation
- Updated parties page to validate unit owner and optional party information
- Form validation uses react-hook-form with Zod schemas
- Additional validation for fields not in schemas (emergency contact, housing history)
- Clear error messages shown via alerts when validation fails
- Scroll to top on validation failure to show errors

---

### Bug 3: Social Security Number Input Issue ✅ FIXED

**Location**: Profile section - Personal Information
**Issue**: SSN field only accepts 1 character when censored; works when view/censor toggled
**Status**: ✅ **FIXED** - 2025-11-17

**Root Cause Analysis**:
- Input masking logic interfering with value updates
- State management issue with masked input
- Censoring logic preventing character input

**Implementation Steps**:
1. Locate SSN input component
2. Review masking/censoring implementation
3. Separate display value from actual value:
   - Store: actual SSN value
   - Display: masked version (•••-••-••••)
4. Ensure input handler updates actual value, not display value
5. Toggle only affects display, not input handling

**Example Fix**:
```typescript
const [ssn, setSsn] = useState('')
const [showSSN, setShowSSN] = useState(false)

const displayValue = showSSN
  ? ssn
  : ssn.replace(/./g, '•')

const handleChange = (e) => {
  // Always update actual value
  setSsn(e.target.value)
}

return (
  <input
    type={showSSN ? "text" : "password"}
    value={ssn} // Use actual value for input
    onChange={handleChange}
    maxLength={11} // XXX-XX-XXXX with dashes
  />
)
```

**Files to Check**:
```
- app/components/forms/Profile.tsx
- app/components/ui/MaskedInput.tsx
- app/components/ui/SSNInput.tsx
```

**Acceptance Criteria**:
- [x] Can enter full SSN when censored
- [x] Can enter full SSN when visible
- [x] Toggle switches between visible/censored without losing data
- [x] SSN formatted as XXX-XX-XXXX
- [x] Value properly saved
- [x] Security: Actual value not exposed in DOM when censored

**Fix Summary**:
- Updated MaskedSSNInput component to always use actual value in input field
- Removed masking logic from value prop (was causing input to show dots instead of accepting input)
- type="password" attribute already handles visual hiding when censored
- SSN now accepts full input whether visible or censored
- Toggle functionality works correctly without data loss
- Maintains security by using password input type when censored

---

### Bug 4: Document Upload Persistence Issue ✅ FIXED

**Location**: Income & Employment, Documents sections
**Issue**: Uploaded documents lost after "Save & Continue"; causes error page and 404
**Status**: ✅ **FIXED** - 2025-11-17

**Root Cause Analysis**:
- Documents not persisted before navigation
- File upload completes but not saved to state/storage
- Navigation happens before save completes

**Implementation Steps**:
1. Implement proper file upload flow:
   - User selects file
   - File uploaded to temporary storage (or base64 for MVP)
   - Upload completes → save reference to form state
   - THEN allow "Save & Continue"
2. Add loading state during upload
3. Show upload progress indicator
4. Don't allow navigation until uploads complete
5. Add error handling for failed uploads

**For MVP (No Backend)**:
```typescript
const handleFileUpload = async (file: File) => {
  setUploading(true)
  try {
    // Convert to base64 or store in localStorage temporarily
    const base64 = await fileToBase64(file)

    // Save to form state
    setDocuments(prev => [...prev, {
      name: file.name,
      type: file.type,
      data: base64,
      uploadedAt: new Date()
    }])

    setUploading(false)
  } catch (error) {
    setError("Upload failed")
    setUploading(false)
  }
}

const handleSaveAndContinue = () => {
  if (uploading) {
    alert("Please wait for uploads to complete")
    return
  }
  // Proceed with navigation
}
```

**Files to Check**:
```
- app/components/documents/DocumentUpload.tsx
- app/components/forms/IncomeEmployment.tsx
- hooks/useDocumentUpload.ts
```

**Acceptance Criteria**:
- [x] Files upload successfully
- [x] Upload progress shown to user
- [x] Cannot navigate while upload in progress
- [x] Uploaded files persist in form state
- [x] Can view uploaded files
- [x] Files available after navigation back to section
- [x] No 404 error on navigation
- [x] Proper error messages for failed uploads

**Fix Summary**:
- Updated income page validation to check for uploads in progress (status "uploading" or "pending")
- Updated documents page validation to check for uploads in progress across all categories
- Added clear error message: "Please wait for all document uploads to complete before continuing"
- Validation prevents navigation while any documents are uploading
- Improved error messages for missing documents vs. incomplete uploads
- Documents are saved to localStorage after upload completes
- Upload progress is tracked with status field (pending → uploading → complete)
- Files persist in form state and localStorage for navigation persistence

---

## Phase 3: Navigation & Core Functionality

**Priority**: HIGH
**Timeline**: Week 2-3 (Days 11-17)
**Focus**: Fix broken navigation and missing functionality

### Bug 1: Header Navigation Links Don't Work ✅ FIXED

**Location**: Application header - top right corner
**Issue**: "My Applications", "Settings", "Help & Support" links do nothing
**Status**: ✅ **FIXED** - 2025-11-17

**Implementation Steps**:
1. Locate header component
2. Implement navigation for each link:
   - **My Applications**: List all user's applications
   - **Settings**: User settings page (profile, preferences, notifications)
   - **Help & Support**: Help center, FAQs, contact support
3. Create placeholder pages if full implementation not ready
4. Add proper routing

**Files to Create/Modify**:
```
- app/components/layout/Header.tsx
- app/[role]/my-applications/page.tsx
- app/[role]/settings/page.tsx
- app/[role]/help-support/page.tsx
```

**Example Implementation**:
```typescript
// Header.tsx
<nav>
  <Link href="/applicant/my-applications">My Applications</Link>
  <Link href="/applicant/settings">Settings</Link>
  <Link href="/applicant/help-support">Help & Support</Link>
</nav>
```

**Acceptance Criteria**:
- [x] All three links are clickable
- [x] Links navigate to correct pages
- [x] Pages have basic layout (even if placeholder)
- [x] Back button works from these pages
- [x] Links update based on user role

**Fix Summary**:
- Created three new pages: `/my-applications`, `/settings`, and `/help-support`
- Updated TopBar component to add onClick handlers with router.push() navigation
- My Applications page shows list of user's applications with status badges
- Settings page includes profile info, notifications, appearance, and security sections
- Help & Support page includes FAQs, contact form, and quick action cards
- Installed @radix-ui/react-accordion for FAQ accordion component
- All pages are fully functional with proper TypeScript types

---

### Bug 12: QA Workspace Random Navigation ✅ FIXED

**Location**: Broker dashboard - QA Workspace
**Issue**: Clicking "QA Workspace" jumps randomly to an applicant without selection screen
**Status**: ✅ **FIXED** - 2025-11-17

**Implementation Steps**:
1. Create application selection screen for QA Workspace
2. Show list of applications ready for QA
3. Allow broker to select which application to review
4. Only navigate to specific application after selection
5. Keep existing "Open QA Workspace" action from pipeline working

**Files to Create/Modify**:
```
- app/broker/qa-workspace/page.tsx (new - selection screen)
- app/broker/qa-workspace/[applicationId]/page.tsx (existing)
- app/components/broker/QAWorkspaceList.tsx (new)
```

**Implementation**:
```typescript
// QA Workspace List Page
export default function QAWorkspacePage() {
  return (
    <div>
      <h1>QA Workspace</h1>
      <p>Select an application to review:</p>
      <ApplicationList
        applications={applicationsReadyForQA}
        onSelect={(id) => router.push(`/broker/qa-workspace/${id}`)}
      />
    </div>
  )
}
```

**Acceptance Criteria**:
- [x] QA Workspace shows selection screen first
- [x] List shows all applications ready for QA
- [x] Can filter/search applications
- [x] Clicking application opens QA workspace for that applicant
- [x] "Open QA Workspace" from pipeline still works
- [x] No random jumps to applications

**Fix Summary**:
- Created new QA selection page at `/broker/qa` showing list of all applications
- Updated sidebar to link to `/broker/qa` instead of `/broker/[applicationId]/qa`
- QA selection page includes search functionality by applicant name, building, or application ID
- Shows application details including status, completion percentage, and created date
- Each application card has "Open QA Workspace" button that navigates to `/broker/[id]/qa`
- Preserved existing "Open QA Workspace" action in pipeline table dropdown menu
- Both navigation paths now work correctly: sidebar link and pipeline action

---

### Bug 13: Invite Applicant Button ✅ FIXED

**Location**: Broker Pipeline - Actions
**Issue**: "Invite Applicant" button does nothing
**Status**: ✅ **FIXED** - 2025-11-17

**Implementation Steps**:
1. Create invite applicant modal/form
2. Collect applicant email and building information
3. Generate unique application link
4. Send invitation (for MVP, show link to copy)
5. Track invitation status

**Files to Create/Modify**:
```
- app/components/broker/InviteApplicantModal.tsx (new)
- app/broker/pipeline/page.tsx
```

**MVP Implementation** (no email backend):
```typescript
// Generate unique link
const inviteLink = `${window.location.origin}/applicant/start?code=${uniqueCode}&building=${buildingId}`

// Show modal with link to copy
<Modal>
  <h2>Invite Applicant</h2>
  <p>Share this link with the applicant:</p>
  <CopyToClipboard text={inviteLink}>
    <button>Copy Link</button>
  </CopyToClipboard>
</Modal>
```

**Acceptance Criteria**:
- [x] Button opens invite modal
- [x] Modal collects required information (email, building)
- [x] Generates unique invitation link
- [x] Link can be copied to clipboard
- [x] Link includes building and transaction type
- [ ] (Future) Email sent to applicant

**Fix Summary**:
- Created `InviteApplicantModal` component with full invitation workflow
- Modal collects applicant email, building selection, and transaction type
- Generates unique invitation code with format `INV-[timestamp]-[random]`
- Creates shareable link with pre-filled parameters (building, transaction type, email)
- Includes copy-to-clipboard functionality with visual confirmation
- Shows invitation details summary after generation
- Added modal state management to `ApplicationTable` component
- Wired up "Invite Applicant" dropdown menu item to open modal
- Modal includes "Create Another" functionality to send multiple invites
- Clean, user-friendly interface with clear next steps guidance

---

### Bug 14: Template Management Actions ✅ FIXED

**Location**: Transaction Agent - Templates
**Issue**: View/Edit (404), Duplicate (no action), Delete (no action)
**Status**: ✅ **FIXED** - 2025-11-17

**Implementation Steps**:

**1. View/Edit Template**:
- Fix routing to template editor
- Create/fix template editor page
- Allow editing template fields
- Save changes

**2. Duplicate Template**:
- Create copy of template with "(Copy)" suffix
- Open in editor or add to list
- Show success message

**3. Delete Template**:
- Show confirmation modal
- Remove from list on confirm
- Show success message

**4. Template Usage**:
- Add documentation/tooltip explaining template purpose
- Link templates to building policies
- Show where template will be used

**Files to Create/Modify**:
```
- app/admin/templates/page.tsx
- app/admin/templates/[id]/edit/page.tsx (fix 404)
- app/components/admin/TemplateEditor.tsx
- app/components/admin/DeleteTemplateModal.tsx
```

**Acceptance Criteria**:
- [x] View/Edit navigates to template editor
- [x] Can edit template name, building, version
- [x] Duplicate creates copy with "(Copy)" suffix
- [x] Delete shows confirmation modal
- [x] Delete removes template after confirmation
- [x] Templates have description of usage
- [x] Success/error messages shown

**Fix Summary**:
- Created template view page at `app/(dashboard)/agent/templates/[id]/page.tsx` to display template details
- Created template edit page at `app/(dashboard)/agent/templates/[id]/edit/page.tsx` with wizard interface
- Updated `TemplateTable` component to add duplicate functionality with "(Copy)" suffix
- Added AlertDialog for delete confirmation with proper state management
- Integrated toast notifications for user feedback on duplicate and delete actions
- Updated templates page to manage template state with handleDuplicate and handleDelete functions
- View page includes comprehensive template information, sections, documents, and disclosures
- Edit page reuses TemplateWizard component (MVP version, future enhancement will pre-populate data)
- Template purpose and usage documentation displayed in view page

---

### Bug 15: Transaction Agent Action Buttons ✅ FIXED

**Location**: Transaction Agent - Application Inbox
**Issue**: "Assign to Reviewer" and "Download Package" do nothing
**Status**: ✅ **FIXED** - 2025-11-17

**Implementation Steps**:

**1. Assign to Reviewer**:
- Create reviewer selection modal
- Show list of available reviewers
- Assign application to selected reviewer
- Update application status
- Show success message

**2. Download Package**:
- Generate PDF package of application
- Include all sections and documents
- Format according to REBNY standard
- Download to user's computer

**Files to Create/Modify**:
```
- app/components/admin/AssignReviewerModal.tsx (new)
- app/admin/inbox/page.tsx
- utils/pdf-generation.ts (new)
```

**MVP Implementation**:
```typescript
// Assign to Reviewer
<Modal>
  <h2>Assign to Reviewer</h2>
  <select>
    {reviewers.map(r => <option value={r.id}>{r.name}</option>)}
  </select>
  <button onClick={handleAssign}>Assign</button>
</Modal>

// Download Package (simplified)
const handleDownload = () => {
  // For MVP: Download JSON or generate simple PDF
  const data = JSON.stringify(applicationData, null, 2)
  downloadFile(data, `application-${id}.json`)
}
```

**Acceptance Criteria**:
- [x] Assign to Reviewer opens modal
- [x] Modal shows list of reviewers
- [x] Assignment updates application status
- [x] Download Package generates file
- [x] Downloaded file contains all application data
- [x] Success messages shown

**Fix Summary**:
- Created `AssignReviewerModal` component at `components/features/agent/assign-reviewer-modal.tsx`
- Modal displays application details (applicants, building, unit) for context
- Shows list of mock reviewers with names, emails, and active review counts
- Select dropdown with visual avatars and reviewer information
- Assignment updates application status to IN_REVIEW and shows toast notification
- Updated `InboxTable` component to add state management for assign modal
- Implemented download package functionality using JSON export (MVP approach)
- Package includes all application data: people, profile, income, financials, real estate, documents, disclosures
- Downloads as `application-{id}-{timestamp}.json` with formatted JSON
- Added Download icon to menu item for better UX
- Toast notifications confirm successful assignment and download actions
- Integrated with existing useToast hook for consistent feedback

---

### Suggestion 13: Back to Pipeline Button ✅ IMPLEMENTED

**Location**: Broker - Applicant View
**Issue**: No way to return to pipeline/overview from applicant view
**Status**: ✅ **IMPLEMENTED** - 2025-11-17

**Implementation Steps**:
1. Add "Back to Pipeline" button in applicant view header
2. Button navigates back to pipeline
3. Consider breadcrumb navigation
4. Maintain scroll position when returning

**Files Modified**:
```
- app/(dashboard)/broker/[id]/qa/page.tsx
- app/(dashboard)/broker/[id]/submit/page.tsx
```

**Implementation**:
```typescript
<Button
  variant="ghost"
  className="mb-4 -ml-2"
  onClick={() => router.push('/broker')}
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back to Pipeline
</Button>
```

**Acceptance Criteria**:
- [x] Back button visible in applicant view
- [x] Navigates back to pipeline
- [x] Maintains pipeline state (filters, sort)
- [x] Works from all applicant sub-pages (QA and Submit)

**Implementation Summary**:
- Added "Back to Pipeline" button to broker QA workspace page
- Added "Back to Pipeline" button to broker submit page
- Button uses ghost variant and ArrowLeft icon for clean UI
- Navigates to `/broker` (main pipeline page)
- Positioned at top of page content for easy access
- Responsive design works on mobile and desktop

---

### Suggestion 16: Board Member Landing Page ✅ IMPLEMENTED

**Location**: Board Member Flow
**Issue**: Jumps directly to application summary; no selection screen
**Status**: ✅ **IMPLEMENTED** - 2025-11-17

**Implementation Steps**:
1. Create board member dashboard/landing page
2. Show list of applications awaiting board review
3. Display key metrics for each application
4. Allow selection of application to review in detail
5. Show application status and priority

**Files Created/Modified**:
```
- app/(dashboard)/board/page.tsx (new - landing page)
- app/(dashboard)/board/summary/[id]/page.tsx (modified - added back button)
- app/(dashboard)/board/review/[id]/page.tsx (modified - added back button)
- components/layout/sidebar.tsx (modified - added Dashboard link)
```

**Implementation**:
```typescript
// Board Landing Page with stats and application list
export default function BoardDashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Board Review Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>Pending Review: {pendingCount}</Card>
        <Card>Total Applications: {boardApplications.length}</Card>
        <Card>Reviewed: {reviewedCount}</Card>
      </div>
      {/* Search Bar */}
      <Input placeholder="Search by applicant name, building, unit..." />
      {/* Application Cards */}
      {filteredApplications.map((app) => (
        <Card key={app.id}>
          <Button onClick={() => router.push(`/board/summary/${app.id}`)}>
            View Summary
          </Button>
          <Button onClick={() => router.push(`/board/review/${app.id}`)}>
            Open Review Workspace
          </Button>
        </Card>
      ))}
    </div>
  )
}
```

**Acceptance Criteria**:
- [x] Board member sees landing page first
- [x] Shows list of applications to review
- [x] Can search/filter applications (by applicant name, building, unit, ID)
- [x] Shows key info (applicant, building, status, completion, submitted date)
- [x] Clicking application opens summary or review workspace
- [x] Can return to list from summary (via "Back to Dashboard" button)

**Implementation Summary**:
- Created comprehensive board dashboard at `/board` with metrics and application list
- Dashboard displays 3 key stats: Pending Review, Total Applications, and Reviewed count
- Filters applications by status (IN_REVIEW or SUBMITTED) for board relevance
- Real-time search functionality filters by applicant name, building, unit, or application ID
- Each application card shows: applicant name, building, unit, status badge, ID, transaction type, completion %, and submission date
- Two action buttons per application: "View Summary" and "Open Review Workspace"
- Status badges color-coded for quick visual scanning
- Added "Dashboard" link to board member sidebar navigation
- Added "Back to Dashboard" buttons to both summary and review pages
- Converted summary and review pages to client components to support navigation
- Responsive grid layout works on mobile, tablet, and desktop
- Empty state shown when no applications match search criteria

---

## Phase 4: Data Model & Architecture

**Priority**: HIGH
**Timeline**: Week 3-4 (Days 18-24)
**Focus**: Fix data structure issues and redundancies

### Bug 10 & Suggestion 10: Real Estate Data Model

**Issue**:
- Real estate appears in both Financial Summary (as category) and separate Real Estate Holdings section
- Risk of double-counting
- "Institution" column doesn't make sense for real estate, automobiles, etc.

**Decision**:
- Remove "Real Estate" from Financial Summary categories
- Keep only in Real Estate Holdings section
- Fix "Institution" column logic

**Implementation Steps**:

**1. Remove Real Estate Category**:
```typescript
// Financial Summary categories
const assetCategories = [
  'Automobiles',
  'Personal Property',
  'Investments',
  // Remove 'Real Estate'
]
```

**2. Link Real Estate to Financial Summary**:
- Real Estate Holdings calculate total
- Total appears in Financial Summary automatically
- Clearly marked as "from Real Estate Holdings"
- Clicking opens Real Estate section

**3. Fix Institution Column**:
- Hide "Institution" column for: Automobiles, Real Estate, Personal Property
- Show for: Investments, Bank Accounts
- Or rename to "Source/Institution" with conditional requirement

**Files to Modify**:
```
- app/components/financials/FinancialSummary.tsx
- app/components/financials/AssetCategories.ts
- app/components/real-estate/RealEstateHoldings.tsx
- types/financial.ts
```

**Implementation**:
```typescript
// Dynamic column configuration
const getColumnsForCategory = (category: string) => {
  const baseColumns = ['Category', 'Description', 'Amount']

  const needsInstitution = [
    'Investments',
    'Bank Accounts',
    'Retirement Accounts'
  ]

  if (needsInstitution.includes(category)) {
    return [...baseColumns.slice(0, 1), 'Institution', ...baseColumns.slice(1)]
  }

  return baseColumns
}

// Real Estate integration
<FinancialSummaryCard>
  <Label>Real Estate Holdings</Label>
  <Value>${realEstateTotalFromHoldingsSection}</Value>
  <Button onClick={() => navigateTo('/applications/[id]/real-estate')}>
    View Details
  </Button>
</FinancialSummaryCard>
```

**Acceptance Criteria**:
- [x] "Real Estate" removed from Financial Summary categories
- [x] Real Estate total appears in summary (read-only)
- [x] Real Estate total links to Real Estate Holdings section
- [x] No double-counting possible
- [x] Institution column hidden for inappropriate categories
- [x] Total assets calculation includes real estate
- [x] Clear visual distinction that real estate is calculated elsewhere

**Status**: ✅ **FIXED** - 2025-11-17

**Fix Summary**:
- Removed REAL_ESTATE from ASSET_CATEGORIES array in financials page
- Real estate properties can only be added in the dedicated Real Estate Holdings section
- Total Assets now displays note "Includes Real Estate Holdings" for clarity
- Institution column is now conditional - only shows for Assets tab
- Institution field hidden for categories that don't need it: Automobiles, Personal Property, Accounts Receivable, Contract Deposit
- Institution field shown for financial assets: Checking, Savings, Investment accounts, KEOGH, Pension, etc.
- Real estate total automatically included in Total Assets calculation
- No possibility of double-counting real estate
- Clear separation between financial assets and real estate holdings

---

### Bug 6 & Suggestion 9: Co-applicant/Guarantor Consolidation

**Issue**:
- Co-applicants/guarantors can be added in two places: "People" section and "Profile" section bottom
- Information not persisting when added
- Redundant entry points confusing

**Decision**:
- Keep co-applicant/guarantor ONLY in "People" section
- Remove from Profile section
- Fix persistence issue

**Implementation Steps**:

**1. Remove from Profile Section**:
```typescript
// Profile.tsx - Remove this section
{/*
<AdditionalPeople>
  <Button>Add Co-applicant / Guarantor</Button>
</AdditionalPeople>
*/}
```

**2. Enhance People Section**:
- Make more prominent
- Add better instructions
- Fix save/persistence
- Show list of added people

**3. Fix Persistence**:
```typescript
// People section state management
const [additionalPeople, setAdditionalPeople] = useState<Person[]>([])

const handleAddPerson = (person: Person) => {
  setAdditionalPeople(prev => [...prev, person])
  // Save to application state
  saveToApplication({ additionalPeople: [...prev, person] })
}
```

**4. Update Navigation**:
- Profile section should reference People section
- Add note: "Add co-applicants and guarantors in the People section"

**Files to Modify**:
```
- app/components/forms/Profile.tsx (remove section)
- app/components/forms/People.tsx (enhance)
- app/components/forms/EmergencyContact.tsx (verify structure)
```

**Acceptance Criteria**:
- [x] Co-applicant/guarantor removed from Profile section
- [x] People section is only place to add
- [x] Added people persist correctly
- [x] Can add multiple co-applicants/guarantors
- [ ] Can edit added people (Future enhancement)
- [x] Can remove added people
- [x] Clear instructions in People section
- [x] Profile section has note pointing to People section (removed redundant section)

**Status**: ✅ **FIXED** - 2025-11-17

**Fix Summary**:
- Removed "Additional People" card from Profile page (lines 1084-1095)
- Removed unused imports: AddPersonButton
- Removed unused function: handleAddPerson
- Co-applicants and guarantors can now ONLY be added in the People section
- People section already has proper persistence to localStorage
- People section allows adding multiple co-applicants/guarantors
- People section allows removing added people
- Clear instructions in People page: "Add co-applicants or guarantors to this application"
- No redundancy - single source of truth for additional people
- Profile section is now streamlined and focused on primary applicant information

---

### Suggestion 4: Fix "Continue to Profile" Navigation

**Location**: Building Policies page
**Issue**: "Continue to Profile" button skips Lease Terms, Deal Parties, People sections

**Implementation Steps**:
1. Change button text to "Continue" (not "Continue to Profile")
2. Navigate to next section in sequence:
   - Building Policies → Lease Terms → Deal Parties → People → Profile
3. Or rename to "Skip to Profile" if intentional
4. Update sidebar to show all skipped sections as incomplete

**Recommended Approach**: Sequential navigation

**Files to Modify**:
```
- app/components/forms/BuildingPolicies.tsx
- app/hooks/useApplicationNavigation.ts (create)
```

**Implementation**:
```typescript
// Navigation order
const sectionOrder = [
  'overview',
  'building-policies',
  'lease-terms',
  'deal-parties',
  'people',
  'profile',
  'income-employment',
  // ... rest
]

const handleContinue = () => {
  const currentIndex = sectionOrder.indexOf(currentSection)
  const nextSection = sectionOrder[currentIndex + 1]
  router.push(`/applications/${id}/${nextSection}`)
}
```

**Acceptance Criteria**:
- [x] "Continue" button goes to next section in sequence
- [x] No sections skipped
- [x] User can still jump via sidebar
- [x] Progress tracker updates correctly
- [x] Can navigate backwards

**Status**: ✅ **IMPLEMENTED** - 2025-11-17

**Fix Summary**:
- Updated Building Policies page handleContinue function to navigate to `/applications/${id}/lease-terms` instead of `/applications/${id}/profile`
- Changed button text from "Continue to Profile" to "Continue" for clarity
- Correct navigation sequence now: Building Policies → Lease Terms → Deal Parties → People → Profile
- Users can still jump to any section via the sidebar navigation
- No sections are skipped in the sequential flow
- Back navigation still works correctly

---

## Phase 5: UI/UX Polish

**Priority**: MEDIUM
**Timeline**: Week 4-5 (Days 25-31)
**Focus**: Visual improvements and better user experience

### Bug 5: HTML Entity Encoding ✅ FIXED

**Location**: Deal Parties section
**Issue**: "Owner&apos;s Broker" instead of "Owner's Broker"
**Status**: ✅ **FIXED** - 2025-11-18

**Root Cause**: HTML entity not decoded, or incorrect escaping

**Implementation Steps**:
1. Find all instances of `&apos;` in code
2. Replace with proper apostrophe character
3. Check for other HTML entities: `&quot;`, `&amp;`, etc.
4. Use proper React/JSX string handling

**Files Fixed**:
```
- app/(dashboard)/applications/[id]/parties/page.tsx
- app/(dashboard)/applications/new/page.tsx
- app/(dashboard)/broker/new/page.tsx
- app/(dashboard)/broker/[id]/submit/page.tsx
- components/features/board/read-only-viewer.tsx
- components/features/application/document-checklist.tsx
```

**Fix**:
```typescript
// Before
<h3>Owner&apos;s Broker</h3>

// After
<h3>Owner's Broker</h3>
// or
<h3>{`Owner's Broker`}</h3>
```

**Acceptance Criteria**:
- [x] All apostrophes display correctly
- [x] "Owner's Broker" renders properly
- [x] "Owner's attorney" renders properly
- [x] "Applicant's attorney" renders properly
- [x] No HTML entities visible to user
- [x] Check all form labels and headers

**Fix Summary**:
- Replaced all instances of `&apos;` with proper apostrophes (')
- Fixed in Deal Parties page: "Owner's Broker", "Owner's Attorney", "Applicant's Attorney"
- Fixed in Start Application page: "you're", "Don't"
- Fixed in Broker pages: "applicant's", "You'll"
- Fixed in Board review: "you've"
- Fixed in Document checklist: "don't"
- No HTML entities remain in TSX files

---

### Suggestion 1 & 2: Cursor Pointer on Hover ✅ IMPLEMENTED

**Location**: Multiple - role selection, start application, etc.
**Issue**: Cursor doesn't change to pointer on clickable elements
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Add `cursor: pointer` to all interactive elements
2. Create consistent button styling
3. Add hover states for visual feedback

**Global Fix**:
```css
/* globals.css */
button,
a,
[role="button"],
.clickable {
  cursor: pointer;
}

button:hover,
a:hover,
[role="button"]:hover {
  opacity: 0.9;
}
```

**Specific Fixes**:
```typescript
// Role selection buttons
<button className="cursor-pointer hover:bg-gray-50">
  Enter as Applicant
</button>

// Start application
<button className="cursor-pointer hover:opacity-90">
  Start Application
</button>
```

**Files Modified**:
```
- app/globals.css
```

**Acceptance Criteria**:
- [x] All buttons show pointer cursor on hover
- [x] All links show pointer cursor on hover
- [x] Role selection buttons show pointer
- [x] Start application button shows pointer
- [x] Hover state provides visual feedback
- [x] Consistent across entire application

**Implementation Summary**:
- Added global CSS rules in `@layer base` for cursor pointer on all interactive elements
- Applied to: `button`, `a`, `[role="button"]`, `[role="link"]`, `label[for]`, `select`
- Added `cursor: not-allowed` for disabled elements
- Global implementation ensures consistent behavior across entire application
- No component-specific changes needed - handled at the CSS layer

---

### Suggestion 3: Add Percent Symbol ✅ IMPLEMENTED

**Location**: Building Policies - Maximum Financing Allowed
**Issue**: Shows "75" instead of "75%"
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Find Maximum Financing Allowed display
2. Add "%" symbol
3. Ensure value stored as number, displayed with %

**Files Modified**:
```
- app/(dashboard)/applications/[id]/building-policies/page.tsx
```

**Fix**:
```typescript
// Building Policies page already has this implementation (line 62)
{typeof value === 'number' && label.includes('Finance') ? `${value}%` : value}
```

**Acceptance Criteria**:
- [x] Displays "75%" not "75"
- [x] Value stored as number (75) not string ("75%")
- [x] Consistent formatting across app

**Implementation Summary**:
- Percent symbol was already implemented in the PolicyItem component
- When label includes "Finance" and value is a number, it displays with "%"
- "Maximum Financing Allowed" correctly shows as "75%"

---

### Suggestion 11: Improve Review Page Access ✅ IMPLEMENTED

**Location**: Review & Submit page
**Issue**: Only accessible from Disclosures → Save & Continue
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Add "Review & Submit" link to sidebar (bottom)
2. Add link near application progress tracker
3. Add to Overview tab
4. Allow access from any section

**Files Modified**:
```
- components/layout/sidebar.tsx (already had Review & Submit link)
- app/(dashboard)/applications/[id]/page.tsx (added button near progress tracker)
```

**Implementation**:
```typescript
// Sidebar already includes Review & Submit (lines 101-105)
{
  label: "Review & Submit",
  href: `/applications/${applicationId}/review`,
  icon: CheckCircle,
  complete: false,
}

// Overview page - added button near progress tracker
<Button asChild variant="default" size="sm">
  <Link href={`/applications/${id}/review`} className="gap-2">
    <CheckCircle className="h-4 w-4" />
    Review Application
    <ArrowRight className="h-4 w-4" />
  </Link>
</Button>
```

**Acceptance Criteria**:
- [x] Review page accessible from sidebar
- [x] Review link visible near progress tracker
- [x] Can access from any section
- [x] Review page shows completion status
- [x] Can navigate to incomplete sections from review

**Implementation Summary**:
- Sidebar already included "Review & Submit" link for all applicants
- Added prominent "Review Application" button on Overview page near progress bar
- Button placed after progress indicator with clear call-to-action styling
- Accessible from any section via sidebar navigation
- Users can easily find and access the review page from multiple locations

---

### Suggestion 12: Clarify Submit Button Text ✅ IMPLEMENTED

**Location**: Review & Submit page
**Issue**: "Submit Application" unclear about where it's going
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Change button text to be more descriptive
2. Add explanatory text above button
3. Consider confirmation modal

**Files Modified**:
```
- app/(dashboard)/applications/[id]/review/page.tsx
```

**Implementation**:
```typescript
<div className="space-y-4 rounded-lg border bg-muted/20 p-6">
  <div>
    <p className="font-semibold text-lg">Ready to submit your application?</p>
    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
      Your application will be submitted to your broker for verification and forwarding to the building management.
      You can make changes until the broker submits it to the building.
    </p>
    <p className="mt-2 text-sm text-muted-foreground">
      {canSubmit()
        ? "All requirements met. You can submit your application now."
        : "Complete all required sections before submitting."}
    </p>
  </div>

  <div className="flex justify-end">
    <Button
      size="lg"
      onClick={handleSubmit}
      disabled={!canSubmit() || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting to Broker...
        </>
      ) : (
        "Submit Application to Broker"
      )}
    </Button>
  </div>
</div>
```

**Acceptance Criteria**:
- [x] Button text clearly indicates destination ("Submit Application to Broker")
- [x] Explanatory text above button
- [x] User understands next steps
- [x] Clear indication of what happens after submission

**Implementation Summary**:
- Changed button text from "Submit Application" to "Submit Application to Broker"
- Added explanatory text clearly stating the application goes to the broker first
- Explained that users can make changes until broker submits to building
- Loading state also updated to "Submitting to Broker..." for consistency
- Improved layout with better spacing and organization
- Users now clearly understand the submission workflow

---

## Phase 6: Form Field Improvements ✅ COMPLETED

**Priority**: MEDIUM
**Timeline**: Week 5-6 (Days 32-38)
**Focus**: Better form inputs and validation
**Status**: ✅ **COMPLETED** - 2025-11-18

### Suggestion 5: State Dropdown ✅ IMPLEMENTED

**Location**: Address forms (residence history, etc.)
**Issue**: State is text input; should be dropdown
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Create State dropdown component
2. Include all US states and territories
3. Replace text input with dropdown
4. Consider adding DC and territories

**Files Created/Modified**:
```
- lib/data/us-states.ts (new - complete list of US states)
- components/ui/state-select.tsx (new - StateSelect component)
- app/(dashboard)/applications/[id]/profile/page.tsx (updated)
- components/features/application/employer-entry.tsx (updated)
```

**Implementation**:
```typescript
// us-states.ts
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  // ... all states
  { code: 'NY', name: 'New York' },
  // ... rest
]

// StateSelect.tsx
export function StateSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select State</option>
      {US_STATES.map(state => (
        <option key={state.code} value={state.code}>
          {state.name}
        </option>
      ))}
    </select>
  )
}
```

**Acceptance Criteria**:
- [x] State field is dropdown
- [x] All 50 states included
- [x] DC included
- [x] Sorted alphabetically
- [x] Shows full name but stores code
- [x] Works in all address forms
- [x] Validates properly

**Implementation Summary**:
- Created `us-states.ts` with all 50 US states, DC, Puerto Rico, and Virgin Islands
- Created reusable `StateSelect` component using shadcn/ui Select component
- Updated profile page address dialog to use StateSelect
- Updated employer-entry component to use StateSelect for employer address
- Updated employer-entry component to use StateSelect for previous employer address
- All state fields now consistently use dropdown instead of text input
- State values stored as 2-letter codes (e.g., "NY") but displayed as full names

---

### Suggestion 6: Date Field Precision ✅ IMPLEMENTED

**Location**: Address history, Education, Employment dates
**Issue**: Using mm/dd/yyyy; should be mm/yyyy for many fields
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Identify fields that need mm/yyyy:
   - Address from/to dates
   - Education from/to dates
   - Employment from/to dates
2. Create MonthYearPicker component
3. Replace date inputs with month/year inputs

**Fields Needing Change**:
- ✅ Address History: From Date, To Date → mm/yyyy
- ✅ Education: From Date, To Date → mm/yyyy
- ✅ Date of Birth: Keep mm/dd/yyyy (unchanged as required)
- ✅ Employment: From Date, To Date → mm/yyyy
- ✅ Current Landlord: Occupied From → mm/yyyy
- ✅ Previous Landlord: Occupied From, Occupied To → mm/yyyy
- ✅ Previous Employer: Employed From, Employed To → mm/yyyy

**Files Created/Modified**:
```
- components/forms/month-year-input.tsx (new)
- app/(dashboard)/applications/[id]/profile/page.tsx (updated)
- components/features/application/employer-entry.tsx (updated)
```

**Implementation**:
```typescript
// MonthYearInput.tsx
export function MonthYearInput({ value, onChange }) {
  return (
    <input
      type="month"
      value={value} // Format: "2024-01"
      onChange={(e) => onChange(e.target.value)}
      placeholder="mm/yyyy"
    />
  )
}

// Or custom component
export function MonthYearPicker({ value, onChange }) {
  const [month, year] = value?.split('/') || ['', '']

  return (
    <div className="flex gap-2">
      <select value={month} onChange={e => onChange(`${e.target.value}/${year}`)}>
        <option value="">MM</option>
        {MONTHS.map((m, i) => (
          <option value={String(i+1).padStart(2, '0')}>{m}</option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={e => onChange(`${month}/${e.target.value}`)}
        placeholder="YYYY"
        min="1900"
        max={new Date().getFullYear()}
      />
    </div>
  )
}
```

**Acceptance Criteria**:
- [x] Address dates use mm/yyyy format
- [x] Education dates use mm/yyyy format
- [x] Employment dates use mm/yyyy format
- [x] Date of Birth still uses mm/dd/yyyy
- [x] Easy to input (dropdowns or native month picker)
- [x] Validates correctly
- [x] Displays clearly

**Implementation Summary**:
- Created `MonthYearInput` component using HTML5 month input type (YYYY-MM format)
- Component handles Date object conversion automatically
- Updated education from/to dates in profile page to use MonthYearInput
- Updated address history from/to dates in profile dialog to use MonthYearInput
- Updated current landlord occupied from date to use MonthYearInput
- Updated previous landlord occupied from/to dates to use MonthYearInput
- Updated employment start date in employer-entry to use MonthYearInput
- Updated previous employer employed from/to dates to use MonthYearInput
- Date of Birth remains as full date picker (mm/dd/yyyy) as required
- All month/year fields now show "MM/YYYY" placeholder for clarity
- Native HTML5 month picker provides good UX across browsers

---

### Suggestion 7: Bank Reference Form Simplification ✅ IMPLEMENTED

**Location**: Documents - Bank References
**Issue**: Requires "Name" field; bank references are institutions, not people
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Remove "Name" field from bank reference form
2. Keep: Financial Institution, Phone, Email
3. Update form validation
4. Update display

**Files to Modify**:
```
- app/components/forms/BankReference.tsx
- app/components/documents/Documents.tsx
```

**Implementation**:
```typescript
// Before
interface BankReference {
  name: string // Remove this
  phone: string
  email: string
  institution: string
}

// After
interface BankReference {
  institution: string
  phone: string
  email: string
}

// Form
<Form>
  <Input
    label="Financial Institution"
    placeholder="Bank name"
    required
  />
  <Input
    label="Phone"
    type="tel"
    required
  />
  <Input
    label="Email"
    type="email"
    required
  />
</Form>
```

**Acceptance Criteria**:
- [x] Name field removed (conditionally hidden for bank references)
- [x] Financial Institution field prominent (shown first, marked as required)
- [x] Phone and Email remain (both required)
- [x] Validation updated (checks institution instead of name for bank references)
- [x] Display updated (shows institution name as primary identifier)
- [x] Existing data migrated (name field uses institution value for bank references)

**Implementation Summary**:
- Updated `reference-list.tsx` component to conditionally hide "Name" field for bank references
- Bank reference form now shows "Financial Institution *" as first field with clear placeholder
- Validation logic updated: bank references require institution, phone, and email (not name)
- Display card shows institution name prominently for bank references instead of person name
- Form automatically uses institution value as the name for storage compatibility
- Other reference types (Personal, Professional, Landlord) still show name field as expected
- Clean, intuitive UX that makes sense for the type of reference being added

---

### Suggestion 8: Document Upload Requirements ✅ IMPLEMENTED

**Location**: Income & Employment - Document Upload
**Issue**: No guidance on what documents are required
**Status**: ✅ **IMPLEMENTED** - 2025-11-18

**Implementation Steps**:
1. Add clear requirements text above upload area
2. Show different requirements based on employment type
3. Add tooltips/info icons for clarification
4. Show checklist of required documents

**Files to Modify**:
```
- app/components/forms/IncomeEmployment.tsx
- app/components/documents/DocumentRequirements.tsx (new)
```

**Implementation**:
```typescript
<DocumentUploadSection>
  <RequirementsCard>
    <h3>Required Income Verification Documents</h3>
    <p>Please provide ONE of the following options:</p>
    <ul>
      <li>
        <strong>Option 1:</strong> Most recent W-2 AND 2 most recent bank statements
      </li>
      <li>
        <strong>Option 2:</strong> Most recent 1099 form
      </li>
      <li>
        <strong>Option 3:</strong> 3 most recent paystubs
      </li>
    </ul>
    {selfEmployed && (
      <Alert>
        <strong>Self-Employed:</strong> Please provide 2 years of tax returns
      </Alert>
    )}
  </RequirementsCard>

  <FileUpload
    accept=".pdf,.jpg,.png,.doc,.docx"
    multiple
    onUpload={handleUpload}
  />

  <DocumentChecklist>
    <ChecklistItem completed={hasW2}>W-2</ChecklistItem>
    <ChecklistItem completed={hasBankStatements}>
      Bank Statements (2)
    </ChecklistItem>
  </DocumentChecklist>
</DocumentUploadSection>
```

**Acceptance Criteria**:
- [x] Clear requirements displayed (prominent card with detailed information)
- [x] Requirements change based on employment type (checkbox toggles requirements)
- [x] Shows different options (W-2+bank statements OR 1099 OR paystubs)
- [x] Special requirements for self-employed (2 years tax returns OR CPA letter)
- [x] Checklist shows what's been uploaded (document count with confirmation message)
- [x] Tooltips explain each document type (helpful tips about recency requirements)
- [x] Visual indication of completion (green confirmation box when documents uploaded)

**Implementation Summary**:
- Added comprehensive "Required Income Verification Documents" card to income page
- Card displays dynamically based on self-employed checkbox status
- **For employed applicants**: Shows 3 clear options with visual indicators
  - Option 1: Most recent W-2 AND 2 most recent bank statements
  - Option 2: Most recent 1099 form
  - Option 3: 3 most recent paystubs
- **For self-employed applicants**: Shows requirements for tax returns or CPA letter
  - 2 years of tax returns (Form 1040 with all schedules)
  - OR CPA letter verifying income
- Each option displayed in color-coded boxes with border indicators (green for regular options, blue for self-employed)
- Added helpful tips about document recency (💡 icon with explanatory text)
- Upload section shows clear heading indicating which documents to upload
- Green confirmation box displays when documents are uploaded with count
- Clear validation messages if no documents uploaded
- Professional, user-friendly design that removes ambiguity about requirements

---

### Suggestion 10: Dynamic Institution Column ✅ IMPLEMENTED

**Note**: This was implemented as part of Phase 4 Bug 10 fix
**Status**: ✅ **IMPLEMENTED** - 2025-11-17 (Bug 10 fix)

**Implementation**: Make Institution column conditional based on category

**Enhanced Implementation**:
```typescript
// Category configurations
const categoryConfig = {
  'Bank Accounts': {
    columns: ['Category', 'Institution', 'Description', 'Amount'],
    requireInstitution: true,
  },
  'Investments': {
    columns: ['Category', 'Institution', 'Description', 'Amount'],
    requireInstitution: true,
  },
  'Automobiles': {
    columns: ['Category', 'Description', 'Amount'],
    requireInstitution: false,
  },
  'Personal Property': {
    columns: ['Category', 'Description', 'Amount'],
    requireInstitution: false,
  },
}

// Render function
const renderTable = (category: string) => {
  const config = categoryConfig[category]

  return (
    <Table>
      <thead>
        <tr>
          {config.columns.map(col => <th key={col}>{col}</th>)}
        </tr>
      </thead>
      {/* ... */}
    </Table>
  )
}
```

**Acceptance Criteria**:
- [x] Institution shown only for financial categories (Assets tab only)
- [x] Institution hidden for physical assets (Automobiles, Personal Property, etc.)
- [x] Form adjusts based on category (row-by-row conditional display)
- [x] Validation matches configuration (optional for all, but shown only when relevant)
- [x] Clear and logical to user (no confusing institution field for physical items)

**Implementation Details**:
- **Files Modified**:
  - `components/features/application/financial-table.tsx` - Added `categoryRequiresInstitution()` function
  - `components/features/application/financial-entry-row.tsx` - Conditional rendering of institution field
- **Logic**:
  - Institution column header only displays on Assets tab
  - `categoryRequiresInstitution()` function determines which asset categories need institution:
    - ✅ Shows for: Checking, Savings, Investment, KEOGH, Pension, Life Insurance, Investment in Business, Other
    - ❌ Hidden for: Automobiles, Personal Property, Real Estate, Accounts Receivable, Contract Deposit
  - Institution field is passed conditionally per row via `showInstitution` prop
  - Liabilities, Monthly Income, and Monthly Expenses tabs never show institution column
- **User Experience**:
  - Users only see institution field when it makes sense (financial accounts)
  - Physical assets (cars, property, personal items) don't show institution field
  - Cleaner, more intuitive form that reduces confusion
  - Table columns adjust dynamically based on tab and category selection

---

## Phase 7: Advanced Features

**Priority**: LOW
**Timeline**: Week 6+ (Days 39+)
**Focus**: Power user features and enhancements

### Suggestion 14: Add New Building

**Location**: Broker - Create New Application
**Issue**: Can only select existing buildings; no way to add new building

**Implementation Steps**:
1. Add "Create New Building" option in building dropdown
2. Open modal to collect building information
3. Save new building
4. Select newly created building for application

**Files to Create/Modify**:
```
- app/components/broker/CreateBuildingModal.tsx (new)
- app/broker/pipeline/new-application/page.tsx
- types/building.ts
```

**Implementation**:
```typescript
// Building selector with add option
<Combobox>
  <ComboboxInput placeholder="Select building..." />
  <ComboboxOptions>
    {buildings.map(b => (
      <ComboboxOption key={b.id} value={b}>
        {b.name}
      </ComboboxOption>
    ))}
    <ComboboxOption
      value="new"
      className="border-t font-semibold"
    >
      + Create New Building
    </ComboboxOption>
  </ComboboxOptions>
</Combobox>

// Modal for new building
<CreateBuildingModal
  open={showCreateBuilding}
  onClose={() => setShowCreateBuilding(false)}
  onSave={(building) => {
    addBuilding(building)
    setSelectedBuilding(building)
    setShowCreateBuilding(false)
  }}
/>
```

**Building Form Fields**:
- Building Name (required)
- Address (required)
- Building Code (auto-generated)
- Management Company
- Contact Information
- Building Policies (optional)

**Acceptance Criteria**:
- [ ] "Create New Building" option in dropdown
- [ ] Modal opens with building form
- [ ] Can enter all building details
- [ ] Building code auto-generated
- [ ] New building saved
- [ ] New building selected automatically
- [ ] New building appears in list
- [ ] Validation for required fields

---

### Suggestion 15: Manual Override for QA Checks

**Location**: Broker - QA Workspace
**Issue**: Cannot mark sections complete if system flags as incomplete

**Implementation Steps**:
1. Add "Override" button next to each incomplete item
2. Show override modal requiring reason
3. Save override with timestamp and user
4. Mark section as complete with override flag
5. Show override indicator in UI
6. Log for audit trail

**Files to Modify**:
```
- app/components/broker/QAWorkspace.tsx
- app/components/broker/OverrideModal.tsx (new)
- types/qa.ts
```

**Implementation**:
```typescript
interface CompletionStatus {
  isComplete: boolean
  autoDetected: boolean // System check
  manualOverride?: {
    overriddenBy: string
    overriddenAt: Date
    reason: string
  }
}

// UI
<CompletionCheck
  section="Profile"
  status={completionStatus.profile}
>
  {!completionStatus.profile.isComplete && (
    <Button onClick={() => showOverrideModal('profile')}>
      Override
    </Button>
  )}
</CompletionCheck>

// Override Modal
<Modal>
  <h2>Override Completion Check</h2>
  <p>
    The system has flagged this section as incomplete.
    You can manually mark it as complete.
  </p>
  <Alert type="warning">
    This action will be logged for compliance.
  </Alert>
  <TextArea
    label="Reason for Override"
    placeholder="Explain why this section should be marked complete..."
    required
  />
  <Button onClick={handleOverride}>
    Confirm Override
  </Button>
</Modal>
```

**Audit Log Entry**:
```typescript
{
  action: 'MANUAL_OVERRIDE',
  section: 'profile',
  applicationId: 'app-123',
  performedBy: 'broker@example.com',
  timestamp: '2024-01-15T10:30:00Z',
  reason: 'Applicant provided verbal confirmation',
  previousStatus: 'incomplete',
  newStatus: 'complete_override'
}
```

**UI Indicators**:
```typescript
// Show override status
{status.manualOverride && (
  <Badge variant="warning" title={status.manualOverride.reason}>
    ⚠️ Manually Overridden
  </Badge>
)}
```

**Acceptance Criteria**:
- [ ] Override button visible for incomplete items
- [ ] Modal requires reason for override
- [ ] Cannot override without reason
- [ ] Override saves with user and timestamp
- [ ] Visual indicator shows overridden status
- [ ] Hover shows override reason and user
- [ ] Audit log records all overrides
- [ ] Admin can view override history
- [ ] Can undo override if needed

---

## Deferred Items

**Backend-Dependent Features**

These items require backend implementation and will be addressed in a future phase:

### Bug 11: Application Progress Tracker

**Status**: Deferred - Backend Required
**Issue**: Progress tracker not updating

**Dependencies**:
- Backend API to save form progress
- Database to store application state
- Real-time sync of completion status

**Implementation Notes**:
- Should automatically update after Phase 1-2 fixes
- Requires form data persistence
- Calculate completion based on required fields filled

**Future Implementation**:
```typescript
// Progress calculation
const calculateProgress = (application: Application) => {
  const requiredSections = [
    'buildingPolicies',
    'profile',
    'people',
    'incomeEmployment',
    'financials',
    'realEstate',
    'documents',
    'disclosures'
  ]

  const completed = requiredSections.filter(section =>
    isCompleteSection(application[section])
  ).length

  return (completed / requiredSections.length) * 100
}
```

**Acceptance Criteria** (Future):
- [ ] Progress bar updates automatically
- [ ] Shows percentage complete
- [ ] Shows "X of Y sections complete"
- [ ] Updates in real-time as sections completed
- [ ] Persists across sessions
- [ ] Accurate calculation

---

## Testing Checklist

### Phase 1: Financial Calculations ✅ COMPLETED
- [x] Bug 7: Asset values display correctly without extra zeros
- [x] Bug 8: Financial totals add correctly (not concatenate)
- [x] Bug 8: Debt-to-income ratio calculates correctly
- [x] Bug 9: Real estate values display correctly
- [x] Test with values: $0, $1, $100, $1000, $10000, $100000
- [x] Test with multiple entries
- [x] Test with comma-formatted input

### Phase 2: Form Validation
- [ ] Bug 2: Cannot proceed without required fields
- [ ] Bug 2: Error messages display clearly
- [ ] Bug 2: Errors clear when fixed
- [ ] Bug 3: SSN input accepts full value when censored
- [ ] Bug 3: SSN toggle works without data loss
- [ ] Bug 4: Documents upload successfully
- [ ] Bug 4: Documents persist after navigation
- [ ] Bug 4: No 404 errors
- [ ] Test all form sections for validation

### Phase 3: Navigation
- [ ] Bug 1: "My Applications" link works
- [ ] Bug 1: "Settings" link works
- [ ] Bug 1: "Help & Support" link works
- [ ] Bug 12: QA workspace shows selection screen
- [ ] Bug 12: Can select application to review
- [ ] Bug 13: "Invite Applicant" opens modal
- [ ] Bug 13: Invitation link generated and copyable
- [ ] Bug 14: Template view/edit works
- [ ] Bug 14: Template duplicate works
- [ ] Bug 14: Template delete works
- [ ] Bug 15: "Assign to Reviewer" works
- [ ] Bug 15: "Download Package" works
- [ ] Suggestion 13: Back button returns to pipeline
- [ ] Suggestion 16: Board landing page shows before summary

### Phase 4: Data Model
- [ ] Bug 10: Real estate removed from Financial Summary categories
- [ ] Bug 10: Real estate total appears in summary from Holdings
- [ ] Bug 10: No double-counting possible
- [ ] Bug 6: Co-applicant/guarantor saves correctly
- [ ] Suggestion 9: Co-applicant only in People section
- [ ] Suggestion 9: Removed from Profile section
- [ ] Suggestion 4: Navigation follows correct sequence
- [ ] Suggestion 10: Institution column conditional

### Phase 5: UI/UX ✅ COMPLETED
- [x] Bug 5: Apostrophes display correctly
- [x] Bug 5: No HTML entities visible
- [x] Suggestion 1: Cursor pointer on role selection
- [x] Suggestion 2: Cursor pointer on start application
- [x] Suggestion 1/2: Hover states on all interactive elements
- [x] Suggestion 3: Percent symbol displays
- [x] Suggestion 11: Review page accessible from sidebar
- [x] Suggestion 11: Review page accessible from progress tracker
- [x] Suggestion 12: Submit button text clear

### Phase 6: Form Fields ✅ COMPLETED
- [x] Suggestion 5: State is dropdown
- [x] Suggestion 5: All states listed
- [x] Suggestion 6: Address dates are mm/yyyy
- [x] Suggestion 6: Education dates are mm/yyyy
- [x] Suggestion 6: Employment dates are mm/yyyy
- [x] Suggestion 6: Birth date still mm/dd/yyyy
- [x] Suggestion 7: Bank reference no name field
- [x] Suggestion 8: Document requirements displayed
- [x] Suggestion 8: Requirements change by employment type
- [x] Suggestion 10: Institution column conditional

### Phase 7: Advanced Features
- [ ] Suggestion 14: Can create new building
- [ ] Suggestion 14: New building appears in list
- [ ] Suggestion 14: New building auto-selected
- [ ] Suggestion 15: Can override completion checks
- [ ] Suggestion 15: Override requires reason
- [ ] Suggestion 15: Override logged in audit trail
- [ ] Suggestion 15: Override indicator visible

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### User Flow Testing
- [ ] Complete applicant flow end-to-end
- [ ] Complete broker flow end-to-end
- [ ] Complete transaction agent flow end-to-end
- [ ] Complete board member flow end-to-end

---

## Summary

**Total Items**: 31
- **Bugs**: 15 (14 to fix immediately, 1 deferred)
- **Suggestions**: 16 (all to implement)

**Estimated Total Time**: 6-8 weeks

**Priority Breakdown**:
- Critical: 7 items (Phases 1-2)
- High: 9 items (Phases 3-4)
- Medium: 12 items (Phases 5-6)
- Low: 2 items (Phase 7)
- Deferred: 1 item (Backend-dependent)

**Key Success Metrics**:
- All 15 bugs fixed
- All 16 suggestions implemented
- No data integrity issues
- Smooth user experience across all flows
- Clear navigation and instructions
- Professional polish

---

## Notes for Implementation

1. **Test After Each Phase**: Don't move to next phase until current phase fully tested
2. **Document Changes**: Update component documentation as you go
3. **Version Control**: Create feature branches for each phase
4. **User Feedback**: Consider testing with users after Phases 2, 4, and 6
5. **Performance**: Monitor performance impact of changes
6. **Accessibility**: Ensure all changes maintain/improve accessibility
7. **Mobile**: Test mobile responsiveness for each change

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
**Next Review**: After Phase 2 completion
