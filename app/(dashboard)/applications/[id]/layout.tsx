"use client";

import { use } from "react";
import { ApplicationSidebar } from "@/components/features/applications/application-sidebar";
import { ApplicationProgressBar } from "@/components/features/applications/application-progress-bar";
import { ApplicationRealtimeWrapper } from "@/components/features/applications/application-realtime-wrapper";

export default function ApplicationDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <>
      <ApplicationSidebar applicationId={id} />
      <main className="flex-1 lg:ml-64 pt-16">
        <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
          <ApplicationProgressBar applicationId={id} />
          <ApplicationRealtimeWrapper
            applicationId={id}
            showPresence={true}
            enableRealtime={true}
          >
            {children}
          </ApplicationRealtimeWrapper>
        </div>
      </main>
    </>
  );
}
