# philter MVP - Requirements Document

## 1. Project Overview

**Product Name:** philter
**Version:** MVP (Minimum Viable Product)
**Purpose:** A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.

**Core Value Proposition:**
Digitize and streamline the board package and application workflow, enabling brokers and their clients to assemble and submit error-free, complete applications with guided checklists, smart document upload, secure role-based collaboration, transparent process tracking, and a full overview of submitted documents for property managers to review.

**Outcome:** Less manual work, faster approvals, and significantly higher application quality for all stakeholders.

---

## 2. Initial Requirements

### 2.1 Scope for MVP UI Phase

This phase focuses **exclusively on UI components** without back-end logic:

- Build a complete, navigable UI for all user flows
- Implement client-side validation and error handling
- Create realistic mock data fixtures for demonstration
- Integrate PDF viewing capabilities
- Implement file upload UI (browser-based, no server storage)
- Ensure responsive design (mobile, tablet, desktop)
- Achieve WCAG 2.2 AA accessibility compliance

**Explicitly Out of Scope:**
- Database integration
- Server-side logic
- Authentication system
- API endpoints
- Data persistence (except localStorage for demo purposes)
- Automated testing (unit/e2e)

### 2.2 Technology Stack

- **Framework:** Next.js 16 with App Router
- **React:** Version 19
- **UI Library:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5
- **Validation:** Zod (client-side)
- **PDF Viewer:** PDF.js
- **State Management:** React hooks + localStorage

---

## 3. Functional Requirements

### 3.1 User Roles

The platform supports five distinct roles with different capabilities:

#### FR-1: Applicant
- **Description:** Primary individual applying for co-op/condo purchase or lease
- **Capabilities:**
  - Complete all application sections
  - Upload required documents
  - Invite co-applicants and guarantors
  - Submit application to building
  - Reply to RFIs (Requests for Information)
- **PII Visibility:** Full access to own information
- **Access Level:** Edit own sections and documents

#### FR-2: Co-applicant / Guarantor
- **Description:** Additional individuals on the application
- **Capabilities:**
  - Complete own subsections only
  - Upload own documents
  - Reply to RFIs related to their items
- **PII Visibility:** Full access to own information
- **Access Level:** Edit only own subsections

#### FR-3: Broker / Agent
- **Description:** Real estate professional orchestrating the application
- **Capabilities:**
  - Initiate new applications
  - Pre-fill building-specific fields
  - Invite applicants and co-applicants
  - Upload documents on behalf of clients
  - Perform QA (quality assurance) checks
  - Submit completed applications
  - Request information from applicants
- **PII Visibility:** Masked SSN (last 4 digits only)
- **Access Level:** Edit non-PII fields, upload on behalf, view-only for PII

#### FR-4: Building Admin / Property Manager
- **Description:** Building management reviewing applications
- **Capabilities:**
  - Create and manage application templates
  - Review submitted applications
  - Create and manage RFIs
  - Mark sections as complete or needing more information
  - Record final decisions (Approve/Conditional/Deny)
- **PII Visibility:** Full access per building policy
- **Access Level:** Full read access, review controls, decision authority

#### FR-5: Board Reviewer
- **Description:** Board member conducting read-only review
- **Capabilities:**
  - View compiled application package
  - Add private notes (not shared with other parties)
  - Mark application as reviewed
  - Download compiled package (time-limited)
- **PII Visibility:** Redacted (SSN hidden as ••••)
- **Access Level:** Read-only, no edit or comment capabilities

### 3.2 Transaction Types

#### FR-6: Support Four Transaction Types
- Co-op Purchase
- Condo Purchase
- Co-op Sublet
- Condo Lease

**Note:** Lease/Sublet transactions require additional disclosure screens (Local Law 55, Window Guard notices).

### 3.3 Application Workflow Screens

#### FR-7: Applicant Screens (A0-A7)

**A0 - Welcome & Building Code Entry**
- Input field for building code validation
- Selection of transaction type (4 tiles)
- Start application button
- Error handling for invalid codes
- Help text for users without codes

**A1 - Application Overview Hub**
- Display all sections with completion status
- Progress indicator showing overall completion
- Ability to invite co-applicants/guarantors
- RFI banner if requests are outstanding
- Navigation to incomplete sections

**A2 - Profile Section**
- Legal name, email, phone, date of birth
- SSN entry (masked input)
- 2-year address history (minimum)
- Add household members
- Invite co-applicants/guarantors
- Validation: Required fields, DOB ≥18 years, address history ≥2 years

**A3 - Employment & Income**
- Add multiple employers
- Fields: Employer name, title, start date, pay cadence, annual income
- Upload income proof (paystubs, W-2, 1099)
- Validation: Required employer fields if employed, numeric income ≥0

**A4 - Financial Summary (REBNY-aligned)**
- Four categories: Assets, Liabilities, Monthly Income, Monthly Expenses
- Add/edit/delete entries
- Display totals: Net Worth, DTI (Debt-to-Income ratio)
- Category dropdowns per entry type
- Validation: Required amount field, numeric values

**A5 - Documents Upload & Preview**
- Document categories: ID, Bank statements, Tax returns, References, Building forms
- Drag-and-drop upload interface
- PDF preview capability
- Replace/delete uploaded files
- "I don't have this" option with reason
- Validation: At least 1 government ID required before submit

**A6 - Disclosures (Lease/Sublet Only)**
- Local Law 55 Indoor Allergen acknowledgment
- Window Guard lease notice acknowledgment
- Download disclosure PDFs
- Upload signed forms if required
- Validation: All enabled disclosures must be acknowledged
- **Conditional:** Only shown for CONDO_LEASE and COOP_SUBLET

**A7 - Review & Submit**
- Validation summary with all requirements
- Anchor links to incomplete sections
- Compiled package preview (PDF)
- Submit button
- Post-submit: Lock editing, show timestamp, display next steps

#### FR-8: Broker Screens (BK1-BK3)

**BK1 - Broker Pipeline**
- Data table of all applications
- Columns: Applicant, Building, Type, Completion %, Last Activity
- Filters: Status, date range, building
- Actions: Start new application, Open QA, Invite applicant
- Empty state with clear CTA

**BK2 - Pre-fill & QA Workspace**
- Three-column layout:
  - Left: Section navigator
  - Center: Form/document view
  - Right: QA panel with completeness checklist
- PII masking (SSN shows last-4 only)
- Upload documents on behalf
- Request info from applicant (creates RFI)
- Mark application ready for submit

**BK3 - Submission Confirm**
- Checklist of deliverables
- Board package preview (PDF)
- Audit trail (activity log)
- Submit to building button
- Confirmation message

#### FR-9: Admin Screens (AD1-AD5)

**AD1 - Template Wizard**
- Multi-step wizard:
  1. Basics (building info)
  2. Sections (toggle required sections)
  3. Documents (customize checklist)
  4. Compliance (enable LL55/Window Guard for lease/sublet)
  5. Review
  6. Publish
- Save draft capability
- Version management

**AD2 - Intake Inbox**
- Data table of submitted applications
- Columns: Applicant(s), Unit, Type, Stage, Age, Last Activity
- Quick filters
- Row actions: Open review, Assign, Set status

**AD3 - Review Workspace**
- Three-column layout:
  - Left: Section navigator with flags/status
  - Center: PDF viewer + data panel (toggle view)
  - Right: RFI thread + activity log
- Mark sections complete or needs info
- Leave comments
- Create RFIs per section
- Full PII visibility

**AD4 - RFIs (Threaded)**
- RFI composer (new request form)
- Threaded message display
- Assign to Applicant or Broker
- Attach document references
- Status toggle (Open/Resolved)

**AD5 - Decision Panel**
- Decision options: Approve, Approve with Conditions, Deny
- Reason tags (multi-select)
- Free-text notes
- "Uses consumer report" checkbox
- Conditional logic: If consumer report used + Deny/Conditional, require adverse action notice
- Email preview
- Submit decision button

#### FR-10: Board Reviewer Screen (BR1)

**BR1 - Read-only Review**
- PDF viewer with watermark
- Private notes (board member only, not shared)
- Mark as reviewed button
- Download compiled package
- Expiry notice ("Link expires soon")
- Completely read-only (no edit capabilities)
- Redacted SSN display (••••)

### 3.4 Cross-Cutting Functional Requirements

#### FR-11: Form Validation
- Client-side validation using Zod schemas
- Inline error messages per field
- Page-top error summary with anchor links
- Focus management (move to first error)
- Required field indicators

#### FR-12: File Upload
- Drag-and-drop interface
- File selection fallback (keyboard accessible)
- Supported formats: PDF, JPG, PNG, DOC, DOCX
- File size limit: 25 MB per file
- Progress indicator
- Pause/resume capability (simulated)
- File type and size validation
- Preview capability (especially PDFs)

#### FR-13: PDF Viewing
- Full-page PDF viewer
- Thumbnail navigation
- Zoom controls (+/-)
- Page navigation
- Rotate capability
- Open in new tab
- Responsive layout

#### FR-14: Navigation
- Breadcrumb navigation
- Section-based navigation (sidebar)
- Deep linking to specific sections
- Back/forward browser support
- Mobile navigation (hamburger menu)

#### FR-15: Mock Data Management
- Realistic mock data for all entities
- Different data sets for different roles
- PII masking rules enforced in mock data
- Sample PDFs for document preview
- State persistence in localStorage

---

## 4. Non-Functional Requirements

### 4.1 Performance

#### NFR-1: Page Load Time
- First Contentful Paint (FCP) < 2.0s on broadband
- Time to Interactive (TTI) < 2.5s on broadband
- Measured on US-East broadband connection

#### NFR-2: Responsiveness
- UI interactions respond within 100ms
- Smooth animations (60fps)
- No janky scrolling

#### NFR-3: File Upload Performance
- Upload progress displayed in real-time
- Resume capability after network interruption
- Chunked upload simulation (for future compatibility)

### 4.2 Accessibility (WCAG 2.2 AA)

#### NFR-4: Keyboard Navigation
- All interactive elements accessible via keyboard
- Visible focus indicators
- Logical tab order
- Skip links for main content

#### NFR-5: Screen Reader Support
- Proper ARIA labels and descriptions
- Semantic HTML elements
- Form labels associated with inputs
- Error announcements (role="alert")
- Live regions for dynamic content updates

#### NFR-6: Visual Accessibility
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Color is not the only means of conveying information
- Resizable text up to 200% without loss of functionality

#### NFR-7: Motor Accessibility
- Touch targets ≥ 24px (WCAG 2.2 Target Size)
- Focus not obscured by sticky headers/overlays (WCAG 2.2)
- Drag-and-drop has keyboard alternative

#### NFR-8: Error Handling
- Error summary at page top after validation
- Anchor links from summary to fields
- Focus moved to first invalid field
- Clear, descriptive error messages

### 4.3 Usability

#### NFR-9: Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly interface on mobile/tablet
- Optimized layouts for each screen size

#### NFR-10: Consistency
- Consistent component patterns throughout
- Design system with defined tokens
- Uniform spacing, typography, colors
- Predictable interactions

#### NFR-11: Progressive Disclosure
- Show information/options only when relevant
- Conditional sections (e.g., Disclosures only for lease/sublet)
- Expandable/collapsible sections where appropriate

### 4.4 Maintainability

#### NFR-12: Code Quality
- TypeScript strict mode enabled
- Type safety throughout application
- Consistent code formatting (ESLint)
- Clear component organization
- Documented complex logic

#### NFR-13: Component Reusability
- Shared UI components in `/components/ui`
- Feature-specific components in `/components/features`
- Consistent prop interfaces
- Composable component patterns

#### NFR-14: Documentation
- Inline code comments for complex logic
- README for project setup
- Component usage examples
- Mock data structure documentation

### 4.5 Security & Privacy (UI Level)

#### NFR-15: PII Masking
- SSN masking enforced at component level
- Different visibility rules by role:
  - Applicant/Admin: Full SSN
  - Broker: Last 4 digits only
  - Board: Redacted (••••)
- No PII in URLs or browser history
- No PII in console logs

#### NFR-16: Data Handling
- Form data stored in localStorage only (demo mode)
- Clear data option available
- No transmission of data to external services
- Mock data clearly labeled

---

## 5. Acceptance Criteria

### 5.1 Phase 0: Setup & Cleanup

- [ ] Boilerplate content removed from `app/page.tsx`
- [ ] Unused Next.js assets deleted (next.svg, vercel.svg)
- [ ] shadcn/ui successfully initialized with proper configuration
- [ ] Project folder structure created as specified
- [ ] TypeScript types defined for all entities
- [ ] Mock data fixtures created with realistic content
- [ ] Project builds without errors

### 5.2 Phase 1: Applicant Flow (A0-A7)

**A0 - Welcome & Building Code Entry**
- [ ] Building code input field validates format
- [ ] All 4 transaction type tiles displayed correctly
- [ ] Invalid code shows appropriate error message
- [ ] Error summary appears at page top
- [ ] Help text visible and actionable
- [ ] Start button creates new application (mock)

**A1 - Application Overview Hub**
- [ ] All sections displayed with correct status pills
- [ ] Progress bar calculates completion accurately
- [ ] Invite widget functional (adds to mock data)
- [ ] RFI banner appears when RFIs present
- [ ] Continue button navigates to next incomplete section
- [ ] Responsive on mobile, tablet, desktop

**A2 - Profile Section**
- [ ] All required fields present and labeled
- [ ] SSN input masked correctly
- [ ] DOB picker functional with age validation (≥18)
- [ ] Address history requires minimum 2 years
- [ ] Add person button adds new co-applicant/guarantor
- [ ] Inline validation errors display
- [ ] Error summary appears with anchor links
- [ ] Save updates mock data
- [ ] Autosave indicator visible

**A3 - Employment & Income**
- [ ] Add employer button creates new employer entry
- [ ] Remove employer works correctly
- [ ] All employer fields present
- [ ] Money input formats currency correctly
- [ ] Upload dropzone accepts files
- [ ] Upload progress indicator animates
- [ ] Document cards show file info
- [ ] Preview/delete actions work
- [ ] File type/size validation enforced

**A4 - Financial Summary**
- [ ] 4 tabs displayed (Assets, Liabilities, Monthly Income, Monthly Expenses)
- [ ] Add row creates new entry
- [ ] Delete row removes entry
- [ ] Category dropdowns populated correctly per type
- [ ] Totals (Net Worth, DTI) calculate correctly
- [ ] Amount fields validate numeric input
- [ ] Responsive table layout on mobile

**A5 - Documents Upload & Preview**
- [ ] All document categories displayed
- [ ] Required/optional indicators shown
- [ ] Drag-and-drop upload works
- [ ] File selection fallback works (keyboard accessible)
- [ ] PDF preview opens in viewer
- [ ] Replace/delete file actions work
- [ ] "I don't have this" option functional
- [ ] Validation: At least 1 govt ID required

**A6 - Disclosures**
- [ ] Only shown for CONDO_LEASE and COOP_SUBLET
- [ ] Not shown for COOP_PURCHASE and CONDO_PURCHASE
- [ ] Local Law 55 disclosure displayed
- [ ] Window Guard disclosure displayed
- [ ] Download links functional (mock PDFs)
- [ ] Acknowledgment checkboxes required
- [ ] Upload signed form works if required
- [ ] Validation prevents proceeding without acknowledgment

**A7 - Review & Submit**
- [ ] Validation summary displays all requirements
- [ ] Incomplete items link to respective sections
- [ ] PDF preview displays compiled package (mock)
- [ ] Submit button disabled until all requirements met
- [ ] Submit action shows loading state
- [ ] Post-submit: Editing locked
- [ ] Post-submit: Timestamp displayed
- [ ] Post-submit: "What's next" message shown

### 5.3 Phase 2: Broker Flow (BK1-BK3)

**BK1 - Broker Pipeline**
- [ ] Data table displays all applications
- [ ] Columns sortable
- [ ] Filters work (status, date, building)
- [ ] Empty state displays with CTA
- [ ] Start new application button works
- [ ] Open QA action navigates to BK2
- [ ] Responsive on mobile (card view)

**BK2 - Pre-fill & QA Workspace**
- [ ] Three-column layout displays correctly
- [ ] Section navigator shows all sections
- [ ] Center panel shows form/document view
- [ ] QA panel shows completeness checklist
- [ ] SSN masked to last-4 only
- [ ] Upload on behalf works
- [ ] Request info creates mock RFI
- [ ] Mark ready enables submit

**BK3 - Submission Confirm**
- [ ] Checklist of deliverables displayed
- [ ] PDF preview works
- [ ] Audit trail shows activity
- [ ] Submit button functional
- [ ] Confirmation message appears

### 5.4 Phase 3: Admin Flow (AD1-AD5)

**AD1 - Template Wizard**
- [ ] Stepper shows 6 steps
- [ ] Navigate forward/backward between steps
- [ ] Toggle switches for sections work
- [ ] Toggle switches for documents work
- [ ] Compliance toggles (LL55, Window Guard) work
- [ ] Review step shows summary
- [ ] Publish button saves template (mock)
- [ ] Version number displayed

**AD2 - Intake Inbox**
- [ ] Data table displays all submitted applications
- [ ] All columns populated correctly
- [ ] Filters functional
- [ ] Open review action navigates to AD3
- [ ] Assign action updates mock data
- [ ] Set status action updates status

**AD3 - Review Workspace**
- [ ] Three-column layout correct
- [ ] Section navigator shows flags/status
- [ ] PDF viewer displays documents
- [ ] Data panel shows form data
- [ ] RFI thread displays messages
- [ ] Activity log shows timeline
- [ ] Mark complete/needs info works
- [ ] Create RFI functional
- [ ] Full SSN visible (no masking)

**AD4 - RFIs**
- [ ] RFI composer form works
- [ ] Threaded messages display correctly
- [ ] Author/role chips visible
- [ ] Assign to Applicant/Broker works
- [ ] Attach document references works
- [ ] Status toggle (Open/Resolved) works
- [ ] Timestamps displayed

**AD5 - Decision Panel**
- [ ] Three decision options (Approve, Conditional, Deny)
- [ ] Reason tags multi-select works
- [ ] Free-text notes field functional
- [ ] "Uses consumer report" checkbox works
- [ ] Conditional logic: If consumer report + Deny/Conditional, requires adverse action
- [ ] Email preview displays
- [ ] Submit decision works
- [ ] Confirmation message appears

### 5.5 Phase 4: Board Reviewer Flow (BR1)

**BR1 - Read-only Review**
- [ ] PDF viewer displays compiled package
- [ ] Watermark visible (if applicable)
- [ ] Private notes field functional
- [ ] Notes saved to localStorage
- [ ] Mark reviewed button works
- [ ] Download button shows expiry notice
- [ ] Download action works (mock)
- [ ] SSN redacted (displayed as ••••)
- [ ] No edit capabilities available
- [ ] No comment/RFI capabilities available

### 5.6 Phase 5: Shared Components & Polish

**PDF.js Integration**
- [ ] PdfViewer component created
- [ ] Thumbnail navigation works
- [ ] Zoom controls functional (+/-)
- [ ] Page navigation works
- [ ] Rotate button works
- [ ] Open in new tab works
- [ ] Full-height responsive layout
- [ ] Works with sample PDFs

**File Upload Component**
- [ ] Drag-and-drop functional
- [ ] File selection fallback works
- [ ] Progress indicator animates
- [ ] Pause/resume simulation works
- [ ] File validation (type, size) enforced
- [ ] Multiple file support works
- [ ] Preview thumbnails display
- [ ] Error handling for invalid files

**Form Validation System**
- [ ] Zod schemas defined for all forms
- [ ] Client-side validation works
- [ ] Inline errors display
- [ ] Error summary component works
- [ ] Anchor links navigate to fields
- [ ] Focus moves to first error
- [ ] Validation messages clear and actionable

**Responsive Design**
- [ ] Mobile layout (< 640px) works
- [ ] Tablet layout (640-1024px) works
- [ ] Desktop layout (> 1024px) works
- [ ] Navigation adapts (hamburger on mobile)
- [ ] Tables transform to cards on mobile
- [ ] Touch targets ≥ 24px on mobile
- [ ] Forms usable on all screen sizes

**Accessibility Audit**
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators on all elements
- [ ] ARIA labels present where needed
- [ ] Form labels associated with inputs
- [ ] Error summary uses role="alert"
- [ ] Color contrast ≥ 4.5:1 verified
- [ ] Focus not obscured by sticky headers
- [ ] Skip links functional
- [ ] Tested with screen reader (basic)

**Design System**
- [ ] Border radius consistent (16px cards, 12px buttons)
- [ ] Spacing scale applied consistently
- [ ] Typography uses Geist Sans/Mono
- [ ] Button variants defined (Primary, Secondary, Destructive, Ghost)
- [ ] Color palette defined and applied
- [ ] Design tokens documented

---

## 6. Success Metrics

### 6.1 Completion Metrics
- All 20+ screens implemented and navigable
- 50+ reusable components created
- 100% TypeScript type coverage
- Zero build errors or warnings

### 6.2 Quality Metrics
- WCAG 2.2 AA compliance verified
- Responsive on all target breakpoints
- All forms validate correctly
- PDF viewer works with sample documents
- File upload UI functional

### 6.3 Documentation Metrics
- All components documented
- Mock data structure documented
- Setup instructions complete
- Known limitations documented

---

## 7. Constraints & Assumptions

### 7.1 Constraints
- No back-end integration in this phase
- No real authentication system
- No database persistence
- No automated testing
- No production deployment
- Limited to modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

### 7.2 Assumptions
- Mock data sufficient for demonstrating all workflows
- localStorage adequate for demo state persistence
- PDF.js can handle sample document viewing
- shadcn/ui components provide needed functionality
- Users have basic familiarity with web applications
- Desktop/laptop primary use case (mobile secondary)

---

## 8. Future Considerations

Items explicitly deferred to post-MVP:
- Supabase back-end integration
- Real authentication (magic links)
- Database persistence with RLS
- TUS resumable uploads to cloud storage
- Server-side validation
- API endpoints
- Email notifications
- Automated testing (unit, integration, e2e)
- Analytics integration
- Production deployment configuration
- Embedded e-signature
- Payment processing
- Advanced document parsing/classification
