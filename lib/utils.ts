import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FinancialEntry, FinancialEntryType, ApplicationSection } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date in a human-readable format
 * @param date - The date to format
 * @param format - The format type ("short", "long", or "relative")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: "short" | "long" | "relative" = "short"
): string {
  // Handle null/undefined dates
  if (!date) {
    return "—";
  }

  const d = typeof date === "string" ? new Date(date) : date;

  // Handle invalid dates
  if (isNaN(d.getTime())) {
    return "—";
  }

  if (format === "relative") {
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }

  // short format
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format SSN with different visibility levels
 * @param ssn - The SSN to format (can be full or last 4)
 * @param format - The format type ("full", "last4", or "redacted")
 * @returns Formatted SSN string
 */
export function formatSSN(
  ssn: string,
  format: "full" | "last4" | "redacted" = "last4"
): string {
  if (format === "redacted") {
    return "••••";
  }

  if (format === "last4") {
    const last4 = ssn.slice(-4);
    return `xxx-xx-${last4}`;
  }

  // full format: 123-45-6789
  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }

  return ssn;
}

/**
 * Calculate Debt-to-Income ratio
 * @param monthlyIncome - Total monthly income
 * @param monthlyExpenses - Total monthly expenses
 * @returns DTI as a percentage (e.g., 0.35 for 35%)
 */
export function calculateDTI(
  monthlyIncome: number,
  monthlyExpenses: number
): number {
  if (monthlyIncome === 0) return 0;
  return monthlyExpenses / monthlyIncome;
}

/**
 * Calculate net worth from financial entries
 * @param financialEntries - Array of financial entries
 * @returns Net worth (assets - liabilities)
 */
export function calculateNetWorth(financialEntries: FinancialEntry[]): number {
  const assets = financialEntries
    .filter((entry) => entry.entryType === FinancialEntryType.ASSET)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const liabilities = financialEntries
    .filter((entry) => entry.entryType === FinancialEntryType.LIABILITY)
    .reduce((sum, entry) => sum + entry.amount, 0);

  return assets - liabilities;
}

/**
 * Calculate completion percentage based on completed sections
 * @param sections - Array of application sections
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionPercentage(
  sections: ApplicationSection[]
): number {
  if (sections.length === 0) return 0;

  const completedCount = sections.filter((section) => section.isComplete).length;
  return Math.round((completedCount / sections.length) * 100);
}
