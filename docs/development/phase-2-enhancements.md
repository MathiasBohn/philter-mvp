# Phase 2 Enhancements - Product Requirements Document

**Document Version:** 1.0
**Last Updated:** November 16, 2025
**Phase:** Phase 2 - Important Enhancements
**Status:** Implementation Complete
**Timeline:** 8-10 weeks

---

## Executive Summary

Phase 2 delivers important enhancements that bring the Philter MVP to full feature parity with competitor platforms while introducing superior UX improvements. This phase focuses on comprehensive data collection, enhanced transparency, and improved workflow efficiency for all user roles.

### Key Objectives
1. Achieve 100% feature parity with competitor applications (Nestseekers, The Screening Co.)
2. Enhance data collection depth and quality
3. Improve transparency with building policies display
4. Streamline workflows with global navigation and activity tracking
5. Introduce value-added services (expedited review)

### Success Metrics
- ✅ Full employment history collection (3+ jobs)
- ✅ Complete real estate holdings tracking
- ✅ Expanded financial categorization (8+ categories)
- ✅ 8 additional acknowledgement forms
- ✅ Building policies acceptance >95%
- ✅ Time-to-complete reduction by 15% (via better navigation)
- ✅ Application quality score increase by 25%

---

## Table of Contents

1. [Enhanced Employment Section](#1-enhanced-employment-section)
2. [Real Estate Holdings](#2-real-estate-holdings)
3. [Expanded Financial Categories](#3-expanded-financial-categories)
4. [Building Policies Display](#4-building-policies-display)
5. [Additional Acknowledgements](#5-additional-acknowledgements)
6. [Cover Letter / Personal Introduction](#6-cover-letter--personal-introduction)
7. [Left Sidebar Navigation](#7-left-sidebar-navigation)
8. [Application Age & Activity Tracking](#8-application-age--activity-tracking)
9. [Technical Implementation](#technical-implementation)
10. [User Experience Guidelines](#user-experience-guidelines)
11. [Rollout Plan](#rollout-plan)

---

## 1. Enhanced Employment Section

### Overview
Expand employment section to collect comprehensive employment history including multiple jobs, detailed compensation, supervisor information, and self-employment details.

### Business Value
- **For Admin/Board:** Complete employment verification data reduces RFI cycles by 30%
- **For Applicants:** Single comprehensive form eliminates back-and-forth
- **Risk Reduction:** Full employment history enables better income stability assessment

### Features

#### 1.1 Multiple Employment Records
**User Story:** As an applicant, I need to provide my complete employment history so the board can verify my income stability.

**Requirements:**
- Support unlimited employment records
- Each record includes:
  - Employer name (text, required)
  - Position/Title (text, required)
  - Employment type (dropdown: Full-time, Part-time, Contract, Self-employed)
  - Start date (date picker, required)
  - End date (date picker, conditional)
  - "Current employment" checkbox (disables end date)
  - Annual income (currency, required)
  - Supervisor name (text, required)
  - Supervisor phone (tel, required)
  - Supervisor email (email, required)
- Add/Edit/Delete functionality for each record
- Chronological sorting (most recent first)
- Total annual income calculation (sum of all current employment)

**UI/UX:**
- Card-based layout for each employment record
- "+ Add Employment" button at top
- Expandable cards showing summary (employer, position, dates)
- Click to expand for full details
- Edit/Delete icons on each card
- Validation: At least 1 current employment required

**Acceptance Criteria:**
- ✅ Can add multiple employment records
- ✅ Current employment checkbox disables end date
- ✅ Income displays with proper currency formatting ($XXX,XXX)
- ✅ Total income calculates correctly
- ✅ Supervisor contact info saves correctly
- ✅ Can edit/delete any record
- ✅ Records sort chronologically
- ✅ Validation prevents submission without current employment

---

#### 1.2 Self-Employment Details
**User Story:** As a self-employed applicant, I need to provide my business details so the board can verify my income source.

**Requirements:**
- Conditional fields when employment type = "Self-employed":
  - Business name (text, required)
  - Business type (dropdown: Sole Proprietorship, LLC, S-Corp, C-Corp, Partnership)
  - Tax ID / EIN (text, required, format: XX-XXXXXXX)
  - Years in business (number, required)
  - Business address (address, required)
  - Business description (textarea, 500 chars max)
- Display only when "Self-employed" selected
- Validate Tax ID format
- Calculate years in business automatically if business start date provided

**Acceptance Criteria:**
- ✅ Self-employment fields show only when type = "Self-employed"
- ✅ All self-employment fields required when shown
- ✅ Tax ID validates format
- ✅ Business information displays in broker/admin view
- ✅ Can edit self-employment details

---

#### 1.3 Employment in Broker/Admin View
**User Story:** As a broker/admin, I need to see complete employment history to verify income and stability.

**Requirements:**
- Display all employment records in review interface
- Show calculated fields:
  - Total annual income (all current jobs)
  - Average tenure (time at each employer)
  - Employment stability score (based on number of jobs and tenure)
- Highlight incomplete employment records (missing supervisor info)
- Export employment history to PDF

**Acceptance Criteria:**
- ✅ All employment records visible in review
- ✅ Calculations accurate
- ✅ Can export to PDF
- ✅ Incomplete records highlighted

---

## 2. Real Estate Holdings

### Overview
Track applicant's current and previous real estate ownership including property details, mortgages, and rental income to assess net worth and investment experience.

### Business Value
- **For Admin/Board:** Better understanding of applicant's real estate experience and financial capacity
- **Net Worth Calculation:** Real estate equity is major component of net worth
- **Co-op Experience:** Prior ownership demonstrates understanding of property management

### Features

#### 2.1 Property Records
**User Story:** As an applicant, I need to list my property holdings so the board can assess my real estate experience and equity.

**Requirements:**
- Support multiple property records
- Each property includes:
  - Property address (full address, required)
  - Property type (dropdown: Primary Residence, Investment Property, Vacation Home, Commercial)
  - Ownership type (dropdown: Sole, Joint, Trust, LLC)
  - Purchase date (date picker, required)
  - Purchase price (currency, required)
  - Current market value (currency, required)
  - Outstanding mortgage balance (currency, default 0)
  - Monthly mortgage payment (currency)
  - Property taxes (annual, currency)
  - HOA/Condo fees (monthly, currency)
  - Rental income (monthly, currency, conditional on Investment Property)
  - Rental occupied (Yes/No, conditional)
- Calculated fields:
  - Equity = Current Value - Mortgage Balance
  - Monthly carrying cost = Mortgage + Taxes/12 + HOA
  - Net monthly income (for rentals) = Rental Income - Carrying Cost
- Add/Edit/Delete functionality

**UI/UX:**
- Card-based layout
- "+ Add Property" button
- Each card shows:
  - Property address
  - Property type badge
  - Equity amount (prominent)
  - Expand for details
- Color coding:
  - Primary Residence (blue)
  - Investment Property (green)
  - Vacation Home (purple)
- Summary panel:
  - Total properties count
  - Total equity
  - Total rental income

**Acceptance Criteria:**
- ✅ Can add multiple properties
- ✅ Equity calculates automatically
- ✅ Rental income fields show only for Investment Property
- ✅ Monthly costs calculate correctly
- ✅ Can edit/delete properties
- ✅ Summary totals accurate
- ✅ Property type badges display correctly

---

#### 2.2 Real Estate Summary
**User Story:** As a board member, I need to see total real estate holdings at a glance.

**Requirements:**
- Summary dashboard showing:
  - Total properties owned: X
  - Total property value: $X,XXX,XXX
  - Total mortgage debt: $X,XXX,XXX
  - Total real estate equity: $X,XXX,XXX
  - Total monthly rental income: $X,XXX
  - Real estate as % of net worth: XX%
- Map view (future enhancement)
- Export to PDF

**Acceptance Criteria:**
- ✅ Summary calculates correctly
- ✅ Displays prominently in admin view
- ✅ Updates in real-time when properties added/edited

---

## 3. Expanded Financial Categories

### Overview
Break down assets and liabilities into detailed categories for comprehensive financial assessment and better DTI calculations.

### Business Value
- **Better Risk Assessment:** Detailed asset breakdown shows liquidity and diversification
- **Accurate DTI:** Detailed liabilities ensure accurate debt-to-income calculations
- **Reduced RFIs:** Complete financial picture reduces need for clarification

### Features

#### 3.1 Asset Categories
**User Story:** As an applicant, I need to categorize my assets so the board can see my complete financial picture.

**Requirements:**
- Asset categories (each can have multiple entries):
  1. **Cash & Checking Accounts**
     - Institution name
     - Account type
     - Balance
  2. **Savings & Money Market**
     - Institution name
     - Account type
     - Balance
     - Interest rate (optional)
  3. **Stocks, Bonds & Mutual Funds**
     - Type (Stock, Bond, Mutual Fund, ETF, Index Fund)
     - Institution/Brokerage
     - Current value
     - Cost basis (optional)
  4. **Retirement Accounts**
     - Account type (401k, IRA, Roth IRA, Pension, etc.)
     - Institution
     - Current balance
     - Vested amount (if different)
  5. **Cryptocurrency**
     - Asset type (Bitcoin, Ethereum, etc.)
     - Current value
     - Platform/wallet
  6. **Business Interests**
     - Business name
     - Ownership percentage
     - Valuation
     - Annual income from business
  7. **Vehicles**
     - Make/Model/Year
     - Current value
     - Loan balance (if any)
  8. **Other Assets**
     - Description
     - Current value

- For each category:
  - Add multiple entries
  - Edit/delete entries
  - Category subtotals
- **Total Assets** = Sum of all categories

**UI/UX:**
- Accordion layout (categories collapsible)
- Each category shows:
  - Category name + icon
  - Subtotal (prominent)
  - Entry count
  - "+ Add [Category]" button
- Expandable to show entries
- Grand total at bottom (sticky)

**Acceptance Criteria:**
- ✅ All 8 categories available
- ✅ Can add multiple entries per category
- ✅ Category subtotals calculate correctly
- ✅ Grand total = sum of all categories
- ✅ Edit/delete works for entries
- ✅ Currency formatting consistent
- ✅ Negative values not allowed

---

#### 3.2 Liability Categories
**User Story:** As an applicant, I need to list all my debts so the board can calculate my debt-to-income ratio accurately.

**Requirements:**
- Liability categories (each can have multiple entries):
  1. **Credit Card Debt**
     - Card issuer
     - Current balance
     - Credit limit
     - Minimum monthly payment
  2. **Auto Loans**
     - Vehicle
     - Lender
     - Original loan amount
     - Current balance
     - Monthly payment
     - Maturity date
  3. **Student Loans**
     - Loan type (Federal, Private)
     - Lender
     - Current balance
     - Monthly payment
     - In deferment (Yes/No)
  4. **Personal Loans**
     - Lender
     - Purpose
     - Current balance
     - Monthly payment
     - Maturity date
  5. **Other Debts**
     - Description
     - Current balance
     - Monthly payment

- For each category:
  - Add multiple entries
  - Edit/delete entries
  - Category subtotals
- **Total Liabilities** = Sum of all categories
- **Total Monthly Debt Payment** = Sum of all monthly payments

**Acceptance Criteria:**
- ✅ All 5 categories available
- ✅ Can add multiple entries per category
- ✅ Category subtotals calculate correctly
- ✅ Total liabilities accurate
- ✅ Total monthly debt payment accurate
- ✅ Edit/delete works
- ✅ Currency formatting consistent

---

#### 3.3 Financial Summary Dashboard
**User Story:** As a board member, I need to see key financial metrics at a glance.

**Requirements:**
- Summary metrics:
  - **Total Assets:** $X,XXX,XXX
  - **Total Liabilities:** $X,XXX,XXX
  - **Net Worth:** $X,XXX,XXX (Assets - Liabilities)
  - **Liquid Assets:** $XXX,XXX (Cash + Savings + Stocks)
  - **Total Annual Income:** $XXX,XXX
  - **Total Monthly Debt:** $X,XXX
  - **Debt-to-Income Ratio:** XX.X%
  - **Liquid Assets / Annual Rent:** X.X years
  - **Net Worth / Annual Rent:** X.X years
- Color coding:
  - Green: Excellent (DTI <30%, Liquid >3 years rent)
  - Yellow: Acceptable (DTI 30-40%, Liquid 1-3 years)
  - Red: Concern (DTI >40%, Liquid <1 year)
- Export to PDF

**Acceptance Criteria:**
- ✅ All metrics calculate correctly
- ✅ Color coding applies appropriately
- ✅ Updates in real-time
- ✅ Displays prominently in admin review
- ✅ Export includes full breakdown

---

## 4. Building Policies Display

### Overview
Display building-specific policies and rules to applicants before they start the application, ensuring informed consent and reducing surprises during review.

### Business Value
- **Transparency:** Applicants understand requirements upfront
- **Reduced Dropouts:** Fewer applicants withdraw after learning of restrictions
- **Compliance:** Clear acknowledgment of policy understanding
- **Legal Protection:** Documented acceptance of building rules

### Features

#### 4.1 Policy Display Screen
**User Story:** As an applicant, I need to review building policies before applying so I understand all requirements and restrictions.

**Requirements:**
- Display screen before application begins
- Policy sections:
  1. **Pet Policy**
     - Pets allowed (Yes/No)
     - Pet types allowed (Dogs, Cats, Birds, etc.)
     - Size restrictions
     - Breed restrictions
     - Pet deposit amount
     - Monthly pet fee
  2. **Alteration Policy**
     - Alteration approval process
     - Prohibited alterations
     - Required approvals
     - Restoration requirements
  3. **Subletting Policy**
     - Subletting allowed (Yes/No)
     - Maximum sublet period
     - Sublet approval process
     - Sublet fees
  4. **Move-in/Move-out Policy**
     - Permitted days/times
     - Elevator reservation
     - Deposit requirements
     - Insurance requirements
  5. **Financial Requirements**
     - Minimum income (X times monthly rent)
     - Minimum liquid assets (X months rent)
     - Minimum net worth (X times purchase price for co-ops)
     - Down payment requirements
  6. **Other Building Rules**
     - Noise restrictions
     - Common area usage
     - Parking rules
     - Guest policies
     - Any other building-specific rules

- PDF download option for each policy
- "I have read and understand the building policies" checkbox
- Cannot proceed without acknowledging

**UI/UX:**
- Clean, readable layout
- Policy sections with icons
- Expandable sections (accordion)
- Prominent acknowledge checkbox at bottom
- "Continue to Application" button (disabled until acknowledged)
- "Download All Policies" button (PDF)

**Acceptance Criteria:**
- ✅ All policy sections display
- ✅ Building-specific policies load correctly
- ✅ PDF download works
- ✅ Cannot proceed without acknowledgment
- ✅ Acknowledgment saves with timestamp
- ✅ Can review policies again later in application

---

#### 4.2 Building Policy Management (Admin)
**User Story:** As an admin, I need to configure building policies for each property.

**Requirements:**
- Admin interface to edit policies per building
- WYSIWYG editor for policy text
- Upload PDF versions of policies
- Set required vs. optional policies
- Version control (track policy changes)
- Effective date for policy updates

**Acceptance Criteria:**
- ✅ Can edit policies per building
- ✅ Changes save correctly
- ✅ Version history maintained
- ✅ PDF uploads work
- ✅ Updates reflect immediately for new applications

---

## 5. Additional Acknowledgements

### Overview
Add 8 comprehensive acknowledgement forms to cover all legal requirements, authorizations, and declarations needed for complete application processing.

### Business Value
- **Legal Compliance:** Full authorization for background checks, credit checks, verifications
- **Risk Mitigation:** Clear consent reduces legal liability
- **Complete Application:** All authorizations collected upfront

### Acknowledgement Forms

#### 5.1 Personal Information Authorization
**Purpose:** Authorize use and verification of personal information

**Content:**
```
I hereby authorize [Building Name] and its authorized representatives to collect, use, and verify my personal information as submitted in this application for the purpose of evaluating my application for residency.

I understand that this information may be shared with:
- The building's managing agent
- The co-op board or condo association
- Third-party verification services
- Credit reporting agencies
- Background check providers

I certify that all information provided is true and accurate to the best of my knowledge.

☐ I acknowledge and agree to the above

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- Electronic signature capture
- Date auto-filled
- Cannot submit application without

---

#### 5.2 Credit Check Authorization
**Purpose:** Authorize credit report pull

**Content:**
```
I authorize [Building Name] and its authorized representatives to obtain my consumer credit report from one or more credit reporting agencies for the purpose of evaluating my application.

I understand that:
- This will result in a hard inquiry on my credit report
- The inquiry may temporarily affect my credit score
- My credit information will be kept confidential
- The credit report will be used solely for application evaluation

Social Security Number: XXX-XX-XXXX (last 4 digits shown)

☐ I authorize the credit check

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- SSN field (encrypted, masked)
- Electronic signature
- Cannot submit without

---

#### 5.3 Background Check Consent
**Purpose:** Authorize criminal and civil background check

**Content:**
```
I hereby consent to a comprehensive background check including:
- Criminal history records
- Civil court records
- Eviction history
- Sex offender registry check
- Terrorist watch list screening

I understand that:
- This information will be obtained from public records and third-party services
- Adverse findings may result in application denial
- I have the right to dispute any inaccurate information
- The background check results will be kept confidential

☐ I consent to the background check

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- Electronic signature
- Link to Fair Credit Reporting Act rights
- Cannot submit without

---

#### 5.4 Reference Contact Authorization
**Purpose:** Authorize contact with references

**Content:**
```
I authorize [Building Name] and its authorized representatives to contact the references I have provided in this application, including:
- Current and former landlords
- Personal references
- Professional references

I authorize these references to disclose information about:
- My rental history and payment record
- My character and conduct
- Any other relevant information

I release my references and [Building Name] from any liability arising from such disclosures.

☐ I authorize contact with my references

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- Electronic signature
- Links to reference section
- Cannot submit without

---

#### 5.5 Employment Verification Authorization
**Purpose:** Authorize contact with current/former employers

**Content:**
```
I authorize [Building Name] and its authorized representatives to contact my current and former employers to verify:
- Employment dates
- Position and title
- Compensation and income
- Employment status and performance

I authorize my employers to disclose this information and release them from any liability.

I understand that employment verification is a standard part of the application process.

☐ I authorize employment verification

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- Electronic signature
- Links to employment section
- Cannot submit without

---

#### 5.6 Financial Statement Verification
**Purpose:** Authorize verification of financial information

**Content:**
```
I authorize [Building Name] and its authorized representatives to verify my financial information with:
- Banks and financial institutions
- Investment firms and brokers
- Accountants and tax professionals
- Any other relevant financial sources

I authorize these institutions to disclose:
- Account balances and history
- Investment holdings and values
- Income and tax information

I understand that I may be required to provide additional documentation to support my financial statements.

☐ I authorize financial verification

Signature: _________________ Date: _________
```

**Implementation:**
- Checkbox required
- Electronic signature
- Links to financial section
- Cannot submit without

---

#### 5.7 Pet Ownership Declaration
**Purpose:** Declare pet ownership (conditional on building policy)

**Content:**
```
Building Pet Policy: [Display from Building Policies]

Pet Ownership:
☐ I do not currently own any pets
☐ I currently own the following pet(s):

[If pets owned, display form:]
Pet 1:
- Type: [Dog/Cat/Bird/Other]
- Breed: _______________
- Weight: _______ lbs
- Age: _______ years
- Name: _______________
- Service/Emotional Support Animal: Yes/No
  [If yes, documentation required]

[+ Add Another Pet]

I certify that:
- All pet information provided is accurate
- I will comply with all building pet policies
- I understand that unauthorized pets may result in lease violation or application denial
- I will pay all required pet deposits and fees

Pet Deposit: $_______ (if applicable)
Monthly Pet Fee: $_______ (if applicable)

☐ I agree to the pet policy and certify the above information

Signature: _________________ Date: _________
```

**Implementation:**
- Conditional: Only shows if building allows pets
- Radio buttons for pet ownership
- Expandable pet entry form
- Support for multiple pets
- Service animal documentation upload
- Calculates pet fees
- Checkbox required if pets owned

---

#### 5.8 Move-in Date Commitment
**Purpose:** Commit to proposed move-in date

**Content:**
```
Proposed Move-in Date: [Date Picker]

I understand that:
- This is my requested move-in date
- Actual move-in date is subject to board approval and lease execution
- I must be ready to move in within 30 days of board approval
- Moving is permitted only on: [Building rules: e.g., weekdays 9am-5pm]
- I must reserve the service elevator at least 48 hours in advance
- I may be required to provide a move-in deposit of $_______ (refundable)
- I must provide proof of renter's/homeowner's insurance before move-in

I commit to being available for my proposed move-in date or a mutually agreed alternative.

☐ I acknowledge and commit to the move-in requirements

Signature: _________________ Date: _________
```

**Implementation:**
- Date picker (min: 30 days from today, max: 6 months)
- Display building move-in rules
- Calculate move-in deposit
- Checkbox required
- Electronic signature

---

### Acknowledgements Implementation

**Technical Requirements:**
- All acknowledgements in separate section of application
- Progress indicator showing X of 8 completed
- Each acknowledgement on separate screen or expandable panel
- Electronic signature capture (typed name + date)
- Timestamp all acknowledgements
- Validation: Cannot submit application unless all required acknowledgements completed
- Display all acknowledgements in broker/admin review
- Export acknowledgements to PDF for records

**Acceptance Criteria:**
- ✅ All 8 acknowledgements display
- ✅ All checkboxes functional
- ✅ Electronic signature captures
- ✅ Timestamps save correctly
- ✅ Conditional logic works (pet form)
- ✅ Cannot submit without completing all
- ✅ Validation messages clear
- ✅ Displays in review interface
- ✅ Export to PDF works

---

## 6. Cover Letter / Personal Introduction

### Overview
Allow applicants to write a personal introduction / cover letter to the board, providing context about themselves, their background, and why they want to live in the building.

### Business Value
- **Personal Connection:** Board members get to know applicant beyond numbers
- **Differentiation:** Applicants can highlight unique qualities
- **Cultural Fit:** Helps assess community fit
- **Board Preference:** Many boards highly value personal statements

### Features

#### 6.1 Cover Letter Editor
**User Story:** As an applicant, I want to introduce myself to the board with a personal letter.

**Requirements:**
- Text area for cover letter
- Character limit: 2000 characters (approximately 300-400 words)
- Character counter (live)
- Optional rich text formatting:
  - Bold, italic
  - Paragraphs (auto-preserve line breaks)
- Save draft functionality
- Preview mode
- Template/examples link
- Tips/guidelines:
  - Introduce yourself and family
  - Explain why you want to live in the building
  - Highlight financial stability and responsibility
  - Mention community involvement
  - Keep professional and concise

**UI/UX:**
- Full-width text area
- Character counter (updates as you type)
- Shows: "237 / 2000 characters"
- Turns yellow at 1800 (approaching limit)
- Turns red at 2000 (at limit)
- "Save Draft" button
- "Preview" button (shows formatted view)
- "View Examples" link (opens modal with sample letters)

**Sample Template Provided:**
```
Dear [Building Name] Board of Directors,

I am writing to introduce myself and express my sincere interest in joining your community at [Building Address].

[Paragraph about yourself: profession, family, background]

[Paragraph about why this building: location, amenities, community]

[Paragraph about financial responsibility and stability]

[Paragraph about community involvement and being a good neighbor]

Thank you for considering my application. I look forward to the opportunity to become part of your community.

Sincerely,
[Your Name]
```

**Acceptance Criteria:**
- ✅ Text area functional with 2000 char limit
- ✅ Character counter updates in real-time
- ✅ Color coding works
- ✅ Cannot exceed 2000 characters
- ✅ Save draft works
- ✅ Preview shows formatted text
- ✅ Examples link works
- ✅ Paragraph breaks preserved

---

#### 6.2 Cover Letter in Review
**User Story:** As a board member, I want to read the applicant's personal introduction.

**Requirements:**
- Display cover letter prominently in review interface
- Separate tab or section: "Personal Introduction"
- Formatted text display (preserve paragraphs)
- Character count shown
- Print/Export option
- Ability to comment on letter

**Acceptance Criteria:**
- ✅ Cover letter displays in review
- ✅ Formatting preserved
- ✅ Easy to read and navigate
- ✅ Print option works
- ✅ Can add comments

---

## 7. Left Sidebar Navigation

### Overview
Add persistent left sidebar navigation showing all application sections, completion status, and allowing quick navigation between sections.

### Business Value
- **Improved UX:** Easy navigation reduces time-to-complete by 15%
- **Progress Visibility:** Applicants see what's complete vs. incomplete
- **Reduced Dropoffs:** Clear progress motivates completion
- **Faster Review:** Admins can jump to specific sections

### Features

#### 7.1 Sidebar Structure
**User Story:** As an applicant, I want to easily navigate between application sections and see my progress.

**Requirements:**
- Fixed left sidebar (sticky)
- Section list (in order):
  1. Application Info
  2. Personal Information
  3. Employment
  4. Financial Information
  5. Real Estate Holdings
  6. Documents
  7. References
  8. Acknowledgements
  9. Building Policies
  10. Personal Introduction
  11. Review & Submit

- For each section:
  - Section icon
  - Section name
  - Status indicator:
    - ⚪ Not Started (gray circle)
    - 🟡 In Progress (yellow circle)
    - 🟢 Complete (green checkmark)
    - 🔴 Needs Attention (red exclamation)
  - Click to navigate

- Current section:
  - Highlighted background
  - Bold text
  - Indicator line/border

**UI/UX:**
- Width: 240px
- Background: Slightly darker than main content
- Icons: 20x20px, consistent style
- Status indicators: 16x16px, right-aligned
- Hover effect on sections
- Click to navigate (smooth scroll or instant)
- Mobile: Collapsible (hamburger menu)
- Z-index: Always on top

**Acceptance Criteria:**
- ✅ Sidebar displays on all application pages
- ✅ All sections listed in correct order
- ✅ Icons display correctly
- ✅ Status indicators accurate
- ✅ Current section highlighted
- ✅ Click navigation works
- ✅ Sticky positioning works (follows scroll)
- ✅ Mobile version collapsible

---

#### 7.2 Section Status Logic
**Requirements:**
- **Not Started:** Section never opened or no data saved
- **In Progress:** At least one field filled but required fields missing
- **Complete:** All required fields filled
- **Needs Attention:** Validation errors or admin requested changes

**Status Updates:**
- Real-time: Updates immediately when data saved
- Persists across sessions
- Visible to all roles (applicant, broker, admin)

**Acceptance Criteria:**
- ✅ Status calculates correctly
- ✅ Updates in real-time
- ✅ Persists correctly
- ✅ Validation triggers "Needs Attention"

---

#### 7.3 Progress Indicator
**Requirements:**
- At top of sidebar:
  - "Application Progress"
  - Progress bar: X% complete
  - "X of 11 sections complete"
- Calculation: (Complete sections / Total sections) × 100%
- Visual progress bar (filled portion green)

**Acceptance Criteria:**
- ✅ Progress calculates correctly
- ✅ Updates in real-time
- ✅ Progress bar visual matches percentage
- ✅ Motivates completion

---

#### 7.4 Mobile Sidebar
**Requirements:**
- Screen width < 768px: Sidebar collapses
- Hamburger icon (☰) in top-left
- Tap hamburger: Sidebar slides in from left
- Overlay dims main content
- Tap outside or section: Sidebar slides out
- Maintain all functionality

**Acceptance Criteria:**
- ✅ Collapses at correct breakpoint
- ✅ Hamburger icon visible
- ✅ Slide animation smooth
- ✅ All navigation works
- ✅ Closes appropriately
- ✅ Doesn't block content

---

## 8. Application Age & Activity Tracking

### Overview
Track application age (time since submission) and last activity to help admins prioritize reviews and identify stale applications.

### Business Value
- **SLA Management:** Ensure timely processing
- **Prioritization:** Focus on oldest or most urgent applications
- **Process Improvement:** Identify bottlenecks
- **Applicant Satisfaction:** Faster review times

### Features

#### 8.1 Age Calculation
**User Story:** As an admin, I need to see how old each application is to prioritize my review queue.

**Requirements:**
- **Age:** Days since application submission
- Calculation: Today - Submission Date
- Display in application list (table column)
- Color coding:
  - 0-7 days: Normal (no color)
  - 8-14 days: Warning (yellow background)
  - 15+ days: Urgent (red background)
- Sortable column (ascending/descending)
- Filter: "Show applications >7 days old"

**Acceptance Criteria:**
- ✅ Age calculates correctly
- ✅ Updates daily (shows current age)
- ✅ Color coding applies correctly
- ✅ Sortable
- ✅ Filter works

---

#### 8.2 Last Activity Tracking
**User Story:** As an admin, I need to see when the last activity occurred on an application.

**Requirements:**
- **Last Activity:** Timestamp of most recent change
- Track all activity types:
  - Section save
  - Document upload
  - Status change
  - Comment added
  - RFI sent/responded
  - Decision made
- Display:
  - In application list: "Last Activity" column
  - Format: "2 hours ago", "3 days ago", "1 week ago"
  - Full timestamp on hover
- Who: Show who made last change (applicant/broker/admin name)
- Sortable column

**Acceptance Criteria:**
- ✅ Last activity timestamp accurate
- ✅ All activity types tracked
- ✅ Relative time displays correctly
- ✅ Full timestamp on hover
- ✅ User attribution works
- ✅ Sortable

---

#### 8.3 Activity Timeline (Detail View)
**User Story:** As an admin, I want to see the complete activity history for an application.

**Requirements:**
- In application detail view: "Activity" tab
- Timeline view (most recent first):
  - Timestamp
  - User (name + role)
  - Action type (icon + description)
  - Details (what changed)
- Activity types:
  - Application created
  - Section completed
  - Document uploaded
  - Document deleted
  - Status changed
  - Comment added
  - RFI sent
  - RFI responded
  - Decision made
  - Email sent
- Filterable by:
  - Activity type
  - User
  - Date range
- Export timeline to PDF

**Acceptance Criteria:**
- ✅ Complete timeline shows
- ✅ All activity types logged
- ✅ Timestamps accurate
- ✅ User attribution correct
- ✅ Filters work
- ✅ Export works

---

#### 8.4 Dashboard Metrics
**Requirements:**
- Admin dashboard metrics:
  - Average review time (application age)
  - Applications >14 days old (urgent count)
  - Applications with no activity in 7 days (stale count)
  - Fastest review time (this month)
  - Slowest review time (this month)
- Charts:
  - Application age distribution (histogram)
  - Review time trend (line chart)

**Acceptance Criteria:**
- ✅ All metrics calculate correctly
- ✅ Charts display accurately
- ✅ Updates in real-time

---

## Technical Implementation

### Database Schema Changes

#### Employment Table
```sql
CREATE TABLE employment_records (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  employer_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Self-employed'),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  annual_income DECIMAL(12,2) NOT NULL,
  supervisor_name VARCHAR(255),
  supervisor_phone VARCHAR(20),
  supervisor_email VARCHAR(255),
  -- Self-employment fields
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  tax_id VARCHAR(20),
  years_in_business INT,
  business_address TEXT,
  business_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Real Estate Table
```sql
CREATE TABLE real_estate_holdings (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  property_address TEXT NOT NULL,
  property_type ENUM('Primary Residence', 'Investment Property', 'Vacation Home', 'Commercial'),
  ownership_type ENUM('Sole', 'Joint', 'Trust', 'LLC'),
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  mortgage_balance DECIMAL(12,2) DEFAULT 0,
  monthly_payment DECIMAL(10,2),
  property_taxes DECIMAL(10,2),
  hoa_fees DECIMAL(10,2),
  rental_income DECIMAL(10,2),
  rental_occupied BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  category ENUM('Cash', 'Savings', 'Stocks', 'Retirement', 'Crypto', 'Business', 'Vehicles', 'Other'),
  description TEXT,
  institution VARCHAR(255),
  account_type VARCHAR(100),
  current_value DECIMAL(12,2) NOT NULL,
  additional_details JSONB, -- Flexible for category-specific fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Liabilities Table
```sql
CREATE TABLE liabilities (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  category ENUM('Credit Card', 'Auto Loan', 'Student Loan', 'Personal Loan', 'Other'),
  description TEXT,
  lender VARCHAR(255),
  current_balance DECIMAL(12,2) NOT NULL,
  monthly_payment DECIMAL(10,2),
  additional_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Acknowledgements Table
```sql
CREATE TABLE acknowledgements (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  acknowledgement_type VARCHAR(100) NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  signature VARCHAR(255),
  acknowledged_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Applications Table Updates
```sql
ALTER TABLE applications ADD COLUMN cover_letter TEXT;
ALTER TABLE applications ADD COLUMN submitted_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN last_activity_at TIMESTAMP DEFAULT NOW();
ALTER TABLE applications ADD COLUMN last_activity_by VARCHAR(255);
```

#### Activity Log Table
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  section VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_application ON activity_log(application_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
```

---

### API Endpoints

#### Employment
- `POST /api/applications/:id/employment` - Add employment record
- `PUT /api/applications/:id/employment/:employmentId` - Update employment
- `DELETE /api/applications/:id/employment/:employmentId` - Delete employment
- `GET /api/applications/:id/employment` - Get all employment records

#### Real Estate
- `POST /api/applications/:id/real-estate` - Add property
- `PUT /api/applications/:id/real-estate/:propertyId` - Update property
- `DELETE /api/applications/:id/real-estate/:propertyId` - Delete property
- `GET /api/applications/:id/real-estate` - Get all properties

#### Financial
- `POST /api/applications/:id/assets` - Add asset
- `PUT /api/applications/:id/assets/:assetId` - Update asset
- `DELETE /api/applications/:id/assets/:assetId` - Delete asset
- `GET /api/applications/:id/assets` - Get all assets
- `POST /api/applications/:id/liabilities` - Add liability
- `PUT /api/applications/:id/liabilities/:liabilityId` - Update liability
- `DELETE /api/applications/:id/liabilities/:liabilityId` - Delete liability
- `GET /api/applications/:id/liabilities` - Get all liabilities
- `GET /api/applications/:id/financial-summary` - Get calculated summary

#### Acknowledgements
- `POST /api/applications/:id/acknowledgements` - Save acknowledgement
- `GET /api/applications/:id/acknowledgements` - Get all acknowledgements

#### Cover Letter
- `PUT /api/applications/:id/cover-letter` - Save/update cover letter
- `GET /api/applications/:id/cover-letter` - Get cover letter

#### Activity Tracking
- `GET /api/applications/:id/activity` - Get activity timeline
- `POST /api/applications/:id/activity` - Log activity (internal)

---

### TypeScript Type Updates

```typescript
// lib/types.ts

export interface EmploymentRecord {
  id: string;
  applicationId: string;
  employerName: string;
  position: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Self-employed';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  annualIncome: number;
  supervisorName: string;
  supervisorPhone: string;
  supervisorEmail: string;
  // Self-employment
  businessName?: string;
  businessType?: string;
  taxId?: string;
  yearsInBusiness?: number;
  businessAddress?: string;
  businessDescription?: string;
}

export interface RealEstateHolding {
  id: string;
  applicationId: string;
  propertyAddress: string;
  propertyType: 'Primary Residence' | 'Investment Property' | 'Vacation Home' | 'Commercial';
  ownershipType: 'Sole' | 'Joint' | 'Trust' | 'LLC';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  mortgageBalance: number;
  monthlyPayment?: number;
  propertyTaxes?: number;
  hoaFees?: number;
  rentalIncome?: number;
  rentalOccupied?: boolean;
}

export interface Asset {
  id: string;
  applicationId: string;
  category: 'Cash' | 'Savings' | 'Stocks' | 'Retirement' | 'Crypto' | 'Business' | 'Vehicles' | 'Other';
  description: string;
  institution?: string;
  accountType?: string;
  currentValue: number;
  additionalDetails?: Record<string, any>;
}

export interface Liability {
  id: string;
  applicationId: string;
  category: 'Credit Card' | 'Auto Loan' | 'Student Loan' | 'Personal Loan' | 'Other';
  description: string;
  lender?: string;
  currentBalance: number;
  monthlyPayment?: number;
  additionalDetails?: Record<string, any>;
}

export interface Acknowledgement {
  id: string;
  applicationId: string;
  acknowledgementType: string;
  acknowledged: boolean;
  signature?: string;
  acknowledgedAt?: string;
  ipAddress?: string;
}

export interface Activity {
  id: string;
  applicationId: string;
  userId: string;
  userName: string;
  userRole: string;
  activityType: string;
  description: string;
  section?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Application {
  // ... existing fields ...
  coverLetter?: string;
  submittedAt?: string;
  lastActivityAt: string;
  lastActivityBy?: string;
  // Calculated fields
  applicationAge?: number; // days
  lastActivityRelative?: string; // "2 hours ago"
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number;
  totalAnnualIncome: number;
  totalMonthlyDebt: number;
  debtToIncomeRatio: number;
  liquidAssetsToRentRatio: number;
  netWorthToRentRatio: number;
}

export interface SectionStatus {
  section: string;
  status: 'not-started' | 'in-progress' | 'complete' | 'needs-attention';
  completionPercentage: number;
}
```

---

## User Experience Guidelines

### Design Principles
1. **Progressive Disclosure:** Show advanced options only when needed
2. **Clear Progress:** Always show where user is in the process
3. **Validation:** Provide helpful, specific error messages
4. **Mobile-First:** Ensure all features work on mobile
5. **Accessibility:** WCAG 2.1 AA compliance

### UI Components
- Use shadcn/ui components for consistency
- Maintain Philter brand colors and typography
- Icons from lucide-react
- Responsive breakpoints: 640px, 768px, 1024px, 1280px

### Loading States
- Skeleton loaders for data fetching
- Progress indicators for uploads
- Optimistic UI updates where appropriate

### Error Handling
- User-friendly error messages
- Fallback UI for failed states
- Retry mechanisms for network errors

---

## Rollout Plan

### Phase 2A (Weeks 1-4)
- Enhanced Employment Section
- Real Estate Holdings
- Expanded Financial Categories
- Internal testing

### Phase 2B (Weeks 5-8)
- Building Policies Display
- Additional Acknowledgements
- Cover Letter
- Beta testing with select brokers

### Phase 2C (Weeks 9-10)
- Left Sidebar Navigation
- Application Age & Activity Tracking
- Full integration testing
- Documentation and training

### Success Metrics (Post-Launch)
- Application completion rate: >85%
- Average time-to-complete: <45 minutes
- RFI reduction: >30%
- User satisfaction: >4.5/5
- Application quality score: >80%

---

## Appendix

### Competitor Feature Comparison

| Feature | Philter (Phase 2) | Nestseekers | The Screening Co. |
|---------|------------------|-------------|-------------------|
| Multiple Employment | ✅ Unlimited | ✅ Up to 3 | ✅ Up to 2 |
| Self-Employment Details | ✅ Full | ⚠️ Limited | ⚠️ Limited |
| Real Estate Holdings | ✅ Unlimited | ✅ Up to 5 | ❌ No |
| Detailed Assets/Liabilities | ✅ 8 categories | ⚠️ 4 categories | ⚠️ 3 categories |
| Building Policies Display | ✅ Yes | ❌ No | ❌ No |
| Acknowledgements | ✅ 8 forms | ⚠️ 4 forms | ⚠️ 3 forms |
| Cover Letter | ✅ Yes | ⚠️ Limited | ❌ No |
| Progress Navigation | ✅ Sidebar | ⚠️ Top tabs | ⚠️ Top tabs |
| Activity Tracking | ✅ Full timeline | ❌ No | ⚠️ Limited |

**Legend:**
- ✅ Full feature
- ⚠️ Partial/Limited
- ❌ Not available

### Glossary
- **DTI:** Debt-to-Income Ratio
- **RFI:** Request for Information
- **SLA:** Service Level Agreement
- **Co-op:** Cooperative housing
- **HOA:** Homeowners Association

---

**Document End**
