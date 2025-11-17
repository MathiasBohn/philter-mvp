"use client";

import { use, Suspense } from "react";
import { notFound, useRouter } from "next/navigation";
import { mockApplications } from "@/lib/mock-data";
import { ApplicationSummary } from "@/components/features/board/application-summary";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardSummaryPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Find the application from mock data
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.push('/board')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
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
