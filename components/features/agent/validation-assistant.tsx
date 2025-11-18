"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  Application,
  FinancialEntryType,
  DocumentCategory,
  Role,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ValidationIssue {
  id: string;
  severity: "error" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  suggestedRFI?: string;
}

interface ValidationAssistantProps {
  application: Application;
  onCreateRFI?: (sectionKey: string, message: string) => void;
}

export function ValidationAssistant({
  application,
  onCreateRFI,
}: ValidationAssistantProps) {
  const [checkedIssues, setCheckedIssues] = useState<Set<string>>(new Set());

  // Validation logic
  const validationResults = useMemo(() => {
    const issues: ValidationIssue[] = [];

    // 1. Check for missing required documents
    const hasGovtId = application.documents?.some(
      (doc) => doc.category === DocumentCategory.GOVERNMENT_ID
    );
    if (!hasGovtId) {
      issues.push({
        id: "missing-govt-id",
        severity: "error",
        category: "Documents",
        title: "Missing Government-Issued ID",
        description: "No government-issued ID found in documents",
        suggestedRFI: "Please provide a valid government-issued ID (driver's license, passport, or state ID) for all applicants.",
      });
    }

    // 2. Check for incomplete sections
    const incompleteSections = application.sections?.filter(
      (section) => !section.isComplete
    );
    if (incompleteSections && incompleteSections.length > 0) {
      incompleteSections.forEach((section) => {
        issues.push({
          id: `incomplete-${section.key}`,
          severity: "warning",
          category: "Sections",
          title: `Incomplete Section: ${section.label}`,
          description: `The ${section.label} section has not been completed`,
        });
      });
    }

    // 3. Calculate DTI ratio (monthly debt / monthly income)
    const monthlyIncome =
      application.financialEntries
        ?.filter((entry) => entry.entryType === FinancialEntryType.MONTHLY_INCOME)
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const monthlyExpenses =
      application.financialEntries
        ?.filter((entry) => entry.entryType === FinancialEntryType.MONTHLY_EXPENSE)
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const dtiRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    if (dtiRatio > 50) {
      issues.push({
        id: "high-dti",
        severity: "error",
        category: "Financials",
        title: "High Debt-to-Income Ratio",
        description: `DTI ratio is ${dtiRatio.toFixed(1)}% (threshold: 50%)`,
        suggestedRFI: "Your debt-to-income ratio exceeds our typical threshold. Please provide additional documentation to support your financial stability, such as additional income sources, guarantor information, or a larger security deposit.",
      });
    } else if (dtiRatio > 40) {
      issues.push({
        id: "elevated-dti",
        severity: "warning",
        category: "Financials",
        title: "Elevated Debt-to-Income Ratio",
        description: `DTI ratio is ${dtiRatio.toFixed(1)}% (recommended: <40%)`,
      });
    }

    // 4. Calculate net worth and compare to 2x annual rent
    const totalAssets =
      application.financialEntries
        ?.filter((entry) => entry.entryType === FinancialEntryType.ASSET)
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const totalLiabilities =
      application.financialEntries
        ?.filter((entry) => entry.entryType === FinancialEntryType.LIABILITY)
        .reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const netWorth = totalAssets - totalLiabilities;

    // Get annual rent from lease terms (assuming it's in the application data)
    // For now, we'll estimate from monthly rent if available
    const estimatedAnnualRent = monthlyIncome > 0 ? monthlyIncome * 0.3 * 12 : 100000; // Rough estimate
    const requiredNetWorth = estimatedAnnualRent * 2;

    if (netWorth < requiredNetWorth) {
      issues.push({
        id: "low-net-worth",
        severity: "warning",
        category: "Financials",
        title: "Net Worth Below Recommended Threshold",
        description: `Net worth is $${netWorth.toLocaleString()} (recommended: $${requiredNetWorth.toLocaleString()})`,
        suggestedRFI: "Your net worth is below our recommended threshold of 2x annual rent. Please consider providing a guarantor or additional financial documentation to strengthen your application.",
      });
    }

    // 5. Check for missing references
    const hasReferences = application.people?.some((person) =>
      person.role === Role.APPLICANT
    );
    if (!hasReferences || application.people.length === 0) {
      issues.push({
        id: "missing-references",
        severity: "warning",
        category: "References",
        title: "Missing Reference Information",
        description: "No reference letters or contacts provided",
        suggestedRFI: "Please provide at least two professional or personal references, including their contact information.",
      });
    }

    // 6. Check for employment verification
    const hasEmployment = application.employmentRecords && application.employmentRecords.length > 0;
    if (!hasEmployment) {
      issues.push({
        id: "missing-employment",
        severity: "error",
        category: "Employment",
        title: "Missing Employment Verification",
        description: "No employment records found",
        suggestedRFI: "Please provide current employment verification, including employer name, position, salary, and duration of employment. Supporting documentation such as pay stubs or an employment verification letter is required.",
      });
    }

    // 7. Check for tax returns (recommended document)
    const hasTaxReturns = application.documents?.some(
      (doc) => doc.category === DocumentCategory.TAX_RETURN
    );
    if (!hasTaxReturns) {
      issues.push({
        id: "missing-tax-returns",
        severity: "info",
        category: "Documents",
        title: "Tax Returns Not Provided",
        description: "Tax returns can strengthen the application",
        suggestedRFI: "Please provide your tax returns for the last 1-2 years to support your financial information.",
      });
    }

    // 8. Check for bank statements
    const hasBankStatements = application.documents?.some(
      (doc) => doc.category === DocumentCategory.BANK_STATEMENT
    );
    if (!hasBankStatements) {
      issues.push({
        id: "missing-bank-statements",
        severity: "info",
        category: "Documents",
        title: "Bank Statements Not Provided",
        description: "Bank statements help verify liquid assets",
        suggestedRFI: "Please provide recent bank statements (last 2-3 months) to verify your liquid assets.",
      });
    }

    return issues;
  }, [application]);

  const errorCount = validationResults.filter((i) => i.severity === "error").length;
  const warningCount = validationResults.filter((i) => i.severity === "warning").length;
  const infoCount = validationResults.filter((i) => i.severity === "info").length;

  const handleToggleIssue = (issueId: string) => {
    const newChecked = new Set(checkedIssues);
    if (newChecked.has(issueId)) {
      newChecked.delete(issueId);
    } else {
      newChecked.add(issueId);
    }
    setCheckedIssues(newChecked);
  };

  const handleCreateRFI = (issue: ValidationIssue) => {
    if (!issue.suggestedRFI || !onCreateRFI) return;

    // Map category to section key
    const sectionKeyMap: Record<string, string> = {
      Documents: "documents",
      Employment: "employment",
      Financials: "financials",
      References: "profile",
      Sections: "profile",
    };

    const sectionKey = sectionKeyMap[issue.category] || "profile";
    onCreateRFI(sectionKey, issue.suggestedRFI);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Documents":
        return <FileText className="h-4 w-4" />;
      case "Financials":
        return <DollarSign className="h-4 w-4" />;
      case "Employment":
        return <TrendingUp className="h-4 w-4" />;
      case "References":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Critical Issues
            </span>
            <Badge variant="destructive">{errorCount}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warnings
            </span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-900">
              {warningCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Recommendations
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">
              {infoCount}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Validation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {validationResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">No issues found</p>
              <p className="text-xs">Application looks good!</p>
            </div>
          ) : (
            validationResults.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  "border rounded-lg p-3 space-y-2",
                  issue.severity === "error" && "border-destructive/50 bg-destructive/5",
                  issue.severity === "warning" && "border-amber-500/50 bg-amber-50/50",
                  issue.severity === "info" && "border-blue-500/50 bg-blue-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checkedIssues.has(issue.id)}
                    onCheckedChange={() => handleToggleIssue(issue.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1">
                      {getSeverityIcon(issue.severity)}
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{issue.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>

                {issue.suggestedRFI && (
                  <div className="pl-9 space-y-2">
                    <div className="text-xs bg-background/50 rounded p-2 border">
                      <p className="font-semibold mb-1">Suggested RFI:</p>
                      <p className="text-muted-foreground">{issue.suggestedRFI}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateRFI(issue)}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create RFI
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Missing Items Checklist */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Missing Items Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationResults
                .filter((issue) => issue.severity === "error" || issue.severity === "warning")
                .map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checkedIssues.has(issue.id)}
                      onCheckedChange={() => handleToggleIssue(issue.id)}
                    />
                    <Label
                      htmlFor={issue.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {issue.title}
                    </Label>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              {checkedIssues.size} of {validationResults.filter((i) => i.severity === "error" || i.severity === "warning").length} items reviewed
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
