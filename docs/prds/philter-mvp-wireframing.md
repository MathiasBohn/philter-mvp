philter — MVP Wireframing PRD — Text-Only

A clean spec that focuses on user flows, screens, and wireframing only. It matches everything we agreed for the MVP and keeps minimal legal/accessibility cues where helpful.

------------------------------------------------------------
1) Personas & role matrix (what each person can do/see)
------------------------------------------------------------
- Applicant
  - Purpose: Complete and send a clean package
  - Can edit: Own sections & uploads
  - Can comment/RFI: Reply to RFIs
  - Can submit: Yes
  - PII visibility: Full for self

- Co-applicant / Guarantor
  - Purpose: Provide their info/docs
  - Can edit: Own subsections & uploads
  - Can comment/RFI: Reply to RFIs (their items)
  - Can submit: No
  - PII visibility: Full for self

- Broker/Agent
  - Purpose: Orchestrate, pre-fill, QA, submit
  - Can edit: Non-PII fields; can upload
  - Can comment/RFI: Start/request info
  - Can submit: Yes
  - PII visibility: SSN masked (last-4)

- Building Admin / Property Manager
  - Purpose: Intake, review, request info, decide
  - Can edit: Review checklist
  - Can comment/RFI: Create/resolve RFIs
  - Can submit: Decide
  - PII visibility: Full (per building policy)

- Board Reviewer
  - Purpose: Read-only review
  - Can edit: No
  - Can comment/RFI: No
  - Can submit: No
  - PII visibility: SSN redacted

Design note: least-privilege is the guiding principle—each role only sees/does what’s necessary.

---------------------------------
2) Information architecture (IA)
---------------------------------
Home:
- Dashboard (Applicant / Broker)
- Building Inbox (Admin)
- Board Review (Board)

Application:
- A0 Join / Building Code
- A1 Overview (progress hub)
- A2 Profile
- A3 Employment & Income
- A4 Financial Summary (REBNY-aligned)
- A5 Documents (upload & preview)
- A6 Disclosures (Lease/Sublet only)
- A7 Review & Submit

Broker:
- BK1 Pipeline
- BK2 Pre-fill & QA
- BK3 Submission Confirm

Admin:
- AD1 Template Wizard (minimal)
- AD2 Intake Inbox
- AD3 Review Workspace
- AD4 RFIs (threaded)
- AD5 Decision

Board:
- BR1 Read-only Review + Download

-----------------------------
3) Primary flows (happy paths)
-----------------------------
- Applicant: A0 → A1 → A2/A3/A4 → A5 → (A6 for lease/sublet) → A7 submit
- Broker: BK1 start → invite Applicant → QA in BK2 → submit (A7)
- Admin: AD2 open → AD3 review (create RFIs if needed) → AD5 decide
- Board: BR1 read-only review → (optional) download compiled package

-----------------------------------------
4) Screen specifications (what to draw)
-----------------------------------------
Each screen lists Purpose • Primary actions • Key content • States • Role variants • Done.

A. Applicant / Co-applicant / Guarantor
---------------------------------------
A0 — Join / Building Code
- Purpose: Get user into the correct building & transaction type.
- Primary actions: Enter building code → choose type (Co-op Purchase / Condo Purchase / Co-op Sublet / Condo Lease) → Start.
- Key content: Building name (after code), type tiles, short helper text.
- States: Invalid code (inline + page-top error summary), invited state.
- Role variants: Broker can start on behalf.
- Done: Draft application created → A1.

A1 — Application Overview
- Purpose: Single hub for progress, blockers, and RFIs.
- Primary actions: Continue, Invite co-app/guarantor, Open RFIs.
- Key content: Sections—Profile, Employment & Income, Financials, Documents, Disclosures*, Review—each with a status pill and “Fix” link.
- States: Empty (new), In progress, With RFIs.
- Variants: Co-app/Guarantor sees only their tasks; Broker sees QA panel with PII masked.

A2 — Profile
- Purpose: Identity, contact, 2-year address history, SSN (masked in some roles).
- Primary actions: Save & continue; Add co-app/guarantor; Send invite.
- Key content: Name, DOB, email, phone, SSN entry, address history.
- Validation pattern: Inline errors + page-top error summary that focuses the first invalid field; ensure focused elements aren’t hidden by sticky headers (WCAG 2.2 “Focus Not Obscured”).
- Variants: Broker sees SSN as last-4; Board never sees SSN.

A3 — Employment & Income
- Purpose: Employment details and income docs.
- Primary actions: Add employer; Upload paystubs/W-2/1099; Save & continue.
- Key content: Employer, title, start date, pay cadence, annual income; upload area for income proof.
- States: Uploading, success, failed (retry). Show progress and allow resume.

A4 — Financial Summary (REBNY-aligned)
- Purpose: Assets, Liabilities, Monthly income, Monthly expenses; show calculated ratios.
- Primary actions: Add entry; Save & continue.
- Key content: Simple tables with category selectors; totals bar (Net worth, DTI).
- States: Empty (no entries), totals updating.

A5 — Documents
- Purpose: Put files in the right buckets and preview PDFs.
- Primary actions: Upload, Replace, Mark “I don’t have this” (with reason).
- Key content: Buckets—ID, Bank letters/statements, Tax returns, Reference letters, Building forms; PDF preview pane.
- States: Upload progress, preview, error.

A6 — Disclosures (Lease/Sublet only)
- Purpose: NYC lease-flow acknowledgments when enabled by a building.
- Primary actions: Read → check “I acknowledge”; (if applicable) upload signed window-guard form.
- Key content: Local Law 55 Indoor Allergen info sheet link + acknowledgment; Window Guards lease notice link + acknowledgment.
- Done: All enabled disclosures acknowledged to proceed.

A7 — Review & Submit
- Purpose: Show validation summary, fix links, and a package preview.
- Primary actions: Fix missing items; Submit.
- Key content: Error summary with jump links; combined-package preview; post-submit “what happens next”.
- States: Submit success → lock edits; time-stamped confirmation.

B. Broker / Agent
-----------------
BK1 — Broker Pipeline
- Purpose: Track deals and nudge applicants.
- Primary actions: Start application; Invite; Open QA.
- Key content: Table with building, applicant, % complete, last activity; filters (status, date).
- States: Empty (no applications) with clear “Start” CTA.

BK2 — Pre-fill & QA
- Purpose: Pre-fill building-specific fields; orchestrate completion.
- Primary actions: Request info to Applicant; Upload on behalf; Mark ready for submit.
- Key content: Left—sections; Center—forms & document buckets; Right—QA panel with blockers, PII masked.
- States: All sections complete → “Submit” enabled.

BK3 — Submission Confirm
- Purpose: Final check & submit to building.
- Primary actions: Submit; Share summary with Applicant.
- Key content: Checklist of deliverables; package preview.

C. Building Admin / Property Manager
------------------------------------
AD1 — Template Wizard (minimal)
- Purpose: Toggle sections & document checklist; enable optional NYC disclosures for lease/sublet flows.
- Steps: Basics → Sections → Documents → Compliance (LL55 / Window Guards) → Publish.

AD2 — Intake Inbox
- Purpose: Triage and open applications.
- Primary actions: Open; Request info; Assign; Set status.
- Key content: Table—Applicant(s), unit, type, stage, age, last activity; quick filters.

AD3 — Review Workspace
- Purpose: One place to read, annotate, and request info.
- Primary actions: Mark item Complete/Needs info; Compose RFI; View PDFs in-app.
- Layout: Left—section navigator; Center—data/PDF viewer; Right—threaded RFIs & activity.

AD4 — RFIs (Threaded)
- Purpose: Keep back-and-forth tidy and auditable.
- Primary actions: New request; Attach doc; Resolve.
- Key content: Threaded messages; status (Open/Resolved).

AD5 — Decision
- Purpose: Approve, Conditional, or Deny; send notices.
- Primary actions: Choose outcome; add reason tags; preview/send decision.
- Compliance cue: If the decision relied on a consumer report, gate sending Deny/Conditional until the current “Summary of Your Rights under the FCRA” is included and CRA contact info is captured.

D. Board Reviewer
-----------------
BR1 — Read-only Review
- Purpose: Read the compiled package and (optionally) add private notes.
- Primary actions: Download compiled package; Mark reviewed.
- Key content: Read-only PDF viewer; SSN and highly sensitive data are redacted.
- UX hint: Show a small label under the download button like “Link expires soon” to set expectations around time-limited access.

-------------------------------------
5) Patterns & components (wireframes)
-------------------------------------
- Global UI: App shell with top bar (role pill, user), left nav (contextual), content pane, right rails for RFIs/QA where relevant.
- Tables: Sort, filter, empty state with a single CTA.
- Forms: Field label + help text + inline error + error summary at top after submit; summary links to fields; focused errors are not obscured by headers.
- Uploader: Drag-and-drop + “Choose file” fallback; per-file progress; pause/resume; file card with name/size/status.
- PDF viewer: Full-height viewer (thumbnail strip optional), toolbar (zoom, page, rotate, open in new tab).
- RFI thread: Message bubbles with author/role chips, timestamps, attachments, and a clear “Resolve” control.
- Decision panel: Outcome radio (Approve / Conditional / Deny), reason tags, free-text notes, and the FCRA attachment gate (when applicable).

---------------------------
6) Microcopy (starter set)
---------------------------
- A1 empty state: “Let’s get your package started. We’ll guide you step by step.”
- A5 upload helper: “PDF, JPG/PNG, or DOC/DOCX • up to 25 MB per file • You can pause and resume large uploads.”
- Error summary title: “There’s a problem — please check these fields.”
- Masked SSN note (Broker view): “Sensitive numbers are hidden for privacy.”
- BR1 download hint: “Download link expires soon to protect your privacy.”

-------------------------------------
7) Accessibility checklist (design)
-------------------------------------
- Error summary: When validation fails, show a page-top summary and inline messages; link items in the summary to fields and move focus there.
- Focus visibility: The focused element must be visible (not obscured by sticky headers/overlays).
- Upload alternatives: Provide non-drag controls (a button) for uploads for keyboard/switch users.
- Target size: Ensure comfortable hit targets on touch.

---------------------------------------
8) Compliance cues (design-time only)
---------------------------------------
- NYC lease/sublet disclosures: Toggle Local Law 55 Indoor Allergen info sheet acknowledgment and Window Guards lease notice acknowledgment; provide official PDF links.
- Adverse action (if a consumer report was used): In AD5, require the “Summary of Your Rights under the FCRA” and CRA details before sending Deny/Conditional notices.

---------------------------------------
9) Acceptance criteria (design QA)
---------------------------------------
- A-forms (A2–A4): Submitting with errors shows a page-top error summary and inline messages; activating the first summary link moves focus to the field and the field is not obscured.
- A5 uploads: A large PDF shows progress and can be resumed after a brief connection loss (design affordances visible).
- B2 review: Admin can request info tied to a specific section; the RFI thread shows status (Open/Resolved).
- B4 decision: When “consumer report used” is toggled, the design blocks sending a Deny/Conditional notice until the FCRA rights PDF is included and CRA details are captured.
- BR1 read-only: Board cannot edit or comment; SSN fields appear as “••••”/“—”; the download control communicates that the link will expire.

Export tips for your wireframing tool:
- Name frames with screen IDs: A0–A7, BK1–BK3, AD1–AD5, BR1.
- Use role badges in the top bar for variants (Applicant, Co-app/Guarantor, Broker, Admin, Board).
- Include state overlays for error summary, upload progress, submission/decision confirmation, and read-only mode hints.