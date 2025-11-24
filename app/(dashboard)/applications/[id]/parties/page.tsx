"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save, CheckCircle, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Participant, Role } from "@/lib/types";
import { FormSkeleton } from "@/components/loading/form-skeleton";
import { useApplication, useUpdateApplication } from "@/lib/hooks/use-applications";
import { notFound } from "next/navigation";

type ParticipantForm = Omit<Participant, "id"> & { id?: string };

export default function PartiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: application, isLoading, error } = useApplication(id);
  const updateApplication = useUpdateApplication(id);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Unit Owner (required)
  const [unitOwner, setUnitOwner] = useState<ParticipantForm>({
    role: Role.UNIT_OWNER,
    name: "",
    email: "",
    phoneWork: "",
    phoneCell: "",
    phoneHome: "",
  });

  // Owner's Broker (optional)
  const [ownerBroker, setOwnerBroker] = useState<ParticipantForm | null>(null);

  // Owner's Attorney (optional)
  const [ownerAttorney, setOwnerAttorney] = useState<ParticipantForm | null>(null);

  // Applicant's Attorney (optional)
  const [applicantAttorney, setApplicantAttorney] = useState<ParticipantForm | null>(null);

  // Load data from application when it's fetched
  useEffect(() => {
    if (application?.participants) {
      const participants = application.participants;

      // Find each participant by role
      const owner = participants.find(p => p.role === Role.UNIT_OWNER);
      const ownerBrok = participants.find(p => p.role === Role.OWNER_BROKER);
      const ownerAtt = participants.find(p => p.role === Role.OWNER_ATTORNEY);
      const applicantAtt = participants.find(p => p.role === Role.APPLICANT_ATTORNEY);

      if (owner) setUnitOwner(owner);
      if (ownerBrok) setOwnerBroker(ownerBrok);
      if (ownerAtt) setOwnerAttorney(ownerAtt);
      if (applicantAtt) setApplicantAttorney(applicantAtt);
    }
  }, [application]);

  const handleSave = async () => {
    if (!application) return;

    setIsSaving(true);

    try {
      // Collect all participants
      const participants: Participant[] = [unitOwner as Participant];
      if (ownerBroker) participants.push(ownerBroker as Participant);
      if (ownerAttorney) participants.push(ownerAttorney as Participant);
      if (applicantAttorney) participants.push(applicantAttorney as Participant);

      await updateApplication.mutateAsync({
        participants,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving parties data:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    // Validate required fields
    const errors: string[] = [];

    // Unit Owner is required
    if (!unitOwner.name || !unitOwner.email) {
      errors.push("Unit Owner Name and Email are required");
    }

    // Validate optional parties if they exist
    if (ownerBroker && (!ownerBroker.name || !ownerBroker.email)) {
      errors.push("Owner's Broker must have Name and Email if added");
    }
    if (ownerAttorney && (!ownerAttorney.name || !ownerAttorney.email)) {
      errors.push("Owner's Attorney must have Name and Email if added");
    }
    if (applicantAttorney && (!applicantAttorney.name || !applicantAttorney.email)) {
      errors.push("Applicant's Attorney must have Name and Email if added");
    }

    if (errors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert(errors.join('\n\n'));
      return;
    }

    await handleSave();
    router.push(`/applications/${id}/profile`);
  };

  const addOwnerBroker = () => {
    setOwnerBroker({
      role: Role.OWNER_BROKER,
      name: "",
      email: "",
      phoneWork: "",
      phoneCell: "",
      phoneHome: "",
    });
  };

  const addOwnerAttorney = () => {
    setOwnerAttorney({
      role: Role.OWNER_ATTORNEY,
      name: "",
      email: "",
      phoneWork: "",
      phoneCell: "",
      phoneHome: "",
    });
  };

  const addApplicantAttorney = () => {
    setApplicantAttorney({
      role: Role.APPLICANT_ATTORNEY,
      name: "",
      email: "",
      phoneWork: "",
      phoneCell: "",
      phoneHome: "",
    });
  };

  const renderParticipantFields = (
    participant: ParticipantForm,
    setter: (p: ParticipantForm) => void,
    title: string,
    isRequired: boolean = false
  ) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isRequired ? "Required information" : "Optional - add if applicable"}
            </CardDescription>
          </div>
          {!isRequired && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (title.includes("Owner's Broker")) setOwnerBroker(null);
                if (title.includes("Owner's Attorney")) setOwnerAttorney(null);
                if (title.includes("Applicant's Attorney")) setApplicantAttorney(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${participant.role}-name`}>
              Name {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${participant.role}-name`}
              value={participant.name}
              onChange={(e) => setter({ ...participant, name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${participant.role}-email`}>
              Email {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${participant.role}-email`}
              type="email"
              value={participant.email}
              onChange={(e) => setter({ ...participant, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${participant.role}-work`}>Work Phone</Label>
            <Input
              id={`${participant.role}-work`}
              type="tel"
              value={participant.phoneWork || ""}
              onChange={(e) => setter({ ...participant, phoneWork: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${participant.role}-cell`}>Cell Phone</Label>
            <Input
              id={`${participant.role}-cell`}
              type="tel"
              value={participant.phoneCell || ""}
              onChange={(e) => setter({ ...participant, phoneCell: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${participant.role}-home`}>Home Phone</Label>
            <Input
              id={`${participant.role}-home`}
              type="tel"
              value={participant.phoneHome || ""}
              onChange={(e) => setter({ ...participant, phoneHome: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <FormSkeleton sections={4} fieldsPerSection={5} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Alert variant="destructive">
          <AlertTitle>Error loading application</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load application data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!application) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deal Parties</h1>
        <p className="mt-2 text-muted-foreground">
          Information about all parties involved in this transaction
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Saved successfully</AlertTitle>
          <AlertDescription>Party information has been saved.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Unit Owner (Required) */}
        {renderParticipantFields(unitOwner, setUnitOwner, "Unit Owner (Landlord/Seller)", true)}

        {/* Owner's Broker (Optional) */}
        {ownerBroker ? (
          renderParticipantFields(ownerBroker, setOwnerBroker, "Owner's Broker")
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Button type="button" variant="outline" onClick={addOwnerBroker} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Owner&apos;s Broker
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Owner's Attorney (Optional) */}
        {ownerAttorney ? (
          renderParticipantFields(ownerAttorney, setOwnerAttorney, "Owner's Attorney")
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Button type="button" variant="outline" onClick={addOwnerAttorney} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Owner&apos;s Attorney
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Applicant's Attorney (Optional) */}
        {applicantAttorney ? (
          renderParticipantFields(applicantAttorney, setApplicantAttorney, "Applicant's Attorney")
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={addApplicantAttorney}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Applicant&apos;s Attorney
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={`/applications/${id}`}>Back to Overview</Link>
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" onClick={handleContinue}>
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
