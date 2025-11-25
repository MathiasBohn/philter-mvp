"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionType, Building, Application } from "@/lib/types"
import { mockBuildings } from "@/lib/mock-data"
import { Loader2, CheckCircle2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateBuildingModal } from "@/components/features/broker/create-building-modal"
import { Separator } from "@/components/ui/separator"
import { useCreateApplication } from "@/lib/hooks/use-applications"

// TODO: Replace with API call when buildings backend is ready
const CUSTOM_BUILDINGS_KEY = 'philter_custom_buildings'

export default function BrokerNewApplicationPage() {
  const router = useRouter()

  // Load custom buildings from localStorage (temporary until buildings API is ready)
  const [customBuildings, setCustomBuildings] = useState<Building[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CUSTOM_BUILDINGS_KEY)
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // Merge mock buildings with custom buildings using useMemo
  const buildings = useMemo(() => {
    return [...mockBuildings, ...customBuildings]
  }, [customBuildings])

  const [buildingId, setBuildingId] = useState("")
  const [unit, setUnit] = useState("")
  const [transactionType, setTransactionType] = useState<TransactionType | "">("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantName, setApplicantName] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false)
  const [createdApplicationId, setCreatedApplicationId] = useState("")

  const createApplication = useCreateApplication()

  const handleBuildingChange = (value: string) => {
    if (value === "create-new") {
      setShowCreateBuildingModal(true)
    } else {
      setBuildingId(value)
    }
  }

  const handleSaveBuilding = (newBuilding: Building) => {
    // Add new building to custom buildings list
    const updatedBuildings = [...customBuildings, newBuilding]
    setCustomBuildings(updatedBuildings)

    // Persist to localStorage (TODO: Replace with API call when buildings backend is ready)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_BUILDINGS_KEY, JSON.stringify(updatedBuildings))
    }

    // Select the new building
    setBuildingId(newBuilding.id)
    // Close modal
    setShowCreateBuildingModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Create a new application via API
      const newApplication = await createApplication.mutateAsync({
        buildingId,
        unit,
        transactionType: transactionType || undefined,
        primaryApplicantEmail: applicantEmail,
        // Note: primaryApplicantName is not a valid property on Application type
        // Name will be set when the applicant completes their profile
      } as Partial<Application>)

      setCreatedApplicationId(newApplication.id)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error('Failed to create application:', error)
      // Error toast is already handled by the mutation
    }
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
            disabled={createApplication.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createApplication.isPending}>
            {createApplication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
