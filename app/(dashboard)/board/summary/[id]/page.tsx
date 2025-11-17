import { Suspense } from "react";
import { notFound } from "next/navigation";
import { mockApplications } from "@/lib/mock-data";
import { ApplicationSummary } from "@/components/features/board/application-summary";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardSummaryPage({ params }: PageProps) {
  const { id } = await params;

  // Find the application from mock data
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Summary</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of key metrics and application timeline
        </p>
      </div>

      <Suspense fallback={<div>Loading summary...</div>}>
        <ApplicationSummary application={application} />
      </Suspense>
    </div>
  );
}
