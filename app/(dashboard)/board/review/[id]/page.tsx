"use client";

import { use, Suspense } from "react";
import { notFound, useRouter } from "next/navigation";
import { mockApplications } from "@/lib/mock-data";
import { ReadOnlyViewer } from "@/components/features/board/read-only-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardReviewPage({ params }: PageProps) {
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
        <h1 className="text-3xl font-bold tracking-tight">Board Review</h1>
        <p className="mt-2 text-muted-foreground">
          Read-only application package for board review
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ReadOnlyViewer application={application} />
      </Suspense>
    </div>
  );
}
