import { Role, ApplicationStatus, TransactionType} from "@/lib/types"

/**
 * Centralized label and status configuration constants
 * This file provides a single source of truth for all label mappings,
 * status colors, and display configurations across the application.
 */

// ============================================================================
// ROLE LABELS
// ============================================================================

export const ROLE_LABELS: Record<Role, string> = {
  [Role.APPLICANT]: "Applicant",
  [Role.CO_APPLICANT]: "Co-applicant",
  [Role.GUARANTOR]: "Guarantor",
  [Role.BROKER]: "Broker",
  [Role.ADMIN]: "Admin",
  [Role.BOARD]: "Board Member",
  [Role.UNIT_OWNER]: "Unit Owner",
  [Role.OWNER_BROKER]: "Owner's Broker",
  [Role.OWNER_ATTORNEY]: "Owner's Attorney",
  [Role.APPLICANT_ATTORNEY]: "Applicant's Attorney",
} as const

/**
 * Get user-friendly label for a role
 * @param role - The role enum value
 * @returns Human-readable role label
 */
export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role]
}

// ============================================================================
// APPLICATION STATUS CONFIGURATION
// ============================================================================

export interface StatusConfig {
  label: string
  color: string
  variant: "default" | "secondary" | "destructive" | "outline"
  description?: string
}

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  [ApplicationStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "bg-gray-500 dark:bg-gray-600",
    variant: "secondary",
    description: "Application is being prepared",
  },
  [ApplicationStatus.SUBMITTED]: {
    label: "Submitted",
    color: "bg-blue-500 dark:bg-blue-600",
    variant: "default",
    description: "Application has been submitted",
  },
  [ApplicationStatus.IN_REVIEW]: {
    label: "In Review",
    color: "bg-purple-500 dark:bg-purple-600",
    variant: "default",
    description: "Application is under review",
  },
  [ApplicationStatus.RFI]: {
    label: "RFI",
    color: "bg-orange-500 dark:bg-orange-600",
    variant: "default",
    description: "Request for information",
  },
  [ApplicationStatus.APPROVED]: {
    label: "Approved",
    color: "bg-green-500 dark:bg-green-600",
    variant: "default",
    description: "Application has been approved",
  },
  [ApplicationStatus.CONDITIONAL]: {
    label: "Conditional",
    color: "bg-yellow-500 dark:bg-yellow-600",
    variant: "default",
    description: "Approved with conditions",
  },
  [ApplicationStatus.DENIED]: {
    label: "Denied",
    color: "bg-red-500 dark:bg-red-600",
    variant: "destructive",
    description: "Application has been denied",
  },
} as const

/**
 * Get configuration for an application status
 * @param status - The application status enum value
 * @returns Status configuration object with label, color, and variant
 */
export function getStatusConfig(status: ApplicationStatus): StatusConfig {
  return STATUS_CONFIG[status]
}

/**
 * Get user-friendly label for an application status
 * @param status - The application status enum value
 * @returns Human-readable status label
 */
export function getStatusLabel(status: ApplicationStatus): string {
  return STATUS_CONFIG[status].label
}

/**
 * Get color class for an application status
 * @param status - The application status enum value
 * @returns Tailwind color class string
 */
export function getStatusColor(status: ApplicationStatus): string {
  return STATUS_CONFIG[status].color
}

/**
 * Get badge variant for an application status
 * @param status - The application status enum value
 * @returns Badge variant type
 */
export function getStatusVariant(
  status: ApplicationStatus
): "default" | "secondary" | "destructive" | "outline" {
  return STATUS_CONFIG[status].variant
}

// ============================================================================
// TRANSACTION TYPE LABELS
// ============================================================================

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.COOP_PURCHASE]: "Co-op Purchase",
  [TransactionType.CONDO_PURCHASE]: "Condo Purchase",
  [TransactionType.COOP_SUBLET]: "Co-op Sublet",
  [TransactionType.CONDO_LEASE]: "Condo Lease",
} as const

/**
 * Get user-friendly label for a transaction type
 * @param type - The transaction type enum value
 * @returns Human-readable transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available application statuses with their configurations
 * Useful for building dropdowns or filter UI
 */
export function getAllStatuses(): Array<{
  value: ApplicationStatus
  config: StatusConfig
}> {
  return Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value: value as ApplicationStatus,
    config,
  }))
}

/**
 * Get all available roles with their labels
 * Useful for building dropdowns or filter UI
 */
export function getAllRoles(): Array<{ value: Role; label: string }> {
  return Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value: value as Role,
    label,
  }))
}

/**
 * Get all available transaction types with their labels
 * Useful for building dropdowns or filter UI
 */
export function getAllTransactionTypes(): Array<{
  value: TransactionType
  label: string
}> {
  return Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as TransactionType,
    label,
  }))
}
