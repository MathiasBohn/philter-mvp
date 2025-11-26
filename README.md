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

Add your Supabase credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

### Applicant Workflow

13-section guided application process:

1. **Overview** - Progress dashboard
2. **Profile** - Personal information with SSN handling
3. **Parties** - Co-applicants and guarantors
4. **People** - Unit owners, brokers, attorneys
5. **Income** - Employment history
6. **Financials** - Assets and liabilities (REBNY-aligned)
7. **Real Estate** - Property ownership history
8. **Lease Terms** - Move-in preferences
9. **Building Policies** - Pet, smoking, renovation acknowledgments
10. **Documents** - File uploads with categorization
11. **Disclosures** - Legal acknowledgments (Lead Paint, FCRA, etc.)
12. **Cover Letter** - Personal introduction
13. **Review** - Final validation and submission

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

```
app/
├── (auth)/                    # Authentication
│   ├── sign-in/
│   ├── sign-up/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   └── accept-invitation/
├── (dashboard)/               # Main application
│   ├── applications/[id]/     # 13-section workflow
│   ├── my-applications/       # User's applications
│   ├── broker/                # Broker dashboard
│   ├── agent/                 # Agent tools
│   ├── board/                 # Board review
│   ├── settings/
│   └── notifications/
├── api/                       # API routes
└── claim/[token]/             # Application claim flow
```

### Component Organization

```
components/
├── ui/           # 38 shadcn/ui components
├── forms/        # Specialized inputs (currency, SSN, date)
├── layout/       # App shell, sidebar, navigation
├── features/     # Role-specific components
│   ├── application/
│   ├── broker/
│   ├── agent/
│   └── board/
├── shared/       # PDF viewer, filters
├── auth/         # Sign-in/up forms
└── providers/    # Theme, query providers
```

### Database Schema

22 PostgreSQL tables with Row Level Security:

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

```
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
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase service role key |

## Documentation

- **CLAUDE.md** - Development guide for AI assistants
- **lib/types.ts** - Type definitions
- **lib/validators.ts** - Validation schemas

---

**Version:** 0.1.0
**Next.js:** 16.0.3
**React:** 19.2.0
**Node.js:** 18.17+ required
