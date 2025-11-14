import { User, Role } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: Role.APPLICANT,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    role: Role.CO_APPLICANT,
    createdAt: new Date("2025-01-02"),
  },
  {
    id: "user-3",
    name: "Jennifer Rodriguez",
    email: "jennifer.rodriguez@realty.com",
    role: Role.BROKER,
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "user-4",
    name: "David Martinez",
    email: "david.martinez@propertymanagement.com",
    role: Role.ADMIN,
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "user-5",
    name: "Emily Thompson",
    email: "emily.thompson@email.com",
    role: Role.BOARD,
    createdAt: new Date("2024-10-15"),
  },
  {
    id: "user-6",
    name: "Robert Williams",
    email: "robert.williams@email.com",
    role: Role.GUARANTOR,
    createdAt: new Date("2025-01-05"),
  },
];
