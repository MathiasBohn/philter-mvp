# Admin Guide: Compliance Toggles & Configuration

**Version:** 1.0
**Last Updated:** 2025-11-16
**Audience:** Building Admins, Property Managers

---

## Overview

This guide explains how to configure compliance requirements for your building's application process using the philter admin panel. The compliance toggle system allows you to enable or disable specific legal disclosures and requirements based on your building's location, construction date, and regulatory requirements.

---

## Table of Contents

1. [Accessing Compliance Settings](#accessing-compliance-settings)
2. [NYC-Specific Compliance Toggles](#nyc-specific-compliance-toggles)
3. [Configuration Best Practices](#configuration-best-practices)
4. [Verifying Applicant Compliance](#verifying-applicant-compliance)
5. [Troubleshooting](#troubleshooting)
6. [Legal Considerations](#legal-considerations)

---

## Accessing Compliance Settings

### Step 1: Navigate to Admin Panel

1. Log in to philter with your admin credentials
2. From the dashboard, select **Admin** from the navigation menu
3. Click **Building Settings** or **Template Wizard** (depending on whether you're configuring an existing building or creating a new template)

### Step 2: Locate Compliance Section

1. In Building Settings, scroll to the **Compliance Requirements** section
2. Or in Template Wizard, navigate to the **Legal Compliance** step

### Visual Reference:

```
┌────────────────────────────────────────────────────────┐
│ Building Settings: 123 Park Avenue                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Information                                       │
│ Application Requirements                                │
│ ► Compliance Requirements ◄ (Click to expand)          │
│ Document Templates                                      │
│ Notification Settings                                   │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## NYC-Specific Compliance Toggles

### Toggle 1: Lead Paint Disclosure

**What it does:** Requires applicants to acknowledge NYC lead paint disclosure requirements before submitting their application.

**When to enable:**
- ✅ Building was constructed **before 1978**
- ✅ Building is located in **New York City**
- ✅ You are renting/leasing units (applies to lease/sublet transactions)

**When to disable:**
- ❌ Building was constructed in **1978 or later**
- ❌ Building is **outside NYC** (use your local jurisdiction's requirements instead)
- ❌ Purchase transactions only (disclosure typically not required)

**How to configure:**

1. Locate the **NYC Lead Paint Disclosure** toggle
2. Check the box to enable, or uncheck to disable
3. If enabled, applicants will see the disclosure in the **Disclosures** section
4. Applicants must acknowledge before they can submit

**Configuration Example:**

```
┌────────────────────────────────────────────────────┐
│ NYC-Specific Compliance                            │
├────────────────────────────────────────────────────┤
│                                                     │
│ ☑ Require NYC Lead Paint Disclosure                │
│   ├─ Building Year: 1972                           │
│   ├─ Last Updated: 2025-11-16                      │
│   └─ Applies to: Lease/Sublet transactions         │
│                                                     │
│   ⓘ Required for buildings built before 1978       │
│      in NYC. Federal and NYC law requires          │
│      disclosure of lead paint hazards.             │
│                                                     │
└────────────────────────────────────────────────────┘
```

**What applicants see when enabled:**

When this toggle is ON, applicants will see a new section in their application titled **"Lead Paint Disclosure"** with:
- Full disclosure text explaining lead paint risks
- Information about buildings built before 1978
- Required acknowledgment checkbox
- Link to EPA lead paint information
- Timestamp of when they acknowledged

**Audit trail:**
- System records who acknowledged, when, and which version of disclosure
- Visible in admin review workspace
- Cannot be modified after submission

---

### Toggle 2: Flood Zone Disclosure

**What it does:** Requires applicants to acknowledge flood zone information and potential flood insurance requirements.

**When to enable:**
- ✅ Property is located in a **FEMA-designated flood zone** (Zone A, AE, AH, AO, V, VE)
- ✅ Building has flood insurance requirements
- ✅ Local regulations require flood hazard disclosure

**When to disable:**
- ❌ Property is **not in a designated flood zone** (Zone C or X - minimal flood risk)
- ❌ No flood insurance requirements for residents

**How to configure:**

1. Locate the **Flood Zone Disclosure** toggle
2. Check the box to enable
3. Optionally specify the FEMA flood zone designation (e.g., "Zone A")
4. System will auto-populate property address in the disclosure

**Configuration Example:**

```
┌────────────────────────────────────────────────────┐
│ Flood Zone Disclosure                              │
├────────────────────────────────────────────────────┤
│                                                     │
│ ☑ Require Flood Zone Disclosure                    │
│   ├─ FEMA Zone: Zone AE (recommended to fill)      │
│   ├─ Last Updated: 2025-11-16                      │
│   └─ Property: 123 Park Ave, NY 10001              │
│                                                     │
│   ⓘ Enable if property is in FEMA flood zone.      │
│      Check FEMA flood maps at:                     │
│      https://msc.fema.gov/portal/search            │
│                                                     │
│   [Check FEMA Flood Map] (opens in new tab)        │
│                                                     │
└────────────────────────────────────────────────────┘
```

**What applicants see when enabled:**

- New **"Flood Zone Disclosure"** section in application
- Information about flood zones and flood insurance
- Property's flood zone designation (if you specified it)
- Link to FEMA flood map
- Required acknowledgment checkbox
- Recommendation to obtain flood insurance

**Optional fields you can configure:**
- FEMA flood zone designation (e.g., "Zone A", "Zone AE")
- Custom disclosure text (if you have additional local requirements)
- Link to building's flood insurance policy (informational)

---

### Toggle 3: Consumer Report Authorization (Always Required)

**Note:** This is **not a toggle** - it's always required for compliance with the Fair Credit Reporting Act (FCRA).

**What it does:** Obtains applicant's written authorization before running background checks, credit reports, or any consumer reports.

**Configuration:**
- This disclosure is **mandatory** and cannot be disabled
- System automatically includes FCRA-compliant authorization language
- Provides "Summary of Your Rights Under the FCRA" to applicants

**Admin responsibilities:**
1. **Before running any background check:**
   - Verify applicant has signed authorization
   - Check authorization date (must be current)

2. **If denying based on consumer report:**
   - Provide applicant with "Pre-Adverse Action Notice"
   - Include copy of consumer report
   - Include "Summary of Rights Under FCRA"
   - Record consumer reporting agency (CRA) name and contact
   - Document reason for adverse action

**Compliance verification:**
- Authorization status visible in admin review workspace
- Timestamp and signature recorded
- Cannot proceed with background check until authorized

---

## Configuration Best Practices

### 1. Review Local Requirements

Before configuring toggles:
- ✅ Consult with your legal counsel
- ✅ Review local and state disclosure requirements
- ✅ Check building construction date (for lead paint)
- ✅ Verify FEMA flood zone designation
- ✅ Stay updated on regulatory changes

### 2. Building Profile Setup

**Recommended information to have ready:**
- Building construction year (critical for lead paint)
- Full property address
- FEMA flood zone designation (if applicable)
- Building ownership entity information
- Property manager contact information

### 3. Templates vs. Individual Applications

**Building Templates:**
- Set compliance requirements at the template level
- Applies to all NEW applications for that building
- Can be updated at any time (affects future applications only)

**Individual Applications:**
- Cannot override template compliance requirements
- Admins can verify compliance on a case-by-case basis
- Historical applications retain their original compliance requirements

### 4. Testing Configuration

**Before going live:**
1. Create a test application
2. Walk through applicant flow
3. Verify all required disclosures appear
4. Confirm acknowledgment requirement works
5. Check that submission is blocked without compliance
6. Review admin view of compliance status

---

## Verifying Applicant Compliance

### In the Admin Review Workspace

When reviewing an application, you can verify compliance:

**Step 1: Open Application Review**
1. Navigate to **Admin → Intake Inbox**
2. Click on an application to review

**Step 2: Check Compliance Status**

Look for the **Compliance Summary** section:

```
┌────────────────────────────────────────────────────┐
│ Compliance Summary                                 │
├────────────────────────────────────────────────────┤
│                                                     │
│ ✅ Consumer Report Authorization                   │
│    Signed: 2025-11-15 at 2:30 PM                   │
│    By: John Doe (john.doe@email.com)               │
│                                                     │
│ ✅ NYC Lead Paint Disclosure                       │
│    Acknowledged: 2025-11-15 at 2:35 PM             │
│    By: John Doe                                    │
│    Version: 2025.1                                 │
│                                                     │
│ ✅ Flood Zone Disclosure                           │
│    Acknowledged: 2025-11-15 at 2:36 PM             │
│    Zone: AE                                        │
│                                                     │
│ [View Full Compliance Details]                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

**Step 3: Audit Trail**

Click **View Full Compliance Details** to see:
- Complete disclosure text version applicant saw
- Exact timestamp of acknowledgment
- IP address (if logged)
- User agent (browser/device used)
- PDF of disclosure with acknowledgment

### Compliance Checklist Before Approval

Before approving any application, verify:
- [ ] Consumer report authorization signed (if running background check)
- [ ] All required disclosures acknowledged
- [ ] Timestamps are recent (not backdated)
- [ ] Applicant name matches signature/acknowledgment
- [ ] No missing compliance items in the summary

---

## Troubleshooting

### Problem: Applicant Can't See Disclosure

**Possible causes:**
1. Toggle is disabled in building settings
2. Disclosure only applies to certain transaction types (e.g., lease/sublet for lead paint)
3. Applicant is on wrong transaction type

**Solution:**
1. Verify toggle is enabled in **Building Settings → Compliance**
2. Check transaction type matches disclosure requirements
3. Have applicant refresh their browser
4. Check browser console for JavaScript errors

---

### Problem: Applicant Says They Acknowledged But It's Not Showing

**Possible causes:**
1. Browser localStorage was cleared
2. Network interruption during save
3. Using different browser/device
4. Application was submitted, acknowledgment is locked

**Solution:**
1. Ask applicant to re-acknowledge (if not yet submitted)
2. Check **Application Activity Log** for save events
3. Verify applicant is logged into same account
4. If submitted, acknowledgment should be in system - check admin view

---

### Problem: Want to Change Disclosure Text

**Important:** Disclosure text is **version-controlled** for legal compliance.

**Process:**
1. Contact your legal counsel to review new text
2. Update disclosure in system (creates new version)
3. **Existing applications:** Retain old version (already acknowledged)
4. **New applications:** Use new version going forward
5. System tracks which version each applicant saw

**Never retroactively change acknowledged disclosures.**

---

### Problem: Applicant Requests to Withdraw Acknowledgment

**Legal note:** Generally, once acknowledged, disclosures cannot be "un-acknowledged."

**Process:**
1. Consult legal counsel
2. Document applicant's request in application notes
3. If withdrawal is necessary, applicant may need to restart application
4. Keep audit trail of all actions

---

## Legal Considerations

### Compliance is Your Responsibility

philter provides tools to help you comply with disclosure requirements, but:
- ⚠️ **You are responsible for determining which disclosures are required**
- ⚠️ **Consult with legal counsel for your jurisdiction**
- ⚠️ philter does not provide legal advice
- ⚠️ Requirements vary by location, building type, and transaction type

### Required Disclosures by Jurisdiction

**New York City:**
- Lead paint (pre-1978 buildings, rental/lease)
- Local Law 55 (lease/sublet - window guards)
- Various consumer protection disclosures

**Other Jurisdictions:**
- Check state and local requirements
- Federal disclosures (FCRA for all background checks)
- Fair Housing Act compliance

### Audit Trail & Record Keeping

**philter automatically maintains:**
- ✅ Disclosure version history
- ✅ Acknowledgment timestamps
- ✅ User signatures/names
- ✅ IP addresses (if enabled)

**You should also:**
- Keep records per your organization's retention policy
- Export compliance data regularly
- Store signed acknowledgments securely
- Document any compliance-related decisions

### Fair Housing Compliance

**Important:** Ensure compliance requirements are applied **equally** to all applicants.
- ❌ Do NOT enable disclosures selectively per applicant
- ✅ Set requirements at building/template level
- ✅ Apply same rules to all transaction types
- ✅ Document legitimate business reasons for requirements

---

## Getting Help

### Technical Support
- **Issue:** Toggle not working, can't see settings
- **Contact:** Technical support team
- **Include:** Building ID, screenshot of issue, browser info

### Legal Questions
- **Issue:** Which disclosures are required? Legal compliance questions
- **Contact:** Your organization's legal counsel
- **Note:** philter does not provide legal advice

### Training & Best Practices
- **Resource:** philter Admin Training Guide
- **Resource:** Compliance webinars (quarterly)
- **Resource:** Knowledge base articles

---

## Summary Checklist

Before launching your building on philter:

- [ ] Determined building construction year
- [ ] Checked FEMA flood zone designation
- [ ] Consulted legal counsel on required disclosures
- [ ] Configured compliance toggles appropriately
- [ ] Tested application flow with all disclosures enabled
- [ ] Reviewed compliance summary in admin view
- [ ] Trained staff on verification procedures
- [ ] Documented your compliance configuration decisions

---

## Additional Resources

- **FCRA Summary of Rights:** [Link to FTC resource]
- **EPA Lead Paint Information:** https://www.epa.gov/lead
- **FEMA Flood Maps:** https://msc.fema.gov/portal/search
- **NYC Housing Regulations:** [Link to NYC HPD]
- **philter Documentation:** `docs/development/` folder

---

**Document Version:** 1.0
**Last Reviewed:** 2025-11-16
**Next Review:** Quarterly or upon regulatory changes
