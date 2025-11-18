"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { MoneyInput } from "@/components/forms/money-input"
import { PropertyType, type RealEstateProperty } from "@/lib/types"

interface RealEstateEntryProps {
  property: RealEstateProperty
  onUpdate: (property: RealEstateProperty) => void
  onRemove: () => void
  showRemove?: boolean
  errors?: Record<string, string>
}

export function RealEstateEntry({
  property,
  onUpdate,
  onRemove,
  showRemove = true,
}: RealEstateEntryProps) {
  const handleChange = (field: keyof RealEstateProperty, value: unknown) => {
    // Ensure numeric fields are stored as numbers, not strings
    const numericFields: (keyof RealEstateProperty)[] = [
      'marketValue',
      'mortgageBalance',
      'monthlyMortgagePayment',
      'monthlyMaintenanceHOA',
      'monthlyRealEstateTaxes',
      'monthlyInsurance'
    ]

    const processedValue = numericFields.includes(field)
      ? parseFloat(String(value)) || 0
      : value

    onUpdate({
      ...property,
      [field]: processedValue,
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">Property Details</h3>
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove property</span>
            </Button>
          )}
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor={`property-type-${property.id}`}>
            Property Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={property.propertyType}
            onValueChange={(value) => handleChange("propertyType", value as PropertyType)}
          >
            <SelectTrigger id={`property-type-${property.id}`}>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PropertyType.SINGLE_FAMILY}>Single-family</SelectItem>
              <SelectItem value={PropertyType.MULTI_FAMILY}>Multi-family</SelectItem>
              <SelectItem value={PropertyType.CONDO}>Condo</SelectItem>
              <SelectItem value={PropertyType.COOP}>Co-op</SelectItem>
              <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
              <SelectItem value={PropertyType.LAND}>Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Address Section */}
        <div className="mt-4">
          <h4 className="text-md font-medium mb-3">Property Address</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`property-street-${property.id}`}>
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`property-street-${property.id}`}
                value={property.address.street}
                onChange={(e) => handleChange("address", {
                  ...property.address,
                  street: e.target.value
                })}
                placeholder="123 Main St"
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`property-city-${property.id}`}>
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`property-city-${property.id}`}
                value={property.address.city}
                onChange={(e) => handleChange("address", {
                  ...property.address,
                  city: e.target.value
                })}
                placeholder="New York"
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`property-state-${property.id}`}>
                State <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`property-state-${property.id}`}
                value={property.address.state}
                onChange={(e) => handleChange("address", {
                  ...property.address,
                  state: e.target.value
                })}
                placeholder="NY"
                maxLength={2}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`property-zip-${property.id}`}>
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`property-zip-${property.id}`}
                value={property.address.zip}
                onChange={(e) => handleChange("address", {
                  ...property.address,
                  zip: e.target.value
                })}
                placeholder="10001"
                maxLength={10}
                aria-required="true"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Financial Details</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`market-value-${property.id}`}>
                Market Value <span className="text-destructive">*</span>
              </Label>
              <MoneyInput
                id={`market-value-${property.id}`}
                value={property.marketValue}
                onChange={(value) => handleChange("marketValue", value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`mortgage-balance-${property.id}`}>
                Mortgage Balance <span className="text-destructive">*</span>
              </Label>
              <MoneyInput
                id={`mortgage-balance-${property.id}`}
                value={property.mortgageBalance}
                onChange={(value) => handleChange("mortgageBalance", value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`monthly-mortgage-${property.id}`}>
                Monthly Mortgage Payment <span className="text-destructive">*</span>
              </Label>
              <MoneyInput
                id={`monthly-mortgage-${property.id}`}
                value={property.monthlyMortgagePayment}
                onChange={(value) => handleChange("monthlyMortgagePayment", value)}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`monthly-hoa-${property.id}`}>
                Monthly Maintenance/HOA
              </Label>
              <MoneyInput
                id={`monthly-hoa-${property.id}`}
                value={property.monthlyMaintenanceHOA}
                onChange={(value) => handleChange("monthlyMaintenanceHOA", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`monthly-taxes-${property.id}`}>
                Monthly Real Estate Taxes
              </Label>
              <MoneyInput
                id={`monthly-taxes-${property.id}`}
                value={property.monthlyRealEstateTaxes}
                onChange={(value) => handleChange("monthlyRealEstateTaxes", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`monthly-insurance-${property.id}`}>
                Monthly Insurance
              </Label>
              <MoneyInput
                id={`monthly-insurance-${property.id}`}
                value={property.monthlyInsurance}
                onChange={(value) => handleChange("monthlyInsurance", value)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
