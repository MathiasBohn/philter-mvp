import { Document, DocumentCategory, DocumentStatus } from "@/lib/types";

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    category: DocumentCategory.GOVERNMENT_ID,
    filename: "drivers_license.pdf",
    size: 524288, // 512 KB
    mimeType: "application/pdf",
    uploadedAt: new Date("2025-01-06"),
    uploadedBy: "user-1",
    status: DocumentStatus.UPLOADED,
  },
  {
    id: "doc-2",
    category: DocumentCategory.BANK_STATEMENT,
    filename: "chase_statement_dec_2024.pdf",
    size: 1048576, // 1 MB
    mimeType: "application/pdf",
    uploadedAt: new Date("2025-01-07"),
    uploadedBy: "user-1",
    status: DocumentStatus.UPLOADED,
  },
  {
    id: "doc-3",
    category: DocumentCategory.PAYSTUB,
    filename: "paystub_jan_2025.pdf",
    size: 262144, // 256 KB
    mimeType: "application/pdf",
    uploadedAt: new Date("2025-01-08"),
    uploadedBy: "user-1",
    status: DocumentStatus.UPLOADED,
  },
  {
    id: "doc-4",
    category: DocumentCategory.TAX_RETURN,
    filename: "2023_tax_return.pdf",
    size: 2097152, // 2 MB
    mimeType: "application/pdf",
    uploadedAt: new Date("2025-01-08"),
    uploadedBy: "user-1",
    status: DocumentStatus.UPLOADED,
  },
  {
    id: "doc-5",
    category: DocumentCategory.REFERENCE_LETTER,
    filename: "employer_reference.pdf",
    size: 131072, // 128 KB
    mimeType: "application/pdf",
    uploadedAt: new Date("2025-01-09"),
    uploadedBy: "user-3",
    status: DocumentStatus.UPLOADED,
    notes: "Uploaded by broker on behalf of applicant",
  },
];
