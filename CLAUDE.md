# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**philter** is a transaction platform for NYC residential co-op and condo board applications. It digitizes the workflow from application creation through board review.

**Tech Stack:** Next.js 16 (App Router) | React 19 | TypeScript 5 (strict) | Tailwind CSS v4 | Supabase

**Transaction Types:** Co-op Purchase, Condo Purchase, Co-op Sublet, Condo Lease

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm start        # Production server (after build)
```

## Architecture

### Route Structure

```
/app
├── (auth)/              # Auth pages: sign-in, sign-up, verify-email, reset-password
├── (dashboard)/
│   ├── applications/[id]/   # Applicant workflow (13 sections)
│   │   ├── overview, profile, parties, people, income
│   │   ├── financials, real-estate, lease-terms
│   │   ├── building-policies, documents, disclosures
│   │   └── cover-letter, review
│   ├── broker/          # Pipeline, QA, submission tracking
│   ├── agent/           # Inbox, templates, review, decisions
│   ├── board/           # Review interface, private notes
│   └── my-applications, settings, help-support
├── api/                 # API routes
└── page.tsx            # Landing page with role selection
```

### Component Organization

```
/components
├── ui/           # 37 shadcn/ui components (new-york style)
├── forms/        # Specialized inputs (date, money, SSN, repeatable-group)
├── layout/       # app-shell, sidebar, top-bar, mobile-nav
├── features/     # Role-specific: application/, broker/, agent/, board/
├── shared/       # pdf-viewer, filter-bar, lazy-image
├── providers/    # theme-provider
└── auth/         # sign-in-form, sign-up-form
```

### Key Dependencies

| Category | Libraries |
|----------|-----------|
| UI | shadcn/ui, Radix UI (14 packages), Lucide icons, next-themes |
| Forms | React Hook Form, @hookform/resolvers, Zod |
| Data | Supabase (auth, database, storage), React Query |
| PDF | pdfjs-dist, pdf-lib, jsPDF |
| Utils | date-fns, clsx, tailwind-merge, Sonner (toasts) |

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
Role: APPLICANT | CO_APPLICANT | GUARANTOR | BROKER | ADMIN | BOARD | ...
TransactionType: COOP_PURCHASE | CONDO_PURCHASE | COOP_SUBLET | CONDO_LEASE
ApplicationStatus: IN_PROGRESS | SUBMITTED | IN_REVIEW | RFI | APPROVED | CONDITIONAL | DENIED
DocumentCategory: GOVERNMENT_ID | BANK_STATEMENT | TAX_RETURN | PAY_STUB | EMPLOYMENT_LETTER | ...
```

### Main Types

- **Application** - Main object with people, employment, financials, documents, disclosures, RFIs
- **Person** - Applicant/co-applicant/guarantor with address history, emergency contacts
- **Document** - File metadata with category, status, storage path
- **RFI** - Request for Information with messages and attachments
- **Template** - Building-specific configuration for sections and disclosures

## Validation

Zod schemas in `lib/validators.ts`. Key schemas:
- `profileSchema` - Age 18+, 5-year address history, SSN format
- `employmentSchema` - Current employment, income documentation
- `financialEntrySchema` - Assets/liabilities with institution requirements
- `documentSchema` - File type/size restrictions

Pattern: Real-time validation on blur, form-level on submit, error summary at top.

## File Storage

### Supabase Storage (Primary)

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

## Utilities

### lib/utils.ts

```typescript
cn(...classes)                    // Merge Tailwind classes
formatCurrency(amount)            // "$1,234.56"
formatDate(date, format)          // 'short' | 'long' | 'relative'
formatSSN(ssn, format)            // 'full' | 'last4' | 'redacted'
calculateDTI(income, debts)       // Debt-to-income ratio
calculateNetWorth(assets, liabs)  // Net worth
```

### Custom Hooks (lib/hooks/)

- `useApplicationFilters` - Filter by status, search, date
- `useFilePreview` - Load file preview from storage
- `useFormLoading` - Loading states with minimum duration
- `useTableSort` - Multi-column sorting
- `useToast` - Toast notifications wrapper

## Mock Data

Development data in `lib/mock-data/`:
- `applications.ts`, `buildings.ts`, `documents.ts`, `rfis.ts`, `templates.ts`, `users.ts`

```typescript
import { mockApplications, mockBuildings, mockUsers } from '@/lib/mock-data'
```

## Styling

### Tailwind CSS v4

- PostCSS-based configuration
- CSS variables in `app/globals.css`
- Dark mode via `prefers-color-scheme`
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
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

App gracefully handles missing env vars for builds.

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
```
lib/types.ts             # Type definitions
lib/validators.ts        # Zod schemas
lib/utils.ts             # Utilities
lib/supabase-storage.ts  # Storage functions
lib/api/                 # Data access layer
lib/hooks/               # React Query hooks
lib/contexts/            # Auth context
```

**Patterns:**
- Server Components by default
- Zod + React Hook Form for validation
- Supabase Storage for files (signed URLs)
- React Query for server state
- WCAG 2.2 AA accessibility

---
**Version:** 0.1.0 | **Updated:** 2025-01-24
