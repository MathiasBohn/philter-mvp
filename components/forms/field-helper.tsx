"use client"

import { HelpCircle, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FieldLabelProps {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
  tooltip?: string
  className?: string
}

/**
 * Enhanced label with optional tooltip for complex fields
 */
export function FieldLabel({
  htmlFor,
  children,
  required,
  tooltip,
  className,
}: FieldLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className={cn("text-sm font-medium", className)}>
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger type="button" className="inline-flex">
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

interface InlineHelpProps {
  children: React.ReactNode
  variant?: "info" | "warning" | "tip"
  className?: string
}

/**
 * Inline help text for providing additional context
 */
export function InlineHelp({ children, variant = "info", className }: InlineHelpProps) {
  const variantStyles = {
    info: "text-muted-foreground bg-muted/30",
    warning: "text-warning-foreground bg-warning/10 border-warning/20",
    tip: "text-accent-foreground bg-accent/10 border-accent/20",
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm mt-2",
        variantStyles[variant],
        className
      )}
    >
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  )
}

interface FieldGroupProps {
  label: string
  required?: boolean
  tooltip?: string
  helpText?: string
  helpVariant?: "info" | "warning" | "tip"
  error?: string
  children: React.ReactNode
  className?: string
}

/**
 * Complete field group with label, tooltip, help text, and error message
 */
export function FieldGroup({
  label,
  required,
  tooltip,
  helpText,
  helpVariant = "info",
  error,
  children,
  className,
}: FieldGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel required={required} tooltip={tooltip}>
        {label}
      </FieldLabel>
      {children}
      {helpText && !error && <InlineHelp variant={helpVariant}>{helpText}</InlineHelp>}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Common tooltips for frequently used fields
 */
export const FIELD_TOOLTIPS = {
  ssn: "Your Social Security Number is required for identity verification and credit checks. It will be kept confidential and secure.",
  dob: "Your date of birth is used to verify your identity and calculate eligibility requirements.",
  annualIncome: "Enter your total annual income before taxes from all sources. This helps determine your ability to meet financial obligations.",
  creditScore: "Your estimated credit score helps us understand your financial history. This won't affect your actual credit score.",
  moveInDate: "The date you plan to move into the property. This helps us plan the onboarding process.",
  leaseLength: "The duration of your lease agreement in months. Common terms are 12, 24, or 36 months.",
  monthlyRent: "The amount you'll pay each month for rent. This doesn't include utilities unless specified.",
  securityDeposit: "A refundable deposit held to cover potential damages. Typically equals 1-2 months of rent.",
  brokerFee: "A one-time fee paid to the broker for their services, typically 12-15% of annual rent in NYC.",
  moveInCost: "Total upfront costs including first month's rent, security deposit, and broker fee.",
  currentLandlord: "Contact information for your current or most recent landlord. We may contact them for a reference.",
  employer: "Your current employer's name and contact information. This helps verify your employment status.",
  references: "Personal or professional references who can vouch for your character and reliability.",
  pets: "Information about any pets you plan to bring. Some buildings have pet policies or restrictions.",
  parking: "Whether you need a parking space. This may affect your total monthly costs.",
} as const
