"use client";

import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Save, CheckCircle } from "lucide-react";
import { AddressHistoryList } from "@/components/features/application/address-history-list";
import { ReferenceList } from "@/components/features/application/reference-list";
import { MaskedSSNInput } from "@/components/forms/masked-ssn-input";
import { DateInput } from "@/components/forms/date-input";
import { MonthYearInput } from "@/components/forms/month-year-input";
import { StateSelect } from "@/components/ui/state-select";
import { profileSchema } from "@/lib/validators";
import { AddressHistoryEntry, ReferenceLetterEntry, HousingHistory, LandlordInfo, EmergencyContact, KeyHolder, EducationInfo, EducationLevel } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSkeleton } from "@/components/loading/form-skeleton";

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addresses, setAddresses] = useState<AddressHistoryEntry[]>([]);
  const [references, setReferences] = useState<ReferenceLetterEntry[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState<{
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    fromDate: Date | undefined;
    toDate: Date | undefined;
    isCurrent: boolean;
  }>({
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    fromDate: undefined,
    toDate: undefined,
    isCurrent: false,
  });

  // Housing History State
  const [ownsPrivateHouse, setOwnsPrivateHouse] = useState<boolean | undefined>(undefined);
  const [currentLandlord, setCurrentLandlord] = useState<LandlordInfo | undefined>(undefined);
  const [previousLandlord, setPreviousLandlord] = useState<LandlordInfo | undefined>(undefined);
  const [reasonForMoving, setReasonForMoving] = useState("");

  // Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    email: "",
    address: "",
    daytimePhone: "",
    eveningPhone: "",
    cellPhone: "",
    fax: "",
    hasKeyHolders: false,
    keyHolders: [],
  });
  const [keyHolders, setKeyHolders] = useState<KeyHolder[]>([]);

  // Education State
  const [educationInfo, setEducationInfo] = useState<EducationInfo>({
    educationLevel: undefined,
    lastSchoolAttended: "",
    fromDate: undefined,
    toDate: undefined,
    membershipsAffiliations: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      addressHistory: [],
    },
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const savedData = localStorage.getItem(`profile_${id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
      if (parsed.fullName) setValue("fullName", parsed.fullName);
      if (parsed.email) setValue("email", parsed.email);
      if (parsed.phone) setValue("phone", parsed.phone);
      if (parsed.ssn) setValue("ssn", parsed.ssn);
      if (parsed.dob) setValue("dob", new Date(parsed.dob));
      if (parsed.addressHistory) {
        const loadedAddresses = parsed.addressHistory.map((addr: AddressHistoryEntry & { fromDate: string; toDate?: string }) => ({
          ...addr,
          fromDate: new Date(addr.fromDate),
          toDate: addr.toDate ? new Date(addr.toDate) : undefined,
        }));
        setAddresses(loadedAddresses);
        setValue("addressHistory", loadedAddresses);
      }
      if (parsed.references) {
        const loadedReferences = parsed.references.map((ref: ReferenceLetterEntry & { occupiedFrom?: string; occupiedTo?: string }) => ({
          ...ref,
          occupiedFrom: ref.occupiedFrom ? new Date(ref.occupiedFrom) : undefined,
          occupiedTo: ref.occupiedTo ? new Date(ref.occupiedTo) : undefined,
        }));
        setReferences(loadedReferences);
      }
      // Load housing history
      if (parsed.housingHistory) {
        setOwnsPrivateHouse(parsed.housingHistory.ownsPrivateHouse);
        if (parsed.housingHistory.currentLandlord) {
          setCurrentLandlord({
            ...parsed.housingHistory.currentLandlord,
            occupiedFrom: new Date(parsed.housingHistory.currentLandlord.occupiedFrom),
            occupiedTo: parsed.housingHistory.currentLandlord.occupiedTo ? new Date(parsed.housingHistory.currentLandlord.occupiedTo) : undefined,
          });
        }
        if (parsed.housingHistory.previousLandlord) {
          setPreviousLandlord({
            ...parsed.housingHistory.previousLandlord,
            occupiedFrom: new Date(parsed.housingHistory.previousLandlord.occupiedFrom),
            occupiedTo: parsed.housingHistory.previousLandlord.occupiedTo ? new Date(parsed.housingHistory.previousLandlord.occupiedTo) : undefined,
          });
        }
        if (parsed.housingHistory.reasonForMoving) {
          setReasonForMoving(parsed.housingHistory.reasonForMoving);
        }
      }
      // Load emergency contact
      if (parsed.emergencyContact) {
        setEmergencyContact(parsed.emergencyContact);
        if (parsed.emergencyContact.keyHolders) {
          setKeyHolders(parsed.emergencyContact.keyHolders);
        }
      }
      // Load education info
      if (parsed.educationInfo) {
        setEducationInfo({
          ...parsed.educationInfo,
          fromDate: parsed.educationInfo.fromDate ? new Date(parsed.educationInfo.fromDate) : undefined,
          toDate: parsed.educationInfo.toDate ? new Date(parsed.educationInfo.toDate) : undefined,
        });
      }
    }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [id, setValue]);

  // Update form value when addresses change
  useEffect(() => {
    setValue("addressHistory", addresses);
  }, [addresses, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Build housing history object
    const housingHistory: HousingHistory | undefined = ownsPrivateHouse !== undefined ? {
      ownsPrivateHouse,
      currentLandlord: currentLandlord ? {
        ...currentLandlord,
        occupiedFrom: currentLandlord.occupiedFrom,
        occupiedTo: currentLandlord.occupiedTo,
      } : undefined,
      previousLandlord: previousLandlord ? {
        ...previousLandlord,
        occupiedFrom: previousLandlord.occupiedFrom,
        occupiedTo: previousLandlord.occupiedTo,
      } : undefined,
      reasonForMoving,
    } : undefined;

    // Save to localStorage
    localStorage.setItem(`profile_${id}`, JSON.stringify({
      ...data,
      dob: data.dob.toISOString(),
      addressHistory: data.addressHistory.map(addr => ({
        ...addr,
        fromDate: addr.fromDate.toISOString(),
        toDate: addr.toDate ? addr.toDate.toISOString() : undefined,
      })),
      references: references.map(ref => ({
        ...ref,
        occupiedFrom: ref.occupiedFrom ? ref.occupiedFrom.toISOString() : undefined,
        occupiedTo: ref.occupiedTo ? ref.occupiedTo.toISOString() : undefined,
      })),
      housingHistory: housingHistory ? {
        ...housingHistory,
        currentLandlord: housingHistory.currentLandlord ? {
          ...housingHistory.currentLandlord,
          occupiedFrom: housingHistory.currentLandlord.occupiedFrom.toISOString(),
          occupiedTo: housingHistory.currentLandlord.occupiedTo ? housingHistory.currentLandlord.occupiedTo.toISOString() : undefined,
        } : undefined,
        previousLandlord: housingHistory.previousLandlord ? {
          ...housingHistory.previousLandlord,
          occupiedFrom: housingHistory.previousLandlord.occupiedFrom.toISOString(),
          occupiedTo: housingHistory.previousLandlord.occupiedTo ? housingHistory.previousLandlord.occupiedTo.toISOString() : undefined,
        } : undefined,
      } : undefined,
      emergencyContact: emergencyContact.name ? {
        ...emergencyContact,
        keyHolders,
      } : undefined,
      educationInfo: (educationInfo.educationLevel || educationInfo.lastSchoolAttended) ? {
        ...educationInfo,
        fromDate: educationInfo.fromDate ? educationInfo.fromDate.toISOString() : undefined,
        toDate: educationInfo.toDate ? educationInfo.toDate.toISOString() : undefined,
      } : undefined,
    }));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip || !newAddress.fromDate) {
      return;
    }

    const address: AddressHistoryEntry = {
      id: `addr-${Date.now()}`,
      street: newAddress.street,
      unit: newAddress.unit || undefined,
      city: newAddress.city,
      state: newAddress.state,
      zip: newAddress.zip,
      fromDate: newAddress.fromDate,
      toDate: newAddress.isCurrent ? undefined : newAddress.toDate,
      isCurrent: newAddress.isCurrent,
    };

    setAddresses([...addresses, address]);
    setNewAddress({
      street: "",
      unit: "",
      city: "",
      state: "",
      zip: "",
      fromDate: undefined,
      toDate: undefined,
      isCurrent: false,
    });
    setShowAddressDialog(false);
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleAddReference = (reference: ReferenceLetterEntry) => {
    setReferences([...references, reference]);
  };

  const handleRemoveReference = (id: string) => {
    setReferences(references.filter((ref) => ref.id !== id));
  };

  const handleUploadReferenceLetter = (referenceId: string, file: File) => {
    // In a real app, this would upload the file and get a document ID
    // For now, we'll just mark it as uploaded with a mock ID
    const updatedReferences = references.map((ref) =>
      ref.id === referenceId
        ? { ...ref, letterDocumentId: `doc-${Date.now()}` }
        : ref
    );
    setReferences(updatedReferences);
  };

  const handleContinue = async () => {
    // Validate the main form fields
    const isFormValid = await handleSubmit(
      async (data) => {
        // Form is valid, now check additional required fields
        const additionalErrors: string[] = [];

        // Validate Emergency Contact (all required fields)
        if (!emergencyContact.name || !emergencyContact.email || !emergencyContact.address || !emergencyContact.daytimePhone) {
          additionalErrors.push("Emergency contact information is required (Name, Email, Address, Daytime Phone)");
        }

        // Validate Housing History
        if (ownsPrivateHouse === undefined) {
          additionalErrors.push("Please indicate if you own a private house");
        }

        // Validate Current Landlord (required if not owning house)
        if (ownsPrivateHouse === false) {
          if (!currentLandlord || !currentLandlord.name || !currentLandlord.phone || !currentLandlord.email || !currentLandlord.occupiedFrom || currentLandlord.monthlyPayment === undefined) {
            additionalErrors.push("Current landlord information is required (Name, Phone, Email, Occupied From, Monthly Payment)");
          }
        }

        // Validate key holders if indicated
        if (emergencyContact.hasKeyHolders && keyHolders.length === 0) {
          additionalErrors.push("Please add at least one key holder or select 'No' for key holders");
        }

        // Check if any key holders are incomplete
        if (emergencyContact.hasKeyHolders && keyHolders.length > 0) {
          const incompleteKeyHolders = keyHolders.filter(
            (holder) => !holder.name || !holder.email || !holder.cellPhone
          );
          if (incompleteKeyHolders.length > 0) {
            additionalErrors.push("All key holders must have Name, Email, and Cell Phone");
          }
        }

        if (additionalErrors.length > 0) {
          // Show errors by scrolling to top and triggering a form submission to show errors
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert(additionalErrors.join('\n\n'));
          return;
        }

        // All validations passed, save and continue
        await onSubmit(data);
        router.push(`/applications/${id}/income`);
      },
      (errors) => {
        // Form validation failed, scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    )();
  };

  if (isLoading) {
    return <FormSkeleton sections={5} fieldsPerSection={6} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Personal information and address history
        </p>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>There are errors in your form</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {errors.fullName && <li>{errors.fullName.message}</li>}
              {errors.email && <li>{errors.email.message}</li>}
              {errors.phone && <li>{errors.phone.message}</li>}
              {errors.dob && <li>{errors.dob.message}</li>}
              {errors.ssn && <li>{errors.ssn.message}</li>}
              {errors.addressHistory && <li>{errors.addressHistory.message}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Saved successfully</AlertTitle>
          <AlertDescription>Your profile information has been saved.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Required information about the primary applicant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Legal Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="John Doe"
                  aria-invalid={errors.fullName ? "true" : "false"}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="(555) 123-4567"
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <DateInput
                  id="dob"
                  value={watch("dob")}
                  onChange={(date) => setValue("dob", date)}
                  error={errors.dob?.message}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ssn">
                  Social Security Number <span className="text-red-500">*</span>
                </Label>
                <MaskedSSNInput
                  id="ssn"
                  value={watch("ssn") || ""}
                  onChange={(value) => setValue("ssn", value)}
                  error={errors.ssn?.message}
                />
                <p className="text-xs text-muted-foreground">
                  Your SSN is encrypted and securely stored. It will be masked for brokers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Information (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Education (Optional)</CardTitle>
            <CardDescription>
              Educational background and affiliations - completely optional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education-level">Highest Education Level</Label>
                <Select
                  value={educationInfo.educationLevel || ""}
                  onValueChange={(value) =>
                    setEducationInfo({ ...educationInfo, educationLevel: value as EducationLevel })
                  }
                >
                  <SelectTrigger id="education-level">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EducationLevel.ELEMENTARY_SCHOOL}>Elementary School</SelectItem>
                    <SelectItem value={EducationLevel.HIGH_SCHOOL}>High School</SelectItem>
                    <SelectItem value={EducationLevel.COLLEGE}>College</SelectItem>
                    <SelectItem value={EducationLevel.GRADUATE_SCHOOL}>Graduate School</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-school">Last School Attended</Label>
                <Input
                  id="last-school"
                  value={educationInfo.lastSchoolAttended || ""}
                  onChange={(e) =>
                    setEducationInfo({ ...educationInfo, lastSchoolAttended: e.target.value })
                  }
                  placeholder="e.g., Columbia University"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education-from">From Date</Label>
                <MonthYearInput
                  id="education-from"
                  value={educationInfo.fromDate}
                  onChange={(date) =>
                    setEducationInfo({
                      ...educationInfo,
                      fromDate: date,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education-to">To Date</Label>
                <MonthYearInput
                  id="education-to"
                  value={educationInfo.toDate}
                  onChange={(date) =>
                    setEducationInfo({
                      ...educationInfo,
                      toDate: date,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="memberships">Memberships/Affiliations</Label>
                <Textarea
                  id="memberships"
                  value={educationInfo.membershipsAffiliations || ""}
                  onChange={(e) =>
                    setEducationInfo({ ...educationInfo, membershipsAffiliations: e.target.value })
                  }
                  placeholder="List any club, society, fraternity or board memberships"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address History */}
        <Card>
          <CardHeader>
            <CardTitle>Address History</CardTitle>
            <CardDescription>
              Provide at least 2 years of address history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressHistoryList
              addresses={addresses}
              onAdd={() => setShowAddressDialog(true)}
              onRemove={handleRemoveAddress}
            />
            {errors.addressHistory && (
              <p className="text-sm text-red-600 mt-2">{errors.addressHistory.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Housing History */}
        <Card>
          <CardHeader>
            <CardTitle>Housing History</CardTitle>
            <CardDescription>
              Information about your current and previous landlords
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Own Private House */}
            <div className="space-y-3">
              <Label>Do you own a private house? <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={ownsPrivateHouse === undefined ? undefined : ownsPrivateHouse ? "yes" : "no"}
                onValueChange={(value) => {
                  const owns = value === "yes";
                  setOwnsPrivateHouse(owns);
                  if (owns) {
                    setCurrentLandlord(undefined);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="owns-yes" />
                  <Label htmlFor="owns-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="owns-no" />
                  <Label htmlFor="owns-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Current Landlord - only if not owning */}
            {ownsPrivateHouse === false && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Current Landlord</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="current-landlord-name"
                      value={currentLandlord?.name || ""}
                      onChange={(e) => setCurrentLandlord({
                        id: currentLandlord?.id || `landlord-${Date.now()}`,
                        name: e.target.value,
                        phone: currentLandlord?.phone || "",
                        email: currentLandlord?.email || "",
                        occupiedFrom: currentLandlord?.occupiedFrom || new Date(),
                        monthlyPayment: currentLandlord?.monthlyPayment || 0,
                        fax: currentLandlord?.fax,
                        referenceLetterDocumentId: currentLandlord?.referenceLetterDocumentId,
                      })}
                      placeholder="Landlord name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-phone">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="current-landlord-phone"
                      type="tel"
                      value={currentLandlord?.phone || ""}
                      onChange={(e) => setCurrentLandlord(currentLandlord ? { ...currentLandlord, phone: e.target.value } : undefined)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="current-landlord-email"
                      type="email"
                      value={currentLandlord?.email || ""}
                      onChange={(e) => setCurrentLandlord(currentLandlord ? { ...currentLandlord, email: e.target.value } : undefined)}
                      placeholder="landlord@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-fax">Fax (Optional)</Label>
                    <Input
                      id="current-landlord-fax"
                      type="tel"
                      value={currentLandlord?.fax || ""}
                      onChange={(e) => setCurrentLandlord(currentLandlord ? { ...currentLandlord, fax: e.target.value } : undefined)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-from">Occupied From <span className="text-red-500">*</span></Label>
                    <MonthYearInput
                      id="current-landlord-from"
                      value={currentLandlord?.occupiedFrom}
                      onChange={(date) => setCurrentLandlord(currentLandlord ? { ...currentLandlord, occupiedFrom: date || new Date() } : undefined)}
                      placeholder="MM/YYYY"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-landlord-payment">Monthly Payment <span className="text-red-500">*</span></Label>
                    <Input
                      id="current-landlord-payment"
                      type="number"
                      value={currentLandlord?.monthlyPayment || ""}
                      onChange={(e) => setCurrentLandlord(currentLandlord ? { ...currentLandlord, monthlyPayment: parseFloat(e.target.value) || 0 } : undefined)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="current-landlord-letter">Reference Letter (Optional but encouraged)</Label>
                    <Input
                      id="current-landlord-letter"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && currentLandlord) {
                          // In a real app, upload the file and get document ID
                          setCurrentLandlord({ ...currentLandlord, referenceLetterDocumentId: `doc-${Date.now()}` });
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Upload a reference letter from your current landlord</p>
                  </div>
                </div>
              </div>
            )}

            {/* Previous Landlord */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Previous Landlord (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-name">Name</Label>
                  <Input
                    id="previous-landlord-name"
                    value={previousLandlord?.name || ""}
                    onChange={(e) => setPreviousLandlord({
                      id: previousLandlord?.id || `prev-landlord-${Date.now()}`,
                      name: e.target.value,
                      phone: previousLandlord?.phone || "",
                      email: previousLandlord?.email || "",
                      occupiedFrom: previousLandlord?.occupiedFrom || new Date(),
                      monthlyPayment: previousLandlord?.monthlyPayment || 0,
                      fax: previousLandlord?.fax,
                      occupiedTo: previousLandlord?.occupiedTo,
                      referenceLetterDocumentId: previousLandlord?.referenceLetterDocumentId,
                    })}
                    placeholder="Previous landlord name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-phone">Phone</Label>
                  <Input
                    id="previous-landlord-phone"
                    type="tel"
                    value={previousLandlord?.phone || ""}
                    onChange={(e) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, phone: e.target.value } : undefined)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-email">Email</Label>
                  <Input
                    id="previous-landlord-email"
                    type="email"
                    value={previousLandlord?.email || ""}
                    onChange={(e) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, email: e.target.value } : undefined)}
                    placeholder="landlord@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-fax">Fax</Label>
                  <Input
                    id="previous-landlord-fax"
                    type="tel"
                    value={previousLandlord?.fax || ""}
                    onChange={(e) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, fax: e.target.value } : undefined)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-from">Occupied From</Label>
                  <MonthYearInput
                    id="previous-landlord-from"
                    value={previousLandlord?.occupiedFrom}
                    onChange={(date) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, occupiedFrom: date || new Date() } : undefined)}
                    placeholder="MM/YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-to">Occupied To</Label>
                  <MonthYearInput
                    id="previous-landlord-to"
                    value={previousLandlord?.occupiedTo}
                    onChange={(date) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, occupiedTo: date } : undefined)}
                    placeholder="MM/YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-landlord-payment">Monthly Payment</Label>
                  <Input
                    id="previous-landlord-payment"
                    type="number"
                    value={previousLandlord?.monthlyPayment || ""}
                    onChange={(e) => setPreviousLandlord(previousLandlord ? { ...previousLandlord, monthlyPayment: parseFloat(e.target.value) || 0 } : undefined)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="previous-landlord-letter">Reference Letter (Optional)</Label>
                  <Input
                    id="previous-landlord-letter"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && previousLandlord) {
                        setPreviousLandlord({ ...previousLandlord, referenceLetterDocumentId: `doc-${Date.now()}` });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Reason for Moving */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="reason-moving">Reason for Moving (Optional)</Label>
              <Input
                id="reason-moving"
                value={reasonForMoving}
                onChange={(e) => setReasonForMoving(e.target.value)}
                placeholder="e.g., Job relocation, seeking larger space, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Reference Letters */}
        <Card>
          <CardHeader>
            <CardTitle>Reference Letters</CardTitle>
            <CardDescription>
              Provide contact information for your references. Letters of recommendation are optional but encouraged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferenceList
              references={references}
              onAdd={handleAddReference}
              onRemove={handleRemoveReference}
              onUpload={handleUploadReferenceLetter}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>
              Provide emergency contact information and key holder details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emergency Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Emergency Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergency-name"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="Emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergency-email"
                    type="email"
                    value={emergencyContact.email}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
                    placeholder="emergency@example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergency-address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergency-address"
                    value={emergencyContact.address}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, address: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-daytime">Daytime Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergency-daytime"
                    type="tel"
                    value={emergencyContact.daytimePhone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, daytimePhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-evening">Evening Phone (Optional)</Label>
                  <Input
                    id="emergency-evening"
                    type="tel"
                    value={emergencyContact.eveningPhone || ""}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, eveningPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-cell">Cell Phone (Optional)</Label>
                  <Input
                    id="emergency-cell"
                    type="tel"
                    value={emergencyContact.cellPhone || ""}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, cellPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-fax">Fax (Optional)</Label>
                  <Input
                    id="emergency-fax"
                    type="tel"
                    value={emergencyContact.fax || ""}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, fax: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Key Holders */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Key Holder Information</h3>
              <div className="space-y-3">
                <Label>Does superintendent or another resident have keys to apartment?</Label>
                <RadioGroup
                  value={emergencyContact.hasKeyHolders ? "yes" : "no"}
                  onValueChange={(value) => {
                    const hasKeys = value === "yes";
                    setEmergencyContact({ ...emergencyContact, hasKeyHolders: hasKeys });
                    if (!hasKeys) {
                      setKeyHolders([]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="keys-yes" />
                    <Label htmlFor="keys-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="keys-no" />
                    <Label htmlFor="keys-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Key Holders List */}
              {emergencyContact.hasKeyHolders && (
                <div className="space-y-4 mt-4">
                  {keyHolders.map((holder, index) => (
                    <div key={holder.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Key Holder {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = keyHolders.filter((h) => h.id !== holder.id);
                            setKeyHolders(updated);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`keyholder-${holder.id}-name`}>Name <span className="text-red-500">*</span></Label>
                          <Input
                            id={`keyholder-${holder.id}-name`}
                            value={holder.name}
                            onChange={(e) => {
                              const updated = keyHolders.map((h) =>
                                h.id === holder.id ? { ...h, name: e.target.value } : h
                              );
                              setKeyHolders(updated);
                            }}
                            placeholder="Key holder name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`keyholder-${holder.id}-email`}>Email <span className="text-red-500">*</span></Label>
                          <Input
                            id={`keyholder-${holder.id}-email`}
                            type="email"
                            value={holder.email}
                            onChange={(e) => {
                              const updated = keyHolders.map((h) =>
                                h.id === holder.id ? { ...h, email: e.target.value } : h
                              );
                              setKeyHolders(updated);
                            }}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`keyholder-${holder.id}-phone`}>Cell Phone <span className="text-red-500">*</span></Label>
                          <Input
                            id={`keyholder-${holder.id}-phone`}
                            type="tel"
                            value={holder.cellPhone}
                            onChange={(e) => {
                              const updated = keyHolders.map((h) =>
                                h.id === holder.id ? { ...h, cellPhone: e.target.value } : h
                              );
                              setKeyHolders(updated);
                            }}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newHolder: KeyHolder = {
                        id: `keyholder-${Date.now()}`,
                        name: "",
                        email: "",
                        cellPhone: "",
                      };
                      setKeyHolders([...keyHolders, newHolder]);
                    }}
                  >
                    Add Key Holder
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href={`/applications/${id}`}>Back to Overview</Link>
          </Button>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" onClick={handleContinue}>
              Save & Continue
            </Button>
          </div>
        </div>
      </form>

      {/* Add Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
            <DialogDescription>Enter the address details for your residence history.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="new-street">Street Address</Label>
                <Input
                  id="new-street"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-unit">Unit/Apt (Optional)</Label>
                <Input
                  id="new-unit"
                  value={newAddress.unit}
                  onChange={(e) => setNewAddress({ ...newAddress, unit: e.target.value })}
                  placeholder="Apt 4B"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-city">City</Label>
                <Input
                  id="new-city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-state">State</Label>
                <StateSelect
                  id="new-state"
                  value={newAddress.state}
                  onChange={(value) => setNewAddress({ ...newAddress, state: value })}
                  placeholder="Select State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-zip">ZIP Code</Label>
                <Input
                  id="new-zip"
                  value={newAddress.zip}
                  onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-from">From Date</Label>
                <MonthYearInput
                  id="new-from"
                  value={newAddress.fromDate}
                  onChange={(date) => setNewAddress({ ...newAddress, fromDate: date })}
                  placeholder="MM/YYYY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-to">To Date</Label>
                <MonthYearInput
                  id="new-to"
                  value={newAddress.toDate}
                  onChange={(date) => setNewAddress({ ...newAddress, toDate: date })}
                  disabled={newAddress.isCurrent}
                  placeholder="MM/YYYY"
                />
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-current"
                  checked={newAddress.isCurrent}
                  onChange={(e) => setNewAddress({ ...newAddress, isCurrent: e.target.checked, toDate: undefined })}
                  className="h-4 w-4"
                />
                <Label htmlFor="new-current" className="cursor-pointer">
                  This is my current address
                </Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddAddress}>
              Add Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
