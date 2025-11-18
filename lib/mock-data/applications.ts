/**
 * Mock Applications Data
 *
 * IMPORTANT: These applications are shared across all user workflows:
 * - APPLICANTS: Work on filling out their own applications
 * - BROKERS: Review and submit applications on behalf of applicants
 * - AGENTS (Building Management): Review submitted applications and manage RFIs
 * - BOARD MEMBERS: Review applications and make approval decisions
 *
 * In production, these will be connected to a shared backend data source
 * so that all roles see the same applications in real-time.
 */

import {
  Application,
  ApplicationStatus,
  TransactionType,
  Person,
  Role,
  EmploymentRecord,
  PayCadence,
  FinancialEntry,
  FinancialEntryType,
  AssetCategory,
  LiabilityCategory,
  IncomeCategory,
  ExpenseCategory,
} from "@/lib/types";
import { mockBuildings } from "./buildings";

// Person 1: Sarah Johnson
const samplePerson: Person = {
  id: "person-1",
  fullName: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  dob: new Date("1990-05-15"),
  ssnLast4: "1234",
  ssnFull: "123-45-1234",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-1",
      street: "100 West End Avenue",
      unit: "12B",
      city: "New York",
      state: "NY",
      zip: "10023",
      fromDate: new Date("2020-01-01"),
      isCurrent: true,
    },
    {
      id: "addr-2",
      street: "456 Amsterdam Avenue",
      unit: "3A",
      city: "New York",
      state: "NY",
      zip: "10024",
      fromDate: new Date("2018-06-01"),
      toDate: new Date("2019-12-31"),
      isCurrent: false,
    },
  ],
};

const sampleEmployment: EmploymentRecord = {
  id: "emp-1",
  employer: "Tech Corporation Inc.",
  title: "Senior Software Engineer",
  startDate: new Date("2019-03-01"),
  payCadence: PayCadence.ANNUAL,
  annualIncome: 150000,
  isCurrent: true,
};

const sampleFinancials: FinancialEntry[] = [
  {
    id: "fin-1",
    entryType: FinancialEntryType.ASSET,
    category: AssetCategory.CHECKING,
    institution: "Chase Bank",
    amount: 50000,
  },
  {
    id: "fin-2",
    entryType: FinancialEntryType.ASSET,
    category: AssetCategory.SAVINGS,
    institution: "Ally Bank",
    amount: 75000,
  },
  {
    id: "fin-3",
    entryType: FinancialEntryType.LIABILITY,
    category: LiabilityCategory.STUDENT_LOAN,
    institution: "Federal Student Aid",
    amount: 25000,
  },
  {
    id: "fin-4",
    entryType: FinancialEntryType.MONTHLY_INCOME,
    category: IncomeCategory.EMPLOYMENT,
    description: "Salary",
    amount: 12500,
  },
  {
    id: "fin-5",
    entryType: FinancialEntryType.MONTHLY_EXPENSE,
    category: ExpenseCategory.RENT_MORTGAGE,
    description: "Current rent",
    amount: 3500,
  },
];

// Person 2: Michael Chen
const person2: Person = {
  id: "person-2",
  fullName: "Michael Chen",
  email: "michael.chen@email.com",
  phone: "(555) 234-5678",
  dob: new Date("1985-08-22"),
  ssnLast4: "5678",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-3",
      street: "567 Fifth Avenue",
      unit: "8C",
      city: "New York",
      state: "NY",
      zip: "10017",
      fromDate: new Date("2021-03-01"),
      isCurrent: true,
    },
  ],
};

// Person 3: Emily Rodriguez
const person3: Person = {
  id: "person-3",
  fullName: "Emily Rodriguez",
  email: "emily.rodriguez@email.com",
  phone: "(555) 345-6789",
  dob: new Date("1992-11-10"),
  ssnLast4: "9012",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-4",
      street: "890 Broadway",
      unit: "15A",
      city: "New York",
      state: "NY",
      zip: "10003",
      fromDate: new Date("2019-07-01"),
      isCurrent: true,
    },
  ],
};

// Person 4: James Thompson
const person4: Person = {
  id: "person-4",
  fullName: "James Thompson",
  email: "james.thompson@email.com",
  phone: "(555) 456-7890",
  dob: new Date("1988-03-14"),
  ssnLast4: "3456",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-5",
      street: "321 Central Park West",
      unit: "6B",
      city: "New York",
      state: "NY",
      zip: "10025",
      fromDate: new Date("2020-09-01"),
      isCurrent: true,
    },
  ],
};

// Person 5: Amanda Martinez
const person5: Person = {
  id: "person-5",
  fullName: "Amanda Martinez",
  email: "amanda.martinez@email.com",
  phone: "(555) 567-8901",
  dob: new Date("1987-06-25"),
  ssnLast4: "7890",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-6",
      street: "150 Sullivan Street",
      unit: "4D",
      city: "New York",
      state: "NY",
      zip: "10012",
      fromDate: new Date("2021-05-01"),
      isCurrent: true,
    },
  ],
};

// Person 6: Robert Kim
const person6: Person = {
  id: "person-6",
  fullName: "Robert Kim",
  email: "robert.kim@email.com",
  phone: "(555) 678-9012",
  dob: new Date("1991-09-18"),
  ssnLast4: "2345",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-7",
      street: "85 Worth Street",
      unit: "10A",
      city: "New York",
      state: "NY",
      zip: "10013",
      fromDate: new Date("2020-02-01"),
      isCurrent: true,
    },
  ],
};

// Person 7: Lisa Anderson
const person7: Person = {
  id: "person-7",
  fullName: "Lisa Anderson",
  email: "lisa.anderson@email.com",
  phone: "(555) 789-0123",
  dob: new Date("1989-12-05"),
  ssnLast4: "6789",
  role: Role.APPLICANT,
  addressHistory: [
    {
      id: "addr-8",
      street: "300 Albany Street",
      unit: "22C",
      city: "New York",
      state: "NY",
      zip: "10280",
      fromDate: new Date("2019-11-01"),
      isCurrent: true,
    },
  ],
};

export const mockApplications: Application[] = [
  // Application 1: Sarah Johnson - 60% complete (missing documents)
  {
    id: "app-1",
    buildingId: "bldg-1",
    building: mockBuildings[0],
    transactionType: TransactionType.CONDO_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-1",
    createdAt: new Date("2025-01-05"),
    lastActivityAt: new Date("2025-01-10"),
    people: [samplePerson],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: false },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 60,
    rfis: [],
    isLocked: false,
  },
  // Application 2: Michael Chen - 100% complete (ready for review/submit)
  {
    id: "app-2",
    buildingId: "bldg-2",
    building: mockBuildings[1],
    transactionType: TransactionType.COOP_PURCHASE,
    status: ApplicationStatus.SUBMITTED,
    createdBy: "user-2",
    createdAt: new Date("2025-01-01"),
    submittedAt: new Date("2025-01-08"),
    lastActivityAt: new Date("2025-01-08"),
    people: [person2],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: true },
      { key: "review", label: "Review & Submit", isComplete: true },
    ],
    completionPercentage: 100,
    rfis: [],
    isLocked: true,
  },
  // Application 3: Emily Rodriguez - 75% complete (missing some documents)
  {
    id: "app-3",
    buildingId: "bldg-3",
    building: mockBuildings[2],
    transactionType: TransactionType.CONDO_LEASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-3",
    createdAt: new Date("2024-12-20"),
    lastActivityAt: new Date("2025-01-09"),
    people: [person3],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: false },
      { key: "disclosures", label: "Disclosures", isComplete: true },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 75,
    rfis: [],
    isLocked: false,
  },
  // Application 4: James Thompson - 40% complete (missing financials and documents)
  {
    id: "app-4",
    buildingId: "bldg-4",
    building: mockBuildings[3],
    transactionType: TransactionType.CONDO_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-4",
    createdAt: new Date("2025-01-12"),
    lastActivityAt: new Date("2025-01-15"),
    people: [person4],
    employmentRecords: [sampleEmployment],
    financialEntries: [],
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: false },
      { key: "documents", label: "Documents", isComplete: false },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 40,
    rfis: [],
    isLocked: false,
  },
  // Application 5: Amanda Martinez - 85% complete (missing final review)
  {
    id: "app-5",
    buildingId: "bldg-5",
    building: mockBuildings[4],
    transactionType: TransactionType.CONDO_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-5",
    createdAt: new Date("2025-01-03"),
    lastActivityAt: new Date("2025-01-14"),
    people: [person5],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: true },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 85,
    rfis: [],
    isLocked: false,
  },
  // Application 6: Robert Kim - 95% complete (almost ready to submit)
  {
    id: "app-6",
    buildingId: "bldg-6",
    building: mockBuildings[5],
    transactionType: TransactionType.COOP_PURCHASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-6",
    createdAt: new Date("2025-01-02"),
    lastActivityAt: new Date("2025-01-16"),
    people: [person6],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: true },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 95,
    rfis: [],
    isLocked: false,
  },
  // Application 7: Lisa Anderson - 70% complete (missing some documents)
  {
    id: "app-7",
    buildingId: "bldg-7",
    building: mockBuildings[6],
    transactionType: TransactionType.CONDO_LEASE,
    status: ApplicationStatus.IN_PROGRESS,
    createdBy: "user-7",
    createdAt: new Date("2025-01-06"),
    lastActivityAt: new Date("2025-01-13"),
    people: [person7],
    employmentRecords: [sampleEmployment],
    financialEntries: sampleFinancials,
    realEstateProperties: [],
    documents: [],
    disclosures: [],
    participants: [],
    sections: [
      { key: "profile", label: "Profile", isComplete: true },
      { key: "income", label: "Employment & Income", isComplete: true },
      { key: "financials", label: "Financial Summary", isComplete: true },
      { key: "documents", label: "Documents", isComplete: false },
      { key: "disclosures", label: "Disclosures", isComplete: true },
      { key: "review", label: "Review & Submit", isComplete: false },
    ],
    completionPercentage: 70,
    rfis: [],
    isLocked: false,
  },
];
