import { Suspense } from "react";
import { notFound } from "next/navigation";
import { mockApplications } from "@/lib/mock-data";
import { ReadOnlyViewer } from "@/components/features/board/read-only-viewer";
import { ApplicationSummary } from "@/components/features/board/application-summary";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardReviewPage({ params }: PageProps) {
  const { id } = await params;

  // Find the application from mock data
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Board Review
            </h1>
            <p className="text-sm text-muted-foreground">
              Read-only application package for board review
            </p>
          </div>
        </div>
      </div>

      {/* Application Summary Dashboard */}
      <div className="border-b bg-background px-6 py-6">
        <Suspense fallback={<div>Loading summary...</div>}>
          <ApplicationSummary application={application} />
        </Suspense>
      </div>

      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <ReadOnlyViewer application={application} />
      </Suspense>
    </div>
  );
}
