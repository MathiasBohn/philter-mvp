/**
 * Standardized layout constants for consistent spacing and layout across all user workflows
 * Based on Board Member workflow patterns
 */

export const LAYOUT_CONSTANTS = {
  // Container widths
  CONTAINER: {
    STANDARD: "mx-auto max-w-6xl",
    NARROW: "mx-auto max-w-2xl",
    WIDE: "mx-auto max-w-7xl",
  },

  // Vertical spacing between sections
  SPACING: {
    SECTIONS: "space-y-6",
    CARDS: "space-y-4",
    FORM_FIELDS: "space-y-2",
    TIGHT: "space-y-3",
  },

  // Padding
  PADDING: {
    CARD: "p-6",
    CARD_COMPACT: "p-4",
    RESPONSIVE: "px-4 sm:px-6 lg:px-8",
    MOBILE: "px-4 sm:px-0",
  },

  // Headers
  HEADER: {
    TITLE: "text-3xl font-bold tracking-tight",
    TITLE_RESPONSIVE: "text-2xl sm:text-3xl font-bold tracking-tight",
    DESCRIPTION: "mt-2 text-muted-foreground",
    SUBTITLE: "text-xl font-semibold",
  },

  // Grid patterns
  GRID: {
    STATS: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    METRICS: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
    FORM: "grid grid-cols-1 md:grid-cols-2 gap-4",
    TWO_COL: "grid grid-cols-1 lg:grid-cols-2 gap-6",
    THREE_COL: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  },

  // Card styles
  CARD: {
    INTERACTIVE: "hover:shadow-md transition-shadow",
    BORDER: "border",
  },

  // Back button
  BACK_BUTTON: {
    WRAPPER: "mb-4 -ml-2",
    VARIANT: "ghost" as const,
  },
} as const;
