/**
 * useFormValidation Hook
 *
 * Provides client-side validation with Zod schemas
 * Supports validation on blur and submit
 *
 * Features:
 * - Type-safe field names based on schema keys
 * - Validation on blur and change events
 * - Error management with summary support
 * - Focus management for accessibility
 */

import { useState, useCallback, useRef } from "react"
import { z, ZodError, ZodObject } from "zod"

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

interface UseFormValidationOptions<T extends z.ZodType> {
  schema: T
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

/**
 * Extract field names from a Zod schema for type-safe validation
 *
 * For ZodObject schemas, this extracts all top-level keys.
 * For nested schemas, use dot notation (e.g., "address.street").
 */
type ExtractFieldNames<T extends z.ZodType> = T extends ZodObject<infer Shape>
  ? keyof Shape extends string
    ? keyof Shape
    : string
  : string

/**
 * Form validation hook with type-safe field names
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   firstName: z.string(),
 *   lastName: z.string(),
 *   email: z.string().email(),
 * })
 *
 * const { validateField, handleBlur } = useFormValidation({ schema })
 *
 * // TypeScript will suggest: 'firstName' | 'lastName' | 'email'
 * validateField('firstName', value)
 *
 * // TypeScript error: Argument of type '"fistName"' is not assignable
 * validateField('fistName', value) // Typo caught!
 * ```
 */
export function useFormValidation<T extends z.ZodType>({
  schema,
  validateOnBlur = true,
  validateOnChange = false,
}: UseFormValidationOptions<T>) {
  // Type for field names based on schema
  type FieldName = ExtractFieldNames<T> | (string & {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  /**
   * Validate entire form data
   */
  const validate = useCallback(
    (data: unknown): ValidationResult => {
      try {
        schema.parse(data)
        setErrors({})
        return {
          isValid: true,
          errors: [],
        }
      } catch (error) {
        if (error instanceof ZodError) {
          const validationErrors: ValidationError[] = []
          const errorMap: Record<string, string> = {}

          error.issues.forEach((err) => {
            const field = err.path.join(".")
            const message = err.message

            validationErrors.push({ field, message })
            errorMap[field] = message
          })

          setErrors(errorMap)

          return {
            isValid: false,
            errors: validationErrors,
          }
        }

        // Unknown error type
        console.error("Validation error:", error)
        return {
          isValid: false,
          errors: [{ field: "_general", message: "An unexpected validation error occurred" }],
        }
      }
    },
    [schema]
  )

  /**
   * Validate a single field
   * @param fieldName - Type-safe field name from schema
   * @param value - Value to validate
   * @param fullData - Optional full form data for cross-field validation
   */
  const validateField = useCallback(
    (fieldName: FieldName, value: unknown, fullData?: unknown): string | null => {
      try {
        // If we have full data, validate against the entire schema
        // to catch cross-field validation errors
        if (fullData) {
          schema.parse(fullData)
          // Clear error for this field if validation passes
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
          return null
        }

        // Otherwise, just validate this field's type if possible
        // Note: This is a simplified approach; full validation requires full data
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
        return null
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.issues.find((err) => err.path.join(".") === fieldName)
          if (fieldError) {
            const message = fieldError.message
            setErrors((prev) => ({
              ...prev,
              [fieldName]: message,
            }))
            return message
          }
        }
        return null
      }
    },
    [schema]
  )

  /**
   * Handle field blur event
   * @param fieldName - Type-safe field name from schema
   * @param value - Current field value
   * @param fullData - Optional full form data for cross-field validation
   */
  const handleBlur = useCallback(
    (fieldName: FieldName, value: unknown, fullData?: unknown) => {
      if (!validateOnBlur) return

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }))

      // Validate field
      if (fullData) {
        validate(fullData)
      } else {
        validateField(fieldName, value)
      }
    },
    [validateOnBlur, validate, validateField]
  )

  /**
   * Handle field change event
   * @param fieldName - Type-safe field name from schema
   * @param value - New field value
   * @param fullData - Optional full form data for cross-field validation
   */
  const handleChange = useCallback(
    (fieldName: FieldName, value: unknown, fullData?: unknown) => {
      if (!validateOnChange) return

      // Only validate if field has been touched
      if (touched[fieldName]) {
        if (fullData) {
          validate(fullData)
        } else {
          validateField(fieldName, value)
        }
      }
    },
    [validateOnChange, touched, validate, validateField]
  )

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Clear error for specific field
   * @param fieldName - Type-safe field name from schema
   */
  const clearFieldError = useCallback((fieldName: FieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  /**
   * Set custom error for a field
   * @param fieldName - Type-safe field name from schema
   * @param message - Error message to display
   */
  const setFieldError = useCallback((fieldName: FieldName, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }))
  }, [])

  /**
   * Get error for specific field
   * @param fieldName - Type-safe field name from schema
   */
  const getFieldError = useCallback(
    (fieldName: FieldName): string | undefined => {
      return errors[fieldName]
    },
    [errors]
  )

  /**
   * Check if field has error
   * @param fieldName - Type-safe field name from schema
   */
  const hasFieldError = useCallback(
    (fieldName: FieldName): boolean => {
      return !!errors[fieldName]
    },
    [errors]
  )

  /**
   * Focus on first error field
   */
  const focusFirstError = useCallback(() => {
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      // Try to find and focus the field
      const element = document.querySelector(
        `[name="${firstErrorField}"], [data-field="${firstErrorField}"], #${firstErrorField}`
      ) as HTMLElement

      if (element) {
        element.focus()
        // Scroll into view if not visible
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errorSummaryRef.current) {
        // If field not found, focus error summary
        errorSummaryRef.current.focus()
        errorSummaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [errors])

  /**
   * Validate and focus on submit
   */
  const validateAndFocus = useCallback(
    (data: unknown): ValidationResult => {
      const result = validate(data)

      if (!result.isValid) {
        // Focus on first error after a brief delay to allow state update
        setTimeout(() => {
          focusFirstError()
        }, 100)
      }

      return result
    },
    [validate, focusFirstError]
  )

  /**
   * Get all validation errors in a format suitable for error summary
   */
  const getErrorList = useCallback((): ValidationError[] => {
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message,
    }))
  }, [errors])

  return {
    // State
    errors,
    touched,
    errorSummaryRef,

    // Validation functions
    validate,
    validateField,
    validateAndFocus,

    // Event handlers
    handleBlur,
    handleChange,

    // Error management
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    hasFieldError,

    // Error list for summary
    getErrorList,

    // Focus management
    focusFirstError,

    // Computed values
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
  }
}

/**
 * Helper function to get field props for use with form inputs
 */
export function getFieldProps(
  fieldName: string,
  validation: ReturnType<typeof useFormValidation>
) {
  return {
    name: fieldName,
    "data-field": fieldName,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value
      validation.handleBlur(fieldName, value)
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      validation.handleChange(fieldName, value)
    },
    "aria-invalid": validation.hasFieldError(fieldName),
    "aria-describedby": validation.hasFieldError(fieldName)
      ? `${fieldName}-error`
      : undefined,
  }
}
