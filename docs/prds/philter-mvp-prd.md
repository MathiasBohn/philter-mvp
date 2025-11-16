# philter — MVP PRD — wireframing + build kit
**Goal:** A minimal, production‑oriented MVP PRD that a wireframing tool and AI coding agents can implement directly.  
**Stack (v1):** Next.js 16 + React 19; Supabase (Auth, Postgres w/ RLS, Storage w/ signed URLs + TUS); PDF.js viewer.  

---

## 1. Product scope (MVP)
**Deliver an end‑to‑end Application → Review → Decision workflow** for professionally managed buildings and four transaction types (Co‑op Purchase, Condo Purchase, Co‑op Sublet, Condo Lease).  

**In-scope MVP (Phase 1):**
- Applicant/Broker guided package: Profile, Income/Employment, Financials (REBNY‑aligned), Documents, Disclosures (for lease/sublet), Review/Submit.
- Admin review workspace: inbox, PDF viewer, checklist, RFIs, decision (Approve / Conditional / Deny).
- Board reviewer read‑only workspace with compiled package download (signed URL).
- Security & privacy: RLS‑first, PII masking (SSN full → Applicant/Admin; last‑4 → Broker; redacted → Board), short‑lived signed URLs for files.

**Phase 1 Enhancements (Implemented):**
See `docs/prds/phase-1-enhancements.md` for detailed specifications on the following additions:
- Reference letter collection system
- NYC-specific legal compliance (Lead Paint & Flood Zone disclosures)
- Consumer report authorization (FCRA compliant)
- Enhanced lease terms capture (move-in date, rent budget)
- Comprehensive housing history tracking
- Emergency contact management
- Unit owner/seller party information
- Admin compliance toggles for NYC requirements

**Out‑of‑scope (later phases):** Embedded e‑signature, payments, automated document parsing/classification/extraction, advanced analytics.

---

## 2. Roles & access (MVP)
| Role | Capabilities | SSN visibility | File access |
|---|---|---|---|
| Applicant | Complete sections; upload; invite co‑app/guarantor; submit | Full (self) | Own docs + compiled package (signed URL) |
| Co‑applicant / Guarantor | Complete own subsections; upload own docs | Full (self) | Own docs |
| Broker / Agent | Initiate; prefill; invite; upload on behalf; QA; submit | Masked (last‑4) | Compiled package; building docs as permitted |
| Building Admin / Property Manager | Templates; intake; review; RFIs; decision | Full (building policy) | All docs + compiled package |
| Board Reviewer | Read‑only review; private notes; download | Redacted | Compiled package (short‑lived URL) |

**Enforcement:** DB RLS policies keyed to `application_participants`; Storage signed URLs; service‑layer route guards.

---

## 3. Screen‑by‑screen wireframing spec
> Use the IDs exactly as listed to keep design, routing, and analytics aligned. Each screen defines **Purpose • Primary Actions • Data • Components to draw • Validation • States • Role gates**.

### A. Applicant (+ Co‑app/Guarantor)

**A0 — Welcome & Join**  
**Purpose:** Identify building + transaction type; create app shell.  
**Primary actions:** Enter building code → validate → choose transaction type → Start.  
**Data:** Building name; transaction type; inviter (if via link).  
**Components:**
- Form: `BuildingCodeInput`, `TransactionTypeTiles`, `StartButton`.
- Errors: inline + page‑top summary; “Don’t have a code?” help.
**Validation:** Non‑empty/format for code; required transaction type.  
**States:** Loading, invalid code, invited flow.  
**Role gates:** All roles (Broker can start on behalf).  

**A1 — Application Overview**  
**Purpose:** Hub showing sections, progress, blockers, RFIs.  
**Primary actions:** Continue; Invite Co‑app/Guarantor; Open RFIs.  
**Data:** Section list: Profile, Employment/Income, Financials, Documents, Disclosures*, Review.  
**Components:**
- `SectionList` (status pills: Not started / In progress / Complete), `ProgressBar`, `InviteWidget`, `RfiBanner`.
**Validation:** N/A.  
**States:** Empty (no data yet), in progress, RFI present.

**A2 — Profile**  
**Purpose:** Capture identity + address history + SSN (masked in UI); add co‑apps/guarantors.  
**Primary actions:** Save & continue; Add household member; Invite.  
**Data fields:**
- Person: Legal name, email, mobile, DOB.
- Identification: SSN (masked entry field), last‑4 derived, ID type/number (optional), address history (2 years min).
**Components:** `FieldRow`, `MaskedSSNInput`, `DateInput`, `AddressHistoryList`, `AddPersonButton`, `FormActions`.  
**Validation:** Required name, DOB (>=18 default), address history ≥ 2 years; SSN format if entered.  
**States:** Inline errors + top summary; autosave indicator.
**Role gates:** Applicant/Co‑app/Guarantor edit self; Broker masked read; Admin full read; Board redacted.

**A3 — Employment & Income**  
**Purpose:** Current employment and income proof.  
**Primary actions:** Add employer; Upload paystubs/W‑2/1099; Save & continue.  
**Data fields:** Employer name, title, start date, pay cadence, annual income; document bucket.  
**Components:** `RepeatableGroup` (employers), `MoneyInput`, `UploadDropzone` (resumable), `DocumentCard`, `FormActions`.  
**Validation:** Annual income numeric ≥ 0; if employed, employer fields required; file type/size rules.  
**States:** Upload progress, resume, failure retry.

**A4 — Financial Summary (REBNY‑aligned)**  
**Purpose:** Assets/Liabilities + Monthly Income/Expenses; compute ratios.  
**Primary actions:** Add entries; Save & continue.  
**Data fields:** Entry type (ASSET | LIABILITY | MONTHLY_INCOME | MONTHLY_EXPENSE), category, institution, description, amount.  
**Components:** `FinancialTable` (4 tabs), `AddRow`, `TotalsBar` (Net Worth, DTI), `FormActions`.  
**Validation:** Amount required; sensible caps; totals recalc on change.

**A5 — Documents**  
**Purpose:** Upload and preview required docs (ID, bank letters/statements, tax returns, reference letters, building forms).  
**Primary actions:** Upload; Replace; Mark “I don’t have this” (reason).  
**Components:** `UploadDropzone` (TUS), `DocumentCard` (status: uploading/complete/failed), `PdfViewer`, `Checklist` (required/optional).  
**Validation:** Per‑file type/size; at least 1 govt ID before submit.  
**States:** Progress, retry, delete, preview.

**A6 — Disclosures (Lease/Sublet only)**  
**Purpose:** Acknowledge required city notices and upload signed forms if needed.  
**Primary actions:** Read → check “I acknowledge”; Upload signed window‑guard form if applicable.  
**Components:** `DisclosureCard(LL55)`, `DisclosureCard(WindowGuard)`, `DownloadLink`, `UploadField`.  
**Validation:** Must acknowledge each enabled disclosure for this building/type.  
**States:** Missing acknowledgement warning.

**A7 — Review & Submit**  
**Purpose:** Validate package; preview compiled PDF; submit.  
**Primary actions:** Fix issues (deep‑link to section); Submit to Building.  
**Components:** `ValidationSummary` (anchor links), `PdfViewer` (compiled preview), `SubmitButton`.  
**Validation:** All required sections complete; required docs uploaded; disclosures acknowledged (if applicable).  
**States:** Submitted → lock editing; show timestamp + what’s next.

---

### B. Broker / Agent

**BK1 — Broker Home**  
**Purpose:** Pipeline view of all active applications.  
**Primary actions:** Start application; Open QA; Invite applicant.  
**Components:** `DataTable(Applications)`, filters (status/date/building), quick actions.

**BK2 — Pre‑fill & QA**  
**Purpose:** Pre‑fill building‑specific fields and doc checklist; orchestrate completion.  
**Components:** Left: sections; Center: forms/docs; Right: `QAPanel` (completeness, blockers, “Request info”), PII masked.  
**Actions:** Request info to Applicant; Upload on behalf; Mark ready.

**BK3 — Submission Confirm**  
**Purpose:** Review deliverables; generate “Board Package” preview; submit.  
**Components:** `Checklist`, `PdfViewer`, `SubmitButton`, `AuditTrail`.

---

### C. Building Admin / Property Manager

**AD1 — Building Template Wizard**  
**Purpose:** Define app template (sections, required docs, compliance toggles).  
**Steps:** Basics → Sections → Documents → Compliance (LL55/Window Guard) → Review → Publish.  
**Artifacts:** `application_templates` (versioned), copied onto new applications.

**AD2 — Intake Inbox**  
**Purpose:** Triage.  
**Components:** `DataTable(Applications)` with columns: Applicant(s), Unit, Type, Stage, Age, Last activity; row actions open Review.

**AD3 — Review Workspace**  
**Layout:** Left = `SectionNavigator` (status/flags); Center = `PdfViewer` and `DataPanel`; Right = `RfiThread` + `ActivityLog`.  
**Actions:** Mark Complete/Needs Info; leave comments; request specific docs.

**AD4 — RFIs**  
**Purpose:** Threaded requests; assign to Applicant or Broker.  
**Components:** `RfiComposer`, `Thread`, `AttachUpload`, status Open/Resolved.

**AD5 — Decision**  
**Purpose:** Approve / Approve w/ Conditions / Decline; optional adverse‑action payload if consumer report used.  
**Components:** `DecisionPanel`, `ReasonTags`, `NotesBox`, `ConfirmModal`, `DecisionEmailPreview`.

---

### D. Board Reviewer (read‑only)

**BR1 — Board Review**  
**Purpose:** Read‑only workspace with compiled package and private notes.  
**Components:** `PdfViewer` (watermark), `PrivateNotes`, `MarkReviewed`, `DownloadButton` (short‑lived signed URL).

---

## 4. Routes & Server Actions (build blueprint)
> Use Next.js App Router + Server Actions. Inputs/outputs are serializable. All file operations use Supabase Storage (signed URLs) and TUS uploads.

| ID | Action / Route | Method | Roles | Input | Output | Notes |
|---|---|---|---|---|---|---|
| R1 | `/actions/auth/signIn` | POST | All | `{ email }` | `{ ok }` | Magic‑link sign‑in.
| R2 | `/actions/applications/create` | POST | Applicant,Broker,Admin | `{ buildingCode, type }` | `{ appId }` | Validates code; creates draft.
| R3 | `/actions/applications/:id/section/:key/save` | POST | Applicant,Co‑app,Broker | `FormData` | `{ ok, errors? }` | Server‑validate; store in `application_sections`.
| R4 | `/actions/applications/:id/invite` | POST | Applicant,Broker | `{ email, role }` | `{ ok }` | Creates invite; participant row.
| R5 | `/actions/applications/:id/upload/start` | POST | Participant | `{ fileName, mime, size, category }` | `{ tusUrl, uploadId }` | Create/upload session.
| R6 | `/api/uploads/tus/:uploadId` | PATCH | Participant | binary | `{ ok }` | TUS chunk endpoint (proxied to Supabase).
| R7 | `/api/documents/:id/signed-url` | GET | Authorized | `id` | `{ url, expiresAt }` | Short‑lived download URL.
| R8 | `/actions/applications/:id/submit` | POST | Applicant,Broker | `{}` | `{ ok }` | Locks sections; sets status `SUBMITTED`.
| R9 | `/actions/rfi/:appId/create` | POST | Admin | `{ sectionKey, assigneeRole, message }` | `{ rfiId }` | Creates RFI.
| R10 | `/actions/rfi/:rfiId/reply` | POST | Participant | `{ message, uploadId? }` | `{ ok }` | Threaded reply.
| R11 | `/actions/review/:id/mark` | POST | Admin | `{ sectionKey, status }` | `{ ok }` | Per‑section status.
| R12 | `/actions/decision/:id/record` | POST | Admin | `{ decision, reasonCodes[], notes, usesConsumerReport }` | `{ ok }` | Decision + audit.
| R13 | `/api/compiled/:id/preview` | GET | Participant | `id` | PDF stream | Simple compile (Phase 1.5).
| R14 | `/actions/templates/:buildingId/publish` | POST | Admin | `{ templateJson }` | `{ templateId }` | Versioned template.
| R15 | `/actions/board/:id/mark-reviewed` | POST | Board | `{}` | `{ ok }` | Private note + timestamp.
| R16 | `/api/health` | GET | — | — | `{ ok, version }` | Health check.

**Server Action patterns:** form `<form action={saveAction}>`, `useActionState`, optimistic UI where safe. Backend enforces RLS on all queries.

---

## 5. Data model (MVP‑min) — SQL DDL
> Lean tables; enums as `text` for MVP; switch to proper `enum` types later if desired.

```sql
-- Organizations/Buildings/Memberships
create table organizations (
  id uuid primary key,
  name text not null,
  created_at timestamptz default now()
);

create table buildings (
  id uuid primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  code text unique not null,
  type text not null check (type in ('rental','coop','condo')),
  address jsonb,
  created_at timestamptz default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('ADMIN','BROKER','BOARD')),
  created_at timestamptz default now(),
  primary key (organization_id, user_id)
);

-- Applications & Participants
create table applications (
  id uuid primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  building_id uuid not null references buildings(id) on delete cascade,
  unit text,
  type text not null check (type in ('COOP_PURCHASE','CONDO_PURCHASE','COOP_SUBLET','CONDO_LEASE')),
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS','SUBMITTED','IN_REVIEW','RFI','APPROVED','CONDITIONAL','DENIED')),
  created_by uuid not null,
  created_at timestamptz default now(),
  submitted_at timestamptz
);

create table application_participants (
  application_id uuid not null references applications(id) on delete cascade,
  user_id uuid, -- nullable until invite accepted
  role text not null check (role in ('APPLICANT','CO_APPLICANT','GUARANTOR','BROKER','ADMIN','BOARD')),
  email text not null,
  full_name text,
  invited_at timestamptz,
  accepted_at timestamptz,
  primary key (application_id, email, role)
);

create table application_sections (
  application_id uuid not null references applications(id) on delete cascade,
  section_key text not null,
  data jsonb,
  is_complete boolean not null default false,
  updated_at timestamptz default now(),
  primary key (application_id, section_key)
);

-- Applicant data
create table application_people (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  participant_role text not null check (participant_role in ('APPLICANT','CO_APPLICANT','GUARANTOR')),
  full_name text not null,
  email text,
  phone text,
  dob date,
  ssn_encrypted bytea,
  ssn_last4 text check (length(ssn_last4)=4),
  address_history jsonb
);

create table employment_records (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  person_id uuid not null references application_people(id) on delete cascade,
  employer_name text not null,
  title text,
  start_date date,
  pay_cadence text,
  annual_income numeric(14,2)
);

-- Unified financials (assets, liabilities, monthly income/expenses)
create table financial_entries (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  person_id uuid references application_people(id) on delete set null,
  entry_type text not null check (entry_type in ('ASSET','LIABILITY','MONTHLY_INCOME','MONTHLY_EXPENSE')),
  category text,
  institution text,
  description text,
  amount numeric(14,2) not null
);

-- Files & review
create table uploads (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  category text,
  storage_path text not null,
  filename text,
  mime_type text,
  size_bytes bigint,
  checksum text,
  uploaded_by uuid,
  created_at timestamptz default now(),
  scan_status text
);

create table rfis (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  section_key text,
  status text not null default 'OPEN' check (status in ('OPEN','RESOLVED')),
  assignee_role text not null check (assignee_role in ('APPLICANT','BROKER')),
  created_by uuid not null,
  created_at timestamptz default now()
);

create table rfi_messages (
  id uuid primary key,
  rfi_id uuid not null references rfis(id) on delete cascade,
  author_id uuid not null,
  message text not null,
  upload_id uuid references uploads(id) on delete set null,
  page int,
  rect jsonb,
  created_at timestamptz default now()
);

create table decisions (
  id uuid primary key,
  application_id uuid not null unique references applications(id) on delete cascade,
  decision text not null check (decision in ('APPROVE','CONDITIONAL','DENY')),
  reason_codes text[],
  notes text,
  uses_consumer_report boolean not null default false,
  decided_by uuid not null,
  decided_at timestamptz default now()
);

create table disclosures (
  id uuid primary key,
  application_id uuid not null references applications(id) on delete cascade,
  type text not null check (type in ('LOCAL_LAW_55','WINDOW_GUARD')),
  acknowledged boolean not null default false,
  acknowledged_at timestamptz,
  document_upload_id uuid references uploads(id) on delete set null
);

create table audit_logs (
  id uuid primary key,
  actor_user_id uuid,
  application_id uuid,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Helpful indexes
create index idx_apps_building_status on applications(building_id, status);
create index idx_participants_app_role on application_participants(application_id, role);
create index idx_uploads_app_category on uploads(application_id, category);
create index idx_rfis_app_status on rfis(application_id, status);
```

---

## 6. RLS & Storage policy stubs (Supabase)
**Principle:** every table `ENABLE ROW LEVEL SECURITY`; allow read/write only if `auth.uid()` is a participant (with Admin overrides). Keep Storage buckets private; serve via short‑lived signed URLs.

```sql
-- Applications: participants can read their apps
alter table applications enable row level security;
create policy participants_read_apps on applications for select
using (
  exists (
    select 1 from application_participants ap
    where ap.application_id = applications.id
      and ap.user_id = auth.uid()
  )
  or exists (
    select 1 from organization_members om
    join buildings b on b.organization_id = om.organization_id
    where b.id = applications.building_id
      and om.user_id = auth.uid() and om.role = 'ADMIN'
  )
);

-- Uploads: same participant pattern
alter table uploads enable row level security;
create policy participants_read_uploads on uploads for select
using (
  exists (
    select 1 from application_participants ap
    where ap.application_id = uploads.application_id
      and ap.user_id = auth.uid()
  )
);

-- Decisions: applicants can read after decision; admins full
alter table decisions enable row level security;
create policy applicants_can_read_decisions on decisions for select
using (
  exists (
    select 1 from application_participants ap
    where ap.application_id = decisions.application_id
      and ap.user_id = auth.uid() and ap.role in ('APPLICANT','CO_APPLICANT','GUARANTOR')
  )
);
```

**PII masking guidance:**
- Serve SSN via a secure view or service: Applicant/Admin → full; Broker → last‑4 only; Board → redacted.
- Never log SSN values (omit from audit logs/telemetry).

**Storage:**
- Private buckets only; generate signed URLs per download with TTL (e.g., 10–30 min); purge on role changes.
- Resumable uploads (TUS) for large PDFs; show progress, resume, retry.

---

## 7. Implementation recipes (front‑end & back‑end)

**Project layout (Next.js 16 / App Router)**
```
app/
  (marketing)/
  (auth)/sign-in/page.tsx
  dashboard/page.tsx
  applications/[id]/page.tsx         // Overview (A1)
  applications/[id]/profile/page.tsx // A2
  applications/[id]/income/page.tsx  // A3
  applications/[id]/financials/page.tsx // A4
  applications/[id]/documents/page.tsx  // A5
  applications/[id]/disclosures/page.tsx // A6
  applications/[id]/review/page.tsx      // A7
  review/[id]/page.tsx                // Admin/Board workspace
  api/compiled/[id]/route.ts          // PDF compile (Phase 1.5)
lib/
  db.ts
  storage.ts
  auth.ts
components/
  forms/*  viewer/*  table/*  layout/*
```

**Forms pattern**
- Use native `<form>` with Server Actions; show `useActionState` statuses; optimistic UI only where safe (non‑PII edits).
- Validation strategy: server‑first (Zod schema), with progressive enhancement to client for faster feedback.
- Error summary at top with anchor links; return focus to first errored field.

**Uploads**
- Use TUS (tus‑js‑client or Uppy) for resumable uploads to Supabase; display per‑file progress and resume options.
- After upload completes, store metadata row in `uploads` and link to `application_id`.

**PDF viewer**
- Embed PDF.js (viewer component) with toolbar controls (zoom, page nav, open in new tab).

**Analytics & logging**
- Use privacy‑first analytics; redact URLs and event payloads to avoid PII leakage (no SSNs, IDs, emails in paths or labels).
- Log significant actions to `audit_logs` (submission, decision, RFI events), omitting sensitive values.

**Accessibility (WCAG 2.2 AA essentials)**
- Form labels and descriptions; keyboard focus visible; error summary; proper roles for dialogs and toasts; color contrast ≥ 4.5:1; hit targets ≥ 24px.

---

## 8. Phasing & acceptance

**Phase 0 — Clickable prototype**
- All screens stubbed; fake data; PDF.js renders sample files; navigation + validation flows.

**Phase 1 — MVP production**
- Auth (magic links), RLS policies, Storage (signed URLs), TUS uploads, Review workspace, RFIs, decisions, disclosures for lease/sublet.

**Phase 1.5 — Package compile & admin templates**
- Simple merged PDF with TOC; Admin Template Wizard (toggle sections/docs/compliance flags; versioned).

**Phase 2 — e‑sign & payments (optional)**
- Embedded e‑sign (DocuSign/Dropbox Sign); Stripe PaymentIntents if charging fees; fee rule toggles for NY rentals vs co‑op purchases.

**Selected acceptance tests (MVP)**
- Upload a 25MB PDF; kill the network mid‑upload; resume completes without restart.
- Board reviewer cannot add comments and sees redacted SSN fields; download link expires within minutes.
- Decision requires reason codes; if `uses_consumer_report = true` and outcome is Deny/Conditional, require adverse‑action payload before sending.

---

## 9. UI tokens & microcopy (starter)

**Tokens**  
- Radius: 16px cards; 12px buttons.  
- Spacing scale: 4/8/12/16/24/32.  
- Typography: Headings (700/600), Body (400); base 16px.  
- Buttons: Primary (submit), Secondary (ghost), Destructive (deny).  

**Common microcopy**  
- Missing item: “This item is required by your building. If you can’t provide it, tell us why.”  
- Upload accept: “PDF, JPG/PNG, DOC/DOCX · up to 25 MB per file.”  
- Disclosures: “By checking this box you acknowledge you’ve received and read the notice.”

---

## 10. Email templates (skeleton)
- **Invite Co‑app/Guarantor:** subject `You’ve been invited to complete an application` → deep link + short expiry note.
- **RFI Request:** subject `More info needed for your application` → section + items + upload link.
- **Submission confirmation:** subject `We’ve submitted your package` → next steps + average review time.
- **Decision:** subject `Application decision` → summary; if adverse‑action, include required notice + CRA contact.

---

### Appendix A — Field map (high level)
- Profile: `full_name, email, phone, dob, ssn_encrypted, ssn_last4, address_history[]`.
- Employment: `employer_name, title, start_date, pay_cadence, annual_income`.
- Financials: `entry_type, category, institution, description, amount`.
- Documents: `category, filename, size_bytes, storage_path, checksum`.
- Disclosures: `type, acknowledged, document_upload_id`.

### Appendix B — Reason codes (starter list)
- Income insufficient; DTI too high; Incomplete documentation; Unsatisfactory references; Board policy criteria not met; Other (notes).

### Appendix C — Status lifecycle
- `IN_PROGRESS → SUBMITTED → IN_REVIEW → (RFI ↔ IN_REVIEW) → APPROVED | CONDITIONAL | DENIED`.

---

## 11. Final build QA kit (added after research double-check)

### 11.1 Wireframing addenda (ready for auto‑generation)
- **Component mapping (suggested):**
  - Layout: `AppShell`, `TopBar`, `SideNav`, `BreadCrumbs`, `InlineToast`, `Modal`, `ConfirmDialog`.
  - Forms: `FieldRow`, `TextInput`, `Select`, `DateInput`, `MoneyInput`, `MaskedSSNInput`, `Checkbox`, `RadioGroup`, `TextArea`, `ErrorSummary`, `FormActions`.
  - Uploads: `UploadDropzone(TUS)`, `DocumentCard(status)`, `UploadProgress`, `RetryButton`.
  - Review: `SectionNavigator`, `PdfViewer`, `CommentThread(visibility: internal|shared)`, `RfiComposer`, `ActivityLog`.
  - Tables: `DataTable`, `FilterBar`, `Tag` (status), `EmptyState`.
  - Decision: `DecisionPanel`, `ReasonTags`, `NotesBox`.
- **ARIA & a11y hooks:**
  - Error summary uses `role="alert"` and focuses the first invalid field on submit.
  - All interactive controls reachable via keyboard; drag‑and‑drop has a button fallback.
  - Provide `aria-live="polite"` on upload progress region; ensure focus is not obscured when modals open.
- **Test IDs naming:** `data-testid="{screenId}-{component}-{slot}"` (e.g., `A3-upload-dropzone`, `B2-rfi-send`).
- **Microcopy catalog (errors):**
  - Required: “Please enter {field}.”
  - Format: “{field} looks incorrect. Check the format.”
  - Upload: “This file type isn’t allowed. Use PDF/JPG/PNG/DOCX.”
  - Disclosure: “You must acknowledge this notice before submitting.”

### 11.2 Implementation addenda (engineer‑ready)
- **Environment variables** (Vercel):
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `STORAGE_BUCKET_DOCS=applications`
  - `VERCEL_ANALYTICS_ENABLED=true`
- **Regions:** Pin Vercel Functions to a US‑East region aligned with the Supabase project. Add failover only if needed later.
- **Storage/buckets:** Private bucket `applications`; path format `apps/{applicationId}/{uuid}-{filename}`; all reads via signed URLs (TTL 10–30m). Max size 25MB/file (raise later if requested by building).
- **Uploads (TUS):** Chunk size ~6MB; resume/retry with exponential backoff; client uses `tus-js-client` or Uppy. Show per‑file progress with `aria-live`.
- **Compilation (Phase 1.5):** Use `pdf-lib` to concatenate PDFs; generate ToC; write to Storage with a new `compiled/` key; don’t block submission on compile success.
- **Telemetry redaction:** Use `@vercel/analytics` `beforeSend` to drop URLs containing email/SSN patterns and scrub custom event params. Disable analytics on `/applications/[id]/review` routes.
- **Security:** Encrypt SSN server‑side before persistence; never place SSN in logs, analytics, or client state snapshots.

### 11.3 Repo scaffold & scripts
```
philter/
  app/
  components/
  lib/ (db.ts, storage.ts, auth.ts)
  tests/e2e/
  scripts/
  prisma/ (optional if Prisma)
```
- Scripts: `dev`, `build`, `lint`, `test`, `e2e`, `typecheck`, `db:migrate`, `db:seed`.
- Seed: create 1 org, 2 buildings (rental, coop), 1 admin, 1 broker, 1 applicant, 1 board; 2 demo applications with sample uploads.

### 11.4 E2E test matrix (Playwright)
- Applicant: create → fill A2–A5 → upload 25MB → drop connection → resume → submit.
- Broker: start app, invite applicant, upload on behalf, submit.
- Admin: open review, create RFI, resolve, record decision.
- Board: open read‑only, verify redacted SSN, download compiled package, link expires.

### 11.5 Performance & SLOs (initial)
- FCP < 2.0s, TTI < 2.5s on US‑East broadband for A1, B2.
- Upload resume must continue within 10s after reconnection.

### 11.6 Legal/compliance notes
- NYC LL55 + Window Guards toggles available per building (lease/sublet flows only).
- If a consumer report informs a decline/condition, system must attach the current FCRA “Summary of Rights” and log the CRA info.

**End of PRD**