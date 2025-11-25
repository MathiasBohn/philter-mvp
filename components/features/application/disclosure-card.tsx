"use client"

import { useState } from "react"
import { Download, Upload, FileText, Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DisclosureType, PetType } from "@/lib/types"
import type { UploadedFile } from "./upload-dropzone"

export interface Pet {
  id: string
  type: PetType
  breed: string
  weight: number
}

export interface Disclosure {
  id: string
  type: DisclosureType
  title: string
  description: string
  pdfUrl: string
  acknowledged: boolean
  signedDocument?: UploadedFile
  requiresUpload: boolean
  // Flood disclosure specific fields
  floodOptions?: string[] // Selected flood zone options
  signature?: string // Digital signature
  requiresSignature?: boolean // Whether this disclosure needs a signature
  // House rules specific fields
  houseRulesUrl?: string // Link to building house rules
  // Consumer report authorization specific fields
  consumerReportData?: {
    firstName?: string
    middleName?: string
    lastName?: string
    ssn?: string
    dob?: Date
    address?: {
      street: string
      unit?: string
      city: string
      state: string
      zip: string
    }
  }
  // Pet acknowledgement specific fields
  hasPets?: boolean
  pets?: Pet[]
  // Insurance requirements specific fields
  insurancePartnerUrl?: string // Link to insurance partner
  minimumCoverage?: number // Minimum coverage amount from building template
  requiredInclusions?: string[] // Required policy inclusions
  proofOfInsuranceUploaded?: boolean // Optional proof of insurance upload
}

interface DisclosureCardProps {
  disclosure: Disclosure
  onAcknowledge: (acknowledged: boolean) => void
  onDocumentUpload?: (file: File) => void
  onDocumentRemove?: () => void
  onFloodOptionsChange?: (options: string[]) => void
  onSignatureChange?: (signature: string) => void
  onPetDataChange?: (hasPets: boolean, pets?: Pet[]) => void
}

export function DisclosureCard({
  disclosure,
  onAcknowledge,
  onDocumentUpload,
  onDocumentRemove,
  onFloodOptionsChange,
  onSignatureChange,
  onPetDataChange,
}: DisclosureCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [signature, setSignature] = useState<string>(disclosure.signature || "")
  const [hasPets, setHasPets] = useState<boolean>(disclosure.hasPets || false)
  const [pets, setPets] = useState<Pet[]>(disclosure.pets || [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && onDocumentUpload) {
      setFile(selectedFile)
      onDocumentUpload(selectedFile)
    }
  }

  const handleRemove = () => {
    setFile(null)
    if (onDocumentRemove) {
      onDocumentRemove()
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{disclosure.title}</h3>
              {disclosure.requiresUpload && (
                <Badge variant="outline" className="text-xs">
                  Signature Required
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {disclosure.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(disclosure.pdfUrl, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Disclosure
          </Button>
          {disclosure.houseRulesUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(disclosure.houseRulesUrl, "_blank")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View House Rules
            </Button>
          )}
        </div>

        {disclosure.type === DisclosureType.CONSUMER_REPORT_AUTH && disclosure.consumerReportData && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Pre-Populated Information</p>
            <p className="text-xs text-muted-foreground">
              The following information has been automatically populated from your profile:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">First Name</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.firstName || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Middle Name</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.middleName || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Name</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.lastName || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Social Security Number</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.ssn ? `***-**-${disclosure.consumerReportData.ssn.slice(-4)}` : "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.dob
                    ? new Date(disclosure.consumerReportData.dob).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Current Address</Label>
                <p className="mt-1 text-sm font-medium">
                  {disclosure.consumerReportData.address
                    ? `${disclosure.consumerReportData.address.street}${disclosure.consumerReportData.address.unit ? `, ${disclosure.consumerReportData.address.unit}` : ""}, ${disclosure.consumerReportData.address.city}, ${disclosure.consumerReportData.address.state} ${disclosure.consumerReportData.address.zip}`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Consumer Report Authorization</p>
              <div className="rounded-md bg-background p-4 text-xs leading-relaxed">
                <p className="mb-3">
                  I authorize the building management company, board of directors, and their
                  designated agents to obtain consumer reports and/or investigative consumer
                  reports about me from consumer reporting agencies and other information sources.
                </p>
                <p className="mb-3">
                  I understand that such reports may include, but are not limited to, information
                  concerning my character, general reputation, personal characteristics, mode of
                  living, credit standing, credit capacity, criminal history, and employment history.
                </p>
                <p className="mb-3">
                  I understand that I have the right to request disclosure of the nature and scope
                  of any investigative consumer report and that I may request a copy of any consumer
                  report obtained about me.
                </p>
                <p className="mb-3">
                  I authorize all persons, schools, companies, corporations, credit bureaus, law
                  enforcement agencies, and other organizations to release information they may have
                  about me to the building management, board, and their designated agents.
                </p>
                <p className="font-medium">
                  By signing below, I certify that I am at least 18 years of age and that all
                  information provided is true and accurate.
                </p>
              </div>
            </div>

            <div className="pt-3">
              <Label htmlFor={`${disclosure.id}-signature`} className="text-sm font-medium">
                Digital Signature <span className="text-destructive">*</span>
              </Label>
              <input
                id={`${disclosure.id}-signature`}
                type="text"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value)
                  if (onSignatureChange) {
                    onSignatureChange(e.target.value)
                  }
                }}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                By typing your name, you are providing your legal authorization for this consumer report.
              </p>
            </div>
          </div>
        )}

        {disclosure.type === DisclosureType.FLOOD_DISCLOSURE && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Flood Zone Information</p>
            <p className="text-xs text-muted-foreground">
              Please check all that apply to the property:
            </p>
            <div className="space-y-3">
              {[
                "Any/all of premises located wholly or partially in FEMA floodplain",
                "Any/all of premises located wholly or partially in SFHA (100-year floodplain)",
                "Any/all of premises located wholly or partially in Moderate Risk Flood Hazard Area (500-year floodplain)",
                "Premises has experienced flood damage due to natural flood event",
                "None of the above",
              ].map((option) => {
                const isNoneOption = option === "None of the above"
                const currentOptions = disclosure.floodOptions || []
                const isChecked = currentOptions.includes(option)

                return (
                  <div key={option} className="flex items-start space-x-3">
                    <Checkbox
                      id={`${disclosure.id}-${option}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (!onFloodOptionsChange) return

                        let newOptions: string[]
                        if (isNoneOption && checked) {
                          // If "None of the above" is checked, clear all other options
                          newOptions = [option]
                        } else if (checked) {
                          // If any other option is checked, remove "None of the above" and add this option
                          newOptions = [
                            ...currentOptions.filter((o) => o !== "None of the above"),
                            option,
                          ]
                        } else {
                          // Uncheck this option
                          newOptions = currentOptions.filter((o) => o !== option)
                        }
                        onFloodOptionsChange(newOptions)
                      }}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`${disclosure.id}-${option}`}
                      className="cursor-pointer text-sm font-normal leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </Label>
                  </div>
                )
              })}
            </div>
            <div className="pt-3">
              <Label htmlFor={`${disclosure.id}-signature`} className="text-sm font-medium">
                Digital Signature <span className="text-destructive">*</span>
              </Label>
              <input
                id={`${disclosure.id}-signature`}
                type="text"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value)
                  if (onSignatureChange) {
                    onSignatureChange(e.target.value)
                  }
                }}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                By typing your name, you are electronically signing this disclosure.
              </p>
            </div>
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/30">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Notice:</strong> Flood insurance may be available from the National Flood
                Insurance Program or private insurers. For more information, visit FloodSmart.gov
                or contact your insurance agent.
              </p>
            </div>
          </div>
        )}

        {disclosure.type === DisclosureType.PET_ACKNOWLEDGEMENT && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Pet Information</p>

            <div className="flex items-center space-x-3">
              <Checkbox
                id={`${disclosure.id}-has-pets`}
                checked={hasPets}
                onCheckedChange={(checked) => {
                  const newHasPets = checked as boolean
                  setHasPets(newHasPets)
                  if (!newHasPets) {
                    setPets([])
                    onPetDataChange?.(newHasPets, [])
                  } else {
                    onPetDataChange?.(newHasPets, pets)
                  }
                }}
              />
              <Label htmlFor={`${disclosure.id}-has-pets`} className="text-sm cursor-pointer">
                Do you have pets? <span className="text-destructive">*</span>
              </Label>
            </div>

            {hasPets && (
              <div className="space-y-4 pt-2">
                {pets.map((pet, index) => (
                  <div key={pet.id} className="rounded-md border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Pet {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPets = pets.filter((_, i) => i !== index)
                          setPets(newPets)
                          onPetDataChange?.(hasPets, newPets)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Type <span className="text-destructive">*</span></Label>
                        <Select
                          value={pet.type}
                          onValueChange={(value) => {
                            const newPets = [...pets]
                            newPets[index] = { ...pet, type: value as PetType }
                            setPets(newPets)
                            onPetDataChange?.(hasPets, newPets)
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PetType.DOG}>Dog</SelectItem>
                            <SelectItem value={PetType.CAT}>Cat</SelectItem>
                            <SelectItem value={PetType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Breed <span className="text-destructive">*</span></Label>
                        <Input
                          className="mt-1"
                          value={pet.breed}
                          onChange={(e) => {
                            const newPets = [...pets]
                            newPets[index] = { ...pet, breed: e.target.value }
                            setPets(newPets)
                            onPetDataChange?.(hasPets, newPets)
                          }}
                          placeholder="e.g., Golden Retriever"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight (lbs) <span className="text-destructive">*</span></Label>
                        <Input
                          className="mt-1"
                          type="number"
                          value={pet.weight || ""}
                          onChange={(e) => {
                            const newPets = [...pets]
                            newPets[index] = { ...pet, weight: parseFloat(e.target.value) || 0 }
                            setPets(newPets)
                            onPetDataChange?.(hasPets, newPets)
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPet: Pet = {
                      id: Math.random().toString(36).substring(7),
                      type: PetType.DOG,
                      breed: "",
                      weight: 0,
                    }
                    const newPets = [...pets, newPet]
                    setPets(newPets)
                    onPetDataChange?.(hasPets, newPets)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Pet
                </Button>

                <div className="pt-3 border-t">
                  <Label htmlFor={`${disclosure.id}-signature`} className="text-sm font-medium">
                    Digital Signature <span className="text-destructive">*</span>
                  </Label>
                  <input
                    id={`${disclosure.id}-signature`}
                    type="text"
                    placeholder="Type your full name to sign"
                    value={signature}
                    onChange={(e) => {
                      setSignature(e.target.value)
                      onSignatureChange?.(e.target.value)
                    }}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    By typing your name, you acknowledge the pet information provided is accurate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {(disclosure.type === DisclosureType.SMOKE_DETECTOR || disclosure.type === DisclosureType.CARBON_MONOXIDE_DETECTOR) && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              {disclosure.type === DisclosureType.SMOKE_DETECTOR ? "Smoke Detector" : "Carbon Monoxide Detector"} Acknowledgement
            </p>
            <div className="rounded-md bg-background p-4 text-xs leading-relaxed">
              <p className="mb-3">
                {disclosure.type === DisclosureType.SMOKE_DETECTOR ? (
                  <>
                    New York City law requires that all residential units be equipped with working smoke detectors.
                    As a tenant/resident, you are responsible for:
                  </>
                ) : (
                  <>
                    New York City law requires that all residential units be equipped with working carbon monoxide detectors.
                    As a tenant/resident, you are responsible for:
                  </>
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li>Testing the {disclosure.type === DisclosureType.SMOKE_DETECTOR ? "smoke" : "carbon monoxide"} detector(s) regularly</li>
                <li>Replacing batteries as needed (if battery-operated)</li>
                <li>Notifying building management immediately if the detector is not functioning properly</li>
                <li>Not removing, disconnecting, or tampering with the detector(s)</li>
              </ul>
              <p className="font-medium">
                Failure to maintain working {disclosure.type === DisclosureType.SMOKE_DETECTOR ? "smoke" : "carbon monoxide"} detectors
                may result in fines and poses serious safety risks.
              </p>
            </div>

            <div className="pt-3">
              <Label htmlFor={`${disclosure.id}-signature`} className="text-sm font-medium">
                Digital Signature <span className="text-destructive">*</span>
              </Label>
              <input
                id={`${disclosure.id}-signature`}
                type="text"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value)
                  onSignatureChange?.(e.target.value)
                }}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                By typing your name, you acknowledge your responsibilities for {disclosure.type === DisclosureType.SMOKE_DETECTOR ? "smoke" : "carbon monoxide"} detector maintenance.
              </p>
            </div>
          </div>
        )}

        {disclosure.type === DisclosureType.INSURANCE_REQUIREMENTS && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Renter&apos;s Insurance Requirements</p>
            <div className="rounded-md bg-background p-4 text-xs leading-relaxed space-y-3">
              <p>
                <strong>Important:</strong> The building requires all residents to obtain and maintain
                renter&apos;s insurance throughout the lease term. This insurance protects both you and the
                building from potential losses due to fire, theft, water damage, and other covered events.
              </p>

              {disclosure.minimumCoverage && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Minimum Coverage Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Minimum liability coverage: ${disclosure.minimumCoverage.toLocaleString()}
                    </li>
                    {disclosure.requiredInclusions && disclosure.requiredInclusions.length > 0 && (
                      <>
                        {disclosure.requiredInclusions.map((inclusion, idx) => (
                          <li key={idx}>{inclusion}</li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>
              )}

              {disclosure.insurancePartnerUrl && (
                <div className="border-t pt-3">
                  <p className="mb-2">
                    <strong>Preferred Insurance Partner:</strong>
                  </p>
                  <p>
                    We have partnered with a recommended insurance provider to make it easy for you to
                    obtain the required coverage at competitive rates.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => window.open(disclosure.insurancePartnerUrl, "_blank")}
                  >
                    Get a quote from our partner →
                  </Button>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="font-medium">
                  <strong>Important Notice:</strong>
                </p>
                <p className="mt-2">
                  You must provide proof of insurance before your move-in date. The policy must name
                  the building and property management as additional insured parties. Failure to maintain
                  continuous coverage may result in lease violation and potential eviction.
                </p>
              </div>
            </div>

            {/* Optional proof of insurance upload */}
            <div className="pt-3 border-t">
              <Label className="text-sm font-medium">
                Proof of Insurance (Optional - can be uploaded later)
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                If you already have proof of insurance, you can upload it now. Otherwise, you must
                provide it before your move-in date.
              </p>

              {!file && !disclosure.signedDocument && (
                <div>
                  <input
                    type="file"
                    id={`upload-insurance-${disclosure.id}`}
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor={`upload-insurance-${disclosure.id}`}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Proof of Insurance
                  </Label>
                </div>
              )}

              {(file || disclosure.signedDocument) && (
                <div className="flex items-center justify-between rounded-md border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {file?.name || disclosure.signedDocument?.file?.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {disclosure.requiresUpload && disclosure.type !== DisclosureType.INSURANCE_REQUIREMENTS && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Signed Document Upload</p>
            <p className="text-xs text-muted-foreground">
              After reviewing, please sign and upload the disclosure form.
            </p>

            {!file && !disclosure.signedDocument && (
              <div>
                <input
                  type="file"
                  id={`upload-${disclosure.id}`}
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <Label
                  htmlFor={`upload-${disclosure.id}`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Upload Signed Form
                </Label>
              </div>
            )}

            {(file || disclosure.signedDocument) && (
              <div className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {file?.name || disclosure.signedDocument?.file?.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start space-x-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Checkbox
            id={`acknowledge-${disclosure.id}`}
            checked={disclosure.acknowledged}
            onCheckedChange={onAcknowledge}
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              htmlFor={`acknowledge-${disclosure.id}`}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I acknowledge that I have read and understood this disclosure
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              You must acknowledge this disclosure before submitting your application.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
