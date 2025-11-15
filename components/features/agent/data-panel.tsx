"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Application, FinancialEntry } from "@/lib/types";
import { formatDate, formatCurrency, formatSSN } from "@/lib/utils";
import { FileText, Eye } from "lucide-react";

type DataPanelProps = {
  application: Application;
  sectionKey: string;
  showFullSSN?: boolean; // Transaction Agent sees full SSN, broker sees last 4
};

export function DataPanel({
  application,
  sectionKey,
  showFullSSN = true,
}: DataPanelProps) {
  const [viewMode, setViewMode] = useState<"data" | "pdf">("data");

  const renderSectionData = () => {
    switch (sectionKey) {
      case "profile":
        return <ProfileData application={application} showFullSSN={showFullSSN} />;

      case "income":
        return <IncomeData application={application} />;

      case "financials":
        return <FinancialsData application={application} />;

      case "documents":
        return <DocumentsData application={application} />;

      case "disclosures":
        return <DisclosuresData application={application} />;

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            Select a section to view data
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Section Details</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "data" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("data")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Data
          </Button>
          <Button
            variant={viewMode === "pdf" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pdf")}
          >
            <Eye className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {viewMode === "data" ? (
            renderSectionData()
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  PDF viewer will be integrated here
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ProfileData({ application, showFullSSN }: { application: Application; showFullSSN: boolean }) {
  return (
    <div className="space-y-6">
      {application.people.map((person) => (
        <Card key={person.id} className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-semibold">{person.fullName}</h4>
            <Badge variant="outline">{person.role}</Badge>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm mt-1">{person.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="text-sm mt-1">{person.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
              <dd className="text-sm mt-1">{formatDate(person.dob)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">SSN</dt>
              <dd className="text-sm mt-1">
                {showFullSSN && person.ssnFull
                  ? formatSSN(person.ssnFull, "full")
                  : formatSSN(person.ssnLast4, "last4")}
              </dd>
            </div>
          </dl>

          {person.addressHistory.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h5 className="text-sm font-semibold mb-3">Address History</h5>
                <div className="space-y-3">
                  {person.addressHistory.map((addr) => (
                    <div key={addr.id} className="text-sm">
                      <p className="font-medium">
                        {addr.street}
                        {addr.unit && `, ${addr.unit}`}
                      </p>
                      <p className="text-muted-foreground">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(addr.fromDate)} - {addr.toDate ? formatDate(addr.toDate) : "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

function IncomeData({ application }: { application: Application }) {
  return (
    <div className="space-y-6">
      <h4 className="font-semibold">Employment Records</h4>
      {application.employmentRecords.length > 0 ? (
        <div className="space-y-4">
          {application.employmentRecords.map((record) => (
            <Card key={record.id} className="p-4">
              <h5 className="font-semibold mb-3">{record.employer}</h5>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                  <dd className="text-sm mt-1">{record.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="text-sm mt-1">
                    <Badge variant={record.isCurrent ? "default" : "secondary"}>
                      {record.isCurrent ? "Current" : "Previous"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                  <dd className="text-sm mt-1">{formatDate(record.startDate)}</dd>
                </div>
                {record.endDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                    <dd className="text-sm mt-1">{formatDate(record.endDate)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Annual Income</dt>
                  <dd className="text-sm mt-1 font-semibold">
                    {formatCurrency(record.annualIncome)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Pay Cadence</dt>
                  <dd className="text-sm mt-1">{record.payCadence}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No employment records</p>
      )}
    </div>
  );
}

function FinancialsData({ application }: { application: Application }) {
  const assets = application.financialEntries.filter(e => e.entryType === "ASSET");
  const liabilities = application.financialEntries.filter(e => e.entryType === "LIABILITY");
  const income = application.financialEntries.filter(e => e.entryType === "MONTHLY_INCOME");
  const expenses = application.financialEntries.filter(e => e.entryType === "MONTHLY_EXPENSE");

  const totalAssets = assets.reduce((sum, e) => sum + e.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const netWorth = totalAssets - totalLiabilities;
  const dti = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const renderEntries = (entries: FinancialEntry[], title: string) => (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm">{title}</h5>
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded">
              <div>
                <p className="font-medium">{entry.category}</p>
                {entry.institution && (
                  <p className="text-xs text-muted-foreground">{entry.institution}</p>
                )}
              </div>
              <p className="font-semibold">{formatCurrency(entry.amount)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No entries</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-primary/5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(netWorth)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">DTI Ratio</p>
            <p className="text-2xl font-bold mt-1">{dti.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {renderEntries(assets, `Assets (${formatCurrency(totalAssets)})`)}
      <Separator />
      {renderEntries(liabilities, `Liabilities (${formatCurrency(totalLiabilities)})`)}
      <Separator />
      {renderEntries(income, `Monthly Income (${formatCurrency(totalIncome)})`)}
      <Separator />
      {renderEntries(expenses, `Monthly Expenses (${formatCurrency(totalExpenses)})`)}
    </div>
  );
}

function DocumentsData({ application }: { application: Application }) {
  const groupedDocs = application.documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof application.documents>);

  return (
    <div className="space-y-6">
      <h4 className="font-semibold">Uploaded Documents</h4>
      {Object.entries(groupedDocs).map(([category, docs]) => (
        <div key={category} className="space-y-3">
          <h5 className="font-semibold text-sm">{category.replace(/_/g, " ")}</h5>
          <div className="space-y-2">
            {docs.map((doc) => (
              <Card key={doc.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded {formatDate(doc.uploadedAt)} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant={doc.status === "VERIFIED" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DisclosuresData({ application }: { application: Application }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Disclosures</h4>
      {application.disclosures.length > 0 ? (
        <div className="space-y-3">
          {application.disclosures.map((disclosure) => (
            <Card key={disclosure.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{disclosure.type.replace(/_/g, " ")}</p>
                  {disclosure.acknowledgedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Acknowledged {formatDate(disclosure.acknowledgedAt)}
                    </p>
                  )}
                </div>
                <Badge variant={disclosure.acknowledged ? "default" : "secondary"}>
                  {disclosure.acknowledged ? "Acknowledged" : "Pending"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No disclosures required</p>
      )}
    </div>
  );
}
