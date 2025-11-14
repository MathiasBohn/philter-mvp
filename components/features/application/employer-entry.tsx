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
import { DateInput } from "@/components/forms/date-input"
import { PayCadence, type EmploymentRecord } from "@/lib/types"

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
            <DateInput
              id={`start-date-${employer.id}`}
              value={employer.startDate}
              onChange={(date) => handleChange("startDate", date)}
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
        </div>
      </div>
    </Card>
  )
}
