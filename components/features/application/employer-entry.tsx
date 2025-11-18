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
import { MonthYearInput } from "@/components/forms/month-year-input"
import { StateSelect } from "@/components/ui/state-select"
import { PayCadence, EmploymentStatus, type EmploymentRecord } from "@/lib/types"

interface EmployerEntryProps {
  employer: EmploymentRecord
  onUpdate: (employer: EmploymentRecord) => void
  onRemove: () => void
  showRemove?: boolean
  errors?: Record<string, string>
}

export function EmployerEntry({
  employer,
  onUpdate,
  onRemove,
  showRemove = true,
  errors = {},
}: EmployerEntryProps) {
  const handleChange = (field: keyof EmploymentRecord, value: unknown) => {
    onUpdate({
      ...employer,
      [field]: value,
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">Employment Details</h3>
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove employer</span>
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`employer-name-${employer.id}`}>
              Employer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`employer-name-${employer.id}`}
              value={employer.employer}
              onChange={(e) => handleChange("employer", e.target.value)}
              placeholder="Company Name"
              aria-required="true"
              aria-invalid={errors.employer ? "true" : "false"}
              aria-describedby={errors.employer ? `employer-error-${employer.id}` : undefined}
            />
            {errors.employer && (
              <p
                id={`employer-error-${employer.id}`}
                className="text-sm text-destructive"
              >
                {errors.employer}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`job-title-${employer.id}`}>
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`job-title-${employer.id}`}
              value={employer.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Your position"
              aria-required="true"
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? `title-error-${employer.id}` : undefined}
            />
            {errors.title && (
              <p
                id={`title-error-${employer.id}`}
                className="text-sm text-destructive"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`start-date-${employer.id}`}>
              Start Date <span className="text-destructive">*</span>
            </Label>
            <MonthYearInput
              id={`start-date-${employer.id}`}
              value={employer.startDate}
              onChange={(date) => handleChange("startDate", date || new Date())}
              placeholder="MM/YYYY"
              required
              aria-required="true"
              aria-invalid={errors.startDate ? "true" : "false"}
              aria-describedby={errors.startDate ? `start-date-error-${employer.id}` : undefined}
            />
            {errors.startDate && (
              <p
                id={`start-date-error-${employer.id}`}
                className="text-sm text-destructive"
              >
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`pay-cadence-${employer.id}`}>
              Pay Cadence <span className="text-destructive">*</span>
            </Label>
            <Select
              value={employer.payCadence}
              onValueChange={(value) => handleChange("payCadence", value as PayCadence)}
            >
              <SelectTrigger
                id={`pay-cadence-${employer.id}`}
                aria-required="true"
                aria-invalid={errors.payCadence ? "true" : "false"}
                aria-describedby={errors.payCadence ? `pay-cadence-error-${employer.id}` : undefined}
              >
                <SelectValue placeholder="Select pay frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PayCadence.ANNUAL}>Annual</SelectItem>
                <SelectItem value={PayCadence.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={PayCadence.BIWEEKLY}>Bi-weekly</SelectItem>
                <SelectItem value={PayCadence.WEEKLY}>Weekly</SelectItem>
              </SelectContent>
            </Select>
            {errors.payCadence && (
              <p
                id={`pay-cadence-error-${employer.id}`}
                className="text-sm text-destructive"
              >
                {errors.payCadence}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`annual-income-${employer.id}`}>
              Annual Income <span className="text-destructive">*</span>
            </Label>
            <MoneyInput
              id={`annual-income-${employer.id}`}
              value={employer.annualIncome}
              onChange={(value) => handleChange("annualIncome", value)}
              aria-required="true"
              aria-invalid={errors.annualIncome ? "true" : "false"}
              aria-describedby={errors.annualIncome ? `annual-income-error-${employer.id}` : undefined}
            />
            {errors.annualIncome && (
              <p
                id={`annual-income-error-${employer.id}`}
                className="text-sm text-destructive"
              >
                {errors.annualIncome}
              </p>
            )}
          </div>

          {/* Phase 2: Employment Status */}
          <div className="space-y-2">
            <Label htmlFor={`employment-status-${employer.id}`}>Employment Status</Label>
            <Select
              value={employer.employmentStatus}
              onValueChange={(value) => handleChange("employmentStatus", value as EmploymentStatus)}
            >
              <SelectTrigger id={`employment-status-${employer.id}`}>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EmploymentStatus.FULL_TIME}>Full-time</SelectItem>
                <SelectItem value={EmploymentStatus.PART_TIME}>Part-time</SelectItem>
                <SelectItem value={EmploymentStatus.UNEMPLOYED}>Unemployed</SelectItem>
                <SelectItem value={EmploymentStatus.RETIRED}>Retired</SelectItem>
                <SelectItem value={EmploymentStatus.STUDENT}>Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phase 2: Self-Employed Toggle */}
          <div className="space-y-2 flex items-center">
            <input
              type="checkbox"
              id={`self-employed-${employer.id}`}
              checked={employer.isSelfEmployed || false}
              onChange={(e) => handleChange("isSelfEmployed", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor={`self-employed-${employer.id}`} className="ml-2 cursor-pointer">
              Self-employed
            </Label>
          </div>

          {/* Phase 2: Nature of Business (if self-employed) */}
          {employer.isSelfEmployed && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`nature-of-business-${employer.id}`}>Nature of Business</Label>
              <Input
                id={`nature-of-business-${employer.id}`}
                value={employer.natureOfBusiness || ""}
                onChange={(e) => handleChange("natureOfBusiness", e.target.value)}
                placeholder="Describe the nature of your business"
              />
            </div>
          )}

          {/* Phase 2: Years in Line of Work */}
          <div className="space-y-2">
            <Label htmlFor={`years-in-work-${employer.id}`}>Years in This Line of Work</Label>
            <Input
              type="number"
              id={`years-in-work-${employer.id}`}
              value={employer.yearsInLineOfWork || ""}
              onChange={(e) => handleChange("yearsInLineOfWork", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {/* Phase 2: Employer Address Section */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Employer Address</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`employer-street-${employer.id}`}>Street Address</Label>
              <Input
                id={`employer-street-${employer.id}`}
                value={employer.employerAddress?.street || ""}
                onChange={(e) => handleChange("employerAddress", {
                  ...(employer.employerAddress || { city: "", state: "", zip: "" }),
                  street: e.target.value
                })}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`employer-city-${employer.id}`}>City</Label>
              <Input
                id={`employer-city-${employer.id}`}
                value={employer.employerAddress?.city || ""}
                onChange={(e) => handleChange("employerAddress", {
                  ...(employer.employerAddress || { street: "", state: "", zip: "" }),
                  city: e.target.value
                })}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`employer-state-${employer.id}`}>State</Label>
              <StateSelect
                id={`employer-state-${employer.id}`}
                value={employer.employerAddress?.state || ""}
                onChange={(value) => handleChange("employerAddress", {
                  ...(employer.employerAddress || { street: "", city: "", zip: "" }),
                  state: value
                })}
                placeholder="Select State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`employer-zip-${employer.id}`}>ZIP Code</Label>
              <Input
                id={`employer-zip-${employer.id}`}
                value={employer.employerAddress?.zip || ""}
                onChange={(e) => handleChange("employerAddress", {
                  ...(employer.employerAddress || { street: "", city: "", state: "" }),
                  zip: e.target.value
                })}
                placeholder="10001"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Phase 2: Supervisor Information */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Supervisor Information</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`supervisor-name-${employer.id}`}>Supervisor Name</Label>
              <Input
                id={`supervisor-name-${employer.id}`}
                value={employer.supervisorName || ""}
                onChange={(e) => handleChange("supervisorName", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`supervisor-phone-${employer.id}`}>Supervisor Phone</Label>
              <Input
                id={`supervisor-phone-${employer.id}`}
                type="tel"
                value={employer.supervisorPhone || ""}
                onChange={(e) => handleChange("supervisorPhone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
        </div>

        {/* Phase 2: Income Estimates */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Income Estimates</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`income-this-year-${employer.id}`}>Estimated Income This Year</Label>
              <MoneyInput
                id={`income-this-year-${employer.id}`}
                value={employer.incomeEstimateThisYear || 0}
                onChange={(value) => handleChange("incomeEstimateThisYear", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`income-last-year-${employer.id}`}>Actual Income Last Year</Label>
              <MoneyInput
                id={`income-last-year-${employer.id}`}
                value={employer.actualIncomeLastYear || 0}
                onChange={(value) => handleChange("actualIncomeLastYear", value)}
              />
            </div>
          </div>
        </div>

        {/* Phase 2: Dividend/Partnership Income (for family business principals) */}
        {employer.isSelfEmployed && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Dividend/Partnership Income (Past 3 Years)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you are a principal in a family business, provide dividend or partnership income for the past 3 years
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`dividend-year1-${employer.id}`}>Year 1</Label>
                <MoneyInput
                  id={`dividend-year1-${employer.id}`}
                  value={employer.dividendPartnershipIncome?.year1 || 0}
                  onChange={(value) => handleChange("dividendPartnershipIncome", {
                    ...(employer.dividendPartnershipIncome || { year2: 0, year3: 0 }),
                    year1: value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dividend-year2-${employer.id}`}>Year 2</Label>
                <MoneyInput
                  id={`dividend-year2-${employer.id}`}
                  value={employer.dividendPartnershipIncome?.year2 || 0}
                  onChange={(value) => handleChange("dividendPartnershipIncome", {
                    ...(employer.dividendPartnershipIncome || { year1: 0, year3: 0 }),
                    year2: value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dividend-year3-${employer.id}`}>Year 3</Label>
                <MoneyInput
                  id={`dividend-year3-${employer.id}`}
                  value={employer.dividendPartnershipIncome?.year3 || 0}
                  onChange={(value) => handleChange("dividendPartnershipIncome", {
                    ...(employer.dividendPartnershipIncome || { year1: 0, year2: 0 }),
                    year3: value
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Previous Employer Section */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-medium mb-3">Previous Employer (if applicable)</h4>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`prev-employer-name-${employer.id}`}>Previous Employer Name</Label>
                <Input
                  id={`prev-employer-name-${employer.id}`}
                  value={employer.previousEmployer?.name || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      address: { street: "", city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    name: e.target.value
                  })}
                  placeholder="Previous Company Name"
                />
              </div>

              {/* Previous Employer Address */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`prev-employer-street-${employer.id}`}>Street Address</Label>
                <Input
                  id={`prev-employer-street-${employer.id}`}
                  value={employer.previousEmployer?.address?.street || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    address: {
                      ...(employer.previousEmployer?.address || { city: "", state: "", zip: "" }),
                      street: e.target.value
                    }
                  })}
                  placeholder="456 Oak Ave"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prev-employer-city-${employer.id}`}>City</Label>
                <Input
                  id={`prev-employer-city-${employer.id}`}
                  value={employer.previousEmployer?.address?.city || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    address: {
                      ...(employer.previousEmployer?.address || { street: "", state: "", zip: "" }),
                      city: e.target.value
                    }
                  })}
                  placeholder="Brooklyn"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prev-employer-state-${employer.id}`}>State</Label>
                <StateSelect
                  id={`prev-employer-state-${employer.id}`}
                  value={employer.previousEmployer?.address?.state || ""}
                  onChange={(value) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    address: {
                      ...(employer.previousEmployer?.address || { street: "", city: "", zip: "" }),
                      state: value
                    }
                  })}
                  placeholder="Select State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prev-employer-zip-${employer.id}`}>ZIP Code</Label>
                <Input
                  id={`prev-employer-zip-${employer.id}`}
                  value={employer.previousEmployer?.address?.zip || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    address: {
                      ...(employer.previousEmployer?.address || { street: "", city: "", state: "" }),
                      zip: e.target.value
                    }
                  })}
                  placeholder="11201"
                  maxLength={10}
                />
              </div>

              {/* Employment Dates */}
              <div className="space-y-2">
                <Label htmlFor={`prev-employed-from-${employer.id}`}>Employed From</Label>
                <MonthYearInput
                  id={`prev-employed-from-${employer.id}`}
                  value={employer.previousEmployer?.employedFrom || new Date()}
                  onChange={(date) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "", zip: "" },
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    employedFrom: date || new Date()
                  })}
                  placeholder="MM/YYYY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prev-employed-to-${employer.id}`}>Employed To</Label>
                <MonthYearInput
                  id={`prev-employed-to-${employer.id}`}
                  value={employer.previousEmployer?.employedTo || new Date()}
                  onChange={(date) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      annualSalary: 0,
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    employedTo: date || new Date()
                  })}
                  placeholder="MM/YYYY"
                />
              </div>

              {/* Previous Annual Salary */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`prev-annual-salary-${employer.id}`}>Previous Annual Salary</Label>
                <MoneyInput
                  id={`prev-annual-salary-${employer.id}`}
                  value={employer.previousEmployer?.annualSalary || 0}
                  onChange={(value) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      supervisorName: "",
                      supervisorPhone: ""
                    }),
                    annualSalary: value
                  })}
                />
              </div>

              {/* Previous Supervisor Info */}
              <div className="space-y-2">
                <Label htmlFor={`prev-supervisor-name-${employer.id}`}>Previous Supervisor Name</Label>
                <Input
                  id={`prev-supervisor-name-${employer.id}`}
                  value={employer.previousEmployer?.supervisorName || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorPhone: ""
                    }),
                    supervisorName: e.target.value
                  })}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prev-supervisor-phone-${employer.id}`}>Previous Supervisor Phone</Label>
                <Input
                  id={`prev-supervisor-phone-${employer.id}`}
                  type="tel"
                  value={employer.previousEmployer?.supervisorPhone || ""}
                  onChange={(e) => handleChange("previousEmployer", {
                    ...(employer.previousEmployer || {
                      name: "",
                      address: { street: "", city: "", state: "", zip: "" },
                      employedFrom: new Date(),
                      employedTo: new Date(),
                      annualSalary: 0,
                      supervisorName: ""
                    }),
                    supervisorPhone: e.target.value
                  })}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
