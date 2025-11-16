# Admin Guide - Phase 2 Features

**Version:** 2.0
**Last Updated:** November 16, 2025
**For:** Admin/Agent Users
**Phase:** Phase 2 - Important Enhancements

---

## Table of Contents

1. [Introduction](#introduction)
2. [Dashboard Enhancements](#dashboard-enhancements)
3. [Reviewing Enhanced Applications](#reviewing-enhanced-applications)
4. [Acknowledgements Review](#acknowledgements-review)
5. [Building Policies Management](#building-policies-management)
6. [Activity Tracking](#activity-tracking)
7. [Expedited Applications](#expedited-applications)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the Phase 2 Admin Guide! This release introduces significant enhancements to help you review applications more efficiently and thoroughly.

### What's New in Phase 2

✅ **Enhanced Employment Section** - Complete employment history with supervisor contacts
✅ **Real Estate Holdings** - Track applicant property ownership and equity
✅ **Expanded Financial Data** - Detailed assets and liabilities in 8+ categories
✅ **Building Policies** - Display and track policy acknowledgment
✅ **8 New Acknowledgements** - Comprehensive authorization forms
✅ **Cover Letters** - Personal introduction from applicants
✅ **Activity Tracking** - See application age and recent activity
✅ **Expedited Review** - Priority processing option for applicants

### Who Should Read This Guide

- Admin/Agent users who review applications
- Building managers
- QA reviewers
- Anyone involved in application processing

---

## Dashboard Enhancements

### New Dashboard Columns

#### Application Age
**What it shows:** Number of days since application was submitted

**How to use it:**
1. View the "Age" column in your application list
2. Color coding helps prioritize:
   - **Normal (0-7 days):** No color - within standard review time
   - **Warning (8-14 days):** Yellow background - approaching deadline
   - **Urgent (15+ days):** Red background - overdue for review
3. Click column header to sort by age (oldest first recommended)

**Best Practice:** Review applications >14 days first to maintain SLA compliance

---

#### Last Activity
**What it shows:** When the last change was made to the application

**How to use it:**
1. View the "Last Activity" column
2. Displays relative time: "2 hours ago", "3 days ago"
3. Hover for exact timestamp
4. Shows who made the change (applicant, broker, or admin name)
5. Sort by last activity to find recently updated applications

**Use cases:**
- Identify stale applications (no activity in 7+ days)
- Find applications waiting for your review (recent applicant activity)
- Track broker QA progress (broker activity)

---

### Filtering and Sorting

#### Filter by Age
```
Filters menu → Age → Select range:
- Last 7 days
- 8-14 days
- 15+ days (Urgent)
- Custom range
```

#### Filter by Expedited Status
```
Filters menu → Expedited Review → ☑ Show expedited only
```

#### Recommended Sort Order
1. **Expedited first** (due to SLA commitment)
2. **Then by Age** (oldest first)
3. **Then by Status** (In Review before Submitted)

---

### Dashboard Metrics

**New metrics displayed:**
- **Applications >14 days:** Count of urgent/overdue applications
- **Avg Review Time:** Average days from submission to decision
- **Expedited SLA Compliance:** % of expedited applications reviewed within 1-2 days
- **Applications by Age:** Chart showing age distribution

**How to use metrics:**
- Monitor SLA compliance
- Identify process bottlenecks
- Report performance to management

---

## Reviewing Enhanced Applications

### Navigation: Left Sidebar

All applications now include a left sidebar for easy navigation:

**Sidebar Sections:**
1. Application Info
2. Personal Information
3. Employment ⭐ (Enhanced)
4. Financial Information ⭐ (Enhanced)
5. Real Estate Holdings ⭐ (New)
6. Documents
7. References
8. Acknowledgements ⭐ (Enhanced - 8 forms)
9. Building Policies ⭐ (New)
10. Personal Introduction ⭐ (New)
11. Review & Submit

**Section Status Indicators:**
- 🟢 **Green checkmark:** Section complete
- 🟡 **Yellow dot:** In progress (incomplete)
- 🔴 **Red exclamation:** Needs attention (errors or RFI)
- ⚪ **Gray circle:** Not started

**How to use:**
- Click any section to navigate directly
- Current section is highlighted
- Use status indicators to identify incomplete sections

---

### Enhanced Employment Review

#### What's New
Applicants now provide:
- **Multiple employment records** (current + previous)
- **Supervisor contact information** for verification
- **Self-employment details** (business name, Tax ID, etc.)
- **Complete employment history** (dates, positions, income)

#### How to Review

**Step 1: Employment Summary**
- Navigate to "Employment" section
- Review employment timeline (chronological order)
- Check **Total Annual Income** calculation
- Verify current employment status

**Step 2: Verify Each Employment Record**

For each job, check:
- ✅ Employer name is legitimate (Google search if unfamiliar)
- ✅ Position/title matches industry norms
- ✅ Employment dates are logical (no overlaps, no gaps)
- ✅ Income is reasonable for position/location
- ✅ Supervisor contact info provided (name, phone, email)

**Step 3: Self-Employment (if applicable)**

If applicant is self-employed, verify:
- ✅ Business name provided
- ✅ Tax ID/EIN format valid (XX-XXXXXXX)
- ✅ Business type specified
- ✅ Years in business reasonable
- ✅ Income documentation attached (tax returns, 1099s)

**Red Flags:**
- ⚠️ Employment gaps >6 months (unexplained)
- ⚠️ Too many job changes (>3 in 2 years)
- ⚠️ Income seems inflated for position
- ⚠️ Missing supervisor contact info
- ⚠️ Overlapping employment dates
- ⚠️ Self-employment without documentation

**Actions:**
- **Request Employment Verification:** Click "Request Verification" button to contact supervisor
- **Send RFI:** If information incomplete or questionable
- **Add Note:** Document any concerns for board review

---

### Real Estate Holdings Review

#### What's New
Applicants now disclose all real estate holdings including:
- Property addresses and types
- Purchase prices and current values
- Mortgage balances and monthly payments
- Rental income (for investment properties)
- Calculated equity per property

#### How to Review

**Step 1: Real Estate Summary**
- Navigate to "Real Estate Holdings" section
- Review summary metrics:
  - Total properties owned
  - Total real estate value
  - Total mortgage debt
  - **Total real estate equity**
  - Monthly rental income

**Step 2: Verify Each Property**

For each property, check:
- ✅ Address is complete and valid
- ✅ Property type appropriate (Primary, Investment, Vacation)
- ✅ Purchase date and price reasonable
- ✅ Current value realistic (compare to Zillow/recent sales)
- ✅ Mortgage balance ≤ Current value (equity positive)
- ✅ Monthly payment reasonable for loan amount
- ✅ For investment properties: Rental income documented

**Step 3: Assess Real Estate Experience**
- Previous ownership shows financial responsibility
- Investment properties show sophistication
- Positive equity shows wealth building
- Rental management experience relevant for co-op living

**Red Flags:**
- ⚠️ Negative equity (underwater mortgage)
- ⚠️ Very recent purchase (cash flow concern)
- ⚠️ Investment property with no rental income (vacancy?)
- ⚠️ Inflated current values
- ⚠️ Missing property tax information

**Use in Decision:**
- Real estate equity is part of net worth
- Prior ownership = real estate experience
- Investment properties = financial sophistication
- Mortgage payment history = creditworthiness indicator

---

### Expanded Financial Information Review

#### What's New
Detailed breakdown of assets and liabilities across 8+ categories with automatic calculations.

#### Assets Review

**Navigate to:** Financial Information → Assets

**Categories to review:**
1. **Cash & Checking** - Immediate liquidity
2. **Savings & Money Market** - Near-term liquidity
3. **Stocks, Bonds & Mutual Funds** - Liquid investments
4. **Retirement Accounts** - Long-term savings
5. **Cryptocurrency** - Alternative investments
6. **Business Interests** - Ownership stakes
7. **Vehicles** - Personal property
8. **Other Assets** - Miscellaneous

**Key Metrics:**
- **Total Assets:** $X,XXX,XXX
- **Liquid Assets:** Cash + Savings + Stocks (available within 30 days)

**What to check:**
- ✅ Asset values reasonable and documented
- ✅ Institutions/accounts legitimate
- ✅ Liquid assets sufficient (recommended: 2+ years rent)
- ✅ Diversification (not all assets in one category)
- ✅ Supporting documentation attached (bank statements, brokerage statements)

---

#### Liabilities Review

**Navigate to:** Financial Information → Liabilities

**Categories to review:**
1. **Credit Card Debt** - Revolving debt
2. **Auto Loans** - Vehicle financing
3. **Student Loans** - Education debt
4. **Personal Loans** - Other borrowing
5. **Other Debts** - Miscellaneous

**Key Metrics:**
- **Total Liabilities:** $XXX,XXX
- **Total Monthly Debt:** $X,XXX (sum of all monthly payments)

**What to check:**
- ✅ All debts disclosed (compare to credit report)
- ✅ Monthly payments reasonable for balances
- ✅ No excessive credit card debt (>$50k concern)
- ✅ Student loans in good standing (not in default)
- ✅ Auto loans match vehicle ownership

---

#### Financial Summary Dashboard

**Navigate to:** Financial Information → Summary

**Key Calculations:**
1. **Net Worth** = Total Assets - Total Liabilities
2. **Liquid Assets Ratio** = Liquid Assets / Annual Rent
3. **Debt-to-Income Ratio (DTI)** = Total Monthly Debt / Monthly Income
4. **Net Worth Ratio** = Net Worth / Purchase Price (for co-ops)

**Color-Coded Assessment:**
- 🟢 **Green (Excellent):**
  - DTI <30%
  - Liquid Assets >3 years rent
  - Net Worth >5x annual rent
- 🟡 **Yellow (Acceptable):**
  - DTI 30-40%
  - Liquid Assets 1-3 years rent
  - Net Worth 2-5x annual rent
- 🔴 **Red (Concern):**
  - DTI >40%
  - Liquid Assets <1 year rent
  - Net Worth <2x annual rent

**Best Practice:** Yellow/Red flags don't automatically disqualify, but require closer scrutiny and possibly board discussion.

---

## Acknowledgements Review

### Overview of 8 Acknowledgement Forms

Phase 2 introduces comprehensive acknowledgement forms ensuring legal compliance and complete authorization.

#### Required Acknowledgements:

1. **Personal Information Authorization**
   - Authorizes collection and verification of personal data
   - Required for all applicants
   - Includes data sharing consent

2. **Credit Check Authorization**
   - Authorizes credit report pull
   - Includes SSN disclosure
   - Hard inquiry notice

3. **Background Check Consent**
   - Authorizes criminal/civil record check
   - Eviction history search
   - Sex offender/terrorist screening

4. **Reference Contact Authorization**
   - Authorizes contact with landlord references
   - Personal reference contact
   - Release of liability for references

5. **Employment Verification Authorization**
   - Authorizes employer contact
   - Income verification consent
   - Supervisor contact permission

6. **Financial Statement Verification**
   - Authorizes bank/brokerage contact
   - Account balance verification
   - Income/tax verification

7. **Pet Ownership Declaration**
   - Pet details (if applicable)
   - Pet policy acknowledgment
   - Pet deposit/fee agreement
   - ⚠️ **Conditional:** Only required if building allows pets

8. **Move-in Date Commitment**
   - Proposed move-in date
   - Move-in requirements acknowledgment
   - Insurance requirement acceptance

---

### How to Review Acknowledgements

**Navigate to:** Acknowledgements section (or scroll to bottom of application)

**Step 1: Verify All Acknowledgements Completed**
- ✅ Check that all 8 acknowledgements are checked (or 7 if no pets)
- ✅ Electronic signature captured for each
- ✅ Timestamp recorded for each

**Step 2: Review Special Acknowledgements**

**Pet Declaration (if applicable):**
- If applicant has pets:
  - ✅ Pet details complete (type, breed, weight, age)
  - ✅ Breed allowed per building policy
  - ✅ Size within limits (if applicable)
  - ✅ Service animal documentation attached (if claimed)
  - ✅ Pet deposit calculated correctly
  - ✅ Monthly pet fee applied (if applicable)
- If building doesn't allow pets:
  - ✅ Verify "no pets" is checked
  - ⚠️ Red flag if pets mentioned elsewhere (e.g., in cover letter)

**Move-in Date:**
- ✅ Proposed date is realistic (30+ days out)
- ✅ Applicant acknowledged move-in requirements
- ✅ Move-in deposit calculated (if applicable)
- 💡 Note date for board timeline discussion

**Step 3: Export Acknowledgements**
- Click "Export Acknowledgements to PDF"
- Include in board package
- File in application records

**Red Flags:**
- ⚠️ Any acknowledgement not completed
- ⚠️ Pet policy violations
- ⚠️ Move-in date within 30 days (may indicate urgency/desperation)

---

## Building Policies Management

### Overview
Phase 2 allows applicants to review and acknowledge building policies before starting the application.

### Admin Policy Management

**Navigate to:** Admin Settings → Building Policies → [Select Building]

**Policy Sections to Configure:**
1. Pet Policy
2. Alteration Policy
3. Subletting Policy
4. Move-in/Move-out Policy
5. Financial Requirements
6. Other Building Rules

**How to Update Policies:**

**Step 1: Edit Policy Text**
1. Navigate to policy section
2. Click "Edit Policy"
3. Use WYSIWYG editor to format text
4. Add/update requirements
5. Save changes

**Step 2: Upload PDF Version**
1. Click "Upload PDF Version"
2. Select policy document PDF
3. Confirm upload
4. PDF will be available for applicant download

**Step 3: Set Effective Date**
1. Enter "Effective Date" for policy changes
2. New applicants see updated policy
3. In-progress applications grandfathered (optional setting)

**Step 4: Version Control**
1. System automatically saves previous versions
2. Click "View History" to see past versions
3. Each version timestamped

**Best Practice:**
- Review policies quarterly
- Update PDFs when text changes
- Notify board of significant policy changes

---

### Reviewing Policy Acknowledgement

**In Application Review:**
1. Navigate to "Building Policies" section
2. Verify applicant checked: "I have read and understand the building policies"
3. Check timestamp of acknowledgment
4. Verify acknowledgment occurred before application submission

**What This Confirms:**
- Applicant aware of building rules
- Cannot claim ignorance later
- Legal protection for building

---

## Activity Tracking

### Activity Timeline

**Navigate to:** Application Detail → Activity Tab

**What you'll see:**
- Complete chronological log of all application activity
- Newest activity at top
- Each entry shows:
  - Timestamp (date and time)
  - User who made change (name + role)
  - Action type (with icon)
  - Description of what changed
  - Section affected

**Activity Types Logged:**
- 📝 Application created
- ✅ Section completed
- 📄 Document uploaded
- 🗑️ Document deleted
- 🔄 Status changed
- 💬 Comment added
- ❓ RFI sent
- ✉️ RFI responded
- ⚖️ Decision made
- 📧 Email sent
- 👁️ Application viewed

---

### Using Activity Timeline

**Use Case 1: Understand Application History**
- Review timeline to see progress
- Identify when applicant last made updates
- See who (broker/admin) has reviewed

**Use Case 2: Identify Stale Applications**
- Filter: "No activity in 7 days"
- Find applications waiting for applicant response
- Send follow-up reminder

**Use Case 3: Track RFI Responses**
- Search timeline for "RFI sent"
- Check if applicant responded
- Verify response completeness

**Use Case 4: Audit Trail**
- Document who made decisions
- Track communication history
- Export for records

**Filtering Timeline:**
```
Filter by:
- Activity Type (dropdown)
- User (dropdown: Applicant, Broker, Admin, System)
- Date Range (calendar picker)
```

**Export Timeline:**
- Click "Export to PDF"
- Includes all filtered activities
- Timestamped report
- Include in board package if needed

---

### Application Age Tracking

**Purpose:** Monitor how long applications have been pending review

**How to Use:**

**In Application List:**
1. View "Age" column
2. See days since submission
3. Sort by age to prioritize old applications
4. Color coding alerts you to urgent cases

**In Application Detail:**
1. See "Application Age: X days" banner at top
2. For expedited applications: See countdown to SLA deadline
3. Track against internal SLA (e.g., 5-7 days standard review)

**Reports:**
1. Navigate to Admin Dashboard
2. View "Application Age Distribution" chart
3. See breakdown: 0-7 days, 8-14 days, 15+ days
4. Monitor trend: Are applications aging longer?

**Best Practice:**
- Set internal SLA: 5-7 days for standard, 1-2 for expedited
- Review applications >14 days daily
- Report weekly on average review time

---

## Expedited Applications

### Overview
Applicants can pay $500 for expedited review (1-2 business days) for FirstService Residential review.

**Important:**
- Expedited fee is NON-REFUNDABLE
- Expedited SLA applies to management review only (not board approval)
- Board review timeline unchanged

---

### Identifying Expedited Applications

**In Application List:**
- 🔴 Red "Expedited" badge on application card
- Badge displays prominently
- Sort/filter: "Expedited applications first"

**In Application Detail:**
- 🔴 Red banner at top: "EXPEDITED REVIEW - Due within: X hours"
- SLA countdown timer
- Timer turns red when <4 hours remaining

**Dashboard:**
- "Expedited Applications" widget shows count of pending expedited reviews
- Click to filter list

---

### Expedited Review Process

**Step 1: Receive Expedited Application**
- Email notification sent immediately upon submission
- Subject: "🔴 EXPEDITED APPLICATION - [Building] - [Applicant Name]"
- Email includes:
  - Application ID and link
  - Applicant name
  - Building/unit
  - Submission timestamp
  - SLA deadline (1-2 business days)

**Step 2: Prioritize Review**
1. Review expedited applications before standard applications
2. Follow same review process (no shortcuts!)
3. Complete thorough review within SLA

**Step 3: SLA Management**
- Monitor SLA countdown in application detail
- Email reminder sent 4 hours before deadline
- If deadline approaching and review incomplete:
  - Contact supervisor
  - Request assignment to another admin if needed
  - Document any delays

**Step 4: Complete Review**
1. Finish review as usual
2. Submit decision or forward to board
3. SLA timer stops when review marked complete
4. System logs SLA compliance (met/missed)

---

### Expedited Fee Details

**Fee Structure:**
- Amount: $500.00
- Status: NON-REFUNDABLE
- Charged with application fee at submission

**Viewing Fee in Application:**
1. Navigate to "Fees" section
2. See line item: "Expedited Review Fee - $500.00"
3. Note: "NON-REFUNDABLE" label

**Refund Policy:**
- No refunds for:
  - Application denied
  - Applicant withdraws
  - Board denies (after management approval)
  - Application incomplete
- Exception: System error preventing review (rare, requires supervisor approval)

**If Applicant Requests Refund:**
1. Explain non-refundable policy
2. Reference:
   - Confirmation checkbox at selection
   - Fees summary acknowledgment
   - Payment receipt
   - Terms of service
3. Escalate to supervisor if applicant insists
4. Document refund request in activity log

---

### Expedited SLA Reporting

**Navigate to:** Reports → Expedited Review Performance

**Metrics:**
- Total expedited applications (this month)
- SLA compliance rate (% reviewed within 1-2 days)
- Average expedited review time
- Missed SLAs (count and details)
- Revenue from expedited fees

**Best Practice:**
- Target: 95%+ SLA compliance
- Review missed SLAs weekly
- Identify causes of delays
- Adjust staffing if needed

---

## Best Practices

### Review Workflow

**Recommended Order:**
1. **Expedited applications first** (SLA commitment)
2. **Applications >14 days** (urgent/overdue)
3. **Recent submissions** (8-14 days)
4. **New submissions** (<7 days)

**Thorough Review Checklist:**
- [ ] Personal information complete and verified
- [ ] Employment history logical and documented
- [ ] Financial summary reviewed (DTI, liquidity, net worth)
- [ ] Real estate holdings verified
- [ ] All required documents uploaded
- [ ] Documents legible and authentic
- [ ] References complete and contactable
- [ ] All acknowledgements signed
- [ ] Pet policy compliance (if applicable)
- [ ] Cover letter reviewed (assess cultural fit)
- [ ] No red flags identified
- [ ] All RFIs resolved

**Decision Making:**
- ✅ **Approve for Board Review:** All criteria met, application complete
- ⏸️ **Request Additional Information (RFI):** Missing documents or clarification needed
- ❌ **Deny:** Does not meet minimum requirements (document for applicant)

---

### Cover Letter Review

**Purpose:** Assess applicant's communication skills, cultural fit, and motivations

**What to look for:**
- ✅ Professional tone and grammar
- ✅ Genuine interest in building/community
- ✅ Addresses financial stability positively
- ✅ Mentions community involvement
- ✅ Appropriate length (not too brief, not rambling)

**Red Flags:**
- ⚠️ No cover letter (when recommended by building)
- ⚠️ Unprofessional tone
- ⚠️ Inconsistencies with application data
- ⚠️ Excessive focus on problems (financial, legal, etc.)
- ⚠️ Generic/template letter (no building-specific content)

**Best Practice:**
- Share standout cover letters with board (highlights personality)
- Note cover letter quality in your review summary
- Consider cover letter as tiebreaker for borderline applications

---

### Communication Best Practices

**Sending RFIs:**
- Be specific about what's needed
- Provide clear deadline (e.g., "within 3 business days")
- Explain why information is needed
- Offer to answer questions
- Use templates for common RFIs

**RFI Templates Available:**
- Missing employment documentation
- Bank statement verification
- Reference contact issue
- Document illegible
- Information inconsistency

**Internal Notes:**
- Use notes for concerns to discuss with board
- Tag urgent issues
- Document phone conversations
- Note any special circumstances

---

### Data Privacy & Security

**Sensitive Information:**
- Applications contain SSN, financials, background checks
- Access restricted to authorized admins only
- Do not share application details outside secure platform
- Do not download to personal devices
- Use secure platform messaging only

**GDPR/Privacy Compliance:**
- Applicants have right to access their data
- Applicants can request data deletion (if application withdrawn)
- Data retention: 7 years for approved/denied, delete on request if withdrawn
- Report data breaches immediately to supervisor

---

## Troubleshooting

### Common Issues

#### Issue: Application shows incomplete but applicant claims submitted
**Solution:**
1. Check Activity Timeline for submission event
2. Verify all required sections have green checkmarks in sidebar
3. Check for validation errors in any section
4. If truly complete, manually mark as submitted
5. Log issue for tech team investigation

---

#### Issue: Acknowledgement missing signature
**Solution:**
1. Navigate to Acknowledgements section
2. Check if checkbox is checked but signature missing
3. Send RFI to applicant: "Please complete electronic signature for [Acknowledgement Name]"
4. Applicant can re-sign without re-doing application

---

#### Issue: Expedited application missing SLA deadline
**Solution:**
1. Check submission timestamp
2. Calculate SLA deadline: Submission + 2 business days (exclude weekends)
3. If system countdown incorrect, note in application
4. Manually track SLA
5. Report bug to tech team

---

#### Issue: Financial calculations seem incorrect
**Solution:**
1. Verify each line item in assets/liabilities
2. Recalculate manually:
   - Total Assets = sum of all asset categories
   - Total Liabilities = sum of all liability categories
   - Net Worth = Assets - Liabilities
   - DTI = Monthly Debt / Monthly Income
3. If calculations incorrect, report bug with screenshot
4. Document manual calculations in notes

---

#### Issue: Document won't open/load
**Solution:**
1. Check file format (PDF, JPG, PNG supported)
2. Check file size (max 20MB per file)
3. Try different browser
4. Clear browser cache
5. If still failing, send RFI to applicant to re-upload
6. Report technical issue if widespread

---

#### Issue: Activity timeline not showing recent activity
**Solution:**
1. Refresh page (Ctrl+R / Cmd+R)
2. Check filters - remove any active filters
3. Try different browser
4. If activity truly missing, report bug
5. Activity logs are permanent - tech team can recover

---

### Getting Help

**Technical Support:**
- Email: support@philter.com
- Phone: 1-800-PHILTER
- Hours: M-F 9am-6pm EST
- Emergency (critical bug): 24/7 on-call

**Training Resources:**
- Video tutorials: philter.com/training
- User documentation: philter.com/docs
- Webinars: Monthly Q&A sessions
- Slack: #philter-admins channel

**Feature Requests:**
- Submit at: philter.com/feedback
- Vote on existing requests
- Check roadmap for planned features

---

## Appendix

### Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save current section
- `Ctrl/Cmd + Enter` - Submit review
- `Ctrl/Cmd + N` - Add note
- `Ctrl/Cmd + F` - Search within application
- `Ctrl/Cmd + P` - Print application
- `Ctrl/Cmd + E` - Export to PDF

### Status Codes

- **Submitted** - Awaiting initial review
- **In Review** - Admin actively reviewing
- **RFI Sent** - Waiting for applicant response
- **Pending Board** - Management approved, forwarded to board
- **Board Review** - Board actively reviewing
- **Approved** - Board approved
- **Denied** - Application denied
- **Withdrawn** - Applicant withdrew

### Contact Information

**FirstService Residential:**
- Phone: 1-800-XXX-XXXX
- Email: applications@firstservice.com
- Hours: M-F 9am-5pm local time

**Philter Support:**
- Email: support@philter.com
- Live Chat: philter.com (9am-6pm EST)
- Emergency: emergency@philter.com

---

**Document End**

*For additional help, visit philter.com/help or contact support@philter.com*
