// Core Enums
export enum Role {
  APPLICANT = "APPLICANT",
  CO_APPLICANT = "CO_APPLICANT",
  GUARANTOR = "GUARANTOR",
  BROKER = "BROKER",
  ADMIN = "ADMIN",
  BOARD = "BOARD",
  UNIT_OWNER = "UNIT_OWNER",
  OWNER_BROKER = "OWNER_BROKER",
  OWNER_ATTORNEY = "OWNER_ATTORNEY",
  APPLICANT_ATTORNEY = "APPLICANT_ATTORNEY",
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
  LEAD_PAINT_CERTIFICATION = "LEAD_PAINT_CERTIFICATION",
  LEAD_WARNING_STATEMENT = "LEAD_WARNING_STATEMENT",
  LEAD_DISCLOSURE = "LEAD_DISCLOSURE",
  EPA_LEAD_PAMPHLET = "EPA_LEAD_PAMPHLET",
  LOCAL_LAW_38 = "LOCAL_LAW_38",
  LOCAL_LAW_55 = "LOCAL_LAW_55",
  WINDOW_GUARD = "WINDOW_GUARD",
  FLOOD_DISCLOSURE = "FLOOD_DISCLOSURE",
  HOUSE_RULES = "HOUSE_RULES",
  CONSUMER_REPORT_AUTH = "CONSUMER_REPORT_AUTH",
  SUBLET_POLICY = "SUBLET_POLICY",
  PET_ACKNOWLEDGEMENT = "PET_ACKNOWLEDGEMENT",
  SMOKE_DETECTOR = "SMOKE_DETECTOR",
  CARBON_MONOXIDE_DETECTOR = "CARBON_MONOXIDE_DETECTOR",
  // Phase 2 Acknowledgements
  PERSONAL_INFO_AUTH = "PERSONAL_INFO_AUTH",
  BACKGROUND_CHECK_CONSENT = "BACKGROUND_CHECK_CONSENT",
  REFERENCE_CONTACT_AUTH = "REFERENCE_CONTACT_AUTH",
  EMPLOYMENT_VERIFICATION_AUTH = "EMPLOYMENT_VERIFICATION_AUTH",
  FINANCIAL_VERIFICATION_AUTH = "FINANCIAL_VERIFICATION_AUTH",
  MOVE_IN_DATE_COMMITMENT = "MOVE_IN_DATE_COMMITMENT",
  // Phase 3 Additions
  INSURANCE_REQUIREMENTS = "INSURANCE_REQUIREMENTS",
}

export enum PetType {
  DOG = "DOG",
  CAT = "CAT",
  OTHER = "OTHER",
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
  CONTRACT_DEPOSIT = "CONTRACT_DEPOSIT",
  INVESTMENT_IN_BUSINESS = "INVESTMENT_IN_BUSINESS",
  ACCOUNTS_RECEIVABLE = "ACCOUNTS_RECEIVABLE",
  AUTOMOBILES = "AUTOMOBILES",
  PERSONAL_PROPERTY = "PERSONAL_PROPERTY",
  LIFE_INSURANCE_CASH_VALUE = "LIFE_INSURANCE_CASH_VALUE",
  KEOGH = "KEOGH",
  PROFIT_SHARING_OR_PENSION = "PROFIT_SHARING_OR_PENSION",
  OTHER = "OTHER",
}

export enum LiabilityCategory {
  MORTGAGE = "MORTGAGE",
  AUTO_LOAN = "AUTO_LOAN",
  CREDIT_CARD = "CREDIT_CARD",
  STUDENT_LOAN = "STUDENT_LOAN",
  NOTES_PAYABLE_TO_BANKS = "NOTES_PAYABLE_TO_BANKS",
  NOTES_TO_RELATIVES = "NOTES_TO_RELATIVES",
  OTHER = "OTHER",
}

export enum IncomeCategory {
  EMPLOYMENT = "EMPLOYMENT",
  OVERTIME = "OVERTIME",
  BONUSES = "BONUSES",
  COMMISSIONS = "COMMISSIONS",
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

export enum EmploymentStatus {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  UNEMPLOYED = "UNEMPLOYED",
  RETIRED = "RETIRED",
  STUDENT = "STUDENT",
}

export enum EducationLevel {
  ELEMENTARY_SCHOOL = "ELEMENTARY_SCHOOL",
  HIGH_SCHOOL = "HIGH_SCHOOL",
  COLLEGE = "COLLEGE",
  GRADUATE_SCHOOL = "GRADUATE_SCHOOL",
}

export enum PropertyType {
  SINGLE_FAMILY = "SINGLE_FAMILY",
  MULTI_FAMILY = "MULTI_FAMILY",
  CONDO = "CONDO",
  COOP = "COOP",
  COMMERCIAL = "COMMERCIAL",
  LAND = "LAND",
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

export enum ReferenceType {
  PERSONAL = "PERSONAL",
  PROFESSIONAL = "PROFESSIONAL",
  LANDLORD = "LANDLORD",
  BANK = "BANK",
}

export type ReferenceLetterEntry = {
  id: string;
  type: ReferenceType;
  name: string;
  phone: string;
  email: string;
  relationship?: string; // For personal references
  company?: string; // For professional references
  institution?: string; // For bank references
  occupiedFrom?: Date; // For landlord references
  occupiedTo?: Date; // For landlord references
  letterDocumentId?: string; // Optional uploaded letter
};

export type LeaseTerms = {
  monthlyRent: number;
  annualRent: number; // Auto-calculated
  securityDeposit: number;
  leaseLengthYears: number; // 1, 2, 3, or 5
  leaseStartDate: Date;
  leaseEndDate: Date; // Auto-calculated or manual
  moveInDate: Date;
  specialConditions?: string;
};

export type LandlordInfo = {
  id: string;
  name: string;
  phone: string;
  fax?: string;
  email: string;
  occupiedFrom: Date;
  occupiedTo?: Date; // Only for previous landlord
  monthlyPayment: number;
  referenceLetterDocumentId?: string; // Optional uploaded reference letter
};

export type HousingHistory = {
  ownsPrivateHouse: boolean;
  currentLandlord?: LandlordInfo;
  previousLandlord?: LandlordInfo;
  reasonForMoving?: string;
};

export type KeyHolder = {
  id: string;
  name: string;
  email: string;
  cellPhone: string;
};

export type EmergencyContact = {
  name: string;
  email: string;
  address: string;
  daytimePhone: string;
  eveningPhone?: string;
  cellPhone?: string;
  fax?: string;
  hasKeyHolders: boolean;
  keyHolders?: KeyHolder[];
};

export type EducationInfo = {
  educationLevel?: EducationLevel;
  lastSchoolAttended?: string;
  fromDate?: Date;
  toDate?: Date;
  membershipsAffiliations?: string;
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

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type PreviousEmployer = {
  name: string;
  address: Address;
  employedFrom: Date;
  employedTo: Date;
  annualSalary: number;
  supervisorName: string;
  supervisorPhone: string;
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
  // Phase 2 additions
  employmentStatus?: EmploymentStatus;
  isSelfEmployed?: boolean;
  natureOfBusiness?: string;
  employerAddress?: Address;
  supervisorName?: string;
  supervisorPhone?: string;
  yearsInLineOfWork?: number;
  previousEmployer?: PreviousEmployer;
  incomeEstimateThisYear?: number;
  actualIncomeLastYear?: number;
  dividendPartnershipIncome?: {
    year1: number;
    year2: number;
    year3: number;
  };
};

export type RealEstateProperty = {
  id: string;
  address: Address;
  propertyType: PropertyType;
  marketValue: number;
  mortgageBalance: number;
  monthlyMortgagePayment: number;
  monthlyMaintenanceHOA: number;
  monthlyRealEstateTaxes: number;
  monthlyInsurance: number;
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
  realEstateProperties: RealEstateProperty[]; // Phase 2
  documents: Document[];
  disclosures: Disclosure[];
  participants: Participant[]; // Deal parties (owner, brokers, attorneys)

  // Section completion tracking
  sections: ApplicationSection[];

  // Metadata
  completionPercentage: number;
  rfis: RFI[];
  isLocked: boolean;

  // Expedited review option (Phase 2)
  expeditedReview?: boolean;
  expeditedReviewFee?: number; // Default: 500

  // Cover letter / Personal introduction (Phase 2)
  coverLetter?: string;
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

export type BuildingPolicies = {
  maxFinancePercent: number; // e.g., 75 for 75%
  allowGuarantors: boolean;
  alterationPolicies?: string;
  insuranceRequirements?: string;
  allowCorpOwnership: boolean;
  allowPiedATerre: boolean;
  allowTrustOwnership: boolean;
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
  buildingPolicies?: BuildingPolicies; // Phase 2 addition
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

export type Participant = {
  id: string;
  role: Role.UNIT_OWNER | Role.OWNER_BROKER | Role.OWNER_ATTORNEY | Role.APPLICANT_ATTORNEY;
  name: string;
  email: string;
  phoneWork?: string;
  phoneCell?: string;
  phoneHome?: string;
};
