"use client"

import { useState } from "react"
import { Download, Upload, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DisclosureType } from "@/lib/types"
import type { UploadedFile } from "./upload-dropzone"

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
}

interface DisclosureCardProps {
  disclosure: Disclosure
  onAcknowledge: (acknowledged: boolean) => void
  onDocumentUpload?: (file: File) => void
  onDocumentRemove?: () => void
  onFloodOptionsChange?: (options: string[]) => void
  onSignatureChange?: (signature: string) => void
}

export function DisclosureCard({
  disclosure,
  onAcknowledge,
  onDocumentUpload,
  onDocumentRemove,
  onFloodOptionsChange,
  onSignatureChange,
}: DisclosureCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [signature, setSignature] = useState<string>(disclosure.signature || "")

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

        {disclosure.requiresUpload && (
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
                    {file?.name || disclosure.signedDocument?.file.name}
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
