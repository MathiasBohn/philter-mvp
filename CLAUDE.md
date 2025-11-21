# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**philter** is a modern transaction platform for residential co-op and condo board applications. It digitizes the entire workflow from application creation through board review and decision-making, supporting multiple transaction types and stakeholder roles.

**Technology Stack:**
- Next.js 16.0.3 with App Router architecture
- React 19.2.0 with React Server Components
- TypeScript 5 (strict mode enabled)
- Tailwind CSS v4 (PostCSS-based)
- Node.js 18.17+ required

**Application Domain:**
The platform handles NYC residential real estate transactions including:
- Co-op Purchase
- Condo Purchase
- Co-op Sublet (with tenant-specific disclosures)
- Condo Lease (with tenant-specific disclosures)

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Server runs at http://localhost:3000. Pages auto-reload on file changes.

### Building for Production
```bash
npm run build
```
Creates optimized production build in `.next` directory.

### Starting Production Server
```bash
npm start
```
Must run `npm run build` first.

### Linting
```bash
npm run lint
```
Uses ESLint with Next.js configuration.

## Architecture Overview

### App Router Structure

The application uses Next.js App Router with organized route groups:

**Root Level** (`/app`):
- `page.tsx` - Landing page with role selection (Applicant, Broker, Transaction Agent, Board Member)
- `layout.tsx` - Root layout with ThemeProvider, UserProvider, Geist fonts, metadata
- `globals.css` - Tailwind CSS v4 with custom theme tokens and dark mode support
- `error.tsx` - Global error boundary

**Dashboard Route Group** (`/app/(dashboard)`):
The dashboard contains role-specific workflows:

1. **Applicant Workflow** (`/applications/[id]/*/page.tsx` - 13 sections):
   - `/overview` - Dashboard with progress tracking
   - `/profile` - Personal info, SSN (masked), emergency contacts
   - `/parties` - Co-applicants, guarantors
   - `/people` - Unit owners, brokers, attorneys
   - `/income` - Employment history, self-employment
   - `/financials` - Assets, liabilities, net worth (REBNY-aligned)
   - `/real-estate` - Housing history, landlord references
   - `/lease-terms` - Move-in preferences, rent budget
   - `/building-policies` - Pet, smoking, renovation acknowledgments
   - `/documents` - Upload with categories, PDF preview
   - `/disclosures` - Legal acknowledgments (Lead Paint, Local Laws, FCRA)
   - `/cover-letter` - Personal introduction to board
   - `/review` - Final validation and submission

2. **Broker Workflow** (`/broker`):
   - `/pipeline` - Application tracking (table/card views)
   - `/[id]/qa` - Quality assurance review interface
   - `/[id]/submit` - Building submission tracking
   - `/qa` - Overall QA dashboard

3. **Transaction Agent Workflow** (`/agent`):
   - `/inbox` - Application inbox with filtering
   - `/templates` - Template management system
   - `/[id]/review` - Complete application review
   - `/[id]/decision` - Decision management with RFI system

4. **Board Member Workflow** (`/board`):
   - `/review` - Application review interface
   - `/[id]` - Individual application details
   - Private notes system, SSN-redacted views

5. **Shared Routes**:
   - `/my-applications` - User's application list
   - `/settings` - User preferences
   - `/help-support` - Documentation
   - `/test-pdf` - PDF testing utilities

**Layout Architecture:**
- Nested layouts with role-specific sidebars
- AppShell component provides global navigation
- Conditional sidebar visibility on detail pages
- MigrationChecker and StorageMonitor mounted at dashboard level

### Technology Stack Details

**Core Dependencies:**

**UI Framework:**
- **shadcn/ui** - Base component library (37 components, "new-york" style)
- **Radix UI** (14 packages) - Headless UI primitives for accessibility
  - Dialog, Dropdown Menu, Popover, Select, Checkbox, Radio Group, Switch
  - Accordion, Tabs, Progress, Tooltip, Alert Dialog, Avatar, Scroll Area
- **Lucide React** (0.553.0) - Icon library
- **next-themes** (0.4.6) - Dark mode support
- **tw-animate-css** (1.4.0) - Animation utilities
- **cmdk** (1.1.1) - Command menu component

**Form Management:**
- **React Hook Form** (7.66.0) - Form state management
- **@hookform/resolvers** (5.2.2) - Validation resolvers
- **Zod** (4.1.12) - Schema validation and type inference

**Data & Storage:**
- **IndexedDB** - Primary file storage (browser native, 50MB-1GB+ capacity)
- **localStorage** - Application metadata, form data
- **lz-string** (1.5.0) - Data compression for large payloads

**PDF Handling:**
- **pdfjs-dist** (5.4.394) - PDF viewing and rendering
- **pdf-lib** (1.17.1) - PDF manipulation and assembly
- **jsPDF** (3.0.3) - PDF generation (cover sheets, reports)

**Utilities:**
- **date-fns** (4.1.0) - Date manipulation and formatting
- **react-day-picker** (9.11.1) - Calendar/date picker
- **class-variance-authority** (0.7.1) - Component variants
- **clsx** (2.1.1) + **tailwind-merge** (3.4.0) - CSS class management
- **Sonner** (2.0.7) - Toast notifications

**Development Tools:**
- **TypeScript** (^5) - Type safety
- **ESLint** (^9) with Next.js config
- **Tailwind CSS** (^4) with PostCSS

### TypeScript Configuration

**Path Aliases:**
```typescript
@/*           → Root directory
@/components  → /components
@/lib         → /lib
@/ui          → /components/ui
@/hooks       → /hooks (via components.json)
```

**Compiler Options:**
- Target: ES2017
- Module resolution: bundler
- Strict mode: enabled
- JSX: react-jsx (React 19 automatic runtime)

### Component Organization

**Component Structure:**

1. **UI Components** (`/components/ui`) - 37 base components
   - **Forms:** button, input, textarea, select, checkbox, radio-group, switch, label, form
   - **Data Display:** card, table, badge, avatar, skeleton, empty-state
   - **Overlays:** dialog, alert-dialog, popover, tooltip, sheet, command
   - **Navigation:** breadcrumb, tabs, dropdown-menu
   - **Feedback:** alert, progress, sonner (toasts)
   - **Layout:** page-container, page-header, scroll-area, separator
   - **Custom:** data-table, state-select, theme-toggle, calendar

2. **Form Components** (`/components/forms`) - 11 specialized inputs
   - `date-input.tsx` - Date picker with calendar popup
   - `masked-ssn-input.tsx` - SSN masking with validation
   - `money-input.tsx` - Currency formatting and input
   - `month-year-input.tsx` - Month/year selection
   - `progressive-form.tsx` - Multi-step form wrapper
   - `repeatable-group.tsx` - Dynamic form arrays (add/remove rows)
   - `enhanced-error.tsx` - Enhanced error display
   - `error-summary.tsx` - Form error summary
   - `field-helper.tsx` - Field help text
   - `field-row.tsx` - Form field layout wrapper
   - `form-actions.tsx` - Form action buttons (save/cancel/next)

3. **Layout Components** (`/components/layout`) - 6 components
   - `app-shell.tsx` - Main application shell with navigation
   - `sidebar.tsx` - Role-specific navigation sidebar
   - `top-bar.tsx` - Header/top navigation bar
   - `mobile-nav.tsx` - Mobile navigation drawer
   - `breadcrumbs.tsx` - Breadcrumb navigation
   - `progress-indicator.tsx` - Multi-step progress tracking

4. **Feature Components** (`/components/features`) - Organized by role:
   - `/application` - Applicant UI (upload-dropzone, document-card, document-checklist)
   - `/applications` - Application list components
   - `/broker` - Broker workflow (pipeline views, QA checklists, mobile-cards)
   - `/agent` - Transaction Agent (template editor, RFI manager, decision panel)
   - `/board` - Board Member (review interface, notes system)
   - `/storage` - Storage management (migration-checker, storage-monitor)

5. **Shared Components** (`/components/shared`)
   - `pdf-viewer.tsx` - Server-side PDF viewer
   - `pdf-viewer-client.tsx` - Client-side PDF viewer
   - `lazy-pdf-viewer.tsx` - Lazy-loaded PDF viewer
   - `lazy-image.tsx` - Lazy-loaded image component
   - `filter-bar.tsx` - Filtering and search interface

6. **Provider Components** (`/components/providers`)
   - `theme-provider.tsx` - Theme context (next-themes wrapper)

**Component Naming Conventions:**
- kebab-case for all component files (e.g., `upload-dropzone.tsx`)
- PascalCase for component names (e.g., `UploadDropzone`)
- Server Components by default (no "use client" unless needed)
- Client Components explicitly marked with `"use client"` directive
- Page components use default exports
- Utility components use named exports

## Data Models & Type System

The application has a comprehensive type system in [lib/types.ts](lib/types.ts) (521 lines).

### Core Enums

```typescript
Role: APPLICANT | CO_APPLICANT | GUARANTOR | BROKER | ADMIN | BOARD | etc. (13 variants)

TransactionType:
  - COOP_PURCHASE
  - CONDO_PURCHASE
  - COOP_SUBLET
  - CONDO_LEASE

ApplicationStatus:
  - IN_PROGRESS
  - SUBMITTED
  - IN_REVIEW
  - RFI (Request for Information)
  - APPROVED
  - CONDITIONAL
  - DENIED

DocumentCategory:
  - GOVERNMENT_ID
  - BANK_STATEMENT
  - TAX_RETURN
  - PAY_STUB
  - EMPLOYMENT_LETTER
  - REFERENCE_LETTER
  - OTHER_FINANCIAL
  - OTHER

DisclosureType:
  - LEAD_PAINT
  - LOCAL_LAW_144
  - LOCAL_LAW_97
  - FCRA_AUTHORIZATION
  - BACKGROUND_CHECK_CONSENT
  - CREDIT_CHECK_AUTHORIZATION
  - etc. (14+ types)
```

### Major Data Structures

**Application** - Main application object:
```typescript
{
  id: string
  transactionType: TransactionType
  status: ApplicationStatus
  currentSection: string
  people: Person[]
  employment: EmploymentRecord[]
  financials: FinancialEntry[]
  documents: Document[]
  disclosures: Disclosure[]
  rfis: RFI[]
  decisionRecords: DecisionRecord[]
  // ... 13+ additional fields
}
```

**Person** - Applicant/co-applicant/guarantor:
```typescript
{
  id: string
  role: Role
  firstName, lastName, email, phone
  dateOfBirth, ssn
  currentAddress: Address
  addressHistory: AddressHistory[]
  emergencyContacts: EmergencyContact[]
}
```

**Document** - File metadata:
```typescript
{
  id: string
  name: string
  category: DocumentCategory
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
  status: 'uploading' | 'processing' | 'complete' | 'error'
  progress?: number
  preview?: string // blob URL
  file?: File
}
```

**RFI** (Request for Information):
```typescript
{
  id: string
  applicationId: string
  createdBy: string
  createdAt: Date
  dueDate?: Date
  status: 'pending' | 'responded' | 'resolved'
  messages: RFIMessage[]
  attachments: Document[]
}
```

**Template** - Building-specific configuration:
```typescript
{
  id: string
  name: string
  buildingId: string
  sections: TemplateSection[] // Configure required/optional sections
  customDisclosures: CustomDisclosure[]
  isPublished: boolean
}
```

**Financial Categories:**
- AssetCategory: CHECKING, SAVINGS, STOCKS, BONDS, RETIREMENT, REAL_ESTATE, OTHER
- LiabilityCategory: MORTGAGE, AUTO_LOAN, STUDENT_LOAN, CREDIT_CARD, OTHER
- IncomeCategory: SALARY, BONUS, INVESTMENT, RENTAL, OTHER
- ExpenseCategory: RENT, UTILITIES, INSURANCE, etc.

## Validation System

The application uses Zod schemas for validation in [lib/validators.ts](lib/validators.ts) (314 lines).

### Key Validation Schemas

**Profile Validation:**
```typescript
profileSchema
  - Age validation (18+ required)
  - Address history completeness (5 years)
  - SSN format validation
  - Emergency contact requirements
```

**Employment Validation:**
```typescript
employmentSchema
  - Current employment requirements
  - Income documentation thresholds
  - Self-employment disclosure requirements
```

**Financial Validation:**
```typescript
financialEntrySchema
  - Asset/liability categorization
  - Value formatting and validation
  - Institution requirements
```

**Document Upload Validation:**
```typescript
documentSchema
  - File type restrictions (PDF, images)
  - File size limits (10MB default)
  - Required documents by category
```

**Template Configuration:**
```typescript
templateSchema
  - Section configuration validation
  - Custom disclosure requirements
  - Publishing prerequisites
```

**Decision Panel Validation:**
```typescript
decisionSchema
  - Approval reason codes
  - Conditional approval requirements
  - Adverse action notice requirements (FCRA compliance)
```

### Validation Patterns

- Real-time validation on field blur
- Form-level validation on submit
- Progressive disclosure of errors
- Error summary component at form top
- Field-level error messages
- Schema-driven validation (single source of truth)

## File Storage & Persistence

The application uses a hybrid storage approach optimized for performance and capacity.

### Storage Architecture

**IndexedDB** ([lib/indexed-db.ts](lib/indexed-db.ts) - 465 lines)
- **Primary storage for file uploads** (50MB-1GB+ capacity, browser-dependent)
- Stores files as **Blob objects** (not base64) for 33% space savings
- Database: `philter_file_storage` (version 1)
- Object store: `files` with indexes on `category` and `uploadedAt`

**Key Functions:**
```typescript
saveFileToIndexedDB(file: StoredFile): Promise<void>
getFileFromIndexedDB(id: string): Promise<StoredFile | undefined>
getAllFilesFromIndexedDB(): Promise<StoredFile[]>
deleteFileFromIndexedDB(id: string): Promise<void>
checkStorageQuota(): Promise<{ usage: number, quota: number, percentUsed: number }>
```

**StoredFile Structure:**
```typescript
{
  id: string
  filename: string
  size: number
  type: string
  blob: Blob        // Native Blob, not base64
  uploadedAt: Date
  category: string
}
```

**localStorage** ([lib/storage.ts](lib/storage.ts) - 247 lines)
- **Application metadata and form data only**
- Centralized through `storageService` class
- In-memory caching for performance
- Observer pattern for reactive updates
- Storage keys defined in `STORAGE_KEYS` constant

**Key Features:**
```typescript
storageService.get<T>(key: string): T | null
storageService.set<T>(key: string, value: T): void
storageService.remove(key: string): void
storageService.clear(): void
storageService.subscribe(key: string, callback: Function): () => void

// React hook for reactive access
useStorage<T>(key: string, defaultValue: T)
```

### Upload System

**UploadManager** ([lib/upload-manager.ts](lib/upload-manager.ts) - 391 lines)

Orchestrates file uploads with simulated progress tracking:

```typescript
// Start upload with progress tracking
uploadManager.startUpload(
  fileId,
  (progress) => console.log(`Progress: ${progress}%`),
  () => console.log('Complete'),
  (error) => console.error(error)
)

// Save to IndexedDB after upload completes
await saveFileToStorage(file, fileId, 'documents')

// Retrieve files
const files = await getStoredFiles()
const file = await getStoredFile(fileId)

// Convert stored file back to File object
const fileObject = getFileObject(storedFile)

// Delete file
await deleteStoredFile(fileId)
```

**Upload Features:**
- Simulated progress (0-100%)
- Pause/resume capability
- Error handling with retry logic
- Integration with IndexedDB
- Blob URL generation for previews

### Data Persistence

**Persistence Utilities** ([lib/persistence.ts](lib/persistence.ts) - 432 lines)

Handles form data and application state persistence:

```typescript
// Application data management
saveApplicationData(id: string, data: Partial<Application>): void
getApplicationData(id: string): Application | null
mergeWithMockData(id: string, changes: Partial<Application>): Application

// Compression for large data (threshold: 1KB)
saveCompressedData(key: string, data: any): void
loadCompressedData(key: string): any | null

// Chunking for very large data (50KB chunks)
saveChunkedData(key: string, data: any): void
loadChunkedData(key: string): any | null

// Form synchronization
syncFormData(formId: string, data: any): void
```

**Key Features:**
- LZ-String compression (threshold: 1KB)
- Chunking for large data (50KB chunks)
- Automatic merge with mock data
- Form state synchronization
- RFI and decision record persistence

### Migration System

**Automatic Migration** ([components/features/storage/migration-checker.tsx](components/features/storage/migration-checker.tsx))

Automatically migrates legacy base64 files from localStorage to IndexedDB:

```typescript
// Triggered on dashboard load
<MigrationChecker />

// Manual migration
import { migrateFilesFromLocalStorage } from '@/lib/upload-manager'

const result = await migrateFilesFromLocalStorage(true) // true = cleanup localStorage
console.log(`Migrated ${result.migratedCount} files`)
console.log(`Failed: ${result.failedCount}`)
```

**Migration Process:**
1. Detects legacy `philter_uploaded_files` key in localStorage
2. Shows migration progress UI to user
3. Converts base64 strings to Blobs
4. Saves to IndexedDB with proper structure
5. Cleans up localStorage after success
6. Shows user-friendly success/error messages

### Data Integrity

**Integrity Tools** ([lib/data-integrity.ts](lib/data-integrity.ts))

Validates and repairs file references:

```typescript
// Validate file references for an application
const integrity = await checkDataIntegrity('app-id')
if (!integrity.valid) {
  console.log('Issues found:', integrity.issues)
  // issues: ['Document doc-123 references missing file']
}

// Find orphaned files (no application reference)
const orphans = await findOrphanedFiles()
console.log(`Found ${orphans.length} orphaned files`)

// Cleanup orphaned files
await cleanupOrphanedFiles(false) // false = actual deletion, true = dry run

// Auto-repair inconsistencies
const repairResult = await repairDataIntegrity('app-id', true)
console.log(`Repaired: ${repairResult.repairedCount}`)
console.log(`Removed: ${repairResult.removedCount}`)
```

### Storage Monitoring

**StorageMonitor** ([components/features/storage/storage-monitor.tsx](components/features/storage/storage-monitor.tsx))

Monitors browser storage quota in real-time:

- Automatically checks every 5 minutes
- Shows warning at 80% capacity
- Shows critical alert at 90% capacity
- Displays usage statistics
- Mounted at dashboard layout level

### Upload Components

**UploadDropzone** ([components/features/application/upload-dropzone.tsx](components/features/application/upload-dropzone.tsx))
- Drag-and-drop file upload
- Multiple file support
- File type filtering
- Size limit validation
- Visual drag state feedback

**DocumentCard** ([components/features/application/document-card.tsx](components/features/application/document-card.tsx))
- Displays uploaded files
- Shows upload progress
- File metadata display
- Preview/delete actions
- Image preview for supported formats

**DocumentChecklist** ([components/features/application/document-checklist.tsx](components/features/application/document-checklist.tsx))
- Organizes uploads by category
- Tracks completion status
- Skip functionality with reasons
- Required/optional indicators

### Storage Best Practices

**1. Always persist files to IndexedDB after upload:**
```typescript
// After upload completes
if (doc.status === 'complete') {
  await saveFileToStorage(doc.file, doc.id, 'documents')
}
```

**2. Restore files on page load:**
```typescript
useEffect(() => {
  const loadFiles = async () => {
    const storedFiles = await getStoredFiles()
    // Merge with metadata and restore to state
  }
  loadFiles()
}, [])
```

**3. Clean up blob URLs to prevent memory leaks:**
```typescript
useEffect(() => {
  return () => {
    documents.forEach(doc => {
      if (doc.preview) URL.revokeObjectURL(doc.preview)
    })
  }
}, [documents])
```

**4. Handle storage errors gracefully:**
```typescript
try {
  await saveFileToStorage(file, id, category)
} catch (error) {
  if (error.message.includes('quota')) {
    // Show quota exceeded message to user
    toast.error('Storage quota exceeded. Please delete some files.')
  } else {
    // Generic error handling
    toast.error('Failed to save file. Please try again.')
  }
}
```

**5. Use data integrity tools after bulk operations:**
```typescript
// After importing/migrating multiple files
const integrity = await checkDataIntegrity(applicationId)
if (!integrity.valid) {
  await repairDataIntegrity(applicationId, true)
}
```

### Troubleshooting Storage Issues

**Files not persisting after refresh:**
- Verify `saveFileToStorage()` is called after upload completes
- Check IndexedDB in DevTools (Application → IndexedDB → philter_file_storage)
- Check browser console for storage errors

**Migration not triggering:**
- Migration only runs if `philter_uploaded_files` key exists in localStorage
- Check browser console for migration errors
- Verify `MigrationChecker` is mounted in dashboard layout

**Storage quota exceeded:**
- IndexedDB quota varies by browser (50MB-1GB+, often ~500MB)
- Use `checkStorageQuota()` to check current usage
- Consider implementing file size limits (e.g., 10MB per file)
- Implement cleanup strategies for old/orphaned files

**Blob URLs not displaying:**
- Ensure blob URLs are created with `URL.createObjectURL(blob)`
- Verify blob URLs are revoked on component unmount
- Check browser console for CORS or security errors

## Utility Functions

### Core Utilities ([lib/utils.ts](lib/utils.ts))

**Class Name Merging:**
```typescript
cn(...classes: ClassValue[]): string
// Combines clsx and tailwind-merge for conflict-free class merging
// Example: cn('px-4', 'px-2') => 'px-2' (latter wins)
```

**Currency Formatting:**
```typescript
formatCurrency(amount: number): string
// Returns USD formatted string: formatCurrency(1234.56) => "$1,234.56"
```

**Date Formatting:**
```typescript
formatDate(date: Date | string, format?: 'short' | 'long' | 'relative'): string
// short: "12/31/2024"
// long: "December 31, 2024"
// relative: "2 days ago"
```

**SSN Formatting:**
```typescript
formatSSN(ssn: string, format?: 'full' | 'last4' | 'redacted'): string
// full: "123-45-6789"
// last4: "***-**-6789"
// redacted: "***-**-****"
```

**Financial Calculations:**
```typescript
calculateDTI(income: FinancialEntry[], debts: FinancialEntry[]): number
// Returns debt-to-income ratio as percentage

calculateNetWorth(assets: FinancialEntry[], liabilities: FinancialEntry[]): number
// Returns net worth (assets - liabilities)

calculateCompletionPercentage(application: Application): number
// Returns application completion percentage (0-100)
```

### PDF Utilities ([lib/pdf-utils.ts](lib/pdf-utils.ts))

**Generate Cover Sheet:**
```typescript
generateCoverSheet(application: Application, building: Building): Promise<Blob>
// Generates PDF cover sheet with jsPDF
// Includes application summary, building info, document categorization
```

### Custom Hooks ([lib/hooks/](lib/hooks/))

**useApplicationFilters** ([use-application-filters.ts](lib/hooks/use-application-filters.ts))
```typescript
const { filteredApplications, filters, setFilters } = useApplicationFilters(applications)
// Filters applications by status, search query, date range
```

**useFilePreview** ([use-file-preview.ts](lib/hooks/use-file-preview.ts))
```typescript
const { previewUrl, isLoading, error } = useFilePreview(fileId)
// Loads file from IndexedDB and creates blob URL for preview
```

**useFormLoading** ([use-form-loading.ts](lib/hooks/use-form-loading.ts))
```typescript
const { isLoading, startLoading, stopLoading } = useFormLoading()
// Manages form loading states with minimum duration
```

**useFormValidation** ([use-form-validation.ts](lib/hooks/use-form-validation.ts))
```typescript
const { errors, validateField, validateForm } = useFormValidation(schema)
// Provides validation utilities for forms with Zod schemas
```

**useTableSort** ([use-table-sort.ts](lib/hooks/use-table-sort.ts))
```typescript
const { sortedData, sortConfig, requestSort } = useTableSort(data, defaultSort)
// Handles table sorting with multi-column support
```

**useToast** ([use-toast.ts](lib/hooks/use-toast.ts))
```typescript
const { toast } = useToast()
toast.success('Application saved!')
toast.error('Failed to save application')
toast.info('Validation in progress...')
// Wrapper around Sonner for consistent toast notifications
```

## Mock Data System

The application uses a comprehensive mock data system for development and testing in [lib/mock-data/](lib/mock-data/).

### Mock Data Files

**applications.ts** - Sample applications
- Multiple applications with various statuses (in_progress, submitted, in_review, approved, etc.)
- Different transaction types
- Complete data for all sections

**buildings.ts** - Building database
- NYC co-op and condo buildings
- Address information
- Building-specific policies

**documents.ts** - Document samples
- Sample documents for each category
- Various file types and sizes

**rfis.ts** - Request for Information samples
- Sample RFIs with different statuses
- Message threads
- Attachments

**templates.ts** - Application template configurations
- Building-specific templates
- Section customization examples
- Custom disclosure configurations

**users.ts** - Mock users for each role
- Applicant, Broker, Transaction Agent, Board Member, Admin
- Different authentication states

**index.ts** - Centralized exports

### Using Mock Data

**Merging with Persisted Data:**
```typescript
import { getApplicationData, mergeWithMockData } from '@/lib/persistence'

// Load application (merges localStorage changes with mock base)
const application = mergeWithMockData(applicationId, {})

// Save changes (only persists deltas)
saveApplicationData(applicationId, { status: 'submitted' })
```

**Accessing Mock Data:**
```typescript
import { mockApplications, mockBuildings, mockUsers } from '@/lib/mock-data'

const applicant = mockUsers.find(u => u.role === 'APPLICANT')
const application = mockApplications[0]
const building = mockBuildings[0]
```

## State Management

The application uses a lightweight state management approach:

### React Context

**UserProvider** ([lib/user-context.tsx](lib/user-context.tsx))
```typescript
import { useUser } from '@/lib/user-context'

function Component() {
  const { user, login, logout, isAuthenticated } = useUser()

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <div>Welcome, {user.firstName}</div>
}
```

**Features:**
- User authentication state (mock system)
- Persists to localStorage
- Role-based access control
- Automatic session restoration

**ThemeProvider** ([components/providers/theme-provider.tsx](components/providers/theme-provider.tsx))
```typescript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</button>
}
```

### Local State Patterns

**Form State:**
- React Hook Form for form-level state
- Automatic persistence on change
- Optimistic UI updates

**Component State:**
- useState for simple local state
- useReducer for complex state machines
- Custom hooks for reusable stateful logic

**Server State:**
- Currently using mock data (no backend)
- Designed for future API integration
- Optimistic updates with localStorage fallback

## Styling System

### Tailwind CSS v4

**Configuration:**
- PostCSS-based (no separate tailwind.config.js)
- CSS variables for theming
- Dark mode via `prefers-color-scheme` media query
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

**Theme Tokens** (defined in [app/globals.css](app/globals.css)):
```css
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;

  /* Borders */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  /* Dark mode color overrides */
}
```

### Styling Patterns

**Component Styling:**
```typescript
import { cn } from '@/lib/utils'

function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        'rounded-md px-4 py-2',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'bg-secondary text-foreground',
        className
      )}
      {...props}
    />
  )
}
```

**Responsive Design:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid: 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

**Dark Mode:**
```typescript
<div className="bg-white dark:bg-black text-black dark:text-white">
  {/* Automatically adapts to system theme preference */}
</div>
```

**CSS Variables:**
```typescript
<div className="bg-background text-foreground border-border">
  {/* Uses CSS variables from globals.css */}
</div>
```

### shadcn/ui Configuration

The project uses shadcn/ui with the "new-york" style variant ([components.json](components.json)):

```json
{
  "style": "new-york",
  "rsc": true,
  "iconLibrary": "lucide",
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

**Adding New Components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

Components are installed to `/components/ui` and can be customized directly.

## Constants & Configuration

### Centralized Labels ([lib/constants/labels.ts](lib/constants/labels.ts))

**Status Labels:**
```typescript
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  // ...
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  // ...
}
```

**Role Labels:**
```typescript
export const ROLE_LABELS: Record<Role, string> = {
  APPLICANT: 'Applicant',
  CO_APPLICANT: 'Co-Applicant',
  GUARANTOR: 'Guarantor',
  // ...
}
```

**Transaction Type Labels:**
```typescript
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  COOP_PURCHASE: 'Co-op Purchase',
  CONDO_PURCHASE: 'Condo Purchase',
  COOP_SUBLET: 'Co-op Sublet',
  CONDO_LEASE: 'Condo Lease',
}
```

**Document Category Labels:**
```typescript
export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  GOVERNMENT_ID: 'Government ID',
  BANK_STATEMENT: 'Bank Statement',
  // ...
}
```

### Storage Keys ([lib/storage.ts](lib/storage.ts))

```typescript
export const STORAGE_KEYS = {
  CURRENT_USER: 'philter_current_user',
  APPLICATIONS: 'philter_applications',
  FORM_DATA: 'philter_form_data',
  UPLOADED_FILES: 'philter_uploaded_files', // Legacy, migrated to IndexedDB
  THEME: 'philter_theme',
  RFI_RECORDS: 'philter_rfi_records',
  DECISION_RECORDS: 'philter_decision_records',
} as const
```

### Layout Configuration ([lib/constants/layout.ts](lib/constants/layout.ts))

```typescript
export const LAYOUT_CONFIG = {
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  TOP_BAR_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
}
```

## Error Handling

### Error Handling Patterns

**Try-Catch with User Feedback:**
```typescript
import { toast } from '@/lib/hooks/use-toast'

try {
  await saveFileToStorage(file, id, category)
  toast.success('File saved successfully')
} catch (error) {
  console.error('Failed to save file:', error)
  toast.error('Failed to save file. Please try again.')
}
```

**Storage Error Handling:**
```typescript
try {
  await saveFileToStorage(file, id, category)
} catch (error) {
  if (error.message.includes('quota')) {
    toast.error('Storage quota exceeded. Please delete some files.')
  } else if (error.message.includes('IndexedDB')) {
    toast.error('Storage unavailable. Please check browser settings.')
  } else {
    toast.error('Failed to save file. Please try again.')
  }
}
```

**Form Validation Errors:**
```typescript
const form = useForm({
  resolver: zodResolver(schema),
})

const onSubmit = async (data) => {
  try {
    await saveData(data)
    toast.success('Saved successfully')
  } catch (error) {
    form.setError('root', {
      message: 'Failed to save. Please try again.',
    })
  }
}
```

**Error Boundary:**
```typescript
// app/error.tsx - Global error boundary
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Logging & Debugging

**Console Logging:**
```typescript
console.log('Debug info:', data)
console.error('Error occurred:', error)
console.warn('Warning:', message)
```

**Storage Debugging:**
```typescript
// Check IndexedDB in DevTools
// Chrome: DevTools → Application → IndexedDB → philter_file_storage
// Firefox: DevTools → Storage → IndexedDB → philter_file_storage

// Check localStorage
// Chrome: DevTools → Application → Local Storage
// Firefox: DevTools → Storage → Local Storage

// Check storage quota
import { checkStorageQuota } from '@/lib/indexed-db'
const { usage, quota, percentUsed } = await checkStorageQuota()
console.log(`Using ${percentUsed}% of quota (${usage}/${quota} bytes)`)
```

## Accessibility (A11Y)

The application follows WCAG 2.2 AA guidelines.

### Accessibility Patterns

**Keyboard Navigation:**
- All interactive elements are keyboard accessible
- Focus management in dialogs and modals
- Tab order follows logical flow
- Escape key closes overlays

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels and roles
- Form field associations
- Error announcements

**Color Contrast:**
- All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Color is not the only means of conveying information
- Status indicators include text labels

**Form Accessibility:**
```typescript
<form>
  <label htmlFor="firstName">First Name</label>
  <input
    id="firstName"
    aria-required="true"
    aria-invalid={!!errors.firstName}
    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
  />
  {errors.firstName && (
    <span id="firstName-error" role="alert">
      {errors.firstName.message}
    </span>
  )}
</form>
```

**Dialog Accessibility:**
```typescript
<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription id="dialog-description">
      Are you sure you want to proceed?
    </DialogDescription>
  </DialogContent>
</Dialog>
```

**Interactive Element Focus:**
```typescript
// Focus management in modals
const dialogRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (open) {
    dialogRef.current?.focus()
  }
}, [open])
```

## Performance Optimizations

### Code Splitting & Lazy Loading

**Lazy Component Loading:**
```typescript
import { lazy, Suspense } from 'react'

const PDFViewer = lazy(() => import('@/components/shared/lazy-pdf-viewer'))

function DocumentView() {
  return (
    <Suspense fallback={<div>Loading PDF...</div>}>
      <PDFViewer url={url} />
    </Suspense>
  )
}
```

**Dynamic Imports:**
```typescript
// Load PDF.js only when needed
const loadPdfJs = async () => {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'
  return pdfjs
}
```

### Storage Optimizations

**Blob Storage (vs base64):**
- 33% space savings by storing Blobs instead of base64 strings
- Faster serialization/deserialization
- Native browser support

**Compression:**
```typescript
import { compress, decompress } from 'lz-string'

// Compress large data before storing (threshold: 1KB)
const compressed = compress(JSON.stringify(data))
localStorage.setItem('key', compressed)

// Decompress on read
const data = JSON.parse(decompress(localStorage.getItem('key')))
```

**Chunking:**
```typescript
// Split very large data into 50KB chunks
const chunks = splitIntoChunks(data, 50 * 1024)
chunks.forEach((chunk, index) => {
  localStorage.setItem(`key_chunk_${index}`, chunk)
})
```

**In-Memory Caching:**
```typescript
// StorageService maintains in-memory cache
const value = storageService.get('key') // Fast, no localStorage read
```

### Rendering Optimizations

**Server Components:**
- Default to Server Components for static content
- Only use Client Components when needed (interactivity, hooks)

**Memoization:**
```typescript
import { useMemo } from 'react'

const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name))
}, [data])
```

**Debouncing:**
```typescript
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'

const [search, setSearch] = useState('')
const debouncedSearch = useDebouncedValue(search, 300)

// Only filters after 300ms of no typing
const filtered = applications.filter(app =>
  app.name.includes(debouncedSearch)
)
```

## Testing

### Testing Utilities

**Test PDF Route** (`/test-pdf`)
- Manual testing utilities for PDF generation and viewing
- Document assembly testing
- Cover sheet generation testing

**Mock Data Testing:**
```typescript
import { mockApplications, mockUsers } from '@/lib/mock-data'

// Test with different user roles
const applicant = mockUsers.find(u => u.role === 'APPLICANT')
const broker = mockUsers.find(u => u.role === 'BROKER')

// Test with different application states
const inProgressApp = mockApplications.find(a => a.status === 'IN_PROGRESS')
const submittedApp = mockApplications.find(a => a.status === 'SUBMITTED')
```

**Storage Testing:**
```typescript
// Test IndexedDB integration
import { saveFileToIndexedDB, getFileFromIndexedDB } from '@/lib/indexed-db'

// Test migration
import { migrateFilesFromLocalStorage } from '@/lib/upload-manager'

// Test data integrity
import { checkDataIntegrity, repairDataIntegrity } from '@/lib/data-integrity'
```

### Manual Testing Checklist

See [documents/development/indexeddb-integration-tests.md](documents/development/indexeddb-integration-tests.md) for comprehensive test checklist covering:
- File upload and persistence
- Migration functionality
- Data integrity validation
- Error handling scenarios
- Memory management
- Cross-browser compatibility

## Project Conventions

### Import Patterns

**Path Alias Usage:**
```typescript
// Prefer path aliases
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Application } from '@/lib/types'

// Avoid relative imports for cross-directory imports
import { Button } from '../../../components/ui/button' // ❌ Don't do this
```

**Import Order:**
```typescript
// 1. External dependencies
import { useState } from 'react'
import { useForm } from 'react-hook-form'

// 2. Internal components
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// 3. Internal utilities
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// 4. Types
import type { Application, Person } from '@/lib/types'
```

### File Naming Conventions

**Components:**
- kebab-case for files: `upload-dropzone.tsx`, `document-card.tsx`
- PascalCase for component names: `UploadDropzone`, `DocumentCard`
- Collocate related components in subdirectories

**Utilities:**
- kebab-case: `indexed-db.ts`, `upload-manager.ts`, `data-integrity.ts`
- Descriptive names that indicate purpose

**Types:**
- `types.ts` - Main type definitions
- `validators.ts` - Zod validation schemas
- Collocated types in component files when specific to that component

### Code Style

**TypeScript:**
- Explicit types for function parameters and return values
- Use type inference for local variables
- Prefer interfaces for object shapes
- Use enums for fixed sets of values

**React:**
- Prefer function components over class components
- Use hooks for stateful logic
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

**Comments:**
- JSDoc comments for exported functions
- Inline comments for complex logic
- Avoid obvious comments
- Document "why" not "what"

**Async/Await:**
- Prefer async/await over promise chains
- Always handle errors with try-catch
- Use Promise.all for parallel operations

## Environment & Configuration

### Environment Variables

Currently, the application runs entirely client-side with no backend. Environment variables are not required for development.

**Future Backend Integration:**
```bash
# .env.local (when backend is added)
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://...
AUTH_SECRET=...
```

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Browser Features:**
- IndexedDB support (all modern browsers)
- Local Storage support
- ES2017+ JavaScript features
- CSS Grid and Flexbox

**Browser-Specific Notes:**
- IndexedDB quota varies by browser (50MB-1GB+)
- Safari has stricter storage limits in Private Browsing mode
- Firefox shows quota prompts for large storage requests

### Development Tools

**Recommended VSCode Extensions:**
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Error Translator
- Pretty TypeScript Errors
- Prettier (if configured)

**Browser DevTools:**
- **IndexedDB Inspector:** Application → IndexedDB → philter_file_storage
- **localStorage Inspector:** Application → Local Storage
- **Network Tab:** Monitor simulated uploads
- **Console:** View storage logs and errors

## Common Tasks

### Adding a New Page

1. Create page file in appropriate route group:
```typescript
// app/(dashboard)/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
```

2. Add navigation link to sidebar:
```typescript
// components/layout/sidebar.tsx
const links = [
  // ...existing links
  { href: '/new-page', label: 'New Page', icon: FileIcon },
]
```

### Adding a New Form Section

1. Create form component:
```typescript
// components/features/application/new-section-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newSectionSchema } from '@/lib/validators'

export function NewSectionForm() {
  const form = useForm({
    resolver: zodResolver(newSectionSchema),
  })

  // Form implementation
}
```

2. Add validation schema:
```typescript
// lib/validators.ts
export const newSectionSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.number().positive(),
})
```

3. Add page route:
```typescript
// app/(dashboard)/applications/[id]/new-section/page.tsx
import { NewSectionForm } from '@/components/features/application/new-section-form'

export default function NewSectionPage() {
  return <NewSectionForm />
}
```

### Adding a New UI Component

1. Use shadcn/ui CLI (if available):
```bash
npx shadcn@latest add component-name
```

2. Or create custom component:
```typescript
// components/ui/custom-component.tsx
import { cn } from '@/lib/utils'

interface CustomComponentProps {
  className?: string
  // other props
}

export function CustomComponent({ className, ...props }: CustomComponentProps) {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {/* component content */}
    </div>
  )
}
```

### Adding File Upload to a Section

1. Add upload state:
```typescript
const [documents, setDocuments] = useState<Document[]>([])
```

2. Add UploadDropzone component:
```typescript
import { UploadDropzone } from '@/components/features/application/upload-dropzone'

<UploadDropzone
  onFilesSelected={(files) => {
    // Handle file selection
    const newDocs = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      category: 'BANK_STATEMENT',
      status: 'uploading' as const,
      file,
    }))
    setDocuments(prev => [...prev, ...newDocs])

    // Start upload for each file
    newDocs.forEach(doc => {
      uploadManager.startUpload(
        doc.id,
        (progress) => {
          // Update progress
        },
        async () => {
          // Save to IndexedDB
          await saveFileToStorage(doc.file, doc.id, 'documents')
        },
        (error) => {
          console.error('Upload failed:', error)
        }
      )
    })
  }}
  accept={{ 'application/pdf': ['.pdf'] }}
  maxSize={10 * 1024 * 1024} // 10MB
/>
```

3. Restore files on mount:
```typescript
useEffect(() => {
  const loadFiles = async () => {
    const storedFiles = await getStoredFiles()
    // Merge with existing documents state
  }
  loadFiles()
}, [])
```

## Documentation

### Project Documentation

**Main Documentation:**
- `CLAUDE.md` - This file, primary development guide
- `README.md` - Project overview and setup instructions
- `documents/development/indexeddb-integration-tests.md` - Storage testing guide

**Code Documentation:**
- JSDoc comments on exported functions
- Inline comments for complex logic
- Type definitions serve as API documentation

### External Resources

**Framework & Library Docs:**
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

**Browser APIs:**
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

## Future Considerations

### Backend Integration

When adding a backend, consider:
- API route structure (`/api/*` routes)
- Authentication (NextAuth.js, Clerk, etc.)
- Database integration (Prisma, Drizzle ORM)
- File upload to cloud storage (S3, Cloudinary)
- Real-time updates (websockets, server-sent events)

### Production Deployment

**Before deploying:**
- Set up environment variables
- Configure CORS policies
- Set up error tracking (Sentry, etc.)
- Configure CDN for static assets
- Set up monitoring and analytics
- Implement proper authentication
- Add rate limiting
- Configure CSP headers

**Platform Options:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted with Docker

### Scalability Considerations

**Storage:**
- Move from IndexedDB to cloud storage for production
- Implement CDN for file delivery
- Add file virus scanning
- Implement file retention policies

**Performance:**
- Implement API caching
- Add database query optimization
- Use Redis for session storage
- Implement CDN for static assets

**Security:**
- Add CSP headers
- Implement rate limiting
- Add CSRF protection
- Encrypt sensitive data at rest
- Implement audit logging

---

## Quick Reference

**Key Commands:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint codebase
```

**Key Directories:**
```
/app                 # App Router pages and layouts
/components          # React components (ui, forms, layout, features)
/lib                 # Utilities, types, hooks, mock data
/public              # Static assets
/documents           # Project documentation
```

**Key Files:**
```
app/layout.tsx       # Root layout
app/globals.css      # Global styles and theme
lib/types.ts         # Type definitions (521 lines)
lib/validators.ts    # Zod schemas (314 lines)
lib/utils.ts         # Utility functions
lib/storage.ts       # localStorage service (247 lines)
lib/indexed-db.ts    # IndexedDB utilities (465 lines)
lib/persistence.ts   # Data persistence (432 lines)
components.json      # shadcn/ui config
tsconfig.json        # TypeScript config
```

**Important Patterns:**
- Server Components by default, `"use client"` when needed
- Form validation with Zod + React Hook Form
- File storage with IndexedDB (not localStorage)
- Persist form data on every change
- Use mock data system for development
- Follow accessibility guidelines (WCAG 2.2 AA)
- Handle storage quota gracefully
- Clean up blob URLs to prevent memory leaks

---

**Last Updated:** 2025-11-21
**Version:** 0.1.0
**Maintained by:** Development Team
