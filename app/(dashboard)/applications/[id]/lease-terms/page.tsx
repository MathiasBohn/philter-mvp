"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Save, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { DateInput } from "@/components/forms/date-input";
import Link from "next/link";
import { FormSkeleton } from "@/components/loading/form-skeleton";
import { useApplication, useUpdateApplication } from "@/lib/hooks/use-applications";
import { notFound } from "next/navigation";

const leaseTermsSchema = z.object({
  monthlyRent: z.number().min(1, "Monthly rent is required"),
  securityDeposit: z.number().min(0, "Security deposit is required"),
  leaseLengthYears: z.number().min(1, "Lease length is required"),
  leaseStartDate: z.date(),
  leaseEndDate: z.date(),
  moveInDate: z.date(),
  specialConditions: z.string().optional(),
}).refine((data) => data.leaseStartDate < data.leaseEndDate, {
  message: "Lease start date must be before lease end date",
  path: ["leaseEndDate"],
}).refine((data) => data.moveInDate >= data.leaseStartDate, {
  message: "Move-in date must be on or after lease start date",
  path: ["moveInDate"],
});

type LeaseTermsFormData = z.infer<typeof leaseTermsSchema>;

export default function LeaseTermsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: application, isLoading, error } = useApplication(id);
  const updateApplication = useUpdateApplication(id);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeaseTermsFormData>({
    resolver: zodResolver(leaseTermsSchema),
    defaultValues: {
      monthlyRent: 0,
      securityDeposit: 0,
      leaseLengthYears: 1,
      leaseStartDate: new Date(),
      leaseEndDate: new Date(),
      moveInDate: new Date(),
      specialConditions: "",
    },
  });

  const monthlyRent = watch("monthlyRent");
  const leaseLengthYears = watch("leaseLengthYears");
  const leaseStartDate = watch("leaseStartDate");

  // Auto-calculate annual rent
  const annualRent = monthlyRent * 12;

  // Auto-calculate lease end date when start date or length changes
  useEffect(() => {
    if (leaseStartDate && leaseLengthYears) {
      const endDate = new Date(leaseStartDate);
      endDate.setFullYear(endDate.getFullYear() + leaseLengthYears);
      setValue("leaseEndDate", endDate);
    }
  }, [leaseStartDate, leaseLengthYears, setValue]);

  // Load lease terms data from application
  useEffect(() => {
    if (application?.leaseTerms) {
      const leaseTerms = application.leaseTerms;
      reset({
        monthlyRent: leaseTerms.monthlyRent || 0,
        securityDeposit: leaseTerms.securityDeposit || 0,
        leaseLengthYears: leaseTerms.leaseLengthYears || 1,
        leaseStartDate: leaseTerms.leaseStartDate ? new Date(leaseTerms.leaseStartDate) : new Date(),
        leaseEndDate: leaseTerms.leaseEndDate ? new Date(leaseTerms.leaseEndDate) : new Date(),
        moveInDate: leaseTerms.moveInDate ? new Date(leaseTerms.moveInDate) : new Date(),
        specialConditions: leaseTerms.specialConditions || "",
      });
    }
  }, [application, reset]);

  const onSubmit = async (data: LeaseTermsFormData) => {
    if (!application) return;

    setIsSaving(true);

    try {
      await updateApplication.mutateAsync({
        leaseTerms: {
          monthlyRent: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          leaseLengthYears: data.leaseLengthYears,
          leaseStartDate: data.leaseStartDate,
          leaseEndDate: data.leaseEndDate,
          moveInDate: data.moveInDate,
          specialConditions: data.specialConditions || "",
          annualRent,
        },
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving lease terms:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    // Validate the form before continuing
    await handleSubmit(
      async (data) => {
        // Form is valid, save and continue
        await onSubmit(data);
        router.push(`/applications/${id}/parties`);
      },
      () => {
        // Form validation failed, scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    )();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <FormSkeleton sections={3} fieldsPerSection={5} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load application data. Please try refreshing the page.
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lease Terms</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the proposed lease terms for this application
        </p>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>There are errors in your form</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {errors.monthlyRent && <li>{errors.monthlyRent.message}</li>}
              {errors.securityDeposit && <li>{errors.securityDeposit.message}</li>}
              {errors.leaseLengthYears && <li>{errors.leaseLengthYears.message}</li>}
              {errors.leaseStartDate && <li>{errors.leaseStartDate.message}</li>}
              {errors.leaseEndDate && <li>{errors.leaseEndDate.message}</li>}
              {errors.moveInDate && <li>{errors.moveInDate.message}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Saved successfully</AlertTitle>
          <AlertDescription>Your lease terms have been saved.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Terms
            </CardTitle>
            <CardDescription>Monthly and annual rent, plus security deposit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">
                  Monthly Rent <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    {...register("monthlyRent", { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                    aria-invalid={errors.monthlyRent ? "true" : "false"}
                    aria-describedby={errors.monthlyRent ? "monthlyRent-error" : undefined}
                  />
                </div>
                {errors.monthlyRent && (
                  <p id="monthlyRent-error" className="text-sm text-red-600">
                    {errors.monthlyRent.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRent">Annual Rent (Auto-calculated)</Label>
                <Input
                  id="annualRent"
                  type="text"
                  value={formatCurrency(annualRent)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="securityDeposit">
                  Security Deposit <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="securityDeposit"
                    type="number"
                    step="0.01"
                    {...register("securityDeposit", { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                    aria-invalid={errors.securityDeposit ? "true" : "false"}
                    aria-describedby={errors.securityDeposit ? "securityDeposit-error" : undefined}
                  />
                </div>
                {errors.securityDeposit && (
                  <p id="securityDeposit-error" className="text-sm text-red-600">
                    {errors.securityDeposit.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Duration & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lease Duration & Dates
            </CardTitle>
            <CardDescription>Lease length and important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseLengthYears">
                  Lease Length (Years) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={String(leaseLengthYears)}
                  onValueChange={(value) => setValue("leaseLengthYears", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leaseLengthYears && (
                  <p className="text-sm text-red-600">{errors.leaseLengthYears.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaseStartDate">
                  Lease Start Date <span className="text-red-500">*</span>
                </Label>
                <DateInput
                  id="leaseStartDate"
                  value={watch("leaseStartDate")}
                  onChange={(date) => setValue("leaseStartDate", date)}
                  error={errors.leaseStartDate?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaseEndDate">
                  Lease End Date (Auto-calculated) <span className="text-red-500">*</span>
                </Label>
                <DateInput
                  id="leaseEndDate"
                  value={watch("leaseEndDate")}
                  onChange={(date) => setValue("leaseEndDate", date)}
                  error={errors.leaseEndDate?.message}
                />
                <p className="text-xs text-muted-foreground">
                  Automatically calculated based on lease length, but can be adjusted
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moveInDate">
                  Move-in Date <span className="text-red-500">*</span>
                </Label>
                <DateInput
                  id="moveInDate"
                  value={watch("moveInDate")}
                  onChange={(date) => setValue("moveInDate", date)}
                  error={errors.moveInDate?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Conditions</CardTitle>
            <CardDescription>Any special terms or conditions (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="specialConditions"
              {...register("specialConditions")}
              placeholder="Enter any special conditions, lease stipulations, or additional notes..."
              className="min-h-[100px]"
            />
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
    </div>
  );
}
