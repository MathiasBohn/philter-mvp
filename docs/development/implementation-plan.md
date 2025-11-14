# philter MVP - Implementation Plan

## Overview

This implementation plan breaks down the philter MVP UI development into actionable phases. Each phase contains specific tasks with checkboxes to track progress. Focus is on UI components only, with no back-end integration.

**Technology Stack:**
- Next.js 16 (App Router)
- React 19
- shadcn/ui + Radix UI
- Tailwind CSS v4
- TypeScript 5
- Zod (validation)
- PDF.js (document viewing)

---

## Phase 0: Setup & Cleanup (Foundation)

**Goal:** Clean up boilerplate and establish project foundation

### 0.1 Remove Boilerplate Content
- [x] Delete boilerplate content from `app/page.tsx`
- [x] Remove `public/next.svg`
- [x] Remove `public/vercel.svg`
- [x] Clean up boilerplate styles in `app/globals.css` (keep Tailwind imports)
- [x] Update `app/layout.tsx` metadata to reflect philter branding

### 0.2 Install shadcn/ui
- [x] Run `npx shadcn@latest init`
  - Choose New York style
  - Use CSS variables for theming
  - Configure path aliases (@/components, @/lib, etc.)
- [x] Verify `components.json` created with correct configuration
- [x] Install additional dependencies: `npm install class-variance-authority clsx tailwind-merge`
- [x] Install Zod: `npm install zod`
- [x] Verify all dependencies installed successfully

### 0.3 Create Project Folder Structure
- [x] Create `app/(marketing)/` directory (route group for public pages)
- [x] Create `app/(marketing)/page.tsx` (landing page)
- [x] Create `app/(auth)/` directory (route group for auth flows)
- [x] Create `app/(auth)/sign-in/page.tsx`
- [x] Create `app/(dashboard)/` directory (route group for protected routes)
- [x] Create `app/(dashboard)/layout.tsx` (dashboard shell)
- [x] Create `components/ui/` directory (shadcn/ui components)
- [x] Create `components/forms/` directory (custom form components)
- [x] Create `components/layout/` directory (layout components)
- [x] Create `components/features/` directory (feature-specific components)
- [x] Create `components/features/application/` directory
- [x] Create `components/features/broker/` directory
- [x] Create `components/features/admin/` directory
- [x] Create `components/features/board/` directory
- [x] Create `lib/` directory (utilities and helpers)
- [x] Create `lib/mock-data/` directory (fixtures)
- [x] Create `lib/types.ts` file
- [x] Create `lib/utils.ts` file (if not created by shadcn)
- [x] Create `lib/validators.ts` file

### 0.4 Define TypeScript Types
- [x] Create `lib/types.ts` with core entity types:
  - [x] `User` type (id, name, email, role)
  - [x] `Role` enum (APPLICANT, CO_APPLICANT, GUARANTOR, BROKER, ADMIN, BOARD)
  - [x] `TransactionType` enum (COOP_PURCHASE, CONDO_PURCHASE, COOP_SUBLET, CONDO_LEASE)
  - [x] `ApplicationStatus` enum (IN_PROGRESS, SUBMITTED, IN_REVIEW, RFI, APPROVED, CONDITIONAL, DENIED)
  - [x] `Building` type (id, name, code, type, address)
  - [x] `Application` type (id, buildingId, type, status, createdBy, submittedAt)
  - [x] `ApplicationSection` type (key, data, isComplete)
  - [x] `Person` type (id, fullName, email, phone, dob, ssnLast4, addressHistory)
  - [x] `EmploymentRecord` type (id, employer, title, startDate, income)
  - [x] `FinancialEntry` type (id, entryType, category, institution, amount)
  - [x] `Document` type (id, category, filename, size, uploadedAt, status)
  - [x] `RFI` type (id, sectionKey, status, assigneeRole, createdBy, messages)
  - [x] `Decision` type (id, decision, reasonCodes, notes, decidedAt)
  - [x] `Disclosure` type (id, type, acknowledged, documentUploadId)

### 0.5 Create Mock Data Fixtures
- [x] Create `lib/mock-data/users.ts` with sample users (1 applicant, 1 broker, 1 admin, 1 board member)
- [x] Create `lib/mock-data/buildings.ts` with 3 sample buildings (1 rental, 1 co-op, 1 condo)
- [x] Create `lib/mock-data/applications.ts` with 5-10 sample applications in various states
- [x] Create `lib/mock-data/documents.ts` with sample document metadata
- [x] Create `lib/mock-data/rfis.ts` with sample RFI threads
- [x] Create `lib/mock-data/index.ts` to export all fixtures
- [ ] Add sample PDF files to `public/samples/` directory

### 0.6 Create Utility Functions
- [x] Create `lib/utils.ts` with helper functions:
  - [x] `cn()` function for classname merging (if not from shadcn)
  - [x] `formatCurrency()` function
  - [x] `formatDate()` function
  - [x] `formatSSN()` function (full, last4, redacted)
  - [x] `calculateDTI()` function
  - [x] `calculateNetWorth()` function
  - [x] `calculateCompletionPercentage()` function
- [x] Create `lib/validators.ts` with Zod schemas for forms

### 0.7 Verification
- [x] Run `npm run dev` and verify app starts without errors
- [x] Run `npm run build` and verify successful build
- [x] Run `npm run lint` and fix any linting issues
- [x] Verify TypeScript compilation succeeds

---

## Phase 1: Applicant Flow (A0-A7)

**Goal:** Implement complete applicant workflow with all screens

### 1.1 Install Core shadcn/ui Components
- [x] `npx shadcn@latest add button`
- [x] `npx shadcn@latest add input`
- [x] `npx shadcn@latest add label`
- [x] `npx shadcn@latest add card`
- [x] `npx shadcn@latest add form`
- [x] `npx shadcn@latest add select`
- [x] `npx shadcn@latest add textarea`
- [x] `npx shadcn@latest add dropdown-menu`
- [x] `npx shadcn@latest add dialog`
- [x] `npx shadcn@latest add alert`
- [x] `npx shadcn@latest add badge`
- [x] `npx shadcn@latest add progress`
- [x] `npx shadcn@latest add tabs`
- [x] `npx shadcn@latest add breadcrumb`
- [x] `npx shadcn@latest add separator`

### 1.2 Create Core Layout Components
- [x] Create `components/layout/app-shell.tsx` (main application shell)
- [x] Create `components/layout/top-bar.tsx` (header with logo, role pill, user menu)
- [x] Create `components/layout/sidebar.tsx` (contextual navigation)
- [x] Create `components/layout/mobile-nav.tsx` (hamburger menu for mobile)
- [x] Create `components/layout/breadcrumbs.tsx` (breadcrumb navigation)
- [x] Create `components/layout/progress-indicator.tsx` (overall progress bar)
- [x] Update `app/(dashboard)/layout.tsx` to use AppShell

### 1.3 Create Reusable Form Components
- [x] Create `components/forms/field-row.tsx` (label + input + error wrapper)
- [x] Create `components/forms/error-summary.tsx` (page-top error list with anchor links)
- [x] Create `components/forms/form-actions.tsx` (save/cancel button group)
- [x] Create `components/forms/masked-ssn-input.tsx` (SSN input with masking)
- [x] Create `components/forms/date-input.tsx` (date picker)
- [x] Create `components/forms/money-input.tsx` (currency formatted input)
- [x] Create `components/forms/repeatable-group.tsx` (add/remove items)

### 1.4 Application Routes Setup
- [x] Create `app/(dashboard)/applications/[id]/page.tsx` (A1: Overview)
- [x] Create `app/(dashboard)/applications/[id]/profile/page.tsx` (A2)
- [x] Create `app/(dashboard)/applications/[id]/income/page.tsx` (A3)
- [x] Create `app/(dashboard)/applications/[id]/financials/page.tsx` (A4)
- [x] Create `app/(dashboard)/applications/[id]/documents/page.tsx` (A5)
- [x] Create `app/(dashboard)/applications/[id]/disclosures/page.tsx` (A6)
- [x] Create `app/(dashboard)/applications/[id]/review/page.tsx` (A7)
- [x] Create `app/(dashboard)/applications/new/page.tsx` (A0: Building code entry)

### 1.5 Screen: A0 - Welcome & Building Code Entry
- [x] Create `components/features/application/building-code-input.tsx`
- [x] Create `components/features/application/transaction-type-tiles.tsx`
- [x] Implement form validation (non-empty, format check)
- [x] Add error handling UI (inline + page-top summary)
- [x] Add "Don't have a code?" help text
- [x] Add loading state
- [x] Implement mock building code validation (accept any 6-character code)
- [x] On success, navigate to A1 with new application ID
- [x] Make responsive for mobile/tablet/desktop

### 1.6 Screen: A1 - Application Overview Hub
- [x] Create `components/features/application/section-list.tsx`
- [x] Create `components/features/application/section-card.tsx` with status pill
- [x] Create `components/features/application/invite-widget.tsx`
- [x] Create `components/features/application/rfi-banner.tsx`
- [x] Implement progress calculation from mock data
- [x] Add navigation to incomplete sections
- [x] Add "Invite Co-applicant/Guarantor" functionality (adds to mock data)
- [x] Display RFI banner if RFIs present
- [x] Make responsive

### 1.7 Screen: A2 - Profile Section
- [x] Create Zod validation schema for profile in `lib/validators.ts`
- [x] Implement profile form with all fields:
  - [x] Full name (required)
  - [x] Email (required, email format)
  - [x] Phone (required)
  - [x] Date of birth (required, ≥18 years)
  - [x] SSN (masked input, format validation)
  - [x] Address history section
- [x] Create `components/features/application/address-history-list.tsx`
- [x] Add address history entry (address, from date, to date)
- [x] Validate minimum 2 years address history
- [x] Create `components/features/application/add-person-button.tsx`
- [x] Implement "Add Co-applicant/Guarantor" functionality
- [x] Implement inline validation errors
- [x] Implement error summary at page top with anchor links
- [x] Add autosave indicator (simulated)
- [x] Save data to localStorage
- [x] Add "Save & Continue" button to navigate to A3
- [x] Make responsive

### 1.8 Screen: A3 - Employment & Income
- [x] Create Zod validation schema for employment
- [x] Create `components/features/application/employer-entry.tsx`
- [x] Implement repeatable employer group (add/remove)
- [x] Add employer fields:
  - [x] Employer name (required if employed)
  - [x] Title (required if employed)
  - [x] Start date (required if employed)
  - [x] Pay cadence (dropdown: Annual, Monthly, Bi-weekly, Weekly)
  - [x] Annual income (required, numeric, ≥0)
- [x] Create `components/features/application/upload-dropzone.tsx`
- [x] Create `components/features/application/document-card.tsx`
- [x] Implement file upload UI (drag-and-drop + file picker)
- [x] Add upload progress indicator (simulated)
- [x] Implement file validation (type: PDF/JPG/PNG/DOC/DOCX, size ≤25MB)
- [x] Store uploaded files in localStorage (base64 or File API)
- [x] Add preview/delete actions for documents
- [x] Save data to localStorage
- [x] Add "Save & Continue" button
- [x] Make responsive

### 1.9 Screen: A4 - Financial Summary (REBNY-aligned)
- [x] Create Zod validation schema for financial entries
- [x] Create `components/features/application/financial-table.tsx`
- [x] Implement tabs for 4 categories:
  - [x] Assets
  - [x] Liabilities
  - [x] Monthly Income
  - [x] Monthly Expenses
- [x] Create `components/features/application/financial-entry-row.tsx`
- [x] Implement add/edit/delete entry functionality
- [x] Add category dropdowns per entry type:
  - [x] Assets: Checking, Savings, Investment, Real Estate, Other
  - [x] Liabilities: Mortgage, Auto Loan, Credit Card, Student Loan, Other
  - [x] Monthly Income: Employment, Rental, Investment, Other
  - [x] Monthly Expenses: Rent/Mortgage, Utilities, Insurance, Other
- [x] Implement amount validation (required, numeric)
- [x] Create `components/features/application/totals-bar.tsx`
- [x] Calculate and display Net Worth (Assets - Liabilities)
- [x] Calculate and display DTI (Monthly Expenses / Monthly Income)
- [x] Save data to localStorage
- [x] Add "Save & Continue" button
- [x] Make responsive (card view on mobile)

### 1.10 Screen: A5 - Documents Upload & Preview
- [x] Create `components/features/application/document-checklist.tsx`
- [x] Define document categories:
  - [x] Government-issued ID (required)
  - [x] Bank letters/statements
  - [x] Tax returns
  - [x] Reference letters
  - [x] Building-specific forms
- [x] Implement upload dropzone per category
- [x] Create `components/features/application/document-preview.tsx`
- [x] Integrate PDF preview (using basic `<iframe>` or prepare for PDF.js later)
- [x] Add file replace/delete functionality
- [x] Create "I don't have this" option with reason textarea
- [x] Implement validation: At least 1 govt ID required
- [x] Store documents in localStorage
- [x] Save metadata to mock data
- [x] Add "Save & Continue" button
- [x] Make responsive

### 1.11 Screen: A6 - Disclosures (Lease/Sublet Only)
- [x] Create `components/features/application/disclosure-card.tsx`
- [x] Implement conditional rendering (only for CONDO_LEASE and COOP_SUBLET)
- [x] Add Local Law 55 Indoor Allergen disclosure:
  - [x] Display title and description
  - [x] Add download link for disclosure PDF (mock)
  - [x] Add acknowledgment checkbox
- [x] Add Window Guard lease notice disclosure:
  - [x] Display title and description
  - [x] Add download link for disclosure PDF (mock)
  - [x] Add acknowledgment checkbox
  - [x] Add upload field for signed form (optional)
- [x] Implement validation: All enabled disclosures must be acknowledged
- [x] Save acknowledgments to localStorage
- [x] Add "Save & Continue" button
- [x] Make responsive

### 1.12 Screen: A7 - Review & Submit
- [x] Create `components/features/application/validation-summary.tsx`
- [x] Implement comprehensive validation check across all sections
- [x] Display checklist of requirements with status:
  - [x] Profile complete
  - [x] At least 1 employer or income source
  - [x] Financial summary complete
  - [x] At least 1 govt ID uploaded
  - [x] All disclosures acknowledged (if applicable)
- [x] Add anchor links to incomplete sections (using hash navigation)
- [x] Create mock compiled PDF preview
- [x] Display PDF preview using `<iframe>` or PDF viewer component
- [x] Disable submit button until all requirements met
- [x] Implement submit action:
  - [x] Show loading state
  - [x] Update application status to SUBMITTED in localStorage
  - [x] Lock editing (set readonly flag)
  - [x] Display timestamp
- [x] Create post-submit success state:
  - [x] Show confirmation message
  - [x] Display "What's next" information
  - [x] Prevent further editing
- [x] Make responsive

### 1.13 Phase 1 Verification
- [x] Navigate through complete A0-A7 flow
- [x] Verify all form validations work
- [x] Test responsive layouts on mobile, tablet, desktop
- [x] Check localStorage persistence
- [x] Verify error summaries with anchor links
- [x] Test keyboard navigation
- [x] Verify all "Save & Continue" buttons work
- [x] Test submit flow from start to finish

---

## Phase 2: Broker Flow (BK1-BK3)

**Goal:** Implement broker pipeline and QA workspace

### 2.1 Install Additional shadcn/ui Components
- [x] `npx shadcn@latest add table`
- [x] `npx shadcn@latest add checkbox`
- [x] `npx shadcn@latest add sheet`
- [x] `npx shadcn@latest add tooltip`
- [x] `npx shadcn@latest add command`
- [x] `npx shadcn@latest add popover`
- [x] `npx shadcn@latest add calendar`

### 2.2 Broker Routes Setup
- [x] Create `app/(dashboard)/broker/page.tsx` (BK1: Pipeline)
- [x] Create `app/(dashboard)/broker/[id]/qa/page.tsx` (BK2: QA workspace)
- [x] Create `app/(dashboard)/broker/[id]/submit/page.tsx` (BK3: Submission confirm)

### 2.3 Create Broker-Specific Components
- [x] Create `components/features/broker/application-table.tsx`
- [x] Create `components/features/broker/filter-bar.tsx`
- [x] Create `components/features/broker/status-tag.tsx`
- [x] Create `components/features/broker/qa-panel.tsx`
- [x] Create `components/features/broker/completeness-checklist.tsx`
- [x] Create `components/features/broker/request-info-dialog.tsx`

### 2.4 Screen: BK1 - Broker Pipeline
- [x] Implement data table with columns:
  - [x] Applicant name(s)
  - [x] Building
  - [x] Transaction type
  - [x] Completion % (with progress bar)
  - [x] Last activity (relative time)
  - [x] Status (with colored badge)
- [x] Add column sorting functionality
- [x] Implement filter bar:
  - [x] Status filter (dropdown)
  - [x] Date range filter (calendar)
  - [x] Building filter (dropdown)
- [x] Add row actions dropdown:
  - [x] Open QA workspace
  - [x] Invite applicant
  - [x] View details
- [x] Create empty state with "Start New Application" CTA
- [x] Add "Start New Application" button in header
- [x] Link to A0 for new application
- [x] Make table responsive (card view on mobile)

### 2.5 Screen: BK2 - Pre-fill & QA Workspace
- [x] Implement 3-column layout:
  - [x] Left: Section navigator (30% width)
  - [x] Center: Form/document view (45% width)
  - [x] Right: QA panel (25% width)
- [x] Create section navigator showing all application sections
- [x] Implement center panel to display:
  - [x] Form data from selected section (read-only with masked PII)
  - [x] Document previews
- [x] Implement SSN masking (show last-4 only) in center panel
- [x] Create QA panel with:
  - [x] Completeness checklist
  - [x] Blocker alerts (missing required items)
  - [x] "Request Info" button
- [x] Implement "Request Info" functionality:
  - [x] Open dialog
  - [x] Select section
  - [x] Add message
  - [x] Create RFI in mock data
- [x] Add "Upload on behalf" functionality (same as applicant upload)
- [x] Add "Mark Ready for Submit" button (enables when all complete)
- [x] Make responsive (stack columns on mobile)

### 2.6 Screen: BK3 - Submission Confirm
- [x] Create deliverables checklist:
  - [x] Profile complete
  - [x] Employment/income documented
  - [x] Financials complete
  - [x] All required documents uploaded
  - [x] Disclosures acknowledged (if applicable)
- [x] Display compiled board package preview (mock PDF)
- [x] Create audit trail component:
  - [x] List of key actions with timestamps
  - [x] User who performed action
  - [x] Action type (e.g., "Profile updated", "Document uploaded")
- [x] Add "Submit to Building" button
- [x] Implement submit action:
  - [x] Update status to SUBMITTED
  - [x] Add submitted timestamp
  - [x] Show confirmation message
- [x] Make responsive

### 2.7 Phase 2 Verification
- [x] Navigate BK1 pipeline view
- [x] Test table sorting and filtering
- [x] Open QA workspace from pipeline
- [x] Navigate between sections in QA workspace
- [x] Verify SSN masking (last-4 only)
- [x] Create test RFI using "Request Info"
- [x] Upload document on behalf
- [x] Mark application ready and submit
- [x] Verify responsive layouts

---

## Phase 3: Admin Flow (AD1-AD5)

**Goal:** Implement admin template wizard, inbox, review workspace, RFI management, and decision panel

### 3.1 Install Additional shadcn/ui Components
- [x] `npx shadcn@latest add stepper` (if available, or create custom)
- [x] `npx shadcn@latest add toggle`
- [x] `npx shadcn@latest add switch`
- [x] `npx shadcn@latest add radio-group`
- [x] `npx shadcn@latest add avatar`
- [x] `npx shadcn@latest add scroll-area`

### 3.2 Admin Routes Setup
- [x] Create `app/(dashboard)/admin/templates/page.tsx` (AD1: Template wizard)
- [x] Create `app/(dashboard)/admin/templates/new/page.tsx` (AD1: New template wizard)
- [x] Create `app/(dashboard)/admin/inbox/page.tsx` (AD2: Intake inbox)
- [x] Create `app/(dashboard)/admin/review/[id]/page.tsx` (AD3: Review workspace)

### 3.3 Create Admin-Specific Components
- [x] Create `components/features/admin/template-wizard.tsx`
- [x] Create `components/features/admin/stepper.tsx` (if not from shadcn)
- [x] Create `components/features/admin/section-toggle-list.tsx`
- [x] Create `components/features/admin/document-toggle-list.tsx`
- [x] Create `components/features/admin/compliance-toggles.tsx`
- [x] Create `components/features/admin/template-preview.tsx`
- [x] Create `components/features/admin/review-navigator.tsx`
- [x] Create `components/features/admin/data-panel.tsx`
- [x] Create `components/features/admin/rfi-thread.tsx`
- [x] Create `components/features/admin/rfi-composer.tsx`
- [x] Create `components/features/admin/activity-log.tsx`
- [x] Create `components/features/admin/decision-panel.tsx`
- [x] Create `components/features/admin/reason-tags.tsx`
- [x] Create `components/features/admin/inbox-table.tsx`
- [x] Create `components/features/admin/inbox-filter-bar.tsx`

### 3.4 Screen: AD1 - Template Wizard
- [x] Create stepper component showing 6 steps:
  1. [x] Basics
  2. [x] Sections
  3. [x] Documents
  4. [x] Compliance
  5. [x] Review
  6. [x] Publish
- [x] Implement Step 1 - Basics:
  - [x] Building selection (dropdown)
  - [x] Template name input
  - [x] Description textarea
- [x] Implement Step 2 - Sections:
  - [x] Toggle switches for each section (Profile, Income, Financials, Documents, Disclosures)
  - [x] Mark sections as required or optional
- [x] Implement Step 3 - Documents:
  - [x] Checklist of document categories
  - [x] Toggle required/optional per category
  - [x] Add custom categories option
- [x] Implement Step 4 - Compliance:
  - [x] Toggle Local Law 55 disclosure (lease/sublet only)
  - [x] Toggle Window Guard disclosure (lease/sublet only)
- [x] Implement Step 5 - Review:
  - [x] Display summary of all selections
  - [x] Show which sections are required
  - [x] Show which documents are required
  - [x] Show compliance settings
- [x] Implement Step 6 - Publish:
  - [x] Version number display
  - [x] Publish button
  - [x] Save template to mock data
  - [x] Show success confirmation
- [x] Add navigation between steps (Next/Previous buttons)
- [x] Add "Save Draft" functionality
- [x] Make responsive

### 3.5 Screen: AD2 - Intake Inbox
- [x] Implement data table with columns:
  - [x] Applicant(s) name
  - [x] Unit (if available)
  - [x] Transaction type
  - [x] Stage/Status
  - [x] Age (days since submission)
  - [x] Last activity (relative time)
- [x] Add filter bar:
  - [x] Status filter
  - [x] Date submitted filter
  - [x] Building filter
- [x] Add row actions:
  - [x] Open review workspace
  - [x] Assign to reviewer
  - [x] Set status
- [x] Add quick status update dropdown
- [x] Load applications from mock data (filter by status: SUBMITTED, IN_REVIEW, RFI)
- [x] Make table responsive

### 3.6 Screen: AD3 - Review Workspace
- [x] Implement 3-column layout:
  - [x] Left: Section navigator with flags (25% width)
  - [x] Center: PDF viewer + data panel toggle (50% width)
  - [x] Right: RFI thread + activity log (25% width)
- [x] Create section navigator:
  - [x] List all sections
  - [x] Show completion status per section
  - [x] Show flags (e.g., needs attention)
  - [x] Click to navigate to section
- [x] Implement center panel with toggle:
  - [x] PDF viewer mode: Display document previews (placeholder)
  - [x] Data panel mode: Display form data in read-only view
  - [x] Toggle button to switch between modes
- [x] Display full PII (no masking) for admin role
- [x] Create RFI thread in right panel:
  - [x] Display existing RFI messages
  - [x] Author avatar and name
  - [x] Role chip (e.g., "Admin", "Applicant")
  - [x] Timestamp
  - [x] Message content
- [x] Create activity log:
  - [x] Timeline of all actions
  - [x] Action type and description
  - [x] User who performed action
  - [x] Timestamp
- [x] Add "Mark Complete" / "Needs Info" buttons per section
- [x] Add "Create RFI" button that opens composer
- [x] Make responsive (stack columns on mobile)

### 3.7 Screen: AD4 - RFI Management (within AD3)
- [x] Create RFI composer dialog:
  - [x] Section selection dropdown
  - [x] Assign to (Applicant or Broker) radio buttons
  - [x] Message textarea
  - [x] Attach document reference (optional - not implemented)
  - [x] Send button
- [x] Implement RFI creation:
  - [x] Add RFI to mock data
  - [x] Update application status to RFI if needed
  - [x] Add first message to thread
- [x] Create RFI thread display:
  - [x] Message bubbles (different alignment for admin vs applicant/broker)
  - [x] Author information
  - [x] Timestamp
  - [x] Attached document references (display capability)
- [x] Add reply functionality:
  - [x] Reply textarea
  - [x] Send reply button
  - [x] Add message to thread in mock data
- [x] Add "Resolve" button:
  - [x] Mark RFI as resolved
  - [x] Update status in mock data
  - [x] Visual indication (grayed out or moved to resolved section)
- [x] Make responsive

### 3.8 Screen: AD5 - Decision Panel (within AD3 or separate)
- [x] Create decision panel with radio group:
  - [x] Approve
  - [x] Approve with Conditions
  - [x] Deny
- [x] Create reason tags component:
  - [x] Multi-select checkboxes for common reasons:
    - [x] Income insufficient
    - [x] DTI too high
    - [x] Incomplete documentation
    - [x] Unsatisfactory references
    - [x] Board policy criteria not met
    - [x] Other
  - [x] Free-text notes textarea
- [x] Add "Uses consumer report" checkbox
- [x] Implement conditional logic:
  - [x] If "Uses consumer report" checked AND (Deny or Conditional selected)
  - [x] Show required field: "Adverse action notice required"
  - [x] Require adverse action payload before enabling submit
- [x] Create decision email preview:
  - [x] Show to: applicant email
  - [x] Show subject based on decision
  - [x] Show email body with decision details
  - [x] Include reason codes if applicable
  - [x] Include adverse action notice if applicable
- [x] Add confirmation modal before submitting decision
- [x] Implement submit decision:
  - [x] Save decision to mock data
  - [x] Update application status (APPROVED, CONDITIONAL, or DENIED)
  - [x] Add decided timestamp
  - [x] Show success confirmation
- [x] Make responsive

### 3.9 Phase 3 Verification
- [x] Complete template wizard flow
- [x] Navigate intake inbox
- [x] Open review workspace
- [x] Navigate between sections
- [x] Verify full SSN visibility (no masking)
- [x] Create test RFI
- [x] Reply to RFI
- [x] Resolve RFI
- [x] Mark sections as complete/needs info
- [x] Record decision (all 3 types)
- [x] Test conditional logic (consumer report + deny/conditional)
- [x] Verify responsive layouts

---

## Phase 4: Board Reviewer Flow (BR1)

**Goal:** Implement read-only review workspace for board members

### 4.1 Board Routes Setup
- [x] Create `app/(dashboard)/board/review/[id]/page.tsx` (BR1: Read-only review)

### 4.2 Create Board-Specific Components
- [x] Create `components/features/board/read-only-viewer.tsx`
- [x] Create `components/features/board/private-notes.tsx`
- [x] Create `components/features/board/download-notice.tsx`

### 4.3 Screen: BR1 - Read-only Review
- [x] Implement read-only layout:
  - [x] PDF viewer (main area)
  - [x] Private notes panel (sidebar or below)
- [x] Display compiled package PDF preview
- [x] Add watermark to PDF viewer (optional, "Board Review Copy")
- [x] Create private notes component:
  - [x] Textarea for notes
  - [x] Save to localStorage (keyed by board member user ID)
  - [x] Explicitly label as "Private - Not shared with applicant or admin"
  - [x] Load notes on page load
- [x] Implement SSN redaction:
  - [x] Replace SSN fields with "••••" or "—"
  - [x] Verify no full SSN visible anywhere
- [x] Add "Mark as Reviewed" button:
  - [x] Save reviewed status to localStorage
  - [x] Show timestamp of review
  - [x] Disable button after marked
- [x] Create download button:
  - [x] Add "Download Compiled Package" button
  - [x] Show expiry notice: "Link expires soon to protect your privacy"
  - [x] Trigger download of mock PDF
- [x] Disable all edit capabilities:
  - [x] No form fields editable
  - [x] No comment/RFI creation
  - [x] No status changes
  - [x] Read-only indicators throughout
- [x] Make responsive

### 4.4 Phase 4 Verification
- [x] Navigate to board review page
- [x] Verify PDF displays correctly
- [x] Verify SSN redacted (shows ••••)
- [x] Add private notes and verify saved
- [x] Reload page and verify notes persist
- [x] Mark as reviewed
- [x] Download compiled package
- [x] Verify no edit capabilities available
- [x] Test responsive layout

---

## Phase 5: Shared Components & Polish

**Goal:** Integrate PDF.js, enhance file uploads, finalize form validation, responsive design, accessibility, and design system

### 5.1 PDF.js Integration
- [x] Install PDF.js: `npm install pdfjs-dist`
- [x] Create `components/shared/pdf-viewer.tsx` component
- [x] Implement PDF rendering using PDF.js
- [x] Add thumbnail navigation sidebar:
  - [x] Display page thumbnails
  - [x] Click thumbnail to jump to page
  - [x] Highlight current page
- [x] Add zoom controls:
  - [x] Zoom in button (+)
  - [x] Zoom out button (-)
  - [x] Fit to width button
  - [x] Fit to page button
  - [x] Zoom percentage display
- [x] Add page navigation:
  - [x] Previous page button
  - [x] Next page button
  - [x] Page number input (go to page)
  - [x] Total pages display (e.g., "Page 1 of 10")
- [x] Add rotate button (90° clockwise)
- [x] Add "Open in new tab" button
- [x] Implement full-height responsive layout
- [x] Add loading state while PDF loads
- [x] Add error state for failed PDF loads
- [x] Test with sample PDFs in `public/samples/`

### 5.2 Enhanced File Upload Component
- [ ] Refactor `upload-dropzone.tsx` with advanced features
- [ ] Implement drag-and-drop:
  - [ ] Drop zone with border and highlight on drag-over
  - [ ] Visual feedback on drop
  - [ ] Support multiple files
- [ ] Add file selection fallback:
  - [ ] "Choose files" button
  - [ ] Keyboard accessible
  - [ ] Works without drag-and-drop
- [ ] Implement upload progress:
  - [ ] Per-file progress bar
  - [ ] Percentage display
  - [ ] Simulate chunked upload with delays
- [ ] Add pause/resume simulation:
  - [ ] Pause button during upload
  - [ ] Resume button when paused
  - [ ] Track pause/resume state
- [ ] Implement file validation:
  - [ ] Check file type against allowed types
  - [ ] Check file size against 25MB limit
  - [ ] Display validation errors
  - [ ] Prevent upload of invalid files
- [ ] Add preview thumbnails:
  - [ ] Show image thumbnails for JPG/PNG
  - [ ] Show PDF icon for PDFs
  - [ ] Show document icon for DOC/DOCX
- [ ] Add file actions:
  - [ ] Preview button (open in modal or new tab)
  - [ ] Delete button (remove from list)
  - [ ] Replace button (upload new version)
- [ ] Store files in localStorage or IndexedDB
- [ ] Handle errors gracefully (show error state, allow retry)

### 5.3 Form Validation System Enhancement
- [ ] Create comprehensive Zod schemas in `lib/validators.ts`:
  - [ ] Profile schema (name, email, phone, DOB, SSN, address history)
  - [ ] Employment schema (employer, title, dates, income)
  - [ ] Financial entry schema (type, category, amount)
  - [ ] Document upload schema (type, size)
  - [ ] Disclosure schema (acknowledged)
  - [ ] Building code schema
- [ ] Implement client-side validation hooks:
  - [ ] `useFormValidation()` hook
  - [ ] Validate on blur
  - [ ] Validate on submit
  - [ ] Return errors keyed by field name
- [ ] Enhance error summary component:
  - [ ] Display at top of page after validation fails
  - [ ] Use `role="alert"` for screen reader announcement
  - [ ] List all errors with anchor links to fields
  - [ ] Style with error colors and icon
- [ ] Implement focus management:
  - [ ] On submit, if errors exist, focus error summary
  - [ ] When clicking error summary link, focus corresponding field
  - [ ] Ensure focused field not obscured by sticky headers
- [ ] Create consistent error message patterns:
  - [ ] Required: "Please enter {field}."
  - [ ] Format: "{field} looks incorrect. Check the format."
  - [ ] Upload: "This file type isn't allowed. Use PDF/JPG/PNG/DOCX."
  - [ ] Disclosure: "You must acknowledge this notice before submitting."
- [ ] Add validation to all forms across A0-A7, BK1-BK3, AD1-AD5, BR1

### 5.4 Responsive Design Implementation
- [ ] Define breakpoint constants:
  - [ ] `sm`: 640px
  - [ ] `md`: 768px
  - [ ] `lg`: 1024px
  - [ ] `xl`: 1280px
  - [ ] `2xl`: 1536px
- [ ] Implement mobile navigation:
  - [ ] Create hamburger menu button
  - [ ] Slide-out sidebar on mobile
  - [ ] Close menu on route change
  - [ ] Touch-friendly menu items
- [ ] Make tables responsive:
  - [ ] Use horizontal scroll on small screens
  - [ ] Or transform to card view on mobile
  - [ ] Ensure all data visible
- [ ] Optimize forms for mobile:
  - [ ] Stack form fields vertically
  - [ ] Increase touch target size (≥24px)
  - [ ] Use appropriate input types (email, tel, number, date)
  - [ ] Ensure labels don't overlap inputs
- [ ] Test layouts on all breakpoints:
  - [ ] Mobile (320px - 639px)
  - [ ] Tablet (640px - 1023px)
  - [ ] Desktop (1024px+)
- [ ] Ensure images scale appropriately
- [ ] Test PDF viewer on mobile (consider simplified view)
- [ ] Verify no horizontal scroll on mobile

### 5.5 Accessibility Audit & Fixes
- [ ] Keyboard navigation audit:
  - [ ] Tab through all interactive elements
  - [ ] Ensure logical tab order
  - [ ] Verify Enter/Space activates buttons
  - [ ] Test modal dialogs (trap focus, Escape to close)
  - [ ] Ensure dropdowns keyboard navigable
- [ ] Add visible focus indicators:
  - [ ] Use Tailwind's `focus-visible:` classes
  - [ ] Ensure contrast ratio ≥3:1 for focus indicators
  - [ ] Test focus styles on all interactive elements
- [ ] ARIA labels and roles:
  - [ ] Add `aria-label` to icon-only buttons
  - [ ] Add `aria-describedby` to form fields with help text
  - [ ] Use `role="alert"` for error summaries
  - [ ] Use `aria-live="polite"` for upload progress
  - [ ] Add `aria-expanded` to collapsible sections
- [ ] Form accessibility:
  - [ ] Associate all labels with inputs (using `htmlFor`)
  - [ ] Add required field indicators (visual + `aria-required`)
  - [ ] Ensure error messages associated with fields (`aria-describedby`)
- [ ] Color contrast audit:
  - [ ] Check all text against backgrounds (≥4.5:1 for normal, ≥3:1 for large)
  - [ ] Verify button text contrast
  - [ ] Check placeholder text contrast
  - [ ] Use contrast checker tool (e.g., WebAIM)
- [ ] Focus not obscured:
  - [ ] Ensure sticky headers don't cover focused elements
  - [ ] Scroll to focused element if needed
  - [ ] Test with WCAG 2.2 Focus Not Obscured criteria
- [ ] Skip links:
  - [ ] Add "Skip to main content" link at top
  - [ ] Make visible on focus
  - [ ] Jump to main content area
- [ ] Heading structure:
  - [ ] Ensure logical heading hierarchy (h1 → h2 → h3)
  - [ ] One h1 per page
  - [ ] No skipped heading levels
- [ ] Alternative text:
  - [ ] Add alt text to all images
  - [ ] Use empty alt for decorative images
  - [ ] Ensure informative alt text for meaningful images
- [ ] Test with screen reader:
  - [ ] Basic navigation test (Chrome + ChromeVox or Safari + VoiceOver)
  - [ ] Verify forms are navigable
  - [ ] Verify error announcements
  - [ ] Verify dynamic content updates announced

### 5.6 Design System Finalization
- [ ] Define design tokens in Tailwind config or CSS variables:
  - [ ] Border radius: `rounded-2xl` (16px cards), `rounded-xl` (12px buttons), `rounded-lg` (8px inputs)
  - [ ] Spacing scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px)
  - [ ] Typography: Use Geist Sans for body, Geist Mono for code
  - [ ] Font sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px)
- [ ] Define button variants:
  - [ ] Primary: Filled with primary color (e.g., blue)
  - [ ] Secondary: Outline or ghost style
  - [ ] Destructive: Red for delete/deny actions
  - [ ] Ghost: Text-only for tertiary actions
- [ ] Create color palette:
  - [ ] Primary: Blue shades (500 main, 600 hover, 700 active)
  - [ ] Success: Green shades (for approvals, success messages)
  - [ ] Warning: Yellow/orange shades (for RFIs, blockers)
  - [ ] Error: Red shades (for validation errors, denials)
  - [ ] Neutral: Gray scale (50-950 for backgrounds, borders, text)
- [ ] Document design tokens:
  - [ ] Create `docs/development/design-system.md`
  - [ ] Document spacing scale
  - [ ] Document color palette with hex codes
  - [ ] Document typography scale
  - [ ] Include examples of button variants
- [ ] Apply design system consistently:
  - [ ] Audit all components for consistency
  - [ ] Replace hard-coded values with tokens
  - [ ] Ensure consistent spacing throughout
  - [ ] Verify consistent border radius
- [ ] Create component showcase (optional):
  - [ ] Create `app/(dashboard)/design-system/page.tsx`
  - [ ] Display all button variants
  - [ ] Display color palette
  - [ ] Display typography scale
  - [ ] Display form components
  - [ ] Useful for developer reference

### 5.7 Final Polish & Bug Fixes
- [ ] Cross-browser testing:
  - [ ] Test in Chrome (latest)
  - [ ] Test in Firefox (latest)
  - [ ] Test in Safari (latest)
  - [ ] Test in Edge (latest)
- [ ] Performance optimization:
  - [ ] Optimize images (use Next.js Image component)
  - [ ] Lazy load PDF.js and heavy components
  - [ ] Check bundle size (npm run build)
  - [ ] Verify no console errors or warnings
- [ ] Fix any layout issues:
  - [ ] Check alignment inconsistencies
  - [ ] Verify spacing is consistent
  - [ ] Fix any overflow issues
- [ ] Verify data flow:
  - [ ] Test all localStorage read/write operations
  - [ ] Verify mock data updates correctly
  - [ ] Test navigation preserves state
- [ ] Error handling:
  - [ ] Add try/catch blocks for localStorage operations
  - [ ] Gracefully handle missing data
  - [ ] Show user-friendly error messages
- [ ] Loading states:
  - [ ] Add loading spinners for async operations
  - [ ] Add skeleton screens for data loading
  - [ ] Ensure no flash of unstyled content
- [ ] Final code cleanup:
  - [ ] Remove console.logs
  - [ ] Remove commented-out code
  - [ ] Ensure consistent code formatting (run prettier if configured)
  - [ ] Remove unused imports
  - [ ] Fix ESLint warnings

### 5.8 Documentation
- [ ] Update `README.md` with:
  - [ ] Project description
  - [ ] Installation instructions
  - [ ] Development instructions (npm run dev)
  - [ ] Build instructions (npm run build)
  - [ ] Project structure overview
  - [ ] Technologies used
- [ ] Create `docs/development/design-system.md` (if not done in 5.6)
- [ ] Create `docs/development/component-guide.md`:
  - [ ] Document major components and their usage
  - [ ] Include prop interfaces
  - [ ] Include usage examples
- [ ] Document known limitations:
  - [ ] No back-end integration
  - [ ] Data stored in localStorage only
  - [ ] Mock authentication
  - [ ] Simulated file uploads
- [ ] Create `docs/development/user-guide.md`:
  - [ ] How to navigate the app
  - [ ] Overview of each role
  - [ ] Walkthrough of key workflows

### 5.9 Phase 5 Final Verification
- [ ] Complete end-to-end walkthrough as Applicant
- [ ] Complete end-to-end walkthrough as Broker
- [ ] Complete end-to-end walkthrough as Admin
- [ ] Complete end-to-end walkthrough as Board member
- [ ] Verify PDF viewer works in all contexts
- [ ] Verify file uploads work throughout
- [ ] Verify all form validations
- [ ] Test responsive on mobile device (or DevTools mobile emulation)
- [ ] Run accessibility checker (e.g., axe DevTools)
- [ ] Check keyboard navigation throughout
- [ ] Verify no console errors
- [ ] Run production build and test

---

## Post-Implementation Checklist

### Final Review
- [ ] All phases (0-5) completed
- [ ] All screens implemented (A0-A7, BK1-BK3, AD1-AD5, BR1)
- [ ] All components functional
- [ ] Mock data comprehensive and realistic
- [ ] TypeScript types complete
- [ ] No build errors or warnings
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] Design system consistent
- [ ] Documentation complete

### Handoff Preparation
- [ ] Create demo video/walkthrough (optional)
- [ ] Prepare presentation slides (optional)
- [ ] List known limitations and future enhancements
- [ ] Gather feedback from stakeholders
- [ ] Plan for Phase 6 (back-end integration) if applicable

---

## Notes

**Progress Tracking:**
- Check off items as you complete them
- Add notes or blockers inline if needed
- Update dates for phase completions

**Estimated Timeline:**
- Phase 0: 1-2 days
- Phase 1: 5-7 days
- Phase 2: 3-4 days
- Phase 3: 5-6 days
- Phase 4: 1-2 days
- Phase 5: 4-5 days
- **Total: ~19-26 days**

**Key Dependencies:**
- Ensure shadcn/ui installed before Phase 1
- Complete core layout components before individual screens
- PDF.js integration can be done in parallel with other phases
- Accessibility audit should be ongoing, not just Phase 5

**Tips:**
- Commit frequently to git
- Test each screen before moving to next
- Keep mock data realistic
- Don't skip responsive testing
- Document as you go
