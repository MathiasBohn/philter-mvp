"use client";

import { AppShell } from "@/components/layout/app-shell";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide the global sidebar on application detail pages
  const isApplicationDetailPage = pathname?.startsWith("/applications/") &&
                                   pathname.split("/").length > 2 &&
                                   pathname.split("/")[2] !== "";

  return <AppShell showSidebar={!isApplicationDetailPage}>{children}</AppShell>;
}
