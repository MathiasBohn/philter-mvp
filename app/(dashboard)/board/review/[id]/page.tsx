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
    <div className="mx-auto max-w-6xl flex h-full flex-col">
      <div className="border-b bg-background px-6 py-4">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.push('/board')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
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

      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <ReadOnlyViewer application={application} />
      </Suspense>
    </div>
  );
}
