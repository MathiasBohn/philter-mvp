import { cn } from "@/lib/utils";
import { LAYOUT_CONSTANTS } from "@/lib/constants/layout";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "standard" | "narrow" | "wide";
}

/**
 * Standardized page container component for consistent layout across all workflows
 * Based on Board Member workflow patterns
 */
export function PageContainer({
  children,
  className,
  size = "standard",
}: PageContainerProps) {
  const containerClass =
    size === "narrow"
      ? LAYOUT_CONSTANTS.CONTAINER.NARROW
      : size === "wide"
        ? LAYOUT_CONSTANTS.CONTAINER.WIDE
        : LAYOUT_CONSTANTS.CONTAINER.STANDARD;

  return (
    <div
      className={cn(
        containerClass,
        LAYOUT_CONSTANTS.SPACING.SECTIONS,
        className
      )}
    >
      {children}
    </div>
  );
}
