"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Eye, Edit3, Info, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Application } from "@/lib/types";

const MAX_CHARACTERS = 2000;

export default function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing cover letter from localStorage
  useEffect(() => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const application = applications.find((app) => app.id === id);
    if (application?.coverLetter) {
      setCoverLetter(application.coverLetter);
    }
  }, [id]);

  const handleSave = () => {
    setIsSaving(true);

    // Save to localStorage
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex !== -1) {
      applications[applicationIndex] = {
        ...applications[applicationIndex],
        coverLetter,
        lastActivityAt: new Date(),
      };
      localStorage.setItem("applications", JSON.stringify(applications));
    }

    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleContinue = () => {
    handleSave();
    router.push(`/applications/${id}/disclosures`);
  };

  const charactersRemaining = MAX_CHARACTERS - coverLetter.length;
  const isOverLimit = charactersRemaining < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cover Letter / Personal Introduction</h1>
        <p className="text-muted-foreground mt-2">
          Share your story and introduce yourself to the board
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is your opportunity to introduce yourself to the board and explain why you would be a great fit for the building.
          You can share information about your background, lifestyle, interests, and why you're excited about this property.
        </AlertDescription>
      </Alert>

      {/* Cover Letter Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isPreviewMode ? "Preview" : "Your Personal Introduction"}
              </CardTitle>
              <CardDescription>
                {isPreviewMode
                  ? "This is how your introduction will appear to the board"
                  : "Write a personal introduction that helps the board get to know you"
                }
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPreviewMode ? (
            <div className="min-h-[300px] p-4 border rounded-md bg-muted/30">
              {coverLetter ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {coverLetter}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No cover letter written yet. Click "Edit" to begin writing.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Dear Board Members,&#10;&#10;I am writing to introduce myself and express my sincere interest in becoming a resident of your building...&#10;&#10;Sincerely,&#10;[Your Name]"
                className="min-h-[300px] resize-y font-sans"
                maxLength={MAX_CHARACTERS}
              />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${isOverLimit ? "text-red-600" : "text-muted-foreground"}`}>
                    {coverLetter.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters
                  </span>
                  {isOverLimit && (
                    <span className="text-red-600 font-semibold">
                      ({Math.abs(charactersRemaining)} over limit)
                    </span>
                  )}
                </div>
                {lastSaved && (
                  <span className="text-muted-foreground text-xs">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Save Draft Button */}
          {!isPreviewMode && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || isOverLimit}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for a Great Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Be genuine and authentic in your writing</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Mention your profession, hobbies, and lifestyle</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Explain why you're interested in this specific building and community</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Highlight any relevant experience (previous board applications, community involvement, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Keep it professional but personable</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Proofread for spelling and grammar</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={`/applications/${id}/documents`}>Back to Documents</Link>
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isOverLimit}
        >
          Continue to Disclosures
        </Button>
      </div>
    </div>
  );
}
