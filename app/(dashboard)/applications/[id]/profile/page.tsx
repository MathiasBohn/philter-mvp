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
import { AddPersonButton } from "@/components/features/application/add-person-button";
import { MaskedSSNInput } from "@/components/forms/masked-ssn-input";
import { DateInput } from "@/components/forms/date-input";
import { profileSchema } from "@/lib/validators";
import { AddressHistoryEntry, Role } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addresses, setAddresses] = useState<AddressHistoryEntry[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    fromDate: "",
    toDate: "",
    isCurrent: false,
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
    }
  }, [id, setValue]);

  // Update form value when addresses change
  useEffect(() => {
    setValue("addressHistory", addresses);
  }, [addresses, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem(`profile_${id}`, JSON.stringify({
      ...data,
      dob: data.dob.toISOString(),
      addressHistory: data.addressHistory.map(addr => ({
        ...addr,
        fromDate: addr.fromDate.toISOString(),
        toDate: addr.toDate ? addr.toDate.toISOString() : undefined,
      })),
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
      fromDate: new Date(newAddress.fromDate),
      toDate: newAddress.isCurrent ? undefined : (newAddress.toDate ? new Date(newAddress.toDate) : undefined),
      isCurrent: newAddress.isCurrent,
    };

    setAddresses([...addresses, address]);
    setNewAddress({
      street: "",
      unit: "",
      city: "",
      state: "",
      zip: "",
      fromDate: "",
      toDate: "",
      isCurrent: false,
    });
    setShowAddressDialog(false);
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleAddPerson = (name: string, email: string, role: Role.CO_APPLICANT | Role.GUARANTOR) => {
    // In a real app, this would make an API call to invite the person
  };

  const handleContinue = () => {
    router.push(`/applications/${id}/income`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
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
                {/* eslint-disable-next-line react-hooks/incompatible-library */}
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

        {/* Additional People */}
        <Card>
          <CardHeader>
            <CardTitle>Additional People</CardTitle>
            <CardDescription>
              Add co-applicants or guarantors to this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddPersonButton onAdd={handleAddPerson} />
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
                <Input
                  id="new-state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })}
                  placeholder="NY"
                  maxLength={2}
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
                <Input
                  id="new-from"
                  type="date"
                  value={newAddress.fromDate}
                  onChange={(e) => setNewAddress({ ...newAddress, fromDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-to">To Date</Label>
                <Input
                  id="new-to"
                  type="date"
                  value={newAddress.toDate}
                  onChange={(e) => setNewAddress({ ...newAddress, toDate: e.target.value })}
                  disabled={newAddress.isCurrent}
                />
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-current"
                  checked={newAddress.isCurrent}
                  onChange={(e) => setNewAddress({ ...newAddress, isCurrent: e.target.checked, toDate: "" })}
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
