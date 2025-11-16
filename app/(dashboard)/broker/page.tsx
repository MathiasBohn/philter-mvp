"use client";

import { useState } from "react";
import { mockApplications } from "@/lib/mock-data";
import { ApplicationTable } from "@/components/features/broker/application-table";
import { FilterBar } from "@/components/features/broker/filter-bar";
import { Button } from "@/components/ui/button";
import { Plus, Download, Send, CheckSquare, FileSpreadsheet, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useApplicationFilters } from "@/lib/hooks/use-application-filters";
import { Application, ApplicationStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function BrokerPipelinePage() {
  const {
    filteredApplications,
    filters,
    setStatusFilter,
    setBuildingFilter,
    setDateRange,
  } = useApplicationFilters(mockApplications, {
    enableDateRange: true,
  });

  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const handleToggleSelection = (appId: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplicationIds.length === filteredApplications.length) {
      setSelectedApplicationIds([]);
    } else {
      setSelectedApplicationIds(filteredApplications.map((app) => app.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    setBulkAction(action);

    // Show confirmation for certain actions
    if (action === "submit" || action === "mark-ready") {
      setShowConfirmDialog(true);
    } else {
      await executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action: string) => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    setProcessingProgress(0);
    setShowProgressDialog(true);

    const totalItems = selectedApplicationIds.length;

    // Simulate processing each application
    for (let i = 0; i < totalItems; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setProcessingProgress(((i + 1) / totalItems) * 100);
    }

    // Execute the action
    switch (action) {
      case "submit":
        alert(`Successfully submitted ${totalItems} applications!`);
        break;
      case "download":
        // In a real app, this would generate a ZIP file
        alert(`Downloading ${totalItems} application packages...`);
        break;
      case "mark-ready":
        alert(`Marked ${totalItems} applications as ready for submission!`);
        break;
      case "export-csv":
        // In a real app, this would generate a CSV file
        exportToCSV(selectedApplicationIds);
        break;
    }

    setIsProcessing(false);
    setShowProgressDialog(false);
    setSelectedApplicationIds([]);
  };

  const exportToCSV = (appIds: string[]) => {
    const selectedApps = filteredApplications.filter((app) => appIds.includes(app.id));

    // Create CSV content
    const headers = ["ID", "Applicant", "Building", "Unit", "Status", "Created At"];
    const rows = selectedApps.map((app) => [
      app.id,
      app.people.map((p) => p.fullName).join("; "),
      app.building?.name || "",
      app.unit || "",
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    alert("CSV export completed!");
  };

  const getBulkActionLabel = (action: string): string => {
    switch (action) {
      case "submit":
        return "Submit Selected";
      case "download":
        return "Download Packages";
      case "mark-ready":
        return "Mark Ready for Submission";
      case "export-csv":
        return "Export to CSV";
      default:
        return "";
    }
  };

  const isAllSelected = selectedApplicationIds.length === filteredApplications.length && filteredApplications.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Pipeline</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track all client applications
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/broker/prefill-wizard">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Pre-fill Wizard
            </Button>
          </Link>
          <Link href="/broker/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        statusFilter={filters.statusFilter as ApplicationStatus | "ALL"}
        onStatusFilterChange={(status) => setStatusFilter(status)}
        buildingFilter={filters.buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        dateRange={filters.dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Bulk Actions Toolbar */}
      {selectedApplicationIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-semibold">
              {selectedApplicationIds.length} Selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedApplicationIds([])}
            >
              Clear Selection
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleBulkAction("submit")}>
                <Send className="mr-2 h-4 w-4" />
                Submit Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("download")}>
                <Download className="mr-2 h-4 w-4" />
                Download Packages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("mark-ready")}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark Ready for Submission
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("export-csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Application Table */}
      <ApplicationTable
        applications={filteredApplications}
        selectedIds={selectedApplicationIds}
        onToggleSelection={handleToggleSelection}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
      />

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {getBulkActionLabel(bulkAction).toLowerCase()}{" "}
              for {selectedApplicationIds.length} application(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => executeBulkAction(bulkAction)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Applications</DialogTitle>
            <DialogDescription>
              Please wait while we process {selectedApplicationIds.length} applications...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={processingProgress} />
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(processingProgress)}% Complete
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
