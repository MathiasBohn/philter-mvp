import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LAYOUT_CONSTANTS } from "@/lib/constants/layout";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  responsive?: boolean;
  className?: string;
}

/**
 * Standardized page header component for consistent headers across all workflows
 * Based on Board Member workflow patterns
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  responsive = false,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {backHref && (
        <div className={LAYOUT_CONSTANTS.BACK_BUTTON.WRAPPER}>
          <Button
            variant={LAYOUT_CONSTANTS.BACK_BUTTON.VARIANT}
            size="sm"
            asChild
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1
            className={
              responsive
                ? LAYOUT_CONSTANTS.HEADER.TITLE_RESPONSIVE
                : LAYOUT_CONSTANTS.HEADER.TITLE
            }
          >
            {title}
          </h1>
          {description && (
            <p className={LAYOUT_CONSTANTS.HEADER.DESCRIPTION}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
