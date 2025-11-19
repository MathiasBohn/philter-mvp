# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application named "philter-mvp" using the App Router architecture, React 19, TypeScript, and Tailwind CSS v4. The project was bootstrapped with `create-next-app` and is in early development stage.

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

## Architecture

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Main application code lives in `/app` directory
- `app/layout.tsx`: Root layout with Geist fonts (sans and mono) and metadata configuration
- `app/page.tsx`: Home page component
- `app/globals.css`: Global styles with Tailwind CSS v4 import and CSS custom properties

### TypeScript Configuration
- Path alias `@/*` maps to root directory (e.g., `@/app/components`)
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler

### Styling
- Tailwind CSS v4 (PostCSS-based, no separate config file needed)
- CSS custom properties for theming in `globals.css`
- Dark mode support via `prefers-color-scheme`
- Geist font family (Google Fonts) loaded via `next/font`

### Key Dependencies
- Next.js 16.0.3
- React 19.2.0
- Tailwind CSS v4 (via @tailwindcss/postcss)
- TypeScript 5

## Project Conventions

### Component Structure
- Server Components by default (no "use client" directive unless needed)
- Client components require explicit "use client" directive at top of file
- Use TypeScript for all components (.tsx extension)

### Imports
- Use Next.js built-in components (`next/image`, `next/font`, etc.) for optimizations
- Prefer named exports for utilities, default exports for page/layout components

### Styling Approach
- Utility-first with Tailwind CSS classes
- Custom properties defined in `globals.css` for theme values
- Dark mode classes available (e.g., `dark:bg-black`)

### File Storage & Persistence

The application uses **IndexedDB** for persistent file storage with automatic migration from legacy localStorage.

#### Storage Architecture

**IndexedDB Storage** (`lib/indexed-db.ts`)
- Primary storage for file uploads (50MB-1GB+ capacity, browser-dependent)
- Stores files as Blob objects (not base64) for optimal performance
- Database name: `philter_file_storage`
- Object store: `files`
- Each file record includes: id, filename, size, type, blob, uploadedAt, category

**localStorage** (`lib/storage.ts`, `lib/persistence.ts`)
- Used for application metadata and form data
- Implements compression (LZ-String) and chunking for large data
- Centralized through `storageService` with caching and reactivity
- Storage keys defined in `STORAGE_KEYS` constant

#### File Upload System

**UploadManager** (`lib/upload-manager.ts`)
```typescript
import { uploadManager, saveFileToStorage } from '@/lib/upload-manager'

// Start simulated upload with progress tracking
uploadManager.startUpload(
  fileId,
  (progress) => console.log(`Progress: ${progress}%`),
  () => console.log('Complete'),
  (error) => console.error(error)
)

// Save file to IndexedDB after upload
await saveFileToStorage(file, fileId, 'documents')
```

**Key Functions:**
- `saveFileToStorage(file, id, category)` - Save file to IndexedDB
- `getStoredFiles()` - Retrieve all stored files
- `getStoredFile(id)` - Get specific file
- `deleteStoredFile(id)` - Remove file from storage
- `getFileObject(storedFile)` - Convert stored file back to File object

#### Migration System

**Automatic Migration** (`components/features/storage/migration-checker.tsx`)
- Automatically detects legacy base64 files in localStorage on app load
- Migrates files to IndexedDB with progress indicator
- Clears localStorage after successful migration
- Shows user-friendly success/error messages

**Manual Migration:**
```typescript
import { migrateFilesFromLocalStorage } from '@/lib/upload-manager'

// Migrate with cleanup
const result = await migrateFilesFromLocalStorage(true)
console.log(`Migrated ${result.migratedCount} files`)
```

#### Data Integrity

**Integrity Tools** (`lib/data-integrity.ts`)
```typescript
import {
  checkDataIntegrity,
  findOrphanedFiles,
  cleanupOrphanedFiles,
  repairDataIntegrity
} from '@/lib/data-integrity'

// Validate file references for an application
const integrity = await checkDataIntegrity('app-id')
if (!integrity.valid) {
  console.log('Issues found:', integrity.issues)
}

// Find and clean up orphaned files
const orphans = await findOrphanedFiles()
await cleanupOrphanedFiles(false) // false = actual deletion, true = dry run

// Auto-repair inconsistencies
const repairResult = await repairDataIntegrity('app-id', true)
```

#### Storage Monitoring

**Storage Monitor** (`components/features/storage/storage-monitor.tsx`)
- Automatically monitors browser storage quota usage
- Shows warning at 80% capacity
- Shows critical alert at 90% capacity
- Checks every 5 minutes

#### Upload Components

**UploadDropzone** (`components/features/application/upload-dropzone.tsx`)
- Drag-and-drop file upload with validation
- Supports multiple files, file type filtering, size limits
- Visual feedback for drag states

**DocumentCard** (`components/features/application/document-card.tsx`)
- Displays uploaded files with preview/delete actions
- Shows upload progress, file metadata
- Image previews for supported formats

**DocumentChecklist** (`components/features/application/document-checklist.tsx`)
- Organizes uploads by category
- Tracks completion status
- Supports skip functionality with reasons

#### Best Practices

1. **Always persist files to IndexedDB after upload:**
   ```typescript
   // After upload completes
   if (doc.status === 'complete') {
     await saveFileToStorage(doc.file, doc.id, 'category')
   }
   ```

2. **Restore files on page load:**
   ```typescript
   useEffect(() => {
     const loadFiles = async () => {
       const storedFiles = await getStoredFiles()
       // Merge with metadata and restore to state
     }
     loadFiles()
   }, [])
   ```

3. **Clean up blob URLs to prevent memory leaks:**
   ```typescript
   useEffect(() => {
     return () => {
       documents.forEach(doc => {
         if (doc.preview) URL.revokeObjectURL(doc.preview)
       })
     }
   }, [documents])
   ```

4. **Handle storage errors gracefully:**
   ```typescript
   try {
     await saveFileToStorage(file, id, category)
   } catch (error) {
     if (error.message.includes('quota')) {
       // Show quota exceeded message
     }
   }
   ```

#### Testing

See `documents/development/indexeddb-integration-tests.md` for comprehensive test checklist covering:
- File upload and persistence
- Migration functionality
- Data integrity
- Error handling
- Memory management
- Cross-browser compatibility

#### Troubleshooting

**Files not persisting after refresh:**
- Check if `saveFileToStorage()` is called after upload completes
- Verify files are in IndexedDB (DevTools → Application → IndexedDB)
- Check console for storage errors

**Migration not triggering:**
- Migration only runs if `philter_uploaded_files` key exists in localStorage
- Check browser console for migration errors
- Verify `MigrationChecker` is mounted in dashboard layout

**Storage quota exceeded:**
- IndexedDB quota varies by browser (50MB-1GB+)
- Use `checkStorageQuota()` from `lib/indexed-db.ts` to check usage
- Consider implementing file size limits or cleanup strategies
