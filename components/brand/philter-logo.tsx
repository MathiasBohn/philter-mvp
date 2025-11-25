"use client";

import { cn } from "@/lib/utils";

interface PhilterLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show full logo with text or just the symbol */
  variant?: "full" | "symbol";
  /** Additional className */
  className?: string;
  /** Show beta badge */
  showBeta?: boolean;
}

const sizeClasses = {
  sm: {
    symbol: "text-xl",
    text: "text-lg",
    badge: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    symbol: "text-2xl",
    text: "text-xl",
    badge: "text-xs px-2 py-0.5",
  },
  lg: {
    symbol: "text-3xl",
    text: "text-2xl",
    badge: "text-xs px-2 py-0.5",
  },
  xl: {
    symbol: "text-5xl",
    text: "text-4xl",
    badge: "text-sm px-2.5 py-1",
  },
};

/**
 * PhilterLogo component
 *
 * The philter brand logo featuring the Greek letter phi (φ) symbol
 * in the brand green color, optionally followed by the "philter" wordmark.
 *
 * Based on the pitch deck brand identity.
 */
export function PhilterLogo({
  size = "md",
  variant = "full",
  className,
  showBeta = false,
}: PhilterLogoProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Phi Symbol - Brand Green */}
      <span
        className={cn(
          sizes.symbol,
          "font-bold text-primary leading-none",
          "transition-colors"
        )}
        aria-hidden="true"
      >
        φ
      </span>

      {/* Wordmark */}
      {variant === "full" && (
        <span
          className={cn(
            sizes.text,
            "font-bold text-foreground leading-none tracking-tight"
          )}
        >
          philter
        </span>
      )}

      {/* Beta Badge */}
      {showBeta && (
        <span
          className={cn(
            sizes.badge,
            "rounded-full font-medium",
            "bg-primary/10 text-primary",
            "dark:bg-primary/20 dark:text-primary"
          )}
        >
          beta
        </span>
      )}
    </div>
  );
}

/**
 * PhilterIcon component
 *
 * Just the phi symbol for use as a favicon-style icon
 */
export function PhilterIcon({
  size = "md",
  className,
}: Pick<PhilterLogoProps, "size" | "className">) {
  const sizes = sizeClasses[size];

  return (
    <span
      className={cn(
        sizes.symbol,
        "font-bold text-primary leading-none",
        className
      )}
      aria-label="Philter"
    >
      φ
    </span>
  );
}

/**
 * PhilterLogoFull component
 *
 * A more elaborate logo version for marketing pages
 * with tagline support
 */
export function PhilterLogoFull({
  className,
  tagline,
}: {
  className?: string;
  tagline?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-1">
        <span className="text-4xl font-bold text-primary leading-none">φ</span>
        <span className="text-3xl font-bold text-foreground leading-none tracking-tight">
          philter
        </span>
      </div>
      {tagline && (
        <p className="text-sm text-muted-foreground mt-1 ml-0.5">
          {tagline}
        </p>
      )}
    </div>
  );
}
