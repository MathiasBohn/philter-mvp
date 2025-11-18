# philter

A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.

## Overview

philter digitizes and streamlines the board package and application workflow, enabling brokers and their clients to assemble and submit error-free, complete applications with guided checklists, smart document upload, secure role-based collaboration, transparent process tracking, and comprehensive application review capabilities.

**Key Benefits:**
- Less manual work for all stakeholders
- Faster approvals through streamlined workflows
- Significantly higher application quality
- Transparent process tracking from submission to decision

## Project Status

This is an MVP (Minimum Viable Product) currently in **beta testing**. The application provides complete UI workflows with client-side functionality and browser-based data persistence.

**Current Capabilities:**
- Complete workflows for all user roles (Applicant, Broker, Transaction Agent, Board Member)
- Client-side form validation with Zod schemas
- Browser-based file upload interface with PDF preview
- PDF viewing and generation capabilities
- Mock authentication system for testing user flows
- localStorage-based data persistence
- Responsive design (mobile, tablet, desktop)
- WCAG 2.2 AA accessibility compliance
- Dark mode support
- Comprehensive application sections (profile, income, financials, documents, etc.)
- Reference letter collection system
- NYC-specific legal compliance (Lead Paint, Flood Zone disclosures, Local Laws)
- Consumer report authorization (FCRA compliant)
- Lease terms and housing history tracking
- Emergency contact management
- Party information capture (buyers, sellers, attorneys, brokers)
- Template management for building-specific requirements
- Application review and decision workflows

**Known Limitations:**
- No back-end server or API integration
- Data stored in localStorage only (browser storage, not persistent across devices)
- Mock authentication (no real user accounts or security)
- Simulated file uploads (files stored as Base64 in localStorage, not on a server)
- No database persistence
- No email notifications or real-time updates
- No production deployment configuration

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **React:** Version 19
- **UI Library:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS v4 (PostCSS-based)
- **Language:** TypeScript 5
- **Validation:** Zod v4 (client-side schemas)
- **Forms:** React Hook Form with @hookform/resolvers
- **PDF:** PDF.js (viewing) + pdf-lib + jsPDF (generation)
- **Icons:** Lucide React
- **Date Handling:** date-fns + react-day-picker
- **Theming:** next-themes (dark mode support)
- **Notifications:** Sonner (toast notifications)
- **State Management:** React hooks + localStorage
- **Data Compression:** lz-string (for localStorage optimization)

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
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── applications/         # Applicant workflow
│   │   │   ├── [id]/             # Dynamic application routes
│   │   │   │   ├── page.tsx      # Application overview
│   │   │   │   ├── profile/      # Personal information
│   │   │   │   ├── parties/      # Co-applicants, guarantors
│   │   │   │   ├── people/       # Unit owners, attorneys
│   │   │   │   ├── income/       # Employment & income
│   │   │   │   ├── financials/   # Assets & liabilities
│   │   │   │   ├── real-estate/  # Housing history
│   │   │   │   ├── lease-terms/  # Move-in preferences
│   │   │   │   ├── building-policies/  # Pet, smoking rules
│   │   │   │   ├── documents/    # Document uploads
│   │   │   │   ├── disclosures/  # Legal acknowledgments
│   │   │   │   ├── cover-letter/ # Board introduction
│   │   │   │   └── review/       # Final review & submit
│   │   │   └── new/              # New application creation
│   │   ├── broker/               # Broker workflow
│   │   │   ├── page.tsx          # Application pipeline
│   │   │   ├── [id]/qa/          # Quality assurance
│   │   │   ├── [id]/submit/      # Submission interface
│   │   │   └── prefill-wizard/   # Pre-fill workflow
│   │   ├── agent/                # Transaction Agent workflow
│   │   │   ├── inbox/            # Submitted applications
│   │   │   ├── templates/        # Template management
│   │   │   ├── review/[id]/      # Application review
│   │   │   └── submit/           # Decision submission
│   │   ├── board/                # Board Member workflow
│   │   │   ├── page.tsx          # Board dashboard
│   │   │   ├── review/[id]/      # Application review
│   │   │   ├── summary/[id]/     # Application summary
│   │   │   └── decisions/        # Decision tracking
│   │   ├── my-applications/      # User's applications
│   │   ├── settings/             # User settings
│   │   └── help-support/         # Help & support
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components (header, sidebar, nav)
│   ├── features/                 # Feature-specific components
│   │   ├── application/          # Applicant flow components
│   │   ├── applications/         # Application list components
│   │   ├── broker/               # Broker flow components
│   │   ├── agent/                # Transaction Agent components
│   │   └── board/                # Board Member components
│   ├── shared/                   # Shared utility components
│   └── providers/                # React context providers
├── lib/                          # Utilities and helpers
│   ├── mock-data/                # Mock data fixtures
│   ├── data/                     # Static data files
│   ├── constants/                # Application constants
│   ├── hooks/                    # Custom React hooks
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   ├── validators.ts             # Zod validation schemas
│   ├── persistence.ts            # localStorage utilities
│   ├── pdf-utils.ts              # PDF handling utilities
│   └── user-context.tsx          # User authentication context
├── public/                       # Static assets
│   └── samples/                  # Sample PDF files for testing
├── docs/                         # Documentation
│   └── development/              # Development documentation
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
└── CLAUDE.md                     # Claude Code project instructions
```

## User Roles

The platform supports four distinct user roles, each with specific workflows and capabilities:

### 1. Applicant
The primary individual applying for purchase or lease of a unit.

**Capabilities:**
- Start new application by entering building code and selecting transaction type
- Complete comprehensive application sections (profile, income, financials, real estate history, etc.)
- Upload required documents with PDF preview
- Add and manage parties (co-applicants, guarantors, attorneys, sellers)
- Collect and manage reference letters with contact information
- Track application progress through guided workflow
- Review and submit completed application
- Acknowledge legal disclosures and building policies

### 2. Broker
Real estate professionals managing client applications.

**Capabilities:**
- View and manage pipeline of applications
- Initiate new applications for clients
- Pre-fill building-specific information
- Upload documents on behalf of clients
- Perform quality assurance (QA) review before submission
- Request information from applicants
- Submit applications to buildings
- Track application status and history

### 3. Transaction Agent
Building management professionals who review and process applications.

**Capabilities:**
- Create and manage building-specific application templates
- Configure required sections and legal compliance requirements
- Review submitted applications in inbox
- View complete application packages with PDF viewer
- Request additional information (RFI) from applicants or brokers
- Make approval decisions (approve, conditional approval, deny)
- Issue adverse action notices when required
- Toggle jurisdiction-specific requirements (NYC Local Laws, etc.)

### 4. Board Member
Board members who review applications and make final decisions.

**Capabilities:**
- View read-only compiled application packages
- Review all submitted documents and information
- Add private notes (not visible to applicants)
- Mark applications as reviewed
- Download complete packages
- View SSN-redacted versions for privacy
- Track review status across multiple applications

## Transaction Types

philter supports four transaction types, each with specific requirements and workflows:

1. **Co-op Purchase** - Purchase of cooperative apartment shares
2. **Condo Purchase** - Purchase of condominium unit
3. **Co-op Sublet** - Sublease of cooperative apartment (includes tenant-specific disclosures)
4. **Condo Lease** - Lease of condominium unit (includes tenant-specific disclosures)

**Note:** Lease and sublet transactions include additional disclosure requirements such as Local Law 55 (Right to Counsel), Window Guard notices, and tenant-specific acknowledgments.

## Application Sections

The applicant workflow is organized into distinct sections, each capturing specific information required for board review:

1. **Overview** - Application dashboard with progress tracking and quick navigation
2. **Profile** - Personal information, contact details, SSN (masked), emergency contacts
3. **Parties** - Co-applicants, guarantors, and their roles
4. **People** - Unit owners, seller's broker, attorneys (buyer and seller)
5. **Income** - Employment history, current job, income sources, self-employment details
6. **Financials** - Assets (bank accounts, investments, retirement), liabilities, net worth
7. **Real Estate** - Current residence, previous residences, landlord references, housing timeline
8. **Lease Terms** - Preferred move-in date, rent budget range, lease duration, special requirements
9. **Building Policies** - Pet acknowledgment, smoking policy, renovation guidelines
10. **Documents** - Document uploads organized by category (ID, bank statements, tax returns, etc.)
11. **Disclosures** - Legal acknowledgments (Lead Paint, Flood Zone, Local Laws, consumer reports)
12. **Cover Letter** - Personal introduction and message to the board
13. **Review** - Final application review, validation checks, and submission

Each section includes:
- Form validation with real-time error checking
- Progress indicators
- Save functionality (localStorage persistence)
- Conditional fields based on transaction type
- Helpful tooltips and guidance

## Key Features

### Applicant Workflow
**Application Initiation:**
- Building code entry with validation
- Transaction type selection (purchase or lease/sublet)
- Application overview dashboard with progress tracking

**Personal Information:**
- Comprehensive profile with contact information
- PII masking for sensitive data (SSN, phone numbers)
- Emergency contact management

**Parties & People:**
- Add co-applicants, guarantors, and attorneys
- Capture unit owner/seller information
- Owner's broker and attorney details
- Role-based party management

**Employment & Income:**
- Current and previous employment history
- Income documentation and verification
- Self-employment details
- Additional income sources

**Financial Information:**
- Assets summary (REBNY-aligned format)
- Liabilities and monthly obligations
- Net worth calculations
- Bank account details

**Real Estate History:**
- Current residence information
- Previous residence history
- Landlord references and contact information
- Housing timeline tracking

**Lease Terms:**
- Preferred move-in date selection
- Rent budget range (min/max)
- Lease duration preferences
- Special requirements or conditions

**Building Policies:**
- Pet acknowledgment (with pet details)
- Smoking policy acceptance
- Renovation guidelines awareness
- Building-specific rules compliance

**Documents:**
- Document upload with category assignment
- PDF preview and management
- File organization by type
- Upload progress tracking

**Legal Disclosures:**
- NYC-specific requirements (Lead Paint, Flood Zone)
- Local Law acknowledgments (LL38, LL55)
- Window Guard and safety notices
- Consumer report authorization (FCRA compliant)
- Background check consent

**Cover Letter:**
- Personal introduction to board
- Motivation and background
- Custom message composition

**Review & Submit:**
- Complete application review
- Validation and completeness checks
- Final submission confirmation

### Broker Workflow
**Application Management:**
- Pipeline dashboard with application tracking
- Multi-application view with status indicators
- Search and filter capabilities

**Pre-fill Wizard:**
- Building-specific information entry
- Bulk data entry for efficiency
- Template-based pre-population

**Quality Assurance:**
- Comprehensive QA checklist
- Document completeness verification
- Data accuracy validation
- Missing information identification

**Submission:**
- Review before submission
- Submit to building management
- Track submission status and history

### Transaction Agent Workflow
**Template Management:**
- Create building-specific templates
- Configure required vs. optional sections
- Set legal compliance requirements
- Manage jurisdiction-specific rules

**Application Inbox:**
- View all submitted applications
- Filter by status, building, date
- Quick access to application details
- Priority queue management

**Application Review:**
- Complete package viewer with PDF support
- Side-by-side document comparison
- Applicant information summary
- Financial analysis tools

**Request for Information (RFI):**
- Create RFI requests for applicants or brokers
- Track RFI status and responses
- Automated follow-up reminders
- RFI resolution workflow

**Decision Management:**
- Approval decision interface (approve, conditional, deny)
- Adverse action notice generation
- Decision documentation and rationale
- Notification to applicants and brokers

### Board Member Workflow
**Application Review:**
- Read-only compiled application packages
- Complete document access
- SSN-redacted views for privacy
- Searchable application content

**Private Notes:**
- Add confidential notes (not shared with applicants)
- Note history and timestamps
- Collaborative board member notes

**Decision Tracking:**
- Mark applications as reviewed
- View board member review status
- Decision history and audit trail

**Package Download:**
- Download complete application packages
- Expiration notices for downloaded files
- Secure download links

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

### Manual Testing Approach
This MVP uses manual testing to verify functionality across all workflows and user roles.

**User Flow Testing:**
Navigate through complete workflows to verify end-to-end functionality:
- **Applicant:** Create application → Complete all sections → Submit
- **Broker:** View pipeline → Initiate application → QA review → Submit
- **Transaction Agent:** Create template → Review applications → Make decisions
- **Board Member:** Review packages → Add notes → Download

**Data Persistence Testing:**
- Verify localStorage saves data correctly
- Test data persistence across page refreshes
- Validate data compression with lz-string
- Check data migration and schema changes

**Cross-Browser Testing:**
Test on multiple browsers to ensure compatibility:
- Chrome/Edge (Chromium-based)
- Safari (WebKit)
- Firefox (Gecko)

**Responsive Testing:**
Verify layouts at different breakpoints:
- Mobile: 320px - 639px (phones)
- Tablet: 640px - 1023px (tablets)
- Desktop: 1024px+ (laptops, monitors)

**Form Validation Testing:**
- Test Zod schema validation
- Verify error messages display correctly
- Check required field enforcement
- Test conditional validation logic

**Accessibility Testing:**
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Browser DevTools accessibility audit
- WCAG 2.2 AA compliance verification
- Color contrast ratio testing
- Focus indicator visibility

### Testing Documentation
Detailed testing procedures available in:
- `docs/development/integration-testing-checklist.md`
- `docs/development/testing-execution-guide.md`

## Documentation

Additional documentation is available in the `docs/` directory:

### General Documentation
- `docs/development/implementation-plan.md` - Detailed implementation roadmap
- `docs/development/requirements.md` - Project requirements and specifications
- `docs/development/design-system.md` - Design tokens and component patterns
- `docs/development/component-guide.md` - Component usage guide
- `docs/development/user-guide.md` - User walkthrough guide

### Testing Documentation
- `docs/development/integration-testing-checklist.md` - Comprehensive testing checklist
- `docs/development/testing-execution-guide.md` - Step-by-step testing procedures

## Future Enhancements

Potential enhancements for production release:

**Infrastructure:**
- Back-end API integration (Supabase, PostgreSQL, or similar)
- Real authentication system with user accounts and security
- Database persistence with row-level security (RLS)
- Production deployment configuration and hosting
- Content Delivery Network (CDN) for static assets
- Server-side rendering optimization

**File Management:**
- Cloud storage integration (S3, Azure Blob, etc.)
- Resumable file uploads (TUS protocol)
- File virus scanning and validation
- Document versioning and history
- Automated document expiration

**Communication:**
- Email notification system (submission confirmations, RFI alerts, decisions)
- In-app messaging between applicants, brokers, and agents
- SMS notifications for critical updates
- Push notifications for mobile

**Security & Compliance:**
- Server-side validation (in addition to client-side)
- Data encryption at rest and in transit
- Audit logging for all actions
- GDPR and privacy law compliance tools
- Two-factor authentication (2FA)
- Session management and timeout

**Testing & Quality:**
- Automated unit testing (Jest, Vitest)
- Integration testing (Playwright, Cypress)
- End-to-end testing
- Continuous Integration/Continuous Deployment (CI/CD)
- Performance monitoring and optimization

**Analytics & Insights:**
- Application analytics (completion rates, time-to-submit)
- User behavior tracking
- Performance metrics dashboards
- A/B testing framework

**Advanced Features:**
- E-signature integration (DocuSign, Adobe Sign)
- Payment processing for application fees
- Automated credit and background check integration
- OCR for automatic document data extraction
- Multi-language support (i18n)
- Mobile native apps (iOS/Android)
- Bulk operations for brokers and agents
- Advanced search and filtering
- Data export and reporting tools

## Contributing

This is an MVP in beta testing. When contributing to the project:

### Before Starting
1. Review the project documentation in `docs/development/`
2. Understand the established code structure and patterns
3. Check the CLAUDE.md file for AI coding assistant guidelines

### Code Quality Standards
- **TypeScript:** Use strict typing, no `any` types
- **Components:** Follow the established component organization
- **Styling:** Use Tailwind utility classes, maintain responsive design
- **Accessibility:** Ensure WCAG 2.2 AA compliance
- **Forms:** Use React Hook Form with Zod validation schemas

### Development Workflow
1. Create feature branch from `main`
2. Write code following existing patterns
3. Test across different screen sizes (mobile, tablet, desktop)
4. Run `npm run lint` and fix all issues
5. Test with keyboard navigation and screen readers
6. Commit with descriptive messages
7. Submit pull request with detailed description

### Testing
- Manually test all affected user workflows
- Verify localStorage persistence works correctly
- Test in multiple browsers (Chrome, Safari, Firefox)
- Check dark mode appearance if UI changes were made

## License

[Add your license information here]

## Contact

[Add contact information or support details here]

---

**philter** - Transaction Platform MVP | Built with Next.js 16, React 19, and TypeScript 5 | Currently in Beta Testing
