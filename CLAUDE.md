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
