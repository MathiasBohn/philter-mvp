"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionType, Building } from "@/lib/types"
import { mockBuildings } from "@/lib/mock-data"
import { Loader2, CheckCircle2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateBuildingModal } from "@/components/features/broker/create-building-modal"
import { Separator } from "@/components/ui/separator"

export default function BrokerNewApplicationPage() {
  const router = useRouter()

  // Load buildings from mock data and localStorage using lazy initialization
  const [buildings, setBuildings] = useState<Building[]>(() => {
    const customBuildings = JSON.parse(localStorage.getItem('custom_buildings') || '[]')
    return [...mockBuildings, ...customBuildings]
  })

  const [buildingId, setBuildingId] = useState("")
  const [unit, setUnit] = useState("")
  const [transactionType, setTransactionType] = useState<TransactionType | "">("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantName, setApplicantName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false)
  const [createdApplicationId, setCreatedApplicationId] = useState("")

  const handleBuildingChange = (value: string) => {
    if (value === "create-new") {
      setShowCreateBuildingModal(true)
    } else {
      setBuildingId(value)
    }
  }

  const handleSaveBuilding = (newBuilding: Building) => {
    // Add new building to list
    setBuildings(prev => [...prev, newBuilding])
    // Select the new building
    setBuildingId(newBuilding.id)
    // Close modal
    setShowCreateBuildingModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a new application ID
    const newApplicationId = `app_${Date.now()}`

    // Store application data in localStorage (mock persistence)
    const selectedBuilding = buildings.find(b => b.id === buildingId)
    const applicationData = {
      id: newApplicationId,
      buildingCode: selectedBuilding?.code || buildingId,
      buildingId,
      unit,
      transactionType,
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString(),
      createdBy: "broker-user-id",
      applicantEmail,
      applicantName,
      sections: {
        profile: { complete: false },
        income: { complete: false },
        financials: { complete: false },
        documents: { complete: false },
        disclosures: { complete: false },
      },
    }

    localStorage.setItem(`application_${newApplicationId}`, JSON.stringify(applicationData))

    setCreatedApplicationId(newApplicationId)
    setIsLoading(false)
    setShowSuccessDialog(true)
  }

  const handleContinue = () => {
    router.push(`/broker/${createdApplicationId}/qa`)
  }

  const handleViewPipeline = () => {
    router.push(`/broker`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Application</h1>
        <p className="mt-2 text-muted-foreground">
          Set up a new application and invite the applicant to complete their information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Select the building and unit for this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="building">Building</Label>
              <Select value={buildingId} onValueChange={handleBuildingChange} required>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name} - {building.code}
                    </SelectItem>
                  ))}
                  <Separator className="my-2" />
                  <SelectItem value="create-new" className="font-semibold text-primary">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Building
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit Number</Label>
              <Input
                id="unit"
                placeholder="e.g., 12A"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select value={transactionType} onValueChange={(value) => setTransactionType(value as TransactionType)} required>
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionType.COOP_PURCHASE}>Co-op Purchase</SelectItem>
                  <SelectItem value={TransactionType.CONDO_PURCHASE}>Condo Purchase</SelectItem>
                  <SelectItem value={TransactionType.COOP_SUBLET}>Co-op Sublet</SelectItem>
                  <SelectItem value={TransactionType.CONDO_LEASE}>Condo Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Applicant Information</CardTitle>
            <CardDescription>
              Enter the applicant&apos;s details. They will receive an invitation to complete the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicantName">Applicant Name</Label>
              <Input
                id="applicantName"
                placeholder="John Doe"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicantEmail">Applicant Email</Label>
              <Input
                id="applicantEmail"
                type="email"
                placeholder="applicant@example.com"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                An invitation will be sent to this email address with a link to complete the application.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/broker')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Application & Send Invitation
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Application Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              An invitation has been sent to <strong>{applicantEmail}</strong> to complete their application information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <Button onClick={handleContinue} className="w-full">
              Go to Application Workspace
            </Button>
            <Button onClick={handleViewPipeline} variant="outline" className="w-full">
              Back to Pipeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Building Modal */}
      <CreateBuildingModal
        open={showCreateBuildingModal}
        onClose={() => setShowCreateBuildingModal(false)}
        onSave={handleSaveBuilding}
      />
    </div>
  )
}
