"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionType, DocumentCategory } from "@/lib/types";
import { mockBuildings } from "@/lib/mock-data";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const WIZARD_STEPS = [
  { id: 1, name: "Building", description: "Select property" },
  { id: 2, name: "Unit & Terms", description: "Enter details" },
  { id: 3, name: "Documents", description: "Select required docs" },
  { id: 4, name: "Parties", description: "Add applicants" },
  { id: 5, name: "Review", description: "Confirm & send" },
];

const DOCUMENT_TEMPLATES = [
  { category: DocumentCategory.GOVERNMENT_ID, required: true, label: "Government ID" },
  { category: DocumentCategory.BANK_STATEMENT, required: true, label: "Bank Statements (3 months)" },
  { category: DocumentCategory.PAYSTUB, required: true, label: "Recent Paystubs" },
  { category: DocumentCategory.TAX_RETURN, required: true, label: "Tax Returns (2 years)" },
  { category: DocumentCategory.REFERENCE_LETTER, required: false, label: "Reference Letters" },
  { category: DocumentCategory.W2, required: true, label: "W2 Forms" },
  { category: DocumentCategory.BUILDING_FORM, required: false, label: "Building Forms" },
];

interface WizardData {
  // Step 1
  buildingId: string;
  // Step 2
  unit: string;
  transactionType: TransactionType | "";
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
  // Step 3
  requiredDocuments: DocumentCategory[];
  // Step 4
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coApplicantName: string;
  coApplicantEmail: string;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
}

const STORAGE_KEY = "broker_prefill_wizard_draft";

export default function BrokerPrefillWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState("");

  const [wizardData, setWizardData] = useState<WizardData>({
    buildingId: "",
    unit: "",
    transactionType: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: "",
    requiredDocuments: [
      DocumentCategory.GOVERNMENT_ID,
      DocumentCategory.BANK_STATEMENT,
      DocumentCategory.PAYSTUB,
      DocumentCategory.TAX_RETURN,
      DocumentCategory.W2,
    ],
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    coApplicantName: "",
    coApplicantEmail: "",
    brokerName: "John Smith",
    brokerEmail: "john.smith@realestate.com",
    brokerPhone: "(212) 555-0100",
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setWizardData(parsed.data);
        setCurrentStep(parsed.step);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  // Auto-save draft whenever data changes
  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: wizardData, step: currentStep })
      );
    };
    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [wizardData, currentStep]);

  const updateWizardData = (field: keyof WizardData, value: any) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuildingChange = (buildingId: string) => {
    updateWizardData("buildingId", buildingId);

    // Pre-populate based on building
    const selectedBuilding = mockBuildings.find((b) => b.id === buildingId);
    if (selectedBuilding) {
      // Could pre-populate lease terms, policies, etc. from building data
      // For now, just set the building
    }
  };

  const handleDocumentToggle = (category: DocumentCategory) => {
    const current = wizardData.requiredDocuments;
    if (current.includes(category)) {
      updateWizardData(
        "requiredDocuments",
        current.filter((c) => c !== category)
      );
    } else {
      updateWizardData("requiredDocuments", [...current, category]);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return wizardData.buildingId !== "";
      case 2:
        return (
          wizardData.unit !== "" &&
          wizardData.transactionType !== ""
        );
      case 3:
        return wizardData.requiredDocuments.length > 0;
      case 4:
        return (
          wizardData.applicantName !== "" &&
          wizardData.applicantEmail !== ""
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    // Draft is already auto-saved, just show confirmation
    alert("Draft saved successfully!");
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a new application ID
    const newApplicationId = `app_${Date.now()}`;

    // Store application data
    const selectedBuilding = mockBuildings.find((b) => b.id === wizardData.buildingId);
    const applicationData = {
      id: newApplicationId,
      buildingCode: selectedBuilding?.code || wizardData.buildingId,
      buildingId: wizardData.buildingId,
      unit: wizardData.unit,
      transactionType: wizardData.transactionType,
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString(),
      createdBy: "broker-user-id",
      applicantEmail: wizardData.applicantEmail,
      applicantName: wizardData.applicantName,
      applicantPhone: wizardData.applicantPhone,
      coApplicantName: wizardData.coApplicantName,
      coApplicantEmail: wizardData.coApplicantEmail,
      leaseStartDate: wizardData.leaseStartDate,
      leaseEndDate: wizardData.leaseEndDate,
      monthlyRent: wizardData.monthlyRent,
      requiredDocuments: wizardData.requiredDocuments,
      brokerInfo: {
        name: wizardData.brokerName,
        email: wizardData.brokerEmail,
        phone: wizardData.brokerPhone,
      },
      sections: {
        profile: { complete: false },
        income: { complete: false },
        financials: { complete: false },
        documents: { complete: false },
        disclosures: { complete: false },
      },
    };

    localStorage.setItem(`application_${newApplicationId}`, JSON.stringify(applicationData));

    // Clear draft
    localStorage.removeItem(STORAGE_KEY);

    setCreatedApplicationId(newApplicationId);
    setIsLoading(false);
    setShowSuccessDialog(true);
  };

  const selectedBuilding = mockBuildings.find((b) => b.id === wizardData.buildingId);

  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Pre-fill Wizard</h1>
        <p className="mt-2 text-muted-foreground">
          Complete all steps to create a pre-filled application for your client
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium">{step.name}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-12 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Building Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Building</CardTitle>
              <CardDescription>
                Choose the building where the application will be submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="building">Building</Label>
                <Select value={wizardData.buildingId} onValueChange={handleBuildingChange}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBuildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name} - {building.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBuilding && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-medium">Building Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span>{selectedBuilding.address.street}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City:</span>
                      <span>
                        {selectedBuilding.address.city}, {selectedBuilding.address.state}{" "}
                        {selectedBuilding.address.zip}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>
                        <Badge variant="outline">{selectedBuilding.type}</Badge>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Unit & Lease Terms */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Unit & Lease Terms</CardTitle>
              <CardDescription>
                Enter the unit number and lease details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Number</Label>
                <Input
                  id="unit"
                  placeholder="e.g., 12A"
                  value={wizardData.unit}
                  onChange={(e) => updateWizardData("unit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={wizardData.transactionType}
                  onValueChange={(value) => updateWizardData("transactionType", value as TransactionType)}
                >
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionType.COOP_PURCHASE}>Co-op Purchase</SelectItem>
                    <SelectItem value={TransactionType.CONDO_PURCHASE}>Condo Purchase</SelectItem>
                    <SelectItem value={TransactionType.COOP_SUBLET}>Co-op Sublet</SelectItem>
                    <SelectItem value={TransactionType.CONDO_LEASE}>Condo Lease</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                  <Input
                    id="leaseStartDate"
                    type="date"
                    value={wizardData.leaseStartDate}
                    onChange={(e) => updateWizardData("leaseStartDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate">Lease End Date</Label>
                  <Input
                    id="leaseEndDate"
                    type="date"
                    value={wizardData.leaseEndDate}
                    onChange={(e) => updateWizardData("leaseEndDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent/Price</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="e.g., 5000"
                  value={wizardData.monthlyRent}
                  onChange={(e) => updateWizardData("monthlyRent", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Required Documents */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>
                Select which documents the applicant will need to provide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DOCUMENT_TEMPLATES.map((doc) => (
                <div key={doc.category} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc.category}
                    checked={wizardData.requiredDocuments.includes(doc.category)}
                    onCheckedChange={() => handleDocumentToggle(doc.category)}
                  />
                  <Label
                    htmlFor={doc.category}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {doc.label}
                    {doc.required && (
                      <Badge variant="secondary" className="ml-2">
                        Required
                      </Badge>
                    )}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Parties */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Add Parties</CardTitle>
              <CardDescription>
                Enter applicant and broker information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Applicant */}
              <div className="space-y-4">
                <h4 className="font-medium">Primary Applicant</h4>
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name</Label>
                  <Input
                    id="applicantName"
                    placeholder="John Doe"
                    value={wizardData.applicantName}
                    onChange={(e) => updateWizardData("applicantName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Email</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    placeholder="applicant@example.com"
                    value={wizardData.applicantEmail}
                    onChange={(e) => updateWizardData("applicantEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantPhone">Phone (Optional)</Label>
                  <Input
                    id="applicantPhone"
                    type="tel"
                    placeholder="(212) 555-0100"
                    value={wizardData.applicantPhone}
                    onChange={(e) => updateWizardData("applicantPhone", e.target.value)}
                  />
                </div>
              </div>

              {/* Co-Applicant */}
              <div className="space-y-4">
                <h4 className="font-medium">Co-Applicant (Optional)</h4>
                <div className="space-y-2">
                  <Label htmlFor="coApplicantName">Full Name</Label>
                  <Input
                    id="coApplicantName"
                    placeholder="Jane Doe"
                    value={wizardData.coApplicantName}
                    onChange={(e) => updateWizardData("coApplicantName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coApplicantEmail">Email</Label>
                  <Input
                    id="coApplicantEmail"
                    type="email"
                    placeholder="coapplicant@example.com"
                    value={wizardData.coApplicantEmail}
                    onChange={(e) => updateWizardData("coApplicantEmail", e.target.value)}
                  />
                </div>
              </div>

              {/* Broker Info (Pre-populated) */}
              <div className="space-y-4">
                <h4 className="font-medium">Broker Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="brokerName">Name</Label>
                  <Input
                    id="brokerName"
                    value={wizardData.brokerName}
                    onChange={(e) => updateWizardData("brokerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brokerEmail">Email</Label>
                  <Input
                    id="brokerEmail"
                    type="email"
                    value={wizardData.brokerEmail}
                    onChange={(e) => updateWizardData("brokerEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brokerPhone">Phone</Label>
                  <Input
                    id="brokerPhone"
                    type="tel"
                    value={wizardData.brokerPhone}
                    onChange={(e) => updateWizardData("brokerPhone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Confirm</CardTitle>
              <CardDescription>
                Review all information before sending the invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Building & Unit</h4>
                  <div className="rounded-lg border p-4 space-y-1 text-sm">
                    <p>
                      <strong>{selectedBuilding?.name}</strong> - {selectedBuilding?.code}
                    </p>
                    <p className="text-muted-foreground">
                      Unit {wizardData.unit} | {wizardData.transactionType}
                    </p>
                    {wizardData.monthlyRent && (
                      <p className="text-muted-foreground">
                        ${wizardData.monthlyRent}/month
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Documents ({wizardData.requiredDocuments.length})</h4>
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-wrap gap-2">
                      {wizardData.requiredDocuments.map((doc) => (
                        <Badge key={doc} variant="secondary">
                          {DOCUMENT_TEMPLATES.find((t) => t.category === doc)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Parties</h4>
                  <div className="rounded-lg border p-4 space-y-3 text-sm">
                    <div>
                      <p className="font-medium">Primary Applicant</p>
                      <p className="text-muted-foreground">
                        {wizardData.applicantName} - {wizardData.applicantEmail}
                      </p>
                    </div>
                    {wizardData.coApplicantName && (
                      <div>
                        <p className="font-medium">Co-Applicant</p>
                        <p className="text-muted-foreground">
                          {wizardData.coApplicantName} - {wizardData.coApplicantEmail}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Broker</p>
                      <p className="text-muted-foreground">
                        {wizardData.brokerName} - {wizardData.brokerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          {currentStep < WIZARD_STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceedToNextStep()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Send Invitation
            </Button>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Application Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              An invitation has been sent to <strong>{wizardData.applicantEmail}</strong> with all
              pre-filled information. They can review and edit before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <Button onClick={() => router.push(`/broker/${createdApplicationId}/qa`)} className="w-full">
              Go to Application Workspace
            </Button>
            <Button onClick={() => router.push("/broker")} variant="outline" className="w-full">
              Back to Pipeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
