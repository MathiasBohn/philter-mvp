# philter MVP - Component Guide

This guide documents the major components in the philter MVP application, their props, and usage examples.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Form Components](#form-components)
3. [Feature Components - Application](#feature-components---application)
4. [Feature Components - Broker](#feature-components---broker)
5. [Feature Components - Admin](#feature-components---admin)
6. [Feature Components - Board](#feature-components---board)
7. [Shared Components](#shared-components)

---

## Layout Components

### AppShell

Main application shell that provides the layout structure for authenticated pages.

**Location:** `components/layout/app-shell.tsx`

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode;
  role?: Role;
}
```

**Usage:**
```tsx
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="APPLICANT">
      {children}
    </AppShell>
  );
}
```

### TopBar

Header component with logo, role indicator, and user menu.

**Location:** `components/layout/top-bar.tsx`

**Props:**
```typescript
interface TopBarProps {
  role?: Role;
  userName?: string;
}
```

**Usage:**
```tsx
import { TopBar } from "@/components/layout/top-bar";

<TopBar role="BROKER" userName="John Doe" />
```

### Sidebar

Contextual navigation sidebar that adapts based on user role.

**Location:** `components/layout/sidebar.tsx`

**Props:**
```typescript
interface SidebarProps {
  role?: Role;
  currentPath?: string;
}
```

### Breadcrumbs

Breadcrumb navigation component.

**Location:** `components/layout/breadcrumbs.tsx`

**Props:**
```typescript
interface BreadcrumbsProps {
  items: Array<{ label: string; href: string }>;
}
```

**Usage:**
```tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

<Breadcrumbs
  items={[
    { label: "Applications", href: "/applications" },
    { label: "Profile", href: `/applications/${id}/profile` }
  ]}
/>
```

### ProgressIndicator

Overall progress bar showing application completion percentage.

**Location:** `components/layout/progress-indicator.tsx`

**Props:**
```typescript
interface ProgressIndicatorProps {
  percentage: number;
  label?: string;
}
```

**Usage:**
```tsx
import { ProgressIndicator } from "@/components/layout/progress-indicator";

<ProgressIndicator percentage={65} label="Application 65% complete" />
```

---

## Form Components

### FieldRow

Wrapper component for form fields with label, input, and error display.

**Location:** `components/forms/field-row.tsx`

**Props:**
```typescript
interface FieldRowProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { FieldRow } from "@/components/forms/field-row";
import { Input } from "@/components/ui/input";

<FieldRow
  label="Full Name"
  htmlFor="fullName"
  required
  error={errors.fullName}
  hint="Enter your legal name as it appears on your ID"
>
  <Input id="fullName" {...register("fullName")} />
</FieldRow>
```

### ErrorSummary

Page-top error summary with anchor links to fields.

**Location:** `components/forms/error-summary.tsx`

**Props:**
```typescript
interface ErrorSummaryProps {
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

**Usage:**
```tsx
import { ErrorSummary } from "@/components/forms/error-summary";

<ErrorSummary
  errors={[
    { field: "email", message: "Please enter a valid email address" },
    { field: "phone", message: "Phone number is required" }
  ]}
/>
```

### FormActions

Save/cancel button group for forms.

**Location:** `components/forms/form-actions.tsx`

**Props:**
```typescript
interface FormActionsProps {
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { FormActions } from "@/components/forms/form-actions";

<FormActions
  onSave={handleSubmit}
  onCancel={handleCancel}
  saveLabel="Save & Continue"
  isLoading={isSubmitting}
/>
```

### MaskedSSNInput

SSN input with masking functionality.

**Location:** `components/forms/masked-ssn-input.tsx`

**Props:**
```typescript
interface MaskedSSNInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}
```

**Usage:**
```tsx
import { MaskedSSNInput } from "@/components/forms/masked-ssn-input";

<MaskedSSNInput
  value={ssn}
  onChange={setSSN}
  error={errors.ssn}
  required
/>
```

### DateInput

Date picker component.

**Location:** `components/forms/date-input.tsx`

**Props:**
```typescript
interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { DateInput } from "@/components/forms/date-input";

<DateInput
  value={dateOfBirth}
  onChange={setDateOfBirth}
  placeholder="Select date of birth"
/>
```

### MoneyInput

Currency-formatted input component.

**Location:** `components/forms/money-input.tsx`

**Props:**
```typescript
interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
}
```

**Usage:**
```tsx
import { MoneyInput } from "@/components/forms/money-input";

<MoneyInput
  value={annualIncome}
  onChange={setAnnualIncome}
  placeholder="$0.00"
/>
```

### RepeatableGroup

Component for adding/removing repeatable items (e.g., employers, addresses).

**Location:** `components/forms/repeatable-group.tsx`

**Props:**
```typescript
interface RepeatableGroupProps {
  items: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  addLabel?: string;
  maxItems?: number;
}
```

**Usage:**
```tsx
import { RepeatableGroup } from "@/components/forms/repeatable-group";

<RepeatableGroup
  items={employers}
  onAdd={addEmployer}
  onRemove={removeEmployer}
  renderItem={(employer, index) => (
    <EmployerFields employer={employer} index={index} />
  )}
  addLabel="Add Another Employer"
  maxItems={5}
/>
```

---

## Feature Components - Application

### BuildingCodeInput

Building code entry component for A0 screen.

**Location:** `components/features/application/building-code-input.tsx`

**Props:**
```typescript
interface BuildingCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (code: string) => Promise<boolean>;
  error?: string;
}
```

### TransactionTypeTiles

Transaction type selection tiles.

**Location:** `components/features/application/transaction-type-tiles.tsx`

**Props:**
```typescript
interface TransactionTypeTilesProps {
  selected: TransactionType | null;
  onSelect: (type: TransactionType) => void;
}
```

**Usage:**
```tsx
import { TransactionTypeTiles } from "@/components/features/application/transaction-type-tiles";

<TransactionTypeTiles
  selected={transactionType}
  onSelect={setTransactionType}
/>
```

### SectionCard

Application section card with status indicator.

**Location:** `components/features/application/section-card.tsx`

**Props:**
```typescript
interface SectionCardProps {
  title: string;
  description: string;
  status: "complete" | "incomplete" | "in-progress";
  href: string;
  required?: boolean;
}
```

**Usage:**
```tsx
import { SectionCard } from "@/components/features/application/section-card";

<SectionCard
  title="Profile"
  description="Personal information and address history"
  status="complete"
  href={`/applications/${id}/profile`}
  required
/>
```

### UploadDropzone

File upload component with drag-and-drop.

**Location:** `components/features/application/upload-dropzone.tsx`

**Props:**
```typescript
interface UploadDropzoneProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { UploadDropzone } from "@/components/features/application/upload-dropzone";

<UploadDropzone
  onUpload={handleFileUpload}
  accept=".pdf,.jpg,.png"
  maxSize={25 * 1024 * 1024} // 25MB
  multiple
/>
```

### DocumentCard

Document display card with preview/delete actions.

**Location:** `components/features/application/document-card.tsx`

**Props:**
```typescript
interface DocumentCardProps {
  document: Document;
  onPreview: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onReplace?: (documentId: string, file: File) => void;
}
```

**Usage:**
```tsx
import { DocumentCard } from "@/components/features/application/document-card";

<DocumentCard
  document={doc}
  onPreview={handlePreview}
  onDelete={handleDelete}
  onReplace={handleReplace}
/>
```

### FinancialTable

REBNY-aligned financial summary table.

**Location:** `components/features/application/financial-table.tsx`

**Props:**
```typescript
interface FinancialTableProps {
  entries: FinancialEntry[];
  category: "assets" | "liabilities" | "monthly-income" | "monthly-expenses";
  onAdd: (entry: FinancialEntry) => void;
  onEdit: (id: string, entry: FinancialEntry) => void;
  onDelete: (id: string) => void;
}
```

### DisclosureCard

Disclosure acknowledgment card.

**Location:** `components/features/application/disclosure-card.tsx`

**Props:**
```typescript
interface DisclosureCardProps {
  disclosure: Disclosure;
  onAcknowledge: (id: string, acknowledged: boolean) => void;
  onUpload?: (id: string, file: File) => void;
}
```

### ValidationSummary

Review page validation summary.

**Location:** `components/features/application/validation-summary.tsx`

**Props:**
```typescript
interface ValidationSummaryProps {
  sections: Array<{
    name: string;
    complete: boolean;
    issues?: string[];
    href: string;
  }>;
}
```

---

## Feature Components - Broker

### ApplicationTable

Broker pipeline table.

**Location:** `components/features/broker/application-table.tsx`

**Props:**
```typescript
interface ApplicationTableProps {
  applications: Application[];
  onOpenQA: (id: string) => void;
  onInvite: (id: string) => void;
}
```

**Usage:**
```tsx
import { ApplicationTable } from "@/components/features/broker/application-table";

<ApplicationTable
  applications={applications}
  onOpenQA={handleOpenQA}
  onInvite={handleInvite}
/>
```

### FilterBar

Table filter component.

**Location:** `components/features/broker/filter-bar.tsx`

**Props:**
```typescript
interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  buildings: Building[];
}
```

### QAPanel

QA checklist and blocker panel.

**Location:** `components/features/broker/qa-panel.tsx`

**Props:**
```typescript
interface QAPanelProps {
  application: Application;
  onRequestInfo: () => void;
  onMarkReady: () => void;
}
```

### CompletenessChecklist

Application completeness checklist.

**Location:** `components/features/broker/completeness-checklist.tsx`

**Props:**
```typescript
interface CompletenessChecklistProps {
  items: Array<{
    label: string;
    complete: boolean;
    required: boolean;
  }>;
}
```

---

## Feature Components - Admin

### TemplateWizard

Multi-step template creation wizard.

**Location:** `components/features/admin/template-wizard.tsx`

**Props:**
```typescript
interface TemplateWizardProps {
  onComplete: (template: Template) => void;
  onCancel: () => void;
}
```

### InboxTable

Admin intake inbox table.

**Location:** `components/features/admin/inbox-table.tsx`

**Props:**
```typescript
interface InboxTableProps {
  applications: Application[];
  onOpenReview: (id: string) => void;
  onAssign: (id: string, userId: string) => void;
  onSetStatus: (id: string, status: ApplicationStatus) => void;
}
```

### ReviewNavigator

Section navigator for review workspace.

**Location:** `components/features/admin/review-navigator.tsx`

**Props:**
```typescript
interface ReviewNavigatorProps {
  sections: ApplicationSection[];
  currentSection: string;
  onNavigate: (sectionKey: string) => void;
}
```

### RFIThread

Threaded RFI message display.

**Location:** `components/features/admin/rfi-thread.tsx`

**Props:**
```typescript
interface RFIThreadProps {
  rfi: RFI;
  onReply: (message: string) => void;
  onResolve: () => void;
}
```

### RFIComposer

New RFI creation dialog.

**Location:** `components/features/admin/rfi-composer.tsx`

**Props:**
```typescript
interface RFIComposerProps {
  sections: string[];
  onSubmit: (rfi: {
    sectionKey: string;
    assigneeRole: Role;
    message: string;
  }) => void;
  onCancel: () => void;
}
```

### DecisionPanel

Decision recording panel.

**Location:** `components/features/admin/decision-panel.tsx`

**Props:**
```typescript
interface DecisionPanelProps {
  applicationId: string;
  onSubmit: (decision: Decision) => void;
}
```

### ActivityLog

Audit trail activity log.

**Location:** `components/features/admin/activity-log.tsx`

**Props:**
```typescript
interface ActivityLogProps {
  activities: Array<{
    timestamp: Date;
    user: string;
    action: string;
    description: string;
  }>;
}
```

---

## Feature Components - Board

### ReadOnlyViewer

Read-only PDF viewer for board members.

**Location:** `components/features/board/read-only-viewer.tsx`

**Props:**
```typescript
interface ReadOnlyViewerProps {
  pdfUrl: string;
  watermark?: string;
}
```

### PrivateNotes

Board member private notes component.

**Location:** `components/features/board/private-notes.tsx`

**Props:**
```typescript
interface PrivateNotesProps {
  applicationId: string;
  userId: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}
```

**Usage:**
```tsx
import { PrivateNotes } from "@/components/features/board/private-notes";

<PrivateNotes
  applicationId={id}
  userId={currentUser.id}
  initialNotes={savedNotes}
  onSave={handleSaveNotes}
/>
```

---

## Shared Components

### PdfViewer

Full-featured PDF viewer with zoom, navigation, and thumbnails.

**Location:** `components/shared/pdf-viewer.tsx`

**Props:**
```typescript
interface PdfViewerProps {
  url: string;
  onError?: (error: Error) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { PdfViewer } from "@/components/shared/pdf-viewer";

<PdfViewer
  url="/samples/application-package.pdf"
  onError={handleError}
  className="h-full"
/>
```

**Features:**
- Thumbnail navigation sidebar
- Zoom controls (+/- buttons, fit to width/page)
- Page navigation (previous/next, go to page)
- Rotate button (90° clockwise)
- Open in new tab
- Full-height responsive layout
- Loading and error states

---

## Best Practices

### Component Usage

1. **Always use TypeScript types** - Import and use the defined types from `lib/types.ts`
2. **Error handling** - Provide error props and handle edge cases
3. **Accessibility** - Use proper ARIA labels and keyboard navigation
4. **Responsive design** - Test components on mobile, tablet, and desktop
5. **Loading states** - Show loading indicators for async operations

### Example: Complete Form Field

```tsx
import { FieldRow } from "@/components/forms/field-row";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function EmailField() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error on change
    if (error) setError("");
  };

  const handleBlur = () => {
    // Validate on blur
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
    }
  };

  return (
    <FieldRow
      label="Email Address"
      htmlFor="email"
      required
      error={error}
      hint="We'll use this to send you updates"
    >
      <Input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
      />
    </FieldRow>
  );
}
```

### Example: Handling File Uploads

```tsx
import { UploadDropzone } from "@/components/features/application/upload-dropzone";
import { DocumentCard } from "@/components/features/application/document-card";
import { useState } from "react";
import type { Document } from "@/lib/types";

function DocumentUploadSection() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      // Simulate upload
      const newDoc: Document = {
        id: crypto.randomUUID(),
        category: "GOVERNMENT_ID",
        filename: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: "UPLOADED"
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handlePreview = (doc: Document) => {
    // Open PDF viewer or image preview
    window.open(`/preview/${doc.id}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <UploadDropzone
        onUpload={handleUpload}
        accept=".pdf,.jpg,.png"
        maxSize={25 * 1024 * 1024}
        multiple
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map(doc => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Conditional Rendering Based on Role

```tsx
import { Role } from "@/lib/types";

interface ComponentProps {
  role: Role;
  children: React.ReactNode;
}

function RoleGatedContent({ role, children }: ComponentProps) {
  const canEdit = ["APPLICANT", "BROKER", "ADMIN"].includes(role);

  if (!canEdit) {
    return <div className="text-muted-foreground">Read-only access</div>;
  }

  return <>{children}</>;
}
```

### PII Masking Based on Role

```tsx
import { Role } from "@/lib/types";
import { formatSSN } from "@/lib/utils";

interface SSNDisplayProps {
  ssn: string;
  role: Role;
}

function SSNDisplay({ ssn, role }: SSNDisplayProps) {
  if (role === "BOARD") {
    return <span>••••</span>;
  }

  if (role === "BROKER") {
    return <span>{formatSSN(ssn, "last4")}</span>;
  }

  // APPLICANT or ADMIN
  return <span>{formatSSN(ssn, "full")}</span>;
}
```

### Form Validation with Zod

```tsx
import { z } from "zod";
import { profileSchema } from "@/lib/validators";

function ProfileForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (data: unknown) => {
    try {
      const validated = profileSchema.parse(data);
      // Save validated data
      console.log("Valid:", validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={e => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Additional Resources

- See `lib/types.ts` for all TypeScript type definitions
- See `lib/validators.ts` for Zod validation schemas
- See `lib/utils.ts` for utility functions
- See `lib/mock-data/` for example data structures
- See `docs/development/design-system.md` for styling guidelines
- See `docs/development/user-guide.md` for user workflows
