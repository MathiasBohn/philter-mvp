# philter

A modern transaction platform for residential co-op and condo board applications. philter digitizes the entire workflow from application creation through board review and decision-making, supporting multiple transaction types and stakeholder roles.

## Overview

philter streamlines the residential real estate application process for NYC co-op and condo transactions. The platform handles the complete lifecycle of board applications, from initial submission through review, decision-making, and documentation assembly.

### Transaction Types

- Co-op Purchase
- Condo Purchase
- Co-op Sublet (with tenant-specific disclosures)
- Condo Lease (with tenant-specific disclosures)

### User Roles

- **Applicants** - Complete and submit applications through a guided 13-section workflow
- **Brokers** - Manage application pipeline, perform quality assurance, and track submissions
- **Transaction Agents** - Review applications, manage templates, and coordinate RFIs (Requests for Information)
- **Board Members** - Review applications with private notes and make approval decisions

## Technology Stack

### Core Framework
- **Next.js 16.0.3** with App Router architecture
- **React 19.2.0** with Server Components
- **TypeScript 5** (strict mode enabled)
- **Node.js 18.17+** required

### UI & Styling
- **Tailwind CSS v4** (PostCSS-based) with dark mode support
- **shadcn/ui** component library (37 components, "new-york" style)
- **Radix UI** primitives for accessibility
- **Lucide React** icon library
- **next-themes** for theme management

### Forms & Validation
- **React Hook Form** for form state management
- **Zod** for schema validation and type inference

### Data & Storage
- **Supabase** for authentication, database, and file storage
  - `@supabase/supabase-js` (2.84.0)
  - `@supabase/ssr` (0.7.0)
  - Supabase Storage with three buckets (documents, profile-photos, building-assets)
- **localStorage** for application metadata and form data
- **lz-string** for data compression
- **crypto-js** for encryption utilities

### PDF Handling
- **pdfjs-dist** (5.4.394) for viewing and rendering
- **pdf-lib** (1.17.1) for PDF manipulation and assembly
- **jsPDF** (3.0.3) for PDF generation

### Development Tools
- **ESLint** with Next.js configuration
- **TypeScript** strict mode
- **Tailwind CSS** IntelliSense support

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn package manager
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+)

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

3. Set up environment variables (optional but recommended for authentication):
```bash
# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** The application will run without Supabase credentials using mock data, but authentication features will be disabled.

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Project Structure

```
philter-mvp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── verify-email/
│   │   └── accept-invitation/
│   ├── (dashboard)/              # Main application routes
│   │   ├── applications/         # Applicant workflow (13 sections)
│   │   ├── broker/               # Broker pipeline and QA
│   │   ├── agent/                # Transaction agent tools
│   │   ├── board/                # Board member review
│   │   ├── my-applications/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── applications/
│   │   ├── buildings/
│   │   ├── invitations/
│   │   └── auth/callback/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles and theme
├── components/
│   ├── ui/                       # Base UI components (37 shadcn components)
│   ├── forms/                    # Form components (11 specialized inputs)
│   ├── layout/                   # Layout components (sidebar, app-shell, etc.)
│   ├── features/                 # Feature-specific components
│   │   ├── application/          # Applicant UI
│   │   ├── broker/               # Broker workflow
│   │   ├── agent/                # Transaction agent
│   │   ├── board/                # Board member
│   │   └── storage/              # Storage management
│   ├── shared/                   # Shared components (PDF viewer, etc.)
│   ├── providers/                # Context providers
│   └── auth/                     # Authentication components
├── lib/
│   ├── types.ts                  # TypeScript type definitions (521 lines)
│   ├── validators.ts             # Zod validation schemas (314 lines)
│   ├── utils.ts                  # Utility functions
│   ├── storage.ts                # localStorage service for form state
│   ├── supabase-storage.ts       # Supabase Storage file operations
│   ├── supabase/                 # Supabase client utilities (server/client)
│   ├── api/
│   │   └── documents.ts          # Document metadata management
│   ├── contexts/                 # React contexts (auth, theme)
│   ├── hooks/                    # Custom React hooks
│   ├── constants/                # Application constants
│   ├── mock-data/                # Development mock data
│   └── pdf-utils.ts              # PDF generation utilities
├── supabase/
│   └── migrations/               # Database migration files
├── public/                       # Static assets
├── documents/                    # Project documentation
├── CLAUDE.md                     # Comprehensive development guide
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Key Features

### Applicant Workflow

A guided 13-section application process:

1. **Overview** - Dashboard with progress tracking
2. **Profile** - Personal information with SSN masking
3. **Parties** - Co-applicants and guarantors
4. **People** - Unit owners, brokers, attorneys
5. **Income** - Employment history and self-employment
6. **Financials** - Assets, liabilities, net worth (REBNY-aligned)
7. **Real Estate** - Housing history with landlord references
8. **Lease Terms** - Move-in preferences and rent budget
9. **Building Policies** - Pet, smoking, renovation acknowledgments
10. **Documents** - File upload with categorization and PDF preview
11. **Disclosures** - Legal acknowledgments (Lead Paint, FCRA, etc.)
12. **Cover Letter** - Personal introduction to the board
13. **Review** - Final validation and submission

### File Storage System

- **Supabase Storage** for all file uploads
- Three storage buckets:
  - `documents` - Application documents (private, user-specific)
  - `profile-photos` - User profile photos (private)
  - `building-assets` - Building logos and images (public)
- File size limits: 25MB for documents, 5MB for profile photos
- Signed URLs for secure file access
- Public URLs for public assets
- Storage quota tracking (1GB free tier)
- Document metadata tracked in Supabase database

### Form Management

- Real-time validation with Zod schemas
- Automatic form data persistence
- Progressive disclosure of errors
- Field-level and form-level validation
- Error summary components
- Specialized input components (masked SSN, currency, date pickers)

### PDF Features

- Client-side and server-side PDF viewing
- PDF document assembly
- Cover sheet generation with jsPDF
- PDF manipulation with pdf-lib
- Document preview and download

### Authentication & Authorization

- Supabase-based authentication (email/password)
- User profile management
- Role-based access control (5 roles)
- Session management with automatic refresh
- Invitation system for broker-initiated applications
- Email verification workflow

### Broker Tools

- Application pipeline management (table/card views)
- Quality assurance checklists
- Building submission tracking
- Mobile-responsive interfaces

### Transaction Agent Features

- Template management system for building-specific configurations
- RFI (Request for Information) management
- Decision panel with approval workflows
- Custom disclosure configuration

### Board Member Interface

- Application review with SSN-redacted views
- Private notes system
- Decision tracking
- Document review tools

### Developer Experience

- Hot module reloading in development
- TypeScript strict mode with comprehensive types
- Path aliases for clean imports (`@/components`, `@/lib`, etc.)
- Mock data system for development
- Comprehensive error handling
- Storage debugging tools

## Storage Architecture

### File Storage (Supabase Storage)

Cloud-based file storage using Supabase:
- **Three storage buckets:**
  - `documents` - Private application documents with RLS policies
  - `profile-photos` - Private user profile photos
  - `building-assets` - Public building images and logos
- **Storage path structure:** `{userId}/{applicationId}/{filename}`
- **Access control:** Row Level Security (RLS) policies ensure users only access their own files
- **File limits:** 25MB for documents, 5MB for profile photos
- **URL types:** Signed URLs for private files, public URLs for public assets
- **Quota:** 1GB on free tier, 100GB on pro tier

### Database Storage (Supabase PostgreSQL)

Document metadata and application data:
- **Documents table** - Tracks file metadata (filename, size, category, storage path, status)
- **Applications table** - Application form data and status
- **Users table** - User profiles and authentication data
- **RLS policies** - Row-level security for data access control
- Soft delete for documents (deleted_at timestamp)

### Application Storage (localStorage)

Form state and UI preferences:
- Centralized through `storageService` class
- In-memory caching for performance
- Observer pattern for reactive updates
- Compression for large data (threshold: 1KB)
- Temporary form data before submission

## Authentication Setup

### With Supabase (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run database migrations:
```bash
supabase db push --linked
```
3. Add environment variables to `.env.local`
4. Restart the development server

### Without Supabase

**Note:** Supabase is now required for the application to function properly, as it provides:
- Authentication and user management
- Database for application data
- File storage for document uploads

Without Supabase credentials, the application will have limited functionality. For local development without Supabase, consider using Supabase Local Development with Docker.

## Browser Compatibility

### Supported Browsers

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- Modern JavaScript (ES2017+)
- CSS Grid and Flexbox
- Local Storage support
- Fetch API for HTTP requests

## Development Workflow

### Adding a New Page

1. Create page file in appropriate route group
2. Add navigation link to sidebar
3. Implement page component with proper layouts

### Adding a New Form Section

1. Create form component with React Hook Form
2. Define Zod validation schema
3. Add page route with proper layout
4. Implement form persistence

### Adding File Upload

1. Use `UploadDropzone` component for file selection
2. Upload files to Supabase Storage using `uploadFile()` from `lib/supabase-storage.ts`
3. Create document metadata record using `createDocument()` from `lib/api/documents.ts`
4. Display uploaded files with signed URLs
5. Handle RLS policies for secure access

Example:
```typescript
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import { createDocument } from '@/lib/api/documents'

// Upload file to Supabase Storage
const result = await uploadFile(
  file,
  STORAGE_BUCKETS.DOCUMENTS,
  `${userId}/${applicationId}/${file.name}`
)

// Create metadata record
await createDocument({
  applicationId,
  filename: file.name,
  category: 'BANK_STATEMENT',
  size: file.size,
  mimeType: file.type,
  storagePath: result.path
})
```

See `CLAUDE.md` for detailed development patterns and examples.

## Code Style & Conventions

### File Naming

- **Components:** kebab-case files (`upload-dropzone.tsx`), PascalCase names (`UploadDropzone`)
- **Utilities:** kebab-case (`supabase-storage.ts`, `pdf-utils.ts`)
- **Types:** `types.ts` for main definitions, collocated types for component-specific

### Import Order
1. External dependencies
2. Internal components
3. Internal utilities
4. Types

### TypeScript
- Explicit types for function parameters and return values
- Type inference for local variables
- Prefer interfaces for object shapes
- Use enums for fixed sets of values

### React
- Function components over class components
- Server Components by default
- `"use client"` directive only when needed
- Custom hooks for reusable stateful logic

## Documentation

### Project Documentation

- **CLAUDE.md** - Comprehensive development guide (primary reference)
- **README.md** - This file, project overview and setup
- **documents/development/** - Additional development documentation

### Key Documentation Sections in CLAUDE.md

- Architecture overview
- Component organization
- Data models and type system
- Validation system
- File storage and persistence
- Utility functions and custom hooks
- Common development tasks
- Troubleshooting guides

## Troubleshooting

### File upload failures
- Verify Supabase Storage buckets are created
- Check RLS policies allow authenticated users to upload
- Ensure file size is within limits (25MB for documents, 5MB for profile photos)
- Review browser console for Supabase Storage errors
- Check storage path follows format: `{userId}/{applicationId}/{filename}`

### File access denied
- Verify RLS policies are properly configured
- Ensure user is authenticated
- Check that storage path includes correct user ID
- Review Supabase dashboard for policy errors

### Storage quota exceeded
- Use `getStorageQuota()` to check usage
- Free tier includes 1GB storage
- Consider upgrading to Pro tier (100GB)
- Clean up old or unused files

### Authentication issues
- Verify Supabase environment variables are set in `.env.local`
- Check Supabase project URL and keys are correct
- Ensure database migrations have been applied: `supabase db push --linked`
- Review browser console for auth errors
- Verify RLS policies are not blocking access

### Database connection errors
- Check Supabase project status in dashboard
- Verify database migrations are up to date
- Check network connectivity to Supabase
- Review API logs in Supabase dashboard

### Build errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (18.17+ required)
- Verify TypeScript compilation succeeds: `npx tsc --noEmit`

## Contributing

1. Follow the code style and conventions outlined in `CLAUDE.md`
2. Write TypeScript with strict mode
3. Test changes across multiple browsers
4. Ensure accessibility guidelines are met (WCAG 2.2 AA)
5. Document complex logic with comments

## License

[Add license information]

## Support

For questions or issues:
- Check `CLAUDE.md` for detailed development guidance
- Review project documentation in `/documents`
- Check browser console for error messages
- Verify environment setup and dependencies

---

**Version:** 0.1.0
**Last Updated:** 2025-11-24
**Node.js:** 18.17+ required
**Next.js:** 16.0.3
**React:** 19.2.0
