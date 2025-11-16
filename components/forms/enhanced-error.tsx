"use client"

import { AlertCircle, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FormError {
  field: string
  message: string
  suggestion?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface EnhancedErrorMessageProps {
  error: FormError
  className?: string
}

/**
 * Enhanced error message with helpful suggestions and actions
 */
export function EnhancedErrorMessage({ error, className }: EnhancedErrorMessageProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-2 text-destructive">
        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{error.message}</p>
          {error.suggestion && (
            <p className="text-sm text-muted-foreground">{error.suggestion}</p>
          )}
          {error.action && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-destructive hover:text-destructive/80"
              onClick={error.action.onClick}
            >
              {error.action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface EnhancedErrorSummaryProps {
  errors: FormError[]
  title?: string
  onDismiss?: () => void
  className?: string
}

/**
 * Enhanced error summary with actionable suggestions
 */
export function EnhancedErrorSummary({
  errors,
  title = "Please fix the following errors",
  onDismiss,
  className,
}: EnhancedErrorSummaryProps) {
  if (errors.length === 0) return null

  return (
    <Alert variant="destructive" className={cn("relative", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mb-2">{title}</AlertTitle>
      <AlertDescription>
        <ul className="space-y-3 mt-2">
          {errors.map((error, index) => (
            <li key={`${error.field}-${index}`} className="text-sm">
              <div className="space-y-1">
                <p className="font-medium">
                  {error.field}: {error.message}
                </p>
                {error.suggestion && (
                  <p className="text-destructive-foreground/80 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    {error.suggestion}
                  </p>
                )}
                {error.action && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-destructive-foreground hover:text-destructive-foreground/80"
                    onClick={error.action.onClick}
                  >
                    → {error.action.label}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

/**
 * Common error messages with helpful suggestions
 */
export const ERROR_MESSAGES = {
  // Required fields
  required: (fieldName: string): FormError => ({
    field: fieldName,
    message: "This field is required",
    suggestion: `Please provide your ${fieldName.toLowerCase()} to continue`,
  }),

  // Email validation
  invalidEmail: (fieldName = "Email"): FormError => ({
    field: fieldName,
    message: "Please enter a valid email address",
    suggestion: "Make sure the email is in the format: name@example.com",
  }),

  // Phone validation
  invalidPhone: (fieldName = "Phone"): FormError => ({
    field: fieldName,
    message: "Please enter a valid phone number",
    suggestion: "Use format: (123) 456-7890 or 123-456-7890",
  }),

  // SSN validation
  invalidSSN: (fieldName = "SSN"): FormError => ({
    field: fieldName,
    message: "Please enter a valid Social Security Number",
    suggestion: "SSN should be in format: 123-45-6789 or 9 digits",
  }),

  // Date validation
  invalidDate: (fieldName = "Date"): FormError => ({
    field: fieldName,
    message: "Please enter a valid date",
    suggestion: "Select a date from the calendar or enter in format: MM/DD/YYYY",
  }),

  futureDate: (fieldName = "Date"): FormError => ({
    field: fieldName,
    message: "Date cannot be in the future",
    suggestion: "Please select a date that has already occurred",
  }),

  pastDate: (fieldName = "Date"): FormError => ({
    field: fieldName,
    message: "Date cannot be in the past",
    suggestion: "Please select a future date",
  }),

  // Number validation
  invalidNumber: (fieldName: string): FormError => ({
    field: fieldName,
    message: "Please enter a valid number",
    suggestion: "Enter numbers only, without letters or special characters",
  }),

  negativeNumber: (fieldName: string): FormError => ({
    field: fieldName,
    message: "Number cannot be negative",
    suggestion: "Please enter a positive value",
  }),

  // File upload
  invalidFileType: (allowedTypes: string[]): FormError => ({
    field: "File",
    message: "Invalid file type",
    suggestion: `Please upload one of the following file types: ${allowedTypes.join(", ")}`,
  }),

  fileTooLarge: (maxSize: string): FormError => ({
    field: "File",
    message: "File size exceeds limit",
    suggestion: `Please upload a file smaller than ${maxSize}`,
  }),

  // Custom
  custom: (field: string, message: string, suggestion?: string): FormError => ({
    field,
    message,
    suggestion,
  }),
} as const
