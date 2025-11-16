# philter MVP

A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.

## Overview

philter digitizes and streamlines the board package and application workflow, enabling brokers and their clients to assemble and submit error-free, complete applications with guided checklists, smart document upload, secure role-based collaboration, transparent process tracking, and a full overview of submitted documents for property managers to review.

**Key Benefits:**
- Less manual work
- Faster approvals
- Significantly higher application quality for all stakeholders

## Project Status

This is an MVP (Minimum Viable Product) UI implementation. The current version focuses exclusively on the user interface and client-side functionality without back-end integration.

**What's Implemented:**
- Complete UI for all user flows (Applicant, Broker, Admin, Board Reviewer)
- Client-side form validation
- File upload interface (browser-based)
- PDF viewing capabilities
- Mock data fixtures for demonstration
- Responsive design (mobile, tablet, desktop)
- WCAG 2.2 AA accessibility compliance
- **Phase 1 Enhancements (NEW):**
  - Reference letter collection system
  - NYC-specific legal compliance (Lead Paint & Flood Zone disclosures)
  - Consumer report authorization (FCRA compliant)
  - Enhanced lease terms capture
  - Comprehensive housing history tracking
  - Emergency contact management
  - Unit owner/seller party information

**Known Limitations:**
- No back-end integration
- Data stored in localStorage only (browser storage)
- Mock authentication (no real user authentication)
- Simulated file uploads (no server storage)
- No database persistence
- No production deployment configuration

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **React:** Version 19
- **UI Library:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5
- **Validation:** Zod (client-side)
- **PDF Viewer:** PDF.js
- **State Management:** React hooks + localStorage

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd philter-mvp
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000).

The page auto-updates as you edit files. Changes are reflected immediately without needing to restart the server.

### Building for Production

Build the optimized production bundle:

```bash
npm run build
```

This creates an optimized build in the `.next` folder.

### Running Production Build

After building, start the production server:

```bash
npm start
```

Note: You must run `npm run build` before starting the production server.

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Fix any issues reported before committing code.

## Project Structure

```
philter-mvp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   └── sign-in/              # Sign-in page
│   ├── (dashboard)/              # Protected routes
│   │   ├── applications/         # Applicant screens (A0-A7)
│   │   ├── broker/               # Broker screens (BK1-BK3)
│   │   ├── admin/                # Admin screens (AD1-AD5)
│   │   └── board/                # Board reviewer screen (BR1)
│   ├── (marketing)/              # Public pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   ├── features/                 # Feature-specific components
│   │   ├── application/          # Applicant flow components
│   │   ├── broker/               # Broker flow components
│   │   ├── admin/                # Admin flow components
│   │   └── board/                # Board reviewer components
│   └── shared/                   # Shared components
├── lib/                          # Utilities and helpers
│   ├── mock-data/                # Mock data fixtures
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   └── validators.ts             # Zod validation schemas
├── public/                       # Static assets
│   └── samples/                  # Sample PDF files
├── docs/                         # Documentation
│   └── development/              # Development documentation
└── package.json                  # Project dependencies
```

## User Roles

The platform supports five distinct user roles:

1. **Applicant** - Primary individual applying for purchase/lease
   - Complete application sections
   - Upload documents
   - Invite co-applicants/guarantors
   - Submit application

2. **Co-applicant/Guarantor** - Additional individuals on application
   - Complete own subsections
   - Upload own documents
   - Reply to requests for information

3. **Broker/Agent** - Real estate professional
   - Initiate applications
   - Pre-fill building-specific fields
   - Upload documents on behalf of clients
   - Perform QA checks
   - Submit to building

4. **Admin/Property Manager** - Building management
   - Create application templates
   - Review submitted applications
   - Request additional information
   - Record final decisions

5. **Board Reviewer** - Board member (read-only)
   - View compiled application package
   - Add private notes
   - Mark as reviewed
   - Download package

## Transaction Types

philter supports four transaction types:

- Co-op Purchase
- Condo Purchase
- Co-op Sublet
- Condo Lease

Note: Lease/Sublet transactions require additional disclosure screens (Local Law 55, Window Guard notices).

## Key Features

### For Applicants (A0-A7)
- Building code entry and transaction type selection
- Application overview hub with progress tracking
- Profile section with PII masking
- Employment and income documentation
- Financial summary (REBNY-aligned)
- Document upload with PDF preview
- Required disclosures for lease/sublet
- Review and submit with validation
- **Enhanced Application Features:**
  - Reference letter collection with contact management
  - Housing history tracking (previous residences)
  - Emergency contact management
  - Detailed lease term preferences (move-in date, rent budget range)
  - NYC legal compliance acknowledgments (Lead Paint, Flood Zone)
  - Consumer report authorization (background check consent)
  - Unit owner/seller information capture

### For Brokers (BK1-BK3)
- Application pipeline dashboard
- Pre-fill and QA workspace
- Document upload on behalf of clients
- Request information from applicants
- Submission confirmation

### For Admins (AD1-AD5)
- Template wizard for building-specific requirements
- Intake inbox for submitted applications
- Review workspace with PDF viewer
- RFI (Request for Information) management
- Decision panel with adverse action compliance
- **Compliance Controls:**
  - Toggle NYC-specific disclosures (Lead Paint, Flood Zone)
  - Manage required vs. optional application sections
  - Configure legal compliance requirements by jurisdiction

### For Board Reviewers (BR1)
- Read-only compiled package viewer
- Private notes (not shared with applicants)
- Download package with expiry notice
- SSN redaction for privacy

## Development Guidelines

### Component Organization
- **UI Components** (`/components/ui`): Base shadcn/ui components
- **Form Components** (`/components/forms`): Reusable form elements
- **Layout Components** (`/components/layout`): App shell, navigation, headers
- **Feature Components** (`/components/features`): Role-specific components

### TypeScript
- Strict mode enabled
- All components use TypeScript (.tsx extension)
- Type definitions in `lib/types.ts`
- No `any` types (use proper typing)

### Styling
- Utility-first approach with Tailwind CSS v4
- Custom properties for theming in `globals.css`
- Dark mode support via `prefers-color-scheme`
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### State Management
- React hooks for component state
- localStorage for demo data persistence
- Mock data fixtures in `lib/mock-data/`

### Accessibility
- WCAG 2.2 AA compliant
- Keyboard navigation support
- Screen reader compatible
- Proper ARIA labels and roles
- Focus management
- Color contrast ratios met

## Testing

### Comprehensive Integration Testing
For Phase 1 features (Tasks 1.1-1.10), follow the detailed testing documentation:
- **Integration Testing Checklist:** `docs/development/integration-testing-checklist.md`
- **Testing Execution Guide:** `docs/development/testing-execution-guide.md`

These documents provide step-by-step procedures for testing:
- All 10 new application sections
- localStorage persistence
- Cross-browser compatibility (Chrome, Safari, Firefox, Edge)
- Mobile responsiveness
- User role-based access
- Form validations and data integrity

### Manual Testing
Navigate through all user flows to verify functionality:
- Applicant flow (A0-A7) + Phase 1 enhancements
- Broker flow (BK1-BK3)
- Admin flow (AD1-AD5) + compliance toggles
- Board reviewer flow (BR1)

### Responsive Testing
Test on multiple screen sizes:
- Mobile: 320px - 639px (iPhone SE, standard phones)
- Tablet: 640px - 1023px (iPad, Android tablets)
- Desktop: 1024px+ (laptops, monitors)

### Accessibility Testing
- Use keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Use browser DevTools accessibility checker
- Verify WCAG 2.2 AA compliance
- Check color contrast ratios
- Verify focus indicators visible

## Documentation

Additional documentation is available in the `docs/` directory:

### General Documentation
- `docs/development/implementation-plan.md` - Detailed implementation roadmap
- `docs/development/requirements.md` - Project requirements and specifications
- `docs/development/design-system.md` - Design tokens and component patterns
- `docs/development/component-guide.md` - Component usage guide
- `docs/development/user-guide.md` - User walkthrough guide

### Testing Documentation (NEW)
- `docs/development/integration-testing-checklist.md` - Comprehensive testing checklist for Phase 1
- `docs/development/testing-execution-guide.md` - Step-by-step testing procedures

### User Guides (NEW)
- See "User Guides" section below for role-specific help documentation

## Future Enhancements

Items deferred to post-MVP:

- Back-end integration (Supabase)
- Real authentication system
- Database persistence with RLS
- Resumable file uploads (TUS protocol)
- Server-side validation
- Email notifications
- Automated testing (unit, integration, e2e)
- Production deployment
- Analytics integration
- E-signature embedding
- Payment processing

## Contributing

This is an MVP project. Before contributing:

1. Review the implementation plan
2. Follow the established code structure
3. Maintain TypeScript type safety
4. Ensure accessibility standards
5. Test responsive layouts
6. Run linting before commits

## License

[Add your license information here]

## Contact

[Add contact information or support details here]

---

Built with Next.js 16, React 19, and TypeScript 5.
