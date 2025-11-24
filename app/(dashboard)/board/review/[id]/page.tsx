"use client";

import { use, Suspense } from "react";
import { notFound, useRouter } from "next/navigation";
import { useApplication } from "@/lib/hooks/use-applications";
import { ReadOnlyViewer } from "@/components/features/board/read-only-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardReviewPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch application data from API
  const { data: application, isLoading, error } = useApplication(id);

  if (isLoading) {
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
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load application'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
