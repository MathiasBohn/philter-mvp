# philter MVP - User Guide

This guide provides a walkthrough of the philter application from the perspective of each user role. Use this to understand how to navigate the app and complete key workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Applicant Workflows](#applicant-workflows)
3. [Broker Workflows](#broker-workflows)
4. [Admin Workflows](#admin-workflows)
5. [Board Reviewer Workflow](#board-reviewer-workflow)
6. [Common Tasks](#common-tasks)

---

## Getting Started

### Accessing the Application

1. Navigate to the application URL (local: <http://localhost:3000>)
2. You'll be presented with the landing page
3. Click "Get Started" or "Sign In" to access the application

**Note:** This MVP uses mock authentication. No real login is required - you can simulate different roles by navigating to different routes.

### Understanding Your Role

The application displays your current role as a badge in the top-right corner of the navigation bar. Different roles have access to different features:

- **Applicant** - Complete and submit applications
- **Broker** - Manage multiple applications and assist clients
- **Admin** - Review applications and make decisions
- **Board** - Read-only review of applications

---

## Applicant Workflows

### Workflow 1: Starting a New Application

**Goal:** Create a new application and begin filling it out.

1. **Navigate to the start page:** `/applications/new`

2. **Enter Building Code:**
   - Type or paste the 6-character building code provided by your broker or building management
   - If you don't have a code, click "Don't have a code?" for assistance
   - Click "Validate Code"

3. **Select Transaction Type:**
   - Choose from four tiles:
     - Co-op Purchase
     - Condo Purchase
     - Co-op Sublet
     - Condo Lease
   - Click on your transaction type

4. **Start Application:**
   - Click "Start Application" button
   - You'll be redirected to the Application Overview (A1)

**Tips:**

- The building code determines which application template you'll use
- Your transaction type affects which sections you'll need to complete (leases/sublets require additional disclosures)

---

### Workflow 2: Completing Your Profile

**Goal:** Fill out your personal information and address history.

1. **Navigate to Profile:** Click "Profile" from the Application Overview or go to `/applications/[id]/profile`

2. **Complete Personal Information:**
   - Full Legal Name (as it appears on your ID)
   - Email Address
   - Phone Number
   - Date of Birth (you must be 18+)
   - Social Security Number (masked for privacy)

3. **Add Address History:**
   - Click "Add Address" to add an address
   - Fill in: Street Address, City, State, Zip, From Date, To Date
   - Ensure you have at least 2 years of address history
   - Add more addresses as needed

4. **Add Household Members (Optional):**
   - Click "Add Co-applicant" or "Add Guarantor"
   - Enter their email address
   - They'll receive an invitation to complete their portion

5. **Save Your Progress:**
   - The form auto-saves as you type
   - Click "Save & Continue" to proceed to the next section
   - If there are errors, they'll appear at the top of the page with links to the specific fields

**Tips:**

- Your SSN is masked (•••-••-1234) for security
- Address history must cover at least 2 years
- Validation happens in real-time - fix errors as they appear

---

### Workflow 3: Adding Employment and Income

**Goal:** Document your income sources.

1. **Navigate to Employment:** `/applications/[id]/income`

2. **Add Your Current Employer:**
   - Employer Name
   - Job Title
   - Start Date
   - Pay Cadence (Annual, Monthly, Bi-weekly, Weekly)
   - Annual Income (in dollars)

3. **Add Previous Employers (if recent):**
   - Click "Add Another Employer"
   - Fill in the same information
   - Include any employers from the last 2 years

4. **Upload Income Verification:**
   - Drag and drop documents or click "Choose Files"
   - Upload paystubs, W-2s, or 1099s
   - Each file must be under 25MB
   - Accepted formats: PDF, JPG, PNG, DOC, DOCX
   - You'll see an upload progress bar

5. **Review Your Documents:**
   - Each uploaded document appears as a card
   - Click the eye icon to preview
   - Click the trash icon to delete
   - Click "Replace" to upload a new version

6. **Save & Continue**

**Tips:**

- If you're self-employed, use "Self-employed" as employer name
- Upload at least 2 recent paystubs or your most recent W-2
- Files are stored locally (no server upload in this MVP)

---

### Workflow 4: Documenting Your Financials

**Goal:** Create a complete REBNY-aligned financial summary.

1. **Navigate to Financials:** `/applications/[id]/financials`

2. **Add Assets:**
   - Click the "Assets" tab
   - Click "Add Row"
   - Select Category: Checking, Savings, Investment, Real Estate, Other
   - Enter Institution Name
   - Enter Amount
   - Repeat for all assets

3. **Add Liabilities:**
   - Click the "Liabilities" tab
   - Add each debt: Mortgage, Auto Loan, Credit Card, Student Loan, Other
   - Enter institution and amount owed

4. **Add Monthly Income:**
   - Click "Monthly Income" tab
   - Add all income sources: Employment, Rental, Investment, Other
   - Amounts should be monthly (not annual)

5. **Add Monthly Expenses:**
   - Click "Monthly Expenses" tab
   - Add recurring expenses: Rent/Mortgage, Utilities, Insurance, Other

6. **Review Your Totals:**
   - Net Worth displays at the bottom (Assets - Liabilities)
   - DTI (Debt-to-Income) displays as a percentage
   - Ensure all numbers are accurate

7. **Save & Continue**

**Tips:**

- Be comprehensive - include all accounts
- Round to the nearest dollar
- Your DTI affects your application strength
- You can edit or delete entries anytime

---

### Workflow 5: Uploading Required Documents

**Goal:** Upload all required documentation.

1. **Navigate to Documents:** `/applications/[id]/documents`

2. **Review Document Categories:**
   - Government-issued ID (required)
   - Bank letters/statements
   - Tax returns
   - Reference letters
   - Building-specific forms

3. **Upload Documents:**
   - For each category, drag files or click "Upload"
   - Upload progress shows for each file
   - Preview PDFs by clicking on the document card

4. **Handle Missing Documents:**
   - If you don't have a required document, click "I don't have this"
   - Provide a brief explanation
   - This will flag the application for review

5. **Verify Uploads:**
   - Ensure at least one Government ID is uploaded (required)
   - Check that all files are legible and complete

6. **Save & Continue**

**Tips:**

- Scan documents in color if possible
- Ensure all pages of multi-page documents are included
- PDFs are preferred over images
- Government ID must be a driver's license, passport, or state ID

---

### Workflow 6: Acknowledging Disclosures (Lease/Sublet Only)

**Goal:** Review and acknowledge required disclosures.

**Note:** This section only appears for Condo Lease and Co-op Sublet transactions.

1. **Navigate to Disclosures:** `/applications/[id]/disclosures`

2. **Review Local Law 55 (Indoor Allergen Disclosure):**
   - Read the disclosure summary
   - Click "Download Disclosure" to view the full PDF
   - Check the acknowledgment box

3. **Review Window Guard Notice:**
   - Read the disclosure summary
   - Click "Download Disclosure" to view the full PDF
   - Check the acknowledgment box
   - Upload signed form if required by your building

4. **Complete All Acknowledgments:**
   - You cannot proceed until all disclosures are acknowledged
   - Validation prevents accidental skipping

5. **Save & Continue**

**Tips:**

- Read disclosures carefully - they're legally binding
- Download and keep copies for your records
- Some buildings require signed forms to be uploaded

---

### Workflow 7: Review and Submit

**Goal:** Final review and submit your completed application.

1. **Navigate to Review:** `/applications/[id]/review`

2. **Review Validation Summary:**
   - Green checkmarks indicate complete sections
   - Red X marks indicate incomplete or invalid sections
   - Click on any incomplete section to jump there and fix issues

3. **Preview Your Application:**
   - Scroll down to see the compiled PDF preview
   - This is what the building will review
   - Check for any obvious errors or omissions

4. **Final Checks:**
   - Profile complete ✓
   - At least one employer or income source ✓
   - Financial summary complete ✓
   - At least one government ID uploaded ✓
   - All disclosures acknowledged (if applicable) ✓

5. **Submit Application:**
   - Once all requirements are met, the "Submit Application" button becomes enabled
   - Click "Submit Application"
   - Confirm your submission in the dialog
   - A loading indicator will appear briefly

6. **Post-Submission:**
   - You'll see a confirmation message
   - The submission timestamp is displayed
   - The application is now locked (read-only)
   - "What's Next" section explains the review process

**Tips:**

- Don't rush - review everything carefully
- Once submitted, you cannot edit (but can respond to RFIs)
- Save the submission confirmation for your records
- Expect to hear back within the timeline shown

---

## Broker Workflows

### Workflow 1: Viewing Your Application Pipeline

**Goal:** See all applications you're managing.

1. **Navigate to Broker Pipeline:** `/broker`

2. **Review the Table:**
   - Each row is an application
   - Columns show: Applicant(s), Building, Type, Completion %, Last Activity, Status

3. **Use Filters:**
   - Filter by Status (In Progress, Submitted, In Review, etc.)
   - Filter by Date Range
   - Filter by Building
   - Click "Clear Filters" to reset

4. **Sort Columns:**
   - Click column headers to sort
   - Useful for finding applications by completion % or last activity

5. **Take Actions:**
   - Click the "•••" menu on any row for options:
     - Open QA Workspace
     - Invite Applicant
     - View Details

**Tips:**

- Use filters to focus on urgent applications
- Sort by Completion % to prioritize incomplete applications
- Check "Last Activity" to follow up on stale applications

---

### Workflow 2: Pre-filling and QA Checks

**Goal:** Review an application for completeness and quality.

1. **Navigate to QA Workspace:** Click "Open QA" from pipeline or go to `/broker/[id]/qa`

2. **Understand the Layout:**
   - **Left Panel:** Section navigator
   - **Center Panel:** Form data and document viewer
   - **Right Panel:** QA checklist and tools

3. **Navigate Through Sections:**
   - Click section names in the left panel
   - Review each section's data in the center panel
   - Note: SSN is masked to last 4 digits (e.g., ***-**-1234)

4. **Check the QA Panel:**
   - Completeness checklist shows missing items
   - Blocker alerts highlight critical issues
   - Green checkmarks indicate complete sections

5. **Request Information (if needed):**
   - Click "Request Info" button
   - Select the section that needs attention
   - Write a clear message to the applicant
   - Click "Send RFI"
   - The applicant will be notified

6. **Upload Documents on Behalf:**
   - If helping your client, you can upload documents for them
   - Click "Upload" in the Documents section
   - Follow the same upload process

7. **Mark Ready for Submission:**
   - Once all QA checks pass, click "Mark Ready for Submit"
   - This enables the final submission step

**Tips:**

- Review documents carefully - blurry or incomplete documents will be rejected
- Use RFIs proactively to get ahead of building questions
- Verify financial calculations (DTI, Net Worth)
- SSN masking protects client privacy while allowing QA

---

### Workflow 3: Submitting to Building

**Goal:** Final submission of a complete application.

1. **Navigate to Submission:** `/broker/[id]/submit`

2. **Review Deliverables Checklist:**
   - Profile complete ✓
   - Employment/income documented ✓
   - Financials complete ✓
   - Required documents uploaded ✓
   - Disclosures acknowledged (if applicable) ✓

3. **Preview Board Package:**
   - Compiled PDF shows the final submission
   - Check for formatting issues
   - Verify all pages are included

4. **Review Audit Trail:**
   - Timeline of all actions taken
   - Shows who did what and when
   - Useful for compliance and record-keeping

5. **Submit to Building:**
   - Click "Submit to Building"
   - Confirm in the dialog
   - Application status changes to "Submitted"

6. **Confirmation:**
   - Submission timestamp is recorded
   - Confirmation message appears
   - Building admin is notified

**Tips:**

- Do a final read-through of the compiled package
- Ensure all client signatures are included
- Keep a copy of the audit trail
- Communicate submission to your client

---

## Admin Workflows

### Workflow 1: Creating an Application Template

**Goal:** Set up building-specific requirements for applications.

1. **Navigate to Templates:** `/admin/templates`

2. **Start New Template:**
   - Click "Create New Template"
   - You'll enter a 6-step wizard

3. **Step 1 - Basics:**
   - Select Building from dropdown
   - Enter Template Name (e.g., "Standard Co-op Application")
   - Add Description
   - Click "Next"

4. **Step 2 - Sections:**
   - Toggle which sections are required:
     - Profile (usually required)
     - Employment & Income
     - Financials
     - Documents
     - Disclosures (for lease/sublet only)
   - Mark each as Required or Optional
   - Click "Next"

5. **Step 3 - Documents:**
   - Toggle required document categories:
     - Government ID (usually required)
     - Bank statements
     - Tax returns
     - Reference letters
     - Custom building forms
   - Add custom categories if needed
   - Click "Next"

6. **Step 4 - Compliance:**
   - For lease/sublet: Enable Local Law 55 disclosure
   - For lease: Enable Window Guard disclosure
   - These are NYC-specific legal requirements
   - Click "Next"

7. **Step 5 - Review:**
   - Summary of all your selections
   - Review required sections, documents, and compliance settings
   - Click "Back" to make changes or "Next" to continue

8. **Step 6 - Publish:**
   - Template version number is shown (e.g., v1.0)
   - Click "Publish Template"
   - Template is now active and can be used for applications

**Tips:**

- Templates ensure consistency across applications
- You can create multiple templates per building (e.g., purchase vs. lease)
- Version numbers help track changes over time
- Save drafts if you need to pause

---

### Workflow 2: Reviewing Submitted Applications

**Goal:** Review and process incoming applications.

1. **Navigate to Intake Inbox:** `/admin/inbox`

2. **Review Submitted Applications:**
   - Table shows all submitted applications
   - Columns: Applicant(s), Unit, Type, Stage, Age (days), Last Activity
   - New submissions appear at the top

3. **Filter Applications:**
   - Filter by Status: Submitted, In Review, RFI, etc.
   - Filter by Date Submitted
   - Filter by Building

4. **Assign Applications:**
   - Click "•••" menu on a row
   - Select "Assign to Reviewer"
   - Choose a team member
   - They'll be notified

5. **Set Status:**
   - Use quick status dropdown
   - Options: In Review, RFI, Approved, Conditional, Denied
   - Status helps track workflow

6. **Open Review Workspace:**
   - Click "Open Review" to begin detailed review
   - This takes you to the full review interface

**Tips:**

- Age in days helps prioritize older applications
- Assign applications based on reviewer expertise
- Use status to track progress through review
- Check "Last Activity" to spot stale applications

---

### Workflow 3: Detailed Review and RFI Management

**Goal:** Thoroughly review an application and request additional information if needed.

1. **Navigate to Review Workspace:** `/admin/review/[id]`

2. **Understand the Three-Column Layout:**
   - **Left:** Section navigator with completion flags
   - **Center:** PDF viewer or data panel (toggle between views)
   - **Right:** RFI thread and activity log

3. **Navigate Through Sections:**
   - Click sections in the left panel
   - Review data in the center panel
   - Note: Full SSN is visible to Admin (no masking)

4. **Toggle Between Views:**
   - Click "PDF View" to see documents
   - Click "Data View" to see form data
   - Use PDF view for document review
   - Use Data view for quick fact-checking

5. **Mark Sections:**
   - For each section, click "Mark Complete" or "Needs Info"
   - Complete sections show green checkmark
   - Needs Info sections show warning icon

6. **Create an RFI:**
   - Click "Create RFI" button in the right panel
   - Select the section with the issue
   - Assign to Applicant or Broker
   - Write a clear message explaining what's needed
   - Attach document references if helpful
   - Click "Send RFI"

7. **Manage RFI Thread:**
   - View all RFI messages in chronological order
   - See author, role, and timestamp
   - Reply to applicant/broker responses
   - Click "Resolve" when issue is addressed

8. **Review Activity Log:**
   - See timeline of all actions
   - Useful for compliance and audit purposes

**Tips:**

- Be specific in RFI messages - vague requests delay the process
- Check financials carefully (DTI calculation, asset verification)
- Review all document pages for completeness
- Resolve RFIs promptly to maintain good applicant experience

---

### Workflow 4: Recording a Decision

**Goal:** Make and record a final decision on an application.

1. **Navigate to Decision Panel:** Within the review workspace, scroll to the decision section or access via `/admin/review/[id]` (decision panel is integrated)

2. **Select Decision Type:**
   - **Approve:** Application accepted without conditions
   - **Approve with Conditions:** Accepted but with requirements
   - **Deny:** Application rejected

3. **Choose Reason Tags:**
   - Multi-select checkboxes for common reasons:
     - Income insufficient
     - DTI too high
     - Incomplete documentation
     - Unsatisfactory references
     - Board policy criteria not met
     - Other
   - Select all that apply

4. **Add Notes:**
   - Use the free-text field for detailed explanation
   - Be professional and clear
   - These notes may be shared with the applicant

5. **Consumer Report Compliance:**
   - If you used a consumer report (credit check), check "Uses consumer report"
   - If checked AND decision is Deny or Conditional:
     - You must provide adverse action notice
     - Additional field appears
     - This is required by federal law

6. **Preview Decision Email:**
   - Email preview shows what the applicant will receive
   - To: Applicant's email
   - Subject: Based on decision type
   - Body: Includes decision and reason codes

7. **Submit Decision:**
   - Review all information carefully
   - Click "Submit Decision"
   - Confirm in the dialog
   - Decision is recorded with timestamp
   - Email notification sent (in full version)

8. **Post-Decision:**
   - Application status updates
   - Decision is locked (cannot be changed without creating a new review)
   - Timestamp and decision-maker are recorded

**Tips:**

- Adverse action notices are legally required for consumer reports
- Be honest but tactful in reason explanations
- Document decisions thoroughly for potential disputes
- Conditional approvals should clearly state the conditions

---

## Board Reviewer Workflow

### Workflow: Reviewing an Application (Read-Only)

**Goal:** Review a compiled application package without editing.

1. **Navigate to Board Review:** `/board/review/[id]`

2. **View the Compiled Package:**
   - Full PDF viewer displays the application
   - All sections and documents compiled into one package
   - Optional watermark: "Board Review Copy"

3. **Navigate the PDF:**
   - Use thumbnail sidebar to jump to pages
   - Zoom in/out with controls
   - Navigate page-by-page with arrows
   - Rotate pages if needed

4. **Note Privacy Protections:**
   - SSN is redacted (shows as ••••)
   - Sensitive information masked per building policy
   - You see applicant data but not raw SSN

5. **Add Private Notes:**
   - Private notes field at the bottom or sidebar
   - Type your thoughts, concerns, or observations
   - Notes are private - NOT shared with applicant, broker, or admin
   - Auto-saves to your browser storage

6. **Mark as Reviewed:**
   - When you've completed your review, click "Mark as Reviewed"
   - Timestamp is recorded
   - Button becomes disabled (prevents duplicate marking)

7. **Download Package (Optional):**
   - Click "Download Compiled Package"
   - Expiry notice: "Link expires soon to protect your privacy"
   - PDF downloads to your device
   - Useful for offline review or board meetings

8. **Read-Only Restrictions:**
   - You cannot edit any data
   - You cannot add comments visible to others
   - You cannot create RFIs
   - You cannot change application status
   - Interface shows read-only indicators throughout

**Tips:**

- Use private notes for pre-meeting thoughts
- Download if you need offline access for a board meeting
- Your review timestamp may be visible to admins (for compliance)
- Contact admin if you have questions or need clarification

---

## Common Tasks

### Navigating the Application

#### Using the Top Bar

- Logo: Click to return to home/dashboard
- Role Badge: Shows your current role (Applicant, Broker, Admin, Board)
- User Menu: Access settings, profile, sign out

#### Using Breadcrumbs

- Shows your current location
- Click any breadcrumb to navigate back
- Example: Applications > Application #123 > Profile

#### Using the Sidebar

- Contextual navigation based on your role
- Applicants: See application sections
- Brokers: See pipeline and active applications
- Admins: See inbox, templates, settings
- Automatically highlights current page

### Working with Forms

#### Auto-Save

- Forms auto-save as you type (simulated in MVP)
- Look for "Saved" indicator
- No need to manually save frequently

#### Validation

- Real-time validation highlights errors immediately
- Inline errors appear below fields
- Page-top error summary lists all issues
- Fix errors before proceeding

#### Required Fields

- Marked with an asterisk (*)
- Also indicated by `required` attribute
- Cannot submit form until all required fields are filled

#### Keyboard Navigation

- Tab: Move to next field
- Shift+Tab: Move to previous field
- Enter: Submit form (if on a button)
- Escape: Close dialogs/modals

### Working with Documents

#### Uploading

- Drag and drop files onto the upload zone
- Or click "Choose Files" to browse
- Multiple files can be uploaded at once
- Progress bar shows upload status

#### Previewing

- Click eye icon on document card
- PDF viewer opens
- Use zoom and navigation controls

#### Replacing

- Click "Replace" on a document card
- Upload a new file
- Old file is removed

#### Deleting

- Click trash icon on document card
- Confirm deletion
- Action is immediate

### Understanding Application Status

#### Status Badges

- **In Progress:** Application started but not submitted
- **Submitted:** Application submitted, awaiting review
- **In Review:** Admin is actively reviewing
- **RFI:** Request for Information - applicant/broker needs to respond
- **Approved:** Application accepted
- **Conditional:** Approved with conditions to be met
- **Denied:** Application rejected

#### Progress Indicators

- Percentage shows overall completion
- Based on required sections
- Each section has its own status (complete/incomplete)

### Responding to RFIs (Requests for Information)

#### As an Applicant or Broker

1. **Notification:** You'll see an RFI banner on your application overview
2. **Open RFI:** Click "View RFIs" or navigate to the flagged section
3. **Read the Request:** Understand what the admin is asking for
4. **Gather Information:** Collect the requested documents or data
5. **Respond:**
   - Upload additional documents if requested
   - Update form fields if data correction needed
   - Add a reply message explaining your response
6. **Submit Response:** Click "Send Reply"
7. **Wait for Resolution:** Admin will mark RFI as resolved when satisfied

**Tips for RFI Responses:**

- Respond promptly to avoid delays
- Be thorough - provide everything requested
- Ask clarifying questions if the RFI is unclear
- Check that you've addressed all points before submitting

### Troubleshooting Common Issues

**"I can't submit my application"**
- Check the validation summary on the Review page
- Each incomplete section will have a red X
- Click the section link to go fix the issues
- Ensure all required documents are uploaded

**"My upload failed"**
- Check file size (must be under 25MB)
- Check file type (PDF, JPG, PNG, DOC, DOCX only)
- Try a different file or compress a large PDF
- Clear browser cache and try again

**"I can't see my saved data"**
- Data is stored in browser localStorage
- Don't clear browser data or use incognito mode
- Use the same browser and device
- In production version, data syncs to server

**"SSN is not displaying correctly"**
- This is intentional masking based on your role
- Applicants and Admins see full SSN
- Brokers see last 4 digits only
- Board members see redacted (••••)

**"The page won't load"**
- Check your internet connection
- Try refreshing the page (F5 or Cmd+R)
- Clear browser cache
- Try a different browser
- Check the browser console for errors (F12)

---

## Additional Help

### Getting Support

- **Technical Issues:** Report at the GitHub repository
- **Questions about the application process:** Contact your broker or building admin
- **Privacy concerns:** Review the privacy policy
- **Accessibility issues:** We aim for WCAG 2.2 AA compliance - report barriers

### Resources

- **Implementation Plan:** `docs/development/implementation-plan.md`
- **Requirements:** `docs/development/requirements.md`
- **Design System:** `docs/development/design-system.md`
- **Component Guide:** `docs/development/component-guide.md` (for developers)

---

**Version:** MVP 1.0
**Last Updated:** [Current Date]
**Built with:** Next.js 16, React 19, TypeScript 5
