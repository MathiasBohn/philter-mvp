import { RFI, RFIStatus, Role, RFIMessage } from "@/lib/types";

const sampleMessages: RFIMessage[] = [
  {
    id: "msg-1",
    authorId: "user-4",
    authorName: "David Martinez",
    authorRole: Role.ADMIN,
    message: "Please provide additional documentation for employment verification. We need your last two paystubs.",
    createdAt: new Date("2025-01-09T10:00:00"),
  },
  {
    id: "msg-2",
    authorId: "user-1",
    authorName: "Sarah Johnson",
    authorRole: Role.APPLICANT,
    message: "I've uploaded the paystubs. Please let me know if you need anything else.",
    createdAt: new Date("2025-01-09T14:30:00"),
  },
];

export const mockRFIs: RFI[] = [
  {
    id: "rfi-1",
    applicationId: "app-3",
    sectionKey: "income",
    status: RFIStatus.OPEN,
    assigneeRole: Role.APPLICANT,
    createdBy: "user-4",
    createdAt: new Date("2025-01-09T10:00:00"),
    messages: sampleMessages,
  },
  {
    id: "rfi-2",
    applicationId: "app-2",
    sectionKey: "documents",
    status: RFIStatus.RESOLVED,
    assigneeRole: Role.BROKER,
    createdBy: "user-4",
    createdAt: new Date("2025-01-05T09:00:00"),
    resolvedAt: new Date("2025-01-06T15:00:00"),
    messages: [
      {
        id: "msg-3",
        authorId: "user-4",
        authorName: "David Martinez",
        authorRole: Role.ADMIN,
        message: "Missing bank statement for savings account.",
        createdAt: new Date("2025-01-05T09:00:00"),
      },
      {
        id: "msg-4",
        authorId: "user-3",
        authorName: "Jennifer Rodriguez",
        authorRole: Role.BROKER,
        message: "Uploaded the missing statement.",
        createdAt: new Date("2025-01-06T15:00:00"),
      },
    ],
  },
];
