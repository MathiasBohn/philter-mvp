# philter

A transaction platform for NYC residential co-op and condo board applications. philter digitizes the workflow from application creation through board review and decision-making.

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript 5** (strict mode)
- **Tailwind CSS v4**
- **Supabase** (Auth, PostgreSQL, Storage)

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm or yarn
- Supabase account (for full functionality)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd philter-mvp
npm install

# Configure environment
cp .env.example .env.local
```

Add your credentials to `.env.local`:

```bash
# Application
NEXT_PUBLIC_APP_URL=https://philter-mvp.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-encryption-key

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=philter <onboarding@resend.dev>
```

### Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:all     # Run all tests
```

## Features

### Transaction Types

- Co-op Purchase
- Condo Purchase
- Co-op Sublet
- Condo Lease

### User Roles

| Role | Description |
|------|-------------|
| Applicant | Complete and submit applications |
| Co-Applicant | Joint applicant with shared access |
| Guarantor | Financial guarantor for the application |
| Broker | Manage pipeline, QA, and submissions |
| Transaction Agent | Review applications, manage templates, coordinate RFIs |
| Board Member | Review applications, add private notes, make decisions |
| Admin | Full system access |
| Property Manager | Building management access |
| Building Manager | Building-specific management |
| Attorney | Legal review access |
| Accountant | Financial review access |

### Applicant Workflow

12-section guided application process:

1. **Profile** - Personal information with SSN handling
2. **Parties** - Co-applicants and guarantors
3. **People** - Unit owners, brokers, attorneys
4. **Income** - Employment history
5. **Financials** - Assets and liabilities (REBNY-aligned)
6. **Real Estate** - Property ownership history
7. **Lease Terms** - Move-in preferences
8. **Building Policies** - Pet, smoking, renovation acknowledgments
9. **Documents** - File uploads with categorization
10. **Disclosures** - Legal acknowledgments (Lead Paint, FCRA, etc.)
11. **Cover Letter** - Personal introduction
12. **Review** - Final validation and submission

### Broker Tools

- Application pipeline (table/card views)
- Prefill wizard for new applications
- Quality assurance checklists
- Building submission tracking
- Applicant invitation system

### Transaction Agent Features

- Inbox for submitted applications
- Template management by building
- RFI (Request for Information) system
- Application review and decisions

### Board Interface

- Application review with redacted sensitive data
- Private notes (visible only to author)
- Decision tracking (Approve/Conditional/Deny)
- Document review tools

## Architecture

### Route Structure

```text
app/
├── (auth)/                    # Authentication
│   ├── sign-in/
│   ├── sign-up/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   └── accept-invitation/
├── (dashboard)/               # Main application
│   ├── applications/[id]/     # 12-section workflow
│   ├── my-applications/       # User's applications
│   ├── broker/                # Broker dashboard
│   ├── agent/                 # Agent tools
│   ├── board/                 # Board review
│   ├── settings/
│   ├── notifications/
│   └── help-support/
├── api/                       # API routes
├── claim/[token]/             # Application claim flow
├── privacy-policy/
└── terms-of-service/
```

### Component Organization

```text
components/
├── ui/           # 37 shadcn/ui components
├── forms/        # Specialized inputs (currency, SSN, date)
├── layout/       # App shell, sidebar, navigation
├── features/     # Role-specific components
│   ├── application/
│   ├── applications/
│   ├── broker/
│   ├── agent/
│   ├── board/
│   └── storage/
├── shared/       # PDF viewer, filters
├── auth/         # Route guards
├── error/        # Error boundaries
├── loading/      # Loading states
├── brand/        # Logo, branding
└── providers/    # Theme, query providers
```

### Database Schema

21 PostgreSQL tables with Row Level Security:

| Table | Purpose |
|-------|---------|
| users | User profiles (extends Supabase Auth) |
| applications | Main application records |
| application_participants | User-application relationships |
| people | Applicants, co-applicants, guarantors |
| address_history | Housing history |
| emergency_contacts | Emergency contact info |
| employment_records | Employment and income |
| financial_entries | Assets, liabilities, expenses |
| real_estate_properties | Owned properties |
| disclosures | Legal acknowledgments |
| documents | File metadata |
| rfis | Requests for information |
| rfi_messages | RFI thread messages |
| board_notes | Private board member notes |
| decision_records | Application decisions |
| buildings | Building directory |
| templates | Building-specific configurations |
| notifications | In-app notifications |
| activity_log | Audit trail |
| board_assignments | Board member assignments |
| application_invitations | Email invitations |

### Storage

**Supabase Storage Buckets:**

- `documents` - Application documents (private, RLS-protected)
- `profile-photos` - User photos (private)
- `building-assets` - Building images (public)

**File Limits:**

- Documents: 25MB
- Profile photos: 5MB

## Development

### Path Aliases

```typescript
@/*           → Root
@/components  → /components
@/lib         → /lib
@/ui          → /components/ui
```

### Key Files

```text
lib/
├── types.ts              # TypeScript definitions
├── validators.ts         # Zod schemas
├── utils.ts              # Utility functions
├── supabase-storage.ts   # File operations
├── database.types.ts     # Generated DB types
├── api/                  # Data access layer
├── hooks/                # React Query hooks
├── contexts/             # Auth context
└── supabase/             # Client utilities
```

### Testing

**Unit Tests (Vitest):**

- Validators
- Utilities
- Component logic

**E2E Tests (Playwright):**

- Authentication flows
- Applicant workflow
- Broker workflow
- Board workflow
- Edge cases

Run tests:

```bash
npm run test:run         # Unit tests
npm run test:e2e         # E2E tests (headless)
npm run test:e2e:headed  # E2E tests (visible browser)
npm run test:all         # All tests
```

### Adding Components

```bash
npx shadcn@latest add <component-name>
```

## Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.0.3 | Framework |
| react | 19.2.0 | UI library |
| typescript | ^5 | Type safety |
| tailwindcss | ^4 | Styling |

### Supabase

| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | 2.84.0 | Client SDK |
| @supabase/ssr | 0.7.0 | Server-side auth |

### Forms & Validation

| Package | Purpose |
|---------|---------|
| react-hook-form | Form state management |
| @hookform/resolvers | Zod integration |
| zod | Schema validation |

### UI

| Package | Purpose |
|---------|---------|
| Radix UI (17 packages) | Accessible primitives |
| lucide-react | Icons |
| next-themes | Dark mode |
| sonner | Toast notifications |
| cmdk | Command palette |

### PDF

| Package | Purpose |
|---------|---------|
| pdfjs-dist | PDF viewing |
| pdf-lib | PDF manipulation |
| jspdf | PDF generation |

### Data

| Package | Purpose |
|---------|---------|
| @tanstack/react-query | Server state |
| date-fns | Date formatting |
| lz-string | Compression |
| crypto-js | Encryption |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_APP_URL | Yes | Application URL |
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase service role key |
| ENCRYPTION_KEY | Yes | Key for encrypting sensitive data |
| RESEND_API_KEY | Yes | Resend email API key |
| RESEND_FROM_EMAIL | Yes | Sender email address |

## Documentation

- **CLAUDE.md** - Development guide for AI assistants
- **lib/types.ts** - Type definitions
- **lib/validators.ts** - Validation schemas
