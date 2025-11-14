// Core Enums
export enum Role {
  APPLICANT = "APPLICANT",
  CO_APPLICANT = "CO_APPLICANT",
  GUARANTOR = "GUARANTOR",
  BROKER = "BROKER",
  ADMIN = "ADMIN",
  BOARD = "BOARD",
}

export enum TransactionType {
  COOP_PURCHASE = "COOP_PURCHASE",
  CONDO_PURCHASE = "CONDO_PURCHASE",
  COOP_SUBLET = "COOP_SUBLET",
  CONDO_LEASE = "CONDO_LEASE",
}

export enum ApplicationStatus {
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  RFI = "RFI",
  APPROVED = "APPROVED",
  CONDITIONAL = "CONDITIONAL",
  DENIED = "DENIED",
}

export enum BuildingType {
  RENTAL = "RENTAL",
  COOP = "COOP",
  CONDO = "CONDO",
}

export enum DocumentCategory {
  GOVERNMENT_ID = "GOVERNMENT_ID",
  BANK_STATEMENT = "BANK_STATEMENT",
  TAX_RETURN = "TAX_RETURN",
  REFERENCE_LETTER = "REFERENCE_LETTER",
  BUILDING_FORM = "BUILDING_FORM",
  PAYSTUB = "PAYSTUB",
  W2 = "W2",
  OTHER = "OTHER",
}

export enum DocumentStatus {
  PENDING = "PENDING",
  UPLOADED = "UPLOADED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum RFIStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
}

export enum Decision {
  APPROVE = "APPROVE",
  CONDITIONAL = "CONDITIONAL",
  DENY = "DENY",
}

export enum DisclosureType {
  LOCAL_LAW_55 = "LOCAL_LAW_55",
  WINDOW_GUARD = "WINDOW_GUARD",
}

export enum FinancialEntryType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  MONTHLY_INCOME = "MONTHLY_INCOME",
  MONTHLY_EXPENSE = "MONTHLY_EXPENSE",
}

export enum AssetCategory {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  INVESTMENT = "INVESTMENT",
  REAL_ESTATE = "REAL_ESTATE",
  OTHER = "OTHER",
}

export enum LiabilityCategory {
  MORTGAGE = "MORTGAGE",
  AUTO_LOAN = "AUTO_LOAN",
  CREDIT_CARD = "CREDIT_CARD",
  STUDENT_LOAN = "STUDENT_LOAN",
  OTHER = "OTHER",
}

export enum IncomeCategory {
  EMPLOYMENT = "EMPLOYMENT",
  RENTAL = "RENTAL",
  INVESTMENT = "INVESTMENT",
  OTHER = "OTHER",
}

export enum ExpenseCategory {
  RENT_MORTGAGE = "RENT_MORTGAGE",
  UTILITIES = "UTILITIES",
  INSURANCE = "INSURANCE",
  OTHER = "OTHER",
}

export enum PayCadence {
  ANNUAL = "ANNUAL",
  MONTHLY = "MONTHLY",
  BIWEEKLY = "BIWEEKLY",
  WEEKLY = "WEEKLY",
}

// Core Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

export type Building = {
  id: string;
  name: string;
  code: string;
  type: BuildingType;
  address: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
  };
};

export type AddressHistoryEntry = {
  id: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  fromDate: Date;
  toDate?: Date;
  isCurrent: boolean;
};

export type Person = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  ssnLast4: string;
  ssnFull?: string; // Only stored for certain roles
  addressHistory: AddressHistoryEntry[];
  role: Role.APPLICANT | Role.CO_APPLICANT | Role.GUARANTOR;
};

export type EmploymentRecord = {
  id: string;
  employer: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  payCadence: PayCadence;
  annualIncome: number;
  isCurrent: boolean;
};

export type FinancialEntry = {
  id: string;
  entryType: FinancialEntryType;
  category: AssetCategory | LiabilityCategory | IncomeCategory | ExpenseCategory;
  institution?: string;
  description?: string;
  amount: number;
};

export type Document = {
  id: string;
  category: DocumentCategory;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  status: DocumentStatus;
  url?: string;
  notes?: string;
};

export type RFIMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  message: string;
  createdAt: Date;
  attachments?: string[]; // Document IDs
};

export type RFI = {
  id: string;
  applicationId: string;
  sectionKey: string;
  status: RFIStatus;
  assigneeRole: Role.APPLICANT | Role.BROKER;
  createdBy: string;
  createdAt: Date;
  resolvedAt?: Date;
  messages: RFIMessage[];
};

export type Disclosure = {
  id: string;
  type: DisclosureType;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  documentUploadId?: string; // For signed form uploads
};

export type ApplicationSection = {
  key: string;
  label: string;
  isComplete: boolean;
  data?: unknown;
};

export type Application = {
  id: string;
  buildingId: string;
  building?: Building;
  unit?: string;
  transactionType: TransactionType;
  status: ApplicationStatus;
  createdBy: string;
  createdAt: Date;
  submittedAt?: Date;
  lastActivityAt: Date;

  // Application sections
  people: Person[];
  employmentRecords: EmploymentRecord[];
  financialEntries: FinancialEntry[];
  documents: Document[];
  disclosures: Disclosure[];

  // Section completion tracking
  sections: ApplicationSection[];

  // Metadata
  completionPercentage: number;
  rfis: RFI[];
  isLocked: boolean;
};

export type DecisionRecord = {
  id: string;
  applicationId: string;
  decision: Decision;
  reasonCodes: string[];
  notes?: string;
  usesConsumerReport: boolean;
  adverseActionRequired: boolean;
  decidedBy: string;
  decidedAt: Date;
};

export type ActivityLogEntry = {
  id: string;
  applicationId: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
};

export type Template = {
  id: string;
  buildingId: string;
  name: string;
  description?: string;
  version: number;
  requiredSections: string[];
  optionalSections: string[];
  requiredDocuments: DocumentCategory[];
  optionalDocuments: DocumentCategory[];
  enabledDisclosures: DisclosureType[];
  createdAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
};

export type BoardNote = {
  id: string;
  applicationId: string;
  boardMemberId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};
