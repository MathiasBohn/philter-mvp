# philter MVP - Design System

## Overview

This document defines the design system for the philter MVP UI. All design tokens are defined using CSS custom properties in `app/globals.css` and are available throughout the application via Tailwind CSS v4.

---

## Border Radius

Border radius values create visual hierarchy and help users identify different types of UI elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-input` | 0.5rem (8px) | Form inputs, text fields |
| `--radius` | 0.625rem (10px) | Base radius for general use |
| `--radius-button` | 0.75rem (12px) | Buttons, interactive elements |
| `--radius-card` | 1rem (16px) | Cards, panels, containers |

### Tailwind Classes

- `rounded-lg` - 8px (inputs)
- `rounded-xl` - 12px (buttons)
- `rounded-2xl` - 16px (cards)

---

## Spacing Scale

Consistent spacing creates visual rhythm and hierarchy. Our spacing scale follows Tailwind's default scale:

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--spacing-1` | 0.25rem (4px) | `space-1` / `p-1` | Minimal spacing, tight layouts |
| `--spacing-2` | 0.5rem (8px) | `space-2` / `p-2` | Small gaps, compact elements |
| `--spacing-3` | 0.75rem (12px) | `space-3` / `p-3` | Form field spacing |
| `--spacing-4` | 1rem (16px) | `space-4` / `p-4` | Standard spacing unit |
| `--spacing-6` | 1.5rem (24px) | `space-6` / `p-6` | Section spacing |
| `--spacing-8` | 2rem (32px) | `space-8` / `p-8` | Large sections |
| `--spacing-12` | 3rem (48px) | `space-12` / `p-12` | Major sections |
| `--spacing-16` | 4rem (64px) | `space-16` / `p-16` | Page-level spacing |

---

## Typography

### Font Families

- **Sans Serif**: Geist Sans (via `next/font`)
  - Used for all body text, headings, UI elements
  - CSS Variable: `var(--font-geist-sans)`
  - Tailwind Class: `font-sans`

- **Monospace**: Geist Mono (via `next/font`)
  - Used for code snippets, technical data
  - CSS Variable: `var(--font-geist-mono)`
  - Tailwind Class: `font-mono`

### Font Sizes

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `--font-size-xs` | 0.75rem (12px) | `text-xs` | Small labels, captions |
| `--font-size-sm` | 0.875rem (14px) | `text-sm` | Secondary text, metadata |
| `--font-size-base` | 1rem (16px) | `text-base` | Body text (default) |
| `--font-size-lg` | 1.125rem (18px) | `text-lg` | Emphasized body text |
| `--font-size-xl` | 1.25rem (20px) | `text-xl` | Small headings (h4-h6) |
| `--font-size-2xl` | 1.5rem (24px) | `text-2xl` | Medium headings (h3) |
| `--font-size-3xl` | 1.875rem (30px) | `text-3xl` | Large headings (h1-h2) |

---

## Color Palette

Colors are defined using the OKLCH color space for better perceptual uniformity and automatic dark mode support.

### Primary Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Primary** | `oklch(0.205 0 0)` (Dark Gray) | `oklch(0.922 0 0)` (Light Gray) | Main action buttons, primary UI elements |
| **Primary Foreground** | `oklch(0.985 0 0)` (White) | `oklch(0.205 0 0)` (Dark Gray) | Text on primary elements |

### Secondary Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Secondary** | `oklch(0.97 0 0)` (Light Gray) | `oklch(0.269 0 0)` (Dark Gray) | Secondary buttons, less prominent actions |
| **Secondary Foreground** | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary elements |

### Semantic Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Success** | `oklch(0.6 0.15 145)` (Green) | `oklch(0.7 0.15 145)` | Approvals, success states |
| **Warning** | `oklch(0.75 0.15 85)` (Yellow/Orange) | `oklch(0.8 0.15 85)` | RFIs, alerts, warnings |
| **Destructive** | `oklch(0.577 0.245 27.325)` (Red) | `oklch(0.704 0.191 22.216)` | Delete actions, denials, errors |

### Neutral Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Background** | `oklch(1 0 0)` (White) | `oklch(0.145 0 0)` (Near Black) | Page background |
| **Foreground** | `oklch(0.145 0 0)` (Near Black) | `oklch(0.985 0 0)` (Near White) | Primary text color |
| **Muted** | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Subtle backgrounds |
| **Muted Foreground** | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary text, metadata |
| **Border** | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders, dividers |
| **Input** | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input borders |

### UI Element Colors

| Color | Usage |
|-------|-------|
| **Card** | Card backgrounds |
| **Popover** | Dropdown and popover backgrounds |
| **Accent** | Highlighted elements |

### Tailwind Classes

Colors are available via Tailwind utility classes:

- `bg-primary` - Primary background
- `text-primary` - Primary text color
- `bg-success` - Success background
- `text-success` - Success text color
- `bg-warning` - Warning background
- `text-warning` - Warning text color
- `bg-destructive` - Destructive/error background
- `text-destructive` - Destructive/error text
- `border-border` - Standard border color

---

## Button Variants

Buttons use the shadcn/ui Button component with predefined variants:

### Primary (Default)

```tsx
<Button>Primary Action</Button>
<Button variant="default">Primary Action</Button>
```

- **Style**: Filled with primary color
- **Usage**: Main call-to-action buttons
- **Example**: "Save & Continue", "Submit Application"

### Secondary

```tsx
<Button variant="secondary">Secondary Action</Button>
```

- **Style**: Light gray background
- **Usage**: Less prominent actions
- **Example**: "Cancel", "Back"

### Destructive

```tsx
<Button variant="destructive">Delete</Button>
```

- **Style**: Red background
- **Usage**: Destructive actions, denials
- **Example**: "Delete Document", "Deny Application"

### Outline

```tsx
<Button variant="outline">Outline</Button>
```

- **Style**: Transparent with border
- **Usage**: Tertiary actions
- **Example**: "View Details", "Download"

### Ghost

```tsx
<Button variant="ghost">Ghost</Button>
```

- **Style**: Transparent, no border
- **Usage**: Minimal emphasis actions
- **Example**: Navigation links, icon buttons

### Link

```tsx
<Button variant="link">Link</Button>
```

- **Style**: Styled as text link
- **Usage**: In-line navigation
- **Example**: "Learn more", "View all"

### Size Variants

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

---

## Component Patterns

### Cards

Cards use consistent padding and border radius:

```tsx
<Card className="rounded-2xl"> {/* 16px radius */}
  <CardHeader className="p-6"> {/* 24px padding */}
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

### Form Fields

Form fields have consistent styling via `FieldRow` component:

```tsx
<FieldRow
  id="field-id"
  label="Field Label"
  required={true}
  error={errors.field}
  helpText="Optional help text"
>
  <Input className="rounded-lg" /> {/* 8px radius */}
</FieldRow>
```

### Spacing Guidelines

- **Form field gaps**: Use `space-y-4` (16px) between fields
- **Section gaps**: Use `space-y-6` (24px) between sections
- **Card padding**: Use `p-6` (24px) for card interiors
- **Page margins**: Use `p-8` or `p-12` for page-level containers

---

## Accessibility

All design tokens support accessibility requirements:

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text**: Minimum 3:1 contrast ratio (WCAG AA)
- **UI elements**: Minimum 3:1 contrast ratio

All color combinations defined in this system meet or exceed these ratios.

### Touch Targets

- **Mobile**: Minimum 44px x 44px (iOS/Android recommended)
- **Desktop**: Minimum 24px x 24px (WCAG 2.2 Target Size)

Touch target sizing is automatically applied via CSS media queries in `globals.css`.

### Focus Indicators

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid oklch(0.488 0.243 264.376);
  outline-offset: 2px;
}
```

Minimum 3:1 contrast ratio for focus indicators against all backgrounds.

---

## Responsive Breakpoints

Tailwind CSS v4 default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops, laptops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

### Mobile-First Approach

All layouts are designed mobile-first, with larger breakpoints enhancing the experience:

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* 16px padding on mobile, 24px on tablet, 32px on desktop */}
</div>
```

---

## Dark Mode

Dark mode is supported automatically via the `.dark` class. All color tokens have both light and dark mode values defined.

To toggle dark mode (for future implementation):

```tsx
<html className="dark">
  {/* App content */}
</html>
```

---

## Usage Examples

### Consistent Card Layout

```tsx
<Card className="rounded-2xl">
  <CardHeader className="p-6 space-y-2">
    <CardTitle className="text-2xl">Section Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Description text
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    {/* Content with 16px vertical spacing */}
  </CardContent>
</Card>
```

### Button Group

```tsx
<div className="flex gap-3">
  <Button className="rounded-xl">Save</Button>
  <Button variant="secondary" className="rounded-xl">Cancel</Button>
</div>
```

### Form Layout

```tsx
<form className="space-y-6">
  <div className="space-y-4">
    <FieldRow label="Name" required>
      <Input className="rounded-lg" />
    </FieldRow>
    <FieldRow label="Email" required>
      <Input type="email" className="rounded-lg" />
    </FieldRow>
  </div>
  <div className="flex gap-3">
    <Button type="submit" className="rounded-xl">Submit</Button>
  </div>
</form>
```

---

## Implementation Notes

### CSS Custom Properties

All design tokens are defined as CSS custom properties in `app/globals.css`:

- Prefix `--radius-*` for border radius
- Prefix `--spacing-*` for spacing scale
- Prefix `--font-size-*` for typography
- No prefix for color tokens (e.g., `--primary`, `--success`)

### Tailwind Integration

Tokens are registered in the `@theme inline` block to make them available as Tailwind utilities:

```css
@theme inline {
  --color-success: var(--success);
  --color-warning: var(--warning);
  /* ... */
}
```

This enables usage like:

```tsx
<div className="bg-success text-success-foreground">
  Success message
</div>
```

---

## Maintenance

### Adding New Colors

1. Define in `:root` for light mode
2. Define in `.dark` for dark mode
3. Register in `@theme inline`
4. Document in this file
5. Test contrast ratios (minimum 4.5:1 for text, 3:1 for UI)

### Adding New Spacing

Spacing already follows Tailwind's default scale. New spacing tokens should only be added for specific, reusable patterns.

### Updating Border Radius

Maintain the current hierarchy:
- Smallest: Inputs (8px)
- Medium: Buttons (12px)
- Largest: Cards (16px)

---

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [OKLCH Color Space](https://oklch.com)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

---

**Last Updated**: 2025-11-14
