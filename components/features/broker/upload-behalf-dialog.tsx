"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadDropzone, UploadedFile } from "@/components/features/application/upload-dropzone";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface UploadBehalfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
}

const documentCategories = [
  { value: "government-id", label: "Government-issued ID" },
  { value: "bank-statement", label: "Bank Statement" },
  { value: "tax-return", label: "Tax Return" },
  { value: "paystub", label: "Paystub" },
  { value: "reference-letter", label: "Reference Letter" },
  { value: "building-form", label: "Building-specific Form" },
  { value: "other", label: "Other" },
];

export function UploadBehalfDialog({
  open,
  onOpenChange,
  applicationId,
}: UploadBehalfDialogProps) {
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCategory("");
        setFiles([]);
        setUploading(false);
        setUploadComplete(false);
      }, 200);
    }
  }, [open]);

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (!category || files.length === 0) return;

    setUploading(true);

    // Simulate upload progress for each file
    const uploadPromises = files.map((file) => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, progress, status: progress === 100 ? "complete" : "uploading" }
                : f
            )
          );

          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    setUploadComplete(true);

    // In a real app, this would save documents to the database
    // Upload completed for applicationId with category and files

    // Auto-close after a brief delay
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  const isValid = category && files.length > 0 && !uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents on Behalf</DialogTitle>
          <DialogDescription>
            Upload documents to the application on behalf of the applicant.
          </DialogDescription>
        </DialogHeader>

        {uploadComplete ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Complete</h3>
            <p className="text-sm text-muted-foreground">
              {files.length} document{files.length !== 1 ? "s" : ""} uploaded successfully
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Document Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={uploading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Dropzone */}
            {!uploading && (
              <div className="space-y-2">
                <Label>Upload Files</Label>
                <UploadDropzone onFilesAdded={handleFilesAdded} multiple={true} />
              </div>
            )}

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <Label>Files ({files.length})</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {!uploading && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {file.status === "uploading" && (
                        <div className="space-y-1">
                          <Progress value={file.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground">
                            Uploading... {file.progress}%
                          </p>
                        </div>
                      )}
                      {file.status === "complete" && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Upload complete
                        </p>
                      )}
                      {file.status === "error" && (
                        <p className="text-xs text-destructive">{file.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!uploadComplete && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!isValid || uploading}>
              {uploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
