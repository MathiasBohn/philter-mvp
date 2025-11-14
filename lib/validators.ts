import { z } from "zod";

// Helper functions for validation
const isAtLeast18 = (dob: Date) => {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

// Building Code validation
export const buildingCodeSchema = z.object({
  code: z.string().min(1, "Building code is required").min(6, "Building code must be at least 6 characters"),
});

// Address History validation
export const addressHistorySchema = z.object({
  street: z.string().min(1, "Street address is required"),
  unit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  fromDate: z.instanceof(Date, { message: "Start date is required" }),
  toDate: z.instanceof(Date).optional().nullable(),
  isCurrent: z.boolean(),
});

// Profile validation
export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number format"),
  dob: z.instanceof(Date, { message: "Date of birth is required" }).refine(isAtLeast18, "You must be at least 18 years old"),
  ssn: z.string().min(1, "SSN is required").regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  addressHistory: z.array(addressHistorySchema).min(1, "At least one address is required"),
});

// Employment validation
export const employmentSchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  title: z.string().min(1, "Job title is required"),
  startDate: z.coerce.date({ message: "Start date is required" }),
  endDate: z.coerce.date().optional().nullable(),
  payCadence: z.enum(["ANNUAL", "MONTHLY", "BIWEEKLY", "WEEKLY"], { message: "Pay cadence is required" }),
  annualIncome: z.coerce.number({ message: "Annual income is required" }).min(0, "Income must be 0 or greater"),
  isCurrent: z.boolean(),
});

// Financial Entry validation
export const financialEntrySchema = z.object({
  entryType: z.enum(["ASSET", "LIABILITY", "MONTHLY_INCOME", "MONTHLY_EXPENSE"], { message: "Entry type is required" }),
  category: z.string().min(1, "Category is required"),
  institution: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number({ message: "Amount is required" }).min(0, "Amount must be 0 or greater"),
});

// Document Upload validation
export const documentUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 25 * 1024 * 1024, "File size must be less than 25MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
      "File must be PDF, JPG, PNG, DOC, or DOCX"
    ),
  category: z.string().min(1, "Document category is required"),
});

// Disclosure validation
export const disclosureSchema = z.object({
  type: z.enum(["LOCAL_LAW_55", "WINDOW_GUARD"], { message: "Disclosure type is required" }),
  acknowledged: z.boolean().refine((val) => val === true, "You must acknowledge this disclosure"),
  documentUploadId: z.string().optional(),
});

// Transaction type validation
export const transactionTypeSchema = z.object({
  transactionType: z.enum(["COOP_PURCHASE", "CONDO_PURCHASE", "COOP_SUBLET", "CONDO_LEASE"], {
    message: "Transaction type is required",
  }),
});
