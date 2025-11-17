"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Building2, Shield, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { BuildingPolicies } from "@/lib/types";

// Mock building policies data - in a real app, this would come from the template/building
const MOCK_BUILDING_POLICIES: BuildingPolicies = {
  maxFinancePercent: 75,
  allowGuarantors: true,
  alterationPolicies: "All alterations must be approved by the board prior to commencement. Applicant must submit detailed plans and obtain all necessary permits. Work must be completed by licensed contractors with appropriate insurance coverage.",
  insuranceRequirements: "Tenants must maintain renter's insurance with liability coverage of at least $300,000. Certificate of insurance must be provided to building management before move-in and renewed annually.",
  allowCorpOwnership: false,
  allowPiedATerre: false,
  allowTrustOwnership: true,
};

export default function BuildingPoliciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const policies = MOCK_BUILDING_POLICIES;

  const PolicyItem = ({
    label,
    value,
    isBoolean = false
  }: {
    label: string;
    value: string | number | boolean;
    isBoolean?: boolean;
  }) => (
    <div className="flex items-start justify-between py-3 border-b last:border-0">
      <span className="font-medium text-sm">{label}</span>
      {isBoolean ? (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Allowed
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Not Allowed
              </Badge>
            </>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground font-semibold">
          {typeof value === 'number' && label.includes('Finance') ? `${value}%` : value}
        </span>
      )}
    </div>
  );

  const handleContinue = () => {
    // Navigate to next section in sequence: Lease Terms
    router.push(`/applications/${id}/lease-terms`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Building Policies</h1>
        <p className="text-muted-foreground mt-2">
          Please review the following building-specific policies before continuing with your application
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These policies are specific to this building and must be adhered to throughout the application process and during occupancy.
          Please review them carefully before proceeding.
        </AlertDescription>
      </Alert>

      {/* Financial & Ownership Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Financial & Ownership Requirements
          </CardTitle>
          <CardDescription>
            Financial restrictions and ownership policies for this building
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <PolicyItem
            label="Maximum Financing Allowed"
            value={policies.maxFinancePercent}
          />
          <PolicyItem
            label="Guarantors"
            value={policies.allowGuarantors}
            isBoolean
          />
          <PolicyItem
            label="Corporate Ownership"
            value={policies.allowCorpOwnership}
            isBoolean
          />
          <PolicyItem
            label="Trust Ownership"
            value={policies.allowTrustOwnership}
            isBoolean
          />
          <PolicyItem
            label="Pied-à-terre (Secondary Residence)"
            value={policies.allowPiedATerre}
            isBoolean
          />
        </CardContent>
      </Card>

      {/* Alteration Policies */}
      {policies.alterationPolicies && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Alteration Policies
            </CardTitle>
            <CardDescription>
              Guidelines for making changes to your unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {policies.alterationPolicies}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insurance Requirements */}
      {policies.insuranceRequirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Requirements
            </CardTitle>
            <CardDescription>
              Required insurance coverage for residents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {policies.insuranceRequirements}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={`/applications/${id}`}>Back to Overview</Link>
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
