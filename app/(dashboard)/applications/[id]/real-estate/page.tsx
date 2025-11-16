"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Home, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Application, RealEstateProperty, PropertyType, Address } from "@/lib/types";

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.SINGLE_FAMILY]: "Single Family",
  [PropertyType.MULTI_FAMILY]: "Multi Family",
  [PropertyType.CONDO]: "Condo",
  [PropertyType.COOP]: "Co-op",
  [PropertyType.COMMERCIAL]: "Commercial",
  [PropertyType.LAND]: "Land",
};

export default function RealEstatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<RealEstateProperty>>({
    propertyType: PropertyType.CONDO,
    marketValue: 0,
    mortgageBalance: 0,
    monthlyMortgagePayment: 0,
    monthlyMaintenanceHOA: 0,
    monthlyRealEstateTaxes: 0,
    monthlyInsurance: 0,
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  // Load existing properties from localStorage
  useEffect(() => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const application = applications.find((app) => app.id === id);
    if (application?.realEstateProperties) {
      setProperties(application.realEstateProperties);
    }
  }, [id]);

  const handleSave = () => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const applicationIndex = applications.findIndex((app) => app.id === id);

    if (applicationIndex !== -1) {
      applications[applicationIndex] = {
        ...applications[applicationIndex],
        realEstateProperties: properties,
        lastActivityAt: new Date(),
      };
      localStorage.setItem("applications", JSON.stringify(applications));
    }
  };

  const handleAddProperty = () => {
    if (!newProperty.address?.street || !newProperty.address?.city) {
      alert("Please fill in the property address");
      return;
    }

    const property: RealEstateProperty = {
      id: `property-${Date.now()}`,
      propertyType: newProperty.propertyType || PropertyType.CONDO,
      marketValue: newProperty.marketValue || 0,
      mortgageBalance: newProperty.mortgageBalance || 0,
      monthlyMortgagePayment: newProperty.monthlyMortgagePayment || 0,
      monthlyMaintenanceHOA: newProperty.monthlyMaintenanceHOA || 0,
      monthlyRealEstateTaxes: newProperty.monthlyRealEstateTaxes || 0,
      monthlyInsurance: newProperty.monthlyInsurance || 0,
      address: newProperty.address as Address,
    };

    setProperties([...properties, property]);
    setIsAddingProperty(false);
    setNewProperty({
      propertyType: PropertyType.CONDO,
      marketValue: 0,
      mortgageBalance: 0,
      monthlyMortgagePayment: 0,
      monthlyMaintenanceHOA: 0,
      monthlyRealEstateTaxes: 0,
      monthlyInsurance: 0,
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
    });
  };

  const handleRemoveProperty = (propertyId: string) => {
    setProperties(properties.filter((p) => p.id !== propertyId));
  };

  const handleContinue = () => {
    handleSave();
    router.push(`/applications/${id}/documents`);
  };

  const calculateEquity = (marketValue: number, mortgageBalance: number) => {
    return Math.max(0, marketValue - mortgageBalance);
  };

  const calculateTotalMonthlyExpenses = (property: RealEstateProperty) => {
    return (
      property.monthlyMortgagePayment +
      property.monthlyMaintenanceHOA +
      property.monthlyRealEstateTaxes +
      property.monthlyInsurance
    );
  };

  const totalEquity = properties.reduce(
    (sum, property) => sum + calculateEquity(property.marketValue, property.mortgageBalance),
    0
  );

  const totalMarketValue = properties.reduce((sum, property) => sum + property.marketValue, 0);
  const totalMortgageBalance = properties.reduce((sum, property) => sum + property.mortgageBalance, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Real Estate Holdings</h1>
        <p className="text-muted-foreground mt-2">
          List all real estate properties you own or have an interest in
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Include all properties you own, whether they are your primary residence, investment properties, vacation homes, or land.
          Accurate property information helps the board assess your overall financial position.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalMarketValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mortgage Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalMortgageBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold text-primary">
                  ${totalEquity.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Properties */}
      {properties.map((property) => {
        const equity = calculateEquity(property.marketValue, property.mortgageBalance);
        const monthlyExpenses = calculateTotalMonthlyExpenses(property);

        return (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5" />
                    <CardTitle className="text-lg">
                      {property.address.street}
                    </CardTitle>
                    <Badge variant="outline">{PROPERTY_TYPE_LABELS[property.propertyType]}</Badge>
                  </div>
                  <CardDescription>
                    {property.address.city}, {property.address.state} {property.address.zip}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProperty(property.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Market Value</p>
                  <p className="font-semibold">${property.marketValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mortgage Balance</p>
                  <p className="font-semibold">${property.mortgageBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Equity</p>
                  <p className="font-semibold text-green-600">${equity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Expenses</p>
                  <p className="font-semibold">${monthlyExpenses.toLocaleString()}/mo</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Mortgage Payment</p>
                  <p>${property.monthlyMortgagePayment.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Maintenance/HOA</p>
                  <p>${property.monthlyMaintenanceHOA.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Real Estate Taxes</p>
                  <p>${property.monthlyRealEstateTaxes.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Insurance</p>
                  <p>${property.monthlyInsurance.toLocaleString()}/mo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Add New Property Form */}
      {isAddingProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Property
            </CardTitle>
            <CardDescription>Enter the details for this property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Type */}
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={newProperty.propertyType}
                onValueChange={(value) =>
                  setNewProperty({ ...newProperty, propertyType: value as PropertyType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <Label>Property Address</Label>
              <div className="grid gap-4">
                <Input
                  placeholder="Street Address (including unit/apt if applicable)"
                  value={newProperty.address?.street || ""}
                  onChange={(e) =>
                    setNewProperty({
                      ...newProperty,
                      address: { ...newProperty.address!, street: e.target.value },
                    })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={newProperty.address?.city || ""}
                    onChange={(e) =>
                      setNewProperty({
                        ...newProperty,
                        address: { ...newProperty.address!, city: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="State"
                    value={newProperty.address?.state || ""}
                    onChange={(e) =>
                      setNewProperty({
                        ...newProperty,
                        address: { ...newProperty.address!, state: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="ZIP"
                    value={newProperty.address?.zip || ""}
                    onChange={(e) =>
                      setNewProperty({
                        ...newProperty,
                        address: { ...newProperty.address!, zip: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Market Value</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.marketValue || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, marketValue: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mortgage Balance</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.mortgageBalance || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, mortgageBalance: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Mortgage Payment</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.monthlyMortgagePayment || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, monthlyMortgagePayment: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Maintenance/HOA</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.monthlyMaintenanceHOA || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, monthlyMaintenanceHOA: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Real Estate Taxes</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.monthlyRealEstateTaxes || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, monthlyRealEstateTaxes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Insurance</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProperty.monthlyInsurance || ""}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, monthlyInsurance: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddProperty}>Add Property</Button>
              <Button variant="outline" onClick={() => setIsAddingProperty(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Property Button */}
      {!isAddingProperty && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center p-8">
            <Button onClick={() => setIsAddingProperty(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={`/applications/${id}/financials`}>Back to Financials</Link>
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue to Documents
        </Button>
      </div>
    </div>
  );
}
