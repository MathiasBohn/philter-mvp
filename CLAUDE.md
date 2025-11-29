# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**philter** is a transaction platform for NYC residential co-op and condo board applications. It digitizes the workflow from application creation through board review.

**Tech Stack:** Next.js 16 (App Router) | React 19 | TypeScript 5 (strict) | Tailwind CSS v4 | Supabase | Vitest | Playwright

**Transaction Types:** Co-op Purchase, Condo Purchase, Co-op Sublet, Condo Lease

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm start            # Production server (after build)
npm test             # Run unit tests (Vitest)
npm run test:run     # Run unit tests once
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:all     # Run all tests (unit + E2E)
```

## Agent Workflow Guidelines

These guidelines define how coding agents plan, execute, and review work. Follow these principles to ensure clarity, maintainability, and high-quality output.

### 1. Think Before You Code

Before writing any code:

- Carefully read the problem
- Explore the relevant parts of the codebase
- Understand the context and dependencies
- Identify exactly which files or modules will be affected
- **First deliverable is always a written plan**

### 2. Create a Work Plan

For any non-trivial task, create or update a plan file:

```text
documents/implementation/{feature-or-task-name}.md
```

The plan must include:

- Structured list of individual tasks with relevant context
- Meaningful phases or categories for multi-step work
- Each item represents a single, small, well-defined task
- Each item designed to be checked off as completed

**Favor incremental change over large, sweeping modifications.**

### 3. Await Verification Before Coding

Before making any changes:

- Present the plan for review
- Wait for confirmation or revisions
- Only begin coding after the plan is explicitly approved

### 4. Implement Tasks Incrementally

Once approved:

- Work through tasks one at a time
- Mark each item complete as you finish it
- Keep changes scoped only to what is required for that specific task
- Focus on sequential, isolated progress—avoid parallel work across tasks

### 5. Provide Updates

For every step:

- Briefly summarize what you changed and why
- Highlight anything unusual or unexpected
- Document specific implementations in the plan file after completion

### 6. Prioritize Simplicity

All changes must follow the rule of maximum simplicity:

- Avoid massive or complex changes
- Modify as little code as possible
- Never rewrite large sections unless directed
- Prefer the smallest, most direct fix
- Keep everything easy to understand for future reviewers

**Goal: Reduce complexity, not increase it.**

### 7. Add a Review Section

After finishing assigned tasks, add a "Review" section to the plan file:

- What was changed
- Why it was changed
- Any implications or potential follow-up work

This becomes the historical record of the implementation.

### 8. Fix the Root Cause

Agents must:

- Never make temporary or hacky fixes
- Never patch symptoms
- Always identify and resolve the true root cause
- Avoid shortcuts unless explicitly approved
- Operate with senior engineer standards

**Every fix must be final, correct, and thoughtful.**

### 9. Keep Fixes Minimal

All fixes and code changes must adhere to:

- Minimal impact—only affect exact files/functions relevant to the task
- No collateral modifications
- Zero unnecessary refactoring
- Zero stylistic or opinionated changes outside task scope
- Zero new bugs introduced

**Mission: Improve the system without disturbing it.**

### 10. Context Window Management

Monitor conversation complexity and proactively suggest session breaks before context issues arise. Document progress in implementation files to enable clean session handoffs.

**Planning Phase:**

- Design phases that are clearly completable in one session
- Limit each phase to 3-5 focused tasks
- Avoid phases requiring reads of 10+ large files
- Plan natural breakpoints where progress can be saved

**Warning Signs to Watch For:**

- 10+ large file reads in a single session
- 20+ tool calls in rapid succession
- Multiple complex refactoring operations
- Repeated back-and-forth iterations on the same issue
- Conversation spanning 50+ exchanges

**Proactive Session Management:**

- Suggest checkpoints after completing each phase
- Recommend fresh sessions before starting new phases
- Update implementation plan files continuously (not just at the end)
- Summarize completed work before session breaks

**Session Handoff Protocol:**

When approaching session limits or completing a phase:

1. Update the `documents/implementation/{task}.md` file with:
   - Completed tasks (checked off)
   - Current state and any in-progress work
   - Next steps clearly documented
   - Any blockers or decisions needed
2. Provide a brief "session summary" message
3. Suggest starting a new session for the next phase

**Recovery Strategy:**

If context issues occur mid-task:

- The implementation plan file serves as the source of truth
- New sessions can read the plan file to restore context
- Keep plan files detailed enough to resume without prior conversation

**Multi-Session Implementation Workflow:**

For large implementations spanning multiple sessions:

```text
Session 1:
  → Agent completes Phase 1
  → Agent updates documents/implementation/{task}.md
  → Agent says: "Phase 1 complete. Please start a new session."
  → Agent provides resumption command

Session 2:
  → User starts new session
  → User says: "Continue from documents/implementation/{task}.md"
  → Agent reads file, restores context, continues Phase 2
  → Repeat as needed until complete
```

**Important:** The agent cannot clear its own context window. Only the user can start a new session (close/reopen CLI or use `/clear`). The agent will:

1. Proactively stop before context issues arise
2. Prepare a complete handoff in the implementation plan file
3. Provide the exact resumption command to use
4. Make the plan file self-contained for full context restoration

**Resumption Command Format:**

When ready for a session break, the agent will provide:

```text
Continue implementing [task name] from documents/implementation/{task}.md
```

The user pastes this into a fresh session to continue.

### Core Principle

> The highest-quality engineering outcome is the simplest possible solution that fully solves the problem without introducing new issues.

Optimize for clarity, minimal impact, and correctness at every step.

## Architecture

### Route Structure

```text
/app
├── (auth)/                      # Auth pages
│   ├── sign-in, sign-up
│   ├── verify-email, forgot-password, reset-password
│   └── accept-invitation/[token]
├── (dashboard)/
│   ├── applications/[id]/       # Applicant workflow (12 sections)
│   │   ├── profile, parties, people, income
│   │   ├── financials, real-estate, lease-terms
│   │   ├── building-policies, documents, disclosures
│   │   └── cover-letter, review
│   ├── applications/new         # Create new application
│   ├── broker/                  # Broker dashboard
│   │   ├── [id]/qa, [id]/submit
│   │   ├── qa, new, prefill-wizard, submit
│   ├── agent/                   # Managing agent dashboard
│   │   ├── inbox, templates, review/[id], submit
│   │   └── templates/[id]/edit, templates/new
│   ├── board/                   # Board member dashboard
│   │   ├── summary/[id], review/[id], decisions
│   └── my-applications, notifications, settings, help-support
├── api/                         # API routes (see below)
├── claim/[token]                # Claim application invitation
├── privacy-policy
└── page.tsx                     # Landing page with role selection
```

### API Routes

```text
/api
├── applications/                # Application CRUD
│   └── [id]/
│       ├── claim-link, decision, documents, employment
│       ├── financials, people, rfis, submit
├── broker/applications          # Broker-specific endpoints
├── buildings/[id]/template      # Building templates
├── documents/                   # Document management
│   └── [id], signed-urls
├── rfis/                        # Request for Information
│   └── [id]/messages, [id]/resolve
├── templates/[id]/publish       # Template publishing
├── invitations/[token]/accept   # Invitation handling
├── users/                       # User management
│   └── me, me/delete, search
├── decisions                    # Board decisions
├── cover-sheet                  # PDF generation
├── csrf                         # CSRF token endpoint
└── admin/recover-profile        # Admin utilities
```

### Component Organization

```text
/components
├── ui/              # 37 shadcn/ui components (new-york style)
├── forms/           # Specialized inputs
│   ├── date-input, money-input, masked-ssn-input
│   ├── month-year-input, repeatable-group
│   ├── error-summary, enhanced-error
│   ├── field-helper, field-row, form-actions
│   └── progressive-form
├── layout/          # app-shell, sidebar, top-bar, mobile-nav
├── features/        # Role-specific components
│   ├── application/ # Applicant form sections
│   ├── applications/# Application list/cards
│   ├── broker/      # Broker pipeline, QA
│   ├── agent/       # Agent inbox, templates
│   ├── board/       # Board review, notes
│   └── storage/     # File upload/preview
├── shared/          # pdf-viewer, filter-bar, lazy-image
├── providers/       # theme-provider
├── auth/            # route-guard
├── loading/         # Loading states
├── error/           # Error boundaries
└── brand/           # Logo, branding
```

### Key Dependencies

| Category | Libraries |
|----------|-----------|
| UI | shadcn/ui, Radix UI (17 packages), Lucide icons, next-themes |
| Forms | React Hook Form 7, @hookform/resolvers, Zod 4 |
| Data | Supabase (@supabase/ssr, @supabase/supabase-js), React Query 5 |
| PDF | pdfjs-dist, pdf-lib, jsPDF |
| Utils | date-fns, clsx, tailwind-merge, Sonner (toasts), crypto-js, lz-string |
| Email | Resend |
| Testing | Vitest, Playwright, Testing Library |

### Path Aliases

```typescript
@/*           → Root
@/components  → /components
@/lib         → /lib
@/ui          → /components/ui
```

## Data Models

See `lib/types.ts` for complete definitions.

### Core Enums

```typescript
Role: APPLICANT | CO_APPLICANT | GUARANTOR | BROKER | ADMIN | BOARD | UNIT_OWNER | OWNER_BROKER | OWNER_ATTORNEY | APPLICANT_ATTORNEY

TransactionType: COOP_PURCHASE | CONDO_PURCHASE | COOP_SUBLET | CONDO_LEASE

ApplicationStatus: IN_PROGRESS | SUBMITTED | IN_REVIEW | RFI | APPROVED | CONDITIONAL | DENIED

DocumentCategory: GOVERNMENT_ID | BANK_STATEMENT | TAX_RETURN | REFERENCE_LETTER | BUILDING_FORM | PAYSTUB | W2 | OTHER

DisclosureType: LEAD_PAINT_CERTIFICATION | LEAD_WARNING_STATEMENT | LEAD_DISCLOSURE | EPA_LEAD_PAMPHLET | LOCAL_LAW_38 | LOCAL_LAW_55 | WINDOW_GUARD | FLOOD_DISCLOSURE | HOUSE_RULES | CONSUMER_REPORT_AUTH | SUBLET_POLICY | PET_ACKNOWLEDGEMENT | SMOKE_DETECTOR | CARBON_MONOXIDE_DETECTOR | PERSONAL_INFO_AUTH | BACKGROUND_CHECK_CONSENT | REFERENCE_CONTACT_AUTH | EMPLOYMENT_VERIFICATION_AUTH | FINANCIAL_VERIFICATION_AUTH | MOVE_IN_DATE_COMMITMENT | INSURANCE_REQUIREMENTS
```

### Main Types

- **Application** - Main object with people, employment, financials, documents, disclosures, RFIs, participants
- **Person** - Applicant/co-applicant/guarantor with address history
- **EmploymentRecord** - Employment history with income details
- **FinancialEntry** - Assets, liabilities, income, expenses
- **RealEstateProperty** - Real estate holdings
- **Document** - File metadata with category, status, storage path
- **RFI** - Request for Information with messages and attachments
- **Template** - Building-specific configuration for sections and disclosures
- **Participant** - Deal parties (unit owner, brokers, attorneys)
- **DecisionRecord** - Board decision with reason codes

### ApplicationSection

Type-safe discriminated union for section data:

```typescript
type ApplicationSection =
  | { key: 'profile'; data?: ProfileSectionData }
  | { key: 'parties'; data?: PartiesSectionData }
  | { key: 'people'; data?: Person[] }
  | { key: 'income'; data?: EmploymentRecord[] }
  | { key: 'financials'; data?: FinancialEntry[] }
  | { key: 'real-estate'; data?: RealEstateProperty[] }
  | { key: 'lease-terms'; data?: LeaseTermsSectionData }
  | { key: 'building-policies'; data?: BuildingPoliciesSectionData }
  | { key: 'documents'; data?: Document[] }
  | { key: 'disclosures'; data?: Disclosure[] }
  | { key: 'cover-letter'; data?: CoverLetterSectionData }
  | { key: 'review'; data?: ReviewSectionData }
```

## File Storage

### Supabase Storage

```typescript
import { uploadFile, downloadFile, deleteFile, listFiles } from '@/lib/supabase-storage'

// Upload
const { path } = await uploadFile('documents', `${userId}/${appId}/${docId}`, file)

// Get signed URL (expires in 1 hour)
const url = await downloadFile('documents', path, 3600)

// Delete
await deleteFile('documents', path)
```

**Buckets:** `documents` (private), `profile-photos` (private), `building-assets` (public)

**Structure:** `bucket/user-id/application-id/document-id`

### Document Hooks

```typescript
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/lib/hooks/use-documents'

const { data: documents } = useDocuments(applicationId)
const uploadMutation = useUploadDocument()
await uploadMutation.mutateAsync({ applicationId, file, category: 'BANK_STATEMENT' })
```

### localStorage

UI state only via `storageService` in `lib/storage.ts`. All application data in Supabase.

## State Management

### Auth Context

```typescript
import { useAuth } from '@/lib/contexts/auth-context'

const { user, profile, isLoading, signOut } = useAuth()
// user: id, name, email, role
// profile: additional fields from users table
```

### Supabase Clients

```typescript
// Client-side
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side (Server Components, API routes)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

## Custom Hooks (lib/hooks/)

| Hook | Purpose |
|------|---------|
| `useApplications` | Application CRUD operations |
| `useDocuments` | Document management |
| `useEmployment` | Employment records |
| `useFinancials` | Financial entries |
| `usePeople` | People (applicants, co-applicants, guarantors) |
| `useRfis` | Request for Information |
| `useDecisions` | Board decisions |
| `useTemplates` | Building templates |
| `useNotifications` | User notifications |
| `useApplicationFilters` | Filter by status, search, date |
| `useFilePreview` | Load file preview from storage |
| `useFormLoading` | Loading states with minimum duration |
| `useFormValidation` | Form validation helpers |
| `useTableSort` | Multi-column sorting |
| `usePresence` | Realtime presence |
| `useRealtimeApplication` | Realtime application updates |
| `useRealtimeDocuments` | Realtime document updates |
| `useRealtimeRfi` | Realtime RFI updates |
| `useTypingIndicator` | Typing indicator for messages |

## API Layer (lib/api/)

Server-side data access with validation and error handling:

| Module | Purpose |
|--------|---------|
| `applications.ts` | Application CRUD, status updates |
| `documents.ts` | Document operations |
| `employment.ts` | Employment record management |
| `financials.ts` | Financial entry management |
| `people.ts` | Person management |
| `rfis.ts` | RFI operations |
| `decisions.ts` | Board decision recording |
| `templates.ts` | Template management |
| `users.ts` | User operations |
| `audit.ts` | Audit logging |
| `transactions.ts` | Database transactions |
| `validate.ts` | Input validation |
| `errors.ts` | Error handling utilities |
| `rate-limit.ts` | Rate limiting |

## Utilities

### lib/utils.ts

```typescript
cn(...classes)                       // Merge Tailwind classes
formatCurrency(amount)               // "$1,234"
formatDate(date, format)             // 'short' | 'long' | 'relative'
formatSSN(ssn, format)               // 'full' | 'last4' | 'redacted'
calculateDTI(income, debts)          // Debt-to-income ratio
calculateNetWorth(entries)           // Net worth from financial entries
calculateCompletionPercentage(sects) // Section completion %
```

### Other Utilities

- `lib/validators.ts` - Zod schemas for all data types
- `lib/routing.ts` - Route helpers and constants
- `lib/pdf-utils.ts` - PDF generation utilities
- `lib/email.ts` - Email sending via Resend
- `lib/audit.ts` - Audit logging
- `lib/csrf.ts` - CSRF protection
- `lib/logger.ts` - Structured logging
- `lib/data-integrity.ts` - Data validation
- `lib/upload-manager.ts` - File upload management
- `lib/indexed-db.ts` - IndexedDB utilities

## Styling

### Tailwind CSS v4

- PostCSS-based configuration
- CSS variables in `app/globals.css`
- Dark mode via `next-themes`
- Breakpoints: sm (640), md (768), lg (1024), xl (1280), 2xl (1536)

### Patterns

```typescript
import { cn } from '@/lib/utils'

// Merge classes
<div className={cn('base-styles', condition && 'conditional-styles', className)} />

// Theme variables
<div className="bg-background text-foreground border-border" />

// Dark mode
<div className="bg-white dark:bg-black" />
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add button dialog form
```

## Conventions

### Naming

- Files: kebab-case (`upload-dropzone.tsx`)
- Components: PascalCase (`UploadDropzone`)
- Server Components by default, `"use client"` when needed

### Imports

```typescript
// 1. External deps
import { useState } from 'react'
// 2. Internal components
import { Button } from '@/components/ui/button'
// 3. Utilities
import { cn } from '@/lib/utils'
// 4. Types
import type { Application } from '@/lib/types'
```

### Error Handling

```typescript
try {
  await uploadFile('documents', path, file)
  toast.success('Uploaded')
} catch (error) {
  console.error('Upload failed:', error)
  toast.error('Upload failed. Please try again.')
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://philter-mvp.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=your-encryption-key  # openssl rand -base64 32
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=philter <onboarding@resend.dev>
```

App gracefully handles missing env vars for builds.

## Testing

### Unit Tests (Vitest)

Located in `tests/unit/` and `tests/`:

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

### E2E Tests (Playwright)

Located in `tests/`:

```bash
npm run test:e2e        # Headless
npm run test:e2e:ui     # With UI
npm run test:e2e:headed # Headed mode
```

Test files cover authentication, applicant workflow, broker workflow, board workflow, admin features, and edge cases.

## Common Tasks

### Add a Page

```typescript
// app/(dashboard)/new-page/page.tsx
export default function NewPage() {
  return <div>Content</div>
}
// Add nav link in components/layout/sidebar.tsx
```

### Add a Form Section

1. Create component in `components/features/application/`
2. Add Zod schema in `lib/validators.ts`
3. Create page route in `app/(dashboard)/applications/[id]/`
4. Add API route if needed in `app/api/applications/[id]/`

### Add File Upload

```typescript
import { UploadDropzone } from '@/components/features/application/upload-dropzone'
import { useUploadDocument } from '@/lib/hooks/use-documents'

const uploadMutation = useUploadDocument()

<UploadDropzone
  onFilesSelected={(files) => files.forEach(f =>
    uploadMutation.mutateAsync({ applicationId, file: f, category: 'BANK_STATEMENT' })
  )}
  accept={{ 'application/pdf': ['.pdf'] }}
  maxSize={25 * 1024 * 1024}
/>
```

## Quick Reference

**Key Files:**

```text
lib/types.ts             # Type definitions
lib/validators.ts        # Zod schemas
lib/utils.ts             # Utilities
lib/supabase-storage.ts  # Storage functions
lib/api/                 # Data access layer
lib/hooks/               # React Query hooks
lib/contexts/            # Auth context
lib/supabase/            # Supabase client setup
```

**Patterns:**

- Server Components by default
- Zod + React Hook Form for validation
- Supabase Storage for files (signed URLs)
- React Query for server state
- WCAG 2.2 AA accessibility
- Type-safe API routes with validation
