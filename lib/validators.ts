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

// Landlord Info validation
export const landlordInfoSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Landlord name is required"),
  phone: z.string().min(1, "Phone number is required").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number format"),
  fax: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  occupiedFrom: z.instanceof(Date, { message: "Occupied from date is required" }),
  occupiedTo: z.instanceof(Date).optional(),
  monthlyPayment: z.number().min(0, "Monthly payment must be 0 or greater"),
  referenceLetterDocumentId: z.string().optional(),
});

// Housing History validation
export const housingHistorySchema = z.object({
  ownsPrivateHouse: z.boolean(),
  currentLandlord: landlordInfoSchema.optional(),
  previousLandlord: landlordInfoSchema.partial().optional(),
  reasonForMoving: z.string().optional(),
}).refine(
  (data) => {
    // If not owning house, current landlord is required
    if (!data.ownsPrivateHouse) {
      return !!data.currentLandlord;
    }
    return true;
  },
  {
    message: "Current landlord information is required if you don't own a house",
    path: ["currentLandlord"],
  }
);

// Key Holder validation
export const keyHolderSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  cellPhone: z.string().min(1, "Cell phone is required").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number format"),
});

// Emergency Contact validation
export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Emergency contact name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  daytimePhone: z.string().min(1, "Daytime phone is required").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number format"),
  eveningPhone: z.string().optional(),
  cellPhone: z.string().optional(),
  fax: z.string().optional(),
  hasKeyHolders: z.boolean(),
  keyHolders: z.array(keyHolderSchema).optional(),
}).refine(
  (data) => {
    // If has key holders, at least one key holder is required
    if (data.hasKeyHolders) {
      return data.keyHolders && data.keyHolders.length > 0;
    }
    return true;
  },
  {
    message: "At least one key holder is required",
    path: ["keyHolders"],
  }
);

// Profile validation
export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number format"),
  dob: z.instanceof(Date, { message: "Date of birth is required" }).refine(isAtLeast18, "You must be at least 18 years old"),
  ssn: z.string().min(1, "SSN is required").regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  addressHistory: z.array(addressHistorySchema).min(1, "At least one address is required"),
  housingHistory: housingHistorySchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
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

// Complete Profile Section Schema (A2)
export const profileSectionSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name.").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Please enter your email.").email("Email looks incorrect. Check the format."),
  phone: z.string().min(1, "Please enter your phone number.").regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Phone number looks incorrect. Check the format."),
  dob: z.instanceof(Date, { message: "Please enter your date of birth." }).refine(isAtLeast18, "You must be at least 18 years old to apply."),
  ssn: z.string().min(1, "Please enter your SSN.").regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  addressHistory: z.array(addressHistorySchema).min(1, "Please add at least one address.").refine(
    (addresses) => {
      // Calculate total time at addresses (minimum 2 years required)
      const now = new Date();
      let totalMonths = 0;

      addresses.forEach(addr => {
        const from = addr.fromDate;
        const to = addr.toDate || now;
        const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
        totalMonths += months;
      });

      return totalMonths >= 24; // 2 years = 24 months
    },
    "Address history must cover at least 2 years."
  ),
});

// Employment & Income Section Schema (A3)
export const employmentSectionSchema = z.object({
  employmentRecords: z.array(employmentSchema).min(1, "Please add at least one employer or income source."),
  documents: z.array(documentUploadSchema).optional(),
});

// Financial Summary Section Schema (A4)
export const financialSectionSchema = z.object({
  assets: z.array(financialEntrySchema).optional(),
  liabilities: z.array(financialEntrySchema).optional(),
  monthlyIncome: z.array(financialEntrySchema).optional(),
  monthlyExpenses: z.array(financialEntrySchema).optional(),
}).refine(
  (data) => {
    // At least one entry must exist
    return (
      (data.assets && data.assets.length > 0) ||
      (data.liabilities && data.liabilities.length > 0) ||
      (data.monthlyIncome && data.monthlyIncome.length > 0) ||
      (data.monthlyExpenses && data.monthlyExpenses.length > 0)
    );
  },
  "Please add at least one financial entry."
);

// Documents Section Schema (A5)
export const documentsSectionSchema = z.object({
  documents: z.array(documentUploadSchema).refine(
    (docs) => {
      // Must have at least one government ID
      return docs.some(doc => doc.category === "GOVERNMENT_ID");
    },
    "Please upload at least one government-issued ID."
  ),
  notAvailableReasons: z.record(z.string(), z.string()).optional(),
});

// Disclosures Section Schema (A6) - conditional
export const disclosuresSectionSchema = z.object({
  disclosures: z.array(disclosureSchema).refine(
    (disclosures) => disclosures.every(d => d.acknowledged === true),
    "You must acknowledge all disclosures before submitting."
  ),
});

// Template Wizard Schemas (AD1)
export const templateBasicsSchema = z.object({
  buildingId: z.string().min(1, "Please select a building."),
  name: z.string().min(1, "Please enter a template name.").min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
});

export const templateSectionsSchema = z.object({
  profile: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
  }),
  income: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
  }),
  financials: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
  }),
  documents: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
  }),
  disclosures: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
  }),
});

export const templateDocumentsSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    required: z.boolean(),
    enabled: z.boolean(),
  })),
});

export const templateComplianceSchema = z.object({
  localLaw55: z.boolean(),
  windowGuard: z.boolean(),
});

// RFI Creation Schema (AD4)
export const rfiCreationSchema = z.object({
  sectionKey: z.string().min(1, "Please select a section."),
  assigneeRole: z.enum(["APPLICANT", "BROKER"], { message: "Please select who should respond." }),
  message: z.string().min(1, "Please enter a message.").min(10, "Message must be at least 10 characters."),
  documentReferenceId: z.string().optional(),
});

// Decision Panel Schema (AD5)
export const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "CONDITIONAL", "DENIED"], { message: "Please select a decision." }),
  reasonCodes: z.array(z.string()).optional(),
  notes: z.string().optional(),
  usesConsumerReport: z.boolean(),
  adverseActionNotice: z.string().optional(),
}).refine(
  (data) => {
    // If uses consumer report AND (conditional or denied), require adverse action notice
    if (data.usesConsumerReport && (data.decision === "CONDITIONAL" || data.decision === "DENIED")) {
      return !!data.adverseActionNotice && data.adverseActionNotice.length > 0;
    }
    return true;
  },
  {
    message: "Adverse action notice is required when using consumer reports for conditional approval or denial.",
    path: ["adverseActionNotice"],
  }
);

// Board Notes Schema (BR1)
export const boardNotesSchema = z.object({
  notes: z.string().max(10000, "Notes must be less than 10,000 characters."),
});

// Common field-level error messages
export const errorMessages = {
  required: (field: string) => `Please enter ${field}.`,
  invalid: (field: string) => `${field} looks incorrect. Check the format.`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters.`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters.`,
  fileType: "This file type isn't allowed. Use PDF/JPG/PNG/DOCX.",
  fileSize: (max: number) => `File size must be less than ${max}MB.`,
  disclosure: "You must acknowledge this notice before submitting.",
  minAge: "You must be at least 18 years old to apply.",
  addressHistory: "Address history must cover at least 2 years.",
};
