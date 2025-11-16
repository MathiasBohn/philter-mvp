"use client";

import { use } from "react";
import { ApplicationSidebar } from "@/components/features/applications/application-sidebar";

export default function ApplicationDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen">
      <ApplicationSidebar applicationId={id} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
